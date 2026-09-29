import { windows } from './api.js';
import { requireAuth, renderTopbar, showMessage, clearMessage } from './nav.js';

requireAuth();

const params = new URLSearchParams(window.location.search);
const projectId = params.get('project_id');

const messageEl = document.getElementById('message');

if (!projectId) {
  showMessage(messageEl, 'Не указан project_id.');
} else {
  renderTopbar(document.getElementById('topbar'), [
    { href: 'projects.html', label: 'К проектам' },
  ]);

  const listEl = document.getElementById('windows-list');
  const emptyEl = document.getElementById('empty-message');

  async function loadWindows() {
    clearMessage(messageEl);
    try {
      const { data } = await windows.list(projectId);
      listEl.innerHTML = '';
      emptyEl.style.display = data.length ? 'none' : 'block';

      for (const win of data) {
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="item-title">${win.name}</div>
          <div class="item-actions">
            <button class="open-btn">Открыть</button>
            <button class="danger delete-btn">Удалить</button>
          </div>
        `;

        li.querySelector('.open-btn').addEventListener('click', () => {
          window.location.href = `window.html?project_id=${projectId}&window_id=${win.id}`;
        });

        li.querySelector('.delete-btn').addEventListener('click', async () => {
          try {
            await windows.remove(projectId, win.id);
            await loadWindows();
          } catch (err) {
            showMessage(messageEl, err.message);
          }
        });

        listEl.appendChild(li);
      }
    } catch (err) {
      showMessage(messageEl, err.message);
    }
  }

  document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage(messageEl);

    const name = document.getElementById('name').value;

    try {
      await windows.create(projectId, { name });
      document.getElementById('create-form').reset();
      await loadWindows();
    } catch (err) {
      showMessage(messageEl, err.message);
    }
  });

  loadWindows();
}
