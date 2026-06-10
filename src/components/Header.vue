<script setup lang="ts">
import Button from 'primevue/button';
import { ref } from 'vue';
import NavDrawer from './NavDrawer.vue';
import Logo from './Logo.vue';
import ToggleSwitch from 'primevue/toggleswitch';
import AuthButtons from './AuthButtons.vue';
import { useSettingsStore } from '@/stores/settings.ts';

const settingsStore = useSettingsStore();
const navOpen = ref(false);
</script>

<template>
  <NavDrawer v-model:visible="navOpen" />
  <header class="p-4 flex items-center justify-between gap-2">
    <div class="flex items-center">
      <Button
        icon="pi pi-bars"
        aria-label="Navigation Menu"
        severity="secondary"
        variant="outlined"
        class="mr-1 md:mr-2"
        @click="navOpen = true"
      />
      <Logo />
    </div>
    <div class="flex items-center gap-4">
      <ToggleSwitch
        v-model="settingsStore.darkMode"
        class="ml-2"
        @change="settingsStore.toggleDarkMode"
      >
        <template #handle>
          <div class="rounded-full">
            <i :class="[settingsStore.darkMode ? 'pi-moon' : 'pi-sun', 'pi !text-xs']"></i>
          </div>
        </template>
      </ToggleSwitch>
      <AuthButtons class="hidden sm:flex" />
    </div>
  </header>
</template>
