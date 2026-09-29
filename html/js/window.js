import { windows, classes, interfaces } from './api.js';
import { requireAuth, renderTopbar, showMessage, clearMessage } from './nav.js';

requireAuth();

const params = new URLSearchParams(window.location.search);
const projectId = params.get('project_id');
const windowId = params.get('window_id');

const messageEl = document.getElementById('message');

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

if (!projectId || !windowId) {
  showMessage(messageEl, 'Не указан project_id или window_id.');
} else {
  renderTopbar(document.getElementById('topbar'), [
    { href: `windows.html?project_id=${projectId}`, label: 'К окнам' },
  ]);

  const classesListEl = document.getElementById('classes-list');
  const interfacesListEl = document.getElementById('interfaces-list');

  async function loadWindowInfo() {
    const win = await windows.get(projectId, windowId);
    document.getElementById('window-title').textContent = win.name;
  }

  async function loadClasses() {
    const { data } = await classes.list(windowId);
    classesListEl.innerHTML = '';

    for (const cls of data) {
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <div class="item-title">${cls.name}</div>
          <div class="item-sub">x:${cls.tile.x} y:${cls.tile.y} ${cls.tile.width}x${cls.tile.height}</div>
        </div>
        <button class="danger delete-btn">Удалить</button>
      `;

      li.querySelector('.delete-btn').addEventListener('click', async () => {
        try {
          await classes.remove(windowId, cls.id);
          await loadClasses();
        } catch (err) {
          showMessage(messageEl, err.message);
        }
      });

      classesListEl.appendChild(li);
    }
  }

  async function loadInterfaces() {
    const { data } = await interfaces.list(windowId);
    interfacesListEl.innerHTML = '';

    for (const item of data) {
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <div class="item-title">${item.name}</div>
          <div class="item-sub">x:${item.tile.x} y:${item.tile.y} ${item.tile.width}x${item.tile.height}</div>
        </div>
        <button class="danger delete-btn">Удалить</button>
      `;

      li.querySelector('.delete-btn').addEventListener('click', async () => {
        try {
          await interfaces.remove(windowId, item.id);
          await loadInterfaces();
        } catch (err) {
          showMessage(messageEl, err.message);
        }
      });

      interfacesListEl.appendChild(li);
    }
  }

  document.getElementById('create-class-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage(messageEl);

    const name = document.getElementById('class-name').value;

    try {
      await classes.create(windowId, { name });
      document.getElementById('create-class-form').reset();
      await loadClasses();
    } catch (err) {
      showMessage(messageEl, err.message);
    }
  });

  document.getElementById('create-interface-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage(messageEl);

    const name = document.getElementById('interface-name').value;

    try {
      await interfaces.create(windowId, { name });
      document.getElementById('create-interface-form').reset();
      await loadInterfaces();
    } catch (err) {
      showMessage(messageEl, err.message);
    }
  });

  document.getElementById('generate-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage(messageEl);

    const language = document.getElementById('language').value;
    const filesEl = document.getElementById('generated-files');
    filesEl.innerHTML = '<p class="muted">Генерация...</p>';

    try {
      const result = await windows.generateCode(projectId, windowId, language);
      filesEl.innerHTML = '';

      for (const [fileName, content] of Object.entries(result.files)) {
        const block = document.createElement('div');
        block.innerHTML = `<h3>${escapeHtml(fileName)}</h3><pre>${escapeHtml(content)}</pre>`;
        filesEl.appendChild(block);
      }
    } catch (err) {
      filesEl.innerHTML = '';
      showMessage(messageEl, err.message);
    }
  });

  Promise.all([loadWindowInfo(), loadClasses(), loadInterfaces()]).catch((err) => {
    showMessage(messageEl, err.message);
  });
}
