import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const customTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{violet.50}',
      100: '{violet.100}',
      200: '{violet.200}',
      300: '{violet.300}',
      400: '{violet.400}',
      500: '{violet.500}',
      600: '{violet.600}',
      700: '{violet.700}',
      800: '{violet.800}',
      900: '{violet.900}',
      950: '{violet.950}',
    },
    secondary: {
      50: '#fdfaf5',
      100: '#f9f1e6',
      200: '#f3e1cb',
      300: '#eecea8',
      400: '#e7b585',
      500: '#de9960',
      600: '#cb7d45',
      700: '#a86134',
      800: '#884f2e',
      900: '#6f4228',
      950: '#3e2315',
    },
    tertiary: {
      50: '#fbf5ff',
      100: '#f3e9ff',
      200: '#e8d4fe',
      300: '#ddbafd',
      400: '#c695f2',
      500: '#a770e0',
      600: '#884dcb',
      700: '#6b37a8',
      800: '#552d85',
      900: '#46256c',
      950: '#2d1845',
    },
    colorScheme: {
      light: {
        text: {
          color: '{indigo.900}',
        },
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}',
        },
      },
      dark: {
        text: {
          color: '{indigo.50}',
        },
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },
    },
  },
});
app.use(PrimeVue, {
  theme: {
    preset: customTheme,
    options: {
      darkModeSelector: '.my-app-dark',
      cssLayer: {
        name: 'primevue',
        order: 'theme, base, primevue, utilities',
      },
    },
  },
});

app.mount('#app');
