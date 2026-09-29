import { projects } from './api.js';
import { requireAuth, renderTopbar, showMessage, clearMessage } from './nav.js';

requireAuth();
renderTopbar(document.getElementById('topbar'));

const listEl = document.getElementById('projects-list');
const emptyEl = document.getElementById('empty-message');
const messageEl = document.getElementById('message');

async function loadProjects() {
  clearMessage(messageEl);
  try {
    const { data } = await projects.list();
    listEl.innerHTML = '';
    emptyEl.style.display = data.length ? 'none' : 'block';

    for (const project of data) {
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <div class="item-title">${project.name}</div>
          <div class="item-sub">${project.description || 'Без описания'}</div>
        </div>
        <div class="item-actions">
          <button class="open-btn">Открыть</button>
          <button class="danger delete-btn">Удалить</button>
        </div>
      `;

      li.querySelector('.open-btn').addEventListener('click', () => {
        window.location.href = `windows.html?project_id=${project.id}`;
      });

      li.querySelector('.delete-btn').addEventListener('click', async () => {
        try {
          await projects.remove(project.id);
          await loadProjects();
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
  const description = document.getElementById('description').value;

  try {
    await projects.create({ name, description: description || null });
    document.getElementById('create-form').reset();
    await loadProjects();
  } catch (err) {
    showMessage(messageEl, err.message);
  }
});

loadProjects();
