import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const STORAGE_KEY = 'lotus-list-settings';

  const loadSettings = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { darkMode: true, scheduleView: true };
  };

  const darkMode = ref(loadSettings().darkMode);
  const scheduleView = ref(loadSettings().scheduleView);

  function applyTheme() {
    darkMode.value
      ? document.documentElement.classList.add('my-app-dark')
      : document.documentElement.classList.remove('my-app-dark');
  }

  function toggleDarkMode() {
    const currentSettings = loadSettings();
    currentSettings.darkMode = darkMode.value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));

    applyTheme();
  }

  function toggleScheduleView() {
    scheduleView.value = !scheduleView.value;
    const currentSettings = loadSettings();
    currentSettings.scheduleView = scheduleView.value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
  }

  onMounted(() => applyTheme());

  return {
    darkMode,
    toggleDarkMode,
    scheduleView,
    toggleScheduleView,
  };
});
