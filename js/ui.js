export const showToast = (message) => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
};

export const hideContextMenu = () => {
  const menu = document.getElementById('context-menu');
  if (menu) menu.style.display = 'none';
};
