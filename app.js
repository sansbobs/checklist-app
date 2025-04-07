import { refreshSidebar, attachNewListButtonListener } from './sidebar.js';
import { showHomeScreen } from './checklist.js';
import { hideContextMenu } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('home-icon')?.addEventListener('click', showHomeScreen);

  document.addEventListener('click', (e) => {
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu && !contextMenu.contains(e.target)) {
      contextMenu.style.display = 'none';
    }
  });

  document.getElementById('font-size-slider')?.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--task-font-size', `${e.target.value}px`);
  });

  document.getElementById('font-family-dropdown')?.addEventListener('change', (e) => {
    document.documentElement.style.setProperty('--task-font-family', e.target.value);
  });

  attachNewListButtonListener();
  refreshSidebar();
  showHomeScreen();
});
