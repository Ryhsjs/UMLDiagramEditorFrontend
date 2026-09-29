import { isLoggedIn, auth } from './api.js';

export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/index.html';
  }
}

export function renderTopbar(container, links = []) {
  const nav = links
    .map((l) => `<a href="${l.href}">${l.label}</a>`)
    .join('');

  container.innerHTML = `
    <div class="brand">UML Diagram Editor</div>
    <nav>
      ${nav}
      <button class="secondary" id="logout-btn">Выйти</button>
    </nav>
  `;

  container.querySelector('#logout-btn').addEventListener('click', async () => {
    await auth.logout();
    window.location.href = '/index.html';
  });
}

export function showMessage(container, text, type = 'error') {
  container.innerHTML = `<div class="message ${type}">${text}</div>`;
}

export function clearMessage(container) {
  container.innerHTML = '';
}
