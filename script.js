<script>
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'adhd_web_checklists';
  let currentList = null;

  const getChecklists = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  const saveChecklists = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  const showToast = (message) => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const refreshSidebar = () => {
    const lists = getChecklists();
    const sidebar = document.getElementById('sidebar-checklists');
    if (!sidebar) return console.error("Sidebar element not found!");
    sidebar.innerHTML = '';
    Object.keys(lists).forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      li.dataset.name = name;
      li.addEventListener('click', () => {
        currentList = name;
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

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('context-menu');
    if (menu && !menu.contains(e.target)) menu.style.display = 'none';
  });

  const attachContextMenuListeners = () => {
    const rename = document.getElementById('rename-option');
    const del = document.getElementById('delete-option');
    if (!rename || !del) return console.error("Context menu actions not found!");

    rename.addEventListener('click', () => {
      const menu = document.getElementById('context-menu');
      const target = menu.dataset.targetList;
      if (menu.dataset.type === 'checklist' && target) {
        const item = [...document.querySelectorAll('#sidebar-checklists li')]
          .find(li => li.dataset.name === target);
        if (!item) return;
        item.contentEditable = true;
        item.focus();
        const range = document.createRange();
        range.selectNodeContents(item);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        const onBlur = () => {
          const newName = item.textContent.trim();
          const lists = getChecklists();
          const original = item.dataset.name;
          if (!newName || newName.toLowerCase() === original.toLowerCase()) {
            item.textContent = original;
            item.contentEditable = false;
            return;
          }
          const conflict = Object.keys(lists).some(
            name => name.toLowerCase() === newName.toLowerCase() && name !== original
          );
          if (conflict) {
            alert('Name already exists.');
            item.textContent = original;
            item.contentEditable = false;
            return;
          }
          lists[newName] = lists[original];
          delete lists[original];
          saveChecklists(lists);
          currentList = newName;
          item.contentEditable = false;
          refreshSidebar();
          showChecklist(newName);
        };

        const onKey = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            item.blur();
          } else if (e.key === 'Escape') {
            item.textContent = item.dataset.name;
            item.contentEditable = false;
          }
        };

        item.addEventListener('blur', onBlur, { once: true });
        item.addEventListener('keydown', onKey);
      }
      menu.style.display = 'none';
    });

    del.addEventListener('click', () => {
      const menu = document.getElementById('context-menu');
      const type = menu.dataset.type;
      if (type === 'checklist') {
        const target = menu.dataset.targetList;
        if (!target) return;
        const lists = getChecklists();
        delete lists[target];
        saveChecklists(lists);
        if (currentList === target) {
          currentList = null;
          showHomeScreen();
        }
        refreshSidebar();
      }
      menu.style.display = 'none';
    });
  };

  const renderTasks = () => {
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

  const showHomeScreen = () => {
    const main = document.querySelector('.main-content');
    if (!main) return;
    main.innerHTML = `
      <div class="home-container">
        <h2>Welcome to the Checklist App</h2>
        <p>Select a checklist from the sidebar or create a new one to get started.</p>
      </div>`;
    refreshSidebar();
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

  const attachNewListButtonListener = () => {
    const btn = document.getElementById('new-list');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const name = prompt('Enter a name for the new checklist:');
      if (!name) return;
      const lists = getChecklists();
      if (lists[name]) return alert('Checklist already exists.');
      lists[name] = [];
      saveChecklists(lists);
      currentList = name;
      refreshSidebar();
      showChecklist(name);
    });
  };

  const showChecklist = (name) => {
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

  // Font controls
  document.getElementById('font-size-slider')?.addEventListener('input', e =>
    document.documentElement.style.setProperty('--task-font-size', `${e.target.value}px`)
  );
  document.getElementById('font-family-dropdown')?.addEventListener('change', e =>
    document.documentElement.style.setProperty('--task-font-family', e.target.value)
  );

  document.getElementById('home-icon')?.addEventListener('click', showHomeScreen);
  attachNewListButtonListener();
  attachContextMenuListeners();
  showHomeScreen();
});
</script>
