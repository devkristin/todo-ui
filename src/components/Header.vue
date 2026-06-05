<script setup lang="ts">
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const isDark = ref(true);
const authStore = useAuthStore();
const router = useRouter();

function toggleDarkMode() {
  document.documentElement.classList.toggle('my-app-dark');
}

function handleSignOut() {
  authStore.signOut();
  router.push('/');
}
</script>

<template>
  <header class="p-4 flex items-center justify-end gap-2">
    <ToggleSwitch v-model="isDark" @change="toggleDarkMode">
      <template #handle>
        <div class="rounded-full">
          <i :class="[isDark ? 'pi-moon' : 'pi-sun', 'pi !text-xs']"></i>
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
  </header>
</template>
