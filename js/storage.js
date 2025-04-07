const STORAGE_KEY = 'adhd_web_checklists';

export const getChecklists = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
};

export const saveChecklists = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
