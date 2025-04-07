import { getChecklists, saveChecklists } from './storage.js';
import { showToast } from './ui.js';

export let currentList = null;

const attachTaskContextMenu = (taskElement, taskIndex, tasks) => {
  taskElement.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const menu = document.getElementById('context-menu');
    if (!menu) return;

    menu.style.top = `${e.pageY}px`;
    menu.style.left = `${e.pageX}px`;
    menu.style.display = 'block';
    menu.dataset.targetTask = taskIndex;

    const editOption = document.getElementById('edit-option');
    const deleteOption = document.getElementById('delete-option');

    editOption.onclick = () => {
      const newText = prompt('Edit task:', tasks[taskIndex].text);
      if (newText !== null) {
        tasks[taskIndex].text = newText.trim();
        saveChecklists(getChecklists());
        renderTasks();
      }
      menu.style.display = 'none';
    };

    deleteOption.onclick = () => {
      tasks.splice(taskIndex, 1);
      saveChecklists(getChecklists());
      renderTasks();
      menu.style.display = 'none';
    };
  });
};

export const renderTasks = () => {
  const lists = getChecklists();
  const tasks = lists[currentList] || [];
  const taskList = document.getElementById('task-list');
  if (!taskList) return;

  taskList.innerHTML = '';
  tasks.forEach((task, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
        <input type="checkbox" class="custom-checkbox" ${task.done ? 'checked' : ''} />
        <span class="task-text ${task.done ? 'done' : ''}">${task.text}</span>
        <button class="task-delete">✖</button>
      </div>`;
    li.querySelector('.custom-checkbox').addEventListener('change', () => {
      task.done = !task.done;
      saveChecklists(lists);
      renderTasks();
    });
    li.querySelector('.task-delete').addEventListener('click', () => {
      tasks.splice(i, 1);
      saveChecklists(lists);
      renderTasks();
    });
    attachTaskContextMenu(li, i, tasks);
    taskList.appendChild(li);
  });

  updateProgress(tasks);
};

const updateProgress = (tasks) => {
  const done = tasks.filter(t => t.done).length;
  const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  document.getElementById('progress-bar').style.width = percent + '%';
  document.getElementById('progress-label').textContent = `${percent}% completed`;
};

export const showChecklist = (name) => {
  const main = document.querySelector('.main-content');
  if (!main) return;

  main.innerHTML = `
    <div class="checklist-container">
      <div class="checklist-header-box">
        <div class="checklist-title" id="checklist-title">${name}</div>
        <div class="progress"><div class="progress-bar" id="progress-bar"></div></div>
        <div id="progress-label">0% completed</div>
      </div>
      <input type="text" id="new-task" placeholder="New Task">
      <ul id="task-list"></ul>
    </div>`;

  currentList = name;
  attachNewTaskListener();
  renderTasks();
};

export const showHomeScreen = () => {
  const main = document.querySelector('.main-content');
  if (!main) return;
  main.innerHTML = `
    <div class="home-container">
      <h2>Welcome to the Checklist App</h2>
      <p>Select a checklist from the sidebar or create a new one to get started.</p>
    </div>`;
};

const attachNewTaskListener = () => {
  const input = document.getElementById('new-task');
  if (!input) return;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const text = e.target.value.trim();
      if (!text || !currentList) return;
      const lists = getChecklists();
      lists[currentList].push({ text, done: false });
      saveChecklists(lists);
      e.target.value = '';
      renderTasks();
    }
  });
};
