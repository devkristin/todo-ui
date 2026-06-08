<script setup lang="ts">
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import { RouterLink } from 'vue-router';
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useSettingsStore } from '@/stores/settings.ts';
import { useRouter } from 'vue-router';
import LotusIcon from './icons/LotusIcon.vue';

const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const router = useRouter();
const isHovered = ref(false);

async function handleSignOut() {
  await authStore.signOut();
  router.push('/');
}
</script>

<template>
  <header class="p-4 flex flex-wrap items-center justify-center gap-2">
    <RouterLink
      to="/"
      class="!text-current flex items-center -ml-4"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <LotusIcon :isHovered="isHovered" class="max-w-20 sm:max-w-25 md:max-w-30 lg:max-w-35" />
      <span class="font-custom font-bold text-xl lowercase pr-4">Lotus List</span>
    </RouterLink>
    <span class="grow flex items-center justify-end gap-4">
      <ToggleSwitch v-model="settingsStore.darkMode" @change="settingsStore.toggleDarkMode">
        <template #handle>
          <div class="rounded-full">
            <i :class="[settingsStore.darkMode ? 'pi-moon' : 'pi-sun', 'pi !text-xs']"></i>
          </div>
        </template>
      </ToggleSwitch>
      <Button
        v-if="authStore.isAuthenticated"
        label="Sign Out"
        severity="secondary"
        variant="outlined"
        size="small"
        @click="handleSignOut"
      />
    </span>
  </header>
</template>
