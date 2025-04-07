import { getChecklists, saveChecklists } from './storage.js';
import { currentList, showChecklist, showHomeScreen } from './checklist.js';

export const refreshSidebar = () => {
  const lists = getChecklists();
  const sidebar = document.getElementById('sidebar-checklists');
  if (!sidebar) return;
  sidebar.innerHTML = '';
  Object.keys(lists).forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    li.dataset.name = name;

    li.addEventListener('click', () => {
      showChecklist(name);
    });

    li.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const menu = document.getElementById('context-menu');
      if (!menu) return;
      menu.style.top = `${e.pageY}px`;
      menu.style.left = `${e.pageX}px`;
      menu.style.display = 'block';
      menu.dataset.targetList = name;
      menu.dataset.type = 'checklist';
      document.getElementById('rename-option').textContent = 'Rename';
    });

    sidebar.appendChild(li);
  });
};

export const attachNewListButtonListener = () => {
  const btn = document.getElementById('new-list');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const name = prompt('Enter a name for the new checklist:');
    if (!name) return;
    const lists = getChecklists();
    if (lists[name]) return alert('Checklist already exists.');
    lists[name] = [];
    saveChecklists(lists);
    refreshSidebar();
    showChecklist(name);
  });
};
