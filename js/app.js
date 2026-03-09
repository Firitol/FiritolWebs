const usersKey = 'portfolioUsers';
const currentKey = 'portfolioCurrentUser';
const updatesKey = 'portfolioUpdates';

const getUsers = () => JSON.parse(localStorage.getItem(usersKey) || '[]');
const setUsers = (users) => localStorage.setItem(usersKey, JSON.stringify(users));
const getCurrent = () => JSON.parse(localStorage.getItem(currentKey) || 'null');
const setCurrent = (user) => localStorage.setItem(currentKey, JSON.stringify(user));

function ensureSeedOwner() {
  const users = getUsers();
  if (!users.some(u => u.email === 'owner@portfolio.dev')) {
    users.push({ name: 'Site Owner', email: 'owner@portfolio.dev', password: 'ChangeMe123!' });
    setUsers(users);
  }
}

function renderAuth() {
  const panel = document.getElementById('authPanel');
  if (!panel) return;
  const current = getCurrent();
  if (current) {
    panel.innerHTML = `<span>Hello, ${current.name}</span> <button id='logoutBtn'>Sign out</button>`;
    document.getElementById('logoutBtn').onclick = () => { localStorage.removeItem(currentKey); location.reload(); };
  } else {
    panel.innerHTML = `<button id='signinBtn'>Sign in</button> <button id='registerBtn'>Register</button>`;
    document.getElementById('signinBtn').onclick = () => authPrompt('signin');
    document.getElementById('registerBtn').onclick = () => authPrompt('register');
  }
}

function authPrompt(type) {
  const email = prompt('Email:');
  const password = prompt('Password:');
  if (!email || !password) return;
  const users = getUsers();

  if (type === 'register') {
    const name = prompt('Full name:');
    if (!name) return;
    if (users.some(u => u.email === email.toLowerCase())) return alert('Email already registered.');
    users.push({ name, email: email.toLowerCase(), password });
    setUsers(users);
    alert('Registered successfully. Please sign in.');
    return;
  }

  const user = users.find(u => u.email === email.toLowerCase() && u.password === password);
  if (!user) return alert('Invalid credentials.');
  setCurrent({ name: user.name, email: user.email });
  location.reload();
}

function renderUpdates() {
  const box = document.getElementById('updates');
  if (!box) return;
  const updates = JSON.parse(localStorage.getItem(updatesKey) || '[]').reverse();
  box.innerHTML = updates.length ? updates.map(item => `
    <article class='card'>
      <h4>${item.title}</h4>
      ${item.type.startsWith('video') ? `<video controls src='${item.data}'></video>` : `<img src='${item.data}' alt='${item.title}'/>`}
    </article>
  `).join('') : '<p class="card">No updates yet.</p>';
}

function bindUpload() {
  const form = document.getElementById('uploadForm');
  if (!form) return;
  form.onsubmit = (e) => {
    e.preventDefault();
    const current = getCurrent();
    if (!current) return alert('Please sign in first.');
    const title = document.getElementById('mediaTitle').value.trim();
    const file = document.getElementById('mediaFile').files[0];
    if (!file || !title) return;
    const reader = new FileReader();
    reader.onload = () => {
      const updates = JSON.parse(localStorage.getItem(updatesKey) || '[]');
      updates.push({ title, type: file.type, data: reader.result, by: current.email, createdAt: new Date().toISOString() });
      localStorage.setItem(updatesKey, JSON.stringify(updates));
      form.reset();
      renderUpdates();
    };
    reader.readAsDataURL(file);
  };
}

function bindContact() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.onsubmit = (e) => {
    e.preventDefault();
    const current = getCurrent();
    if (!current) return alert('Please register/sign in first.');
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    const body = encodeURIComponent(`From: ${current.name} (${current.email})\n\n${message}`);
    window.location.href = `mailto:owner@portfolio.dev?subject=${encodeURIComponent(subject)}&body=${body}`;
    document.getElementById('contactStatus').textContent = 'Your email client has been opened with your inquiry.';
  };
}

ensureSeedOwner();
renderAuth();
renderUpdates();
bindUpload();
bindContact();
