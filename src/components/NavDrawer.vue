<script setup lang="ts">
import { computed } from 'vue';
import Drawer from 'primevue/drawer';
import Logo from './Logo.vue';
import AuthButtons from './AuthButtons.vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useSettingsStore } from '@/stores/settings.ts';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const route = useRoute();
const settingsStore = useSettingsStore();

const activeColors = computed(() => ({
  background: settingsStore.darkMode ? 'var(--p-surface-800)' : 'var(--p-primary-100)',
  text: 'var(--p-primary-color)',
}));

const navItems = [
  { label: 'Planner', icon: 'pi pi-calendar', to: '/planner' },
  { label: 'Goals', icon: 'pi pi-check-circle', to: '/goals' },
  { label: 'Projects', icon: 'pi pi-briefcase', to: '/projects' },
  { label: 'Budget', icon: 'pi pi-wallet', to: '/budget' },
  { label: 'Food', icon: 'pi pi-shopping-cart', to: '/food' },
  { label: 'Self-Care', icon: 'pi pi-face-smile', to: '/self-care' },
  { label: 'Values', icon: 'pi pi-compass', to: '/values' },
  { label: 'Templates', icon: 'pi pi-copy', to: '/templates' },
  { label: 'Settings', icon: 'pi pi-cog', to: '/settings' },
];

function close() {
  emit('update:visible', false);
}
</script>

<template>
  <Drawer
    :visible="props.visible"
    @update:visible="emit('update:visible', $event)"
    position="left"
    :style="{
      '--nav-active-bg': activeColors.background,
      '--nav-active-text': activeColors.text,
    }"
    :pt="{
      root: { class: 'nav-drawer' },
      header: { class: 'nav-drawer-header' },
      content: { class: 'nav-drawer-content' },
    }"
  >
    <template #header>
      <Logo />
    </template>

    <nav class="flex flex-col gap-1 mb-4">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ 'nav-link--active': route.path.startsWith(item.to) }"
        @click="close"
      >
        <i :class="['pi', item.icon, 'nav-link-icon']" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <AuthButtons class="sm:hidden mb-6" @update:visible="emit('update:visible', $event)" />
  </Drawer>
</template>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
  color: var(--p-text-color);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.nav-link:hover {
  color: var(--p-primary-color);
}

.nav-link--active {
  background: var(--nav-active-bg);
  color: var(--nav-active-text);
  font-weight: 600;
}

.nav-link-icon {
  font-size: 1rem;
  width: 1.25rem;
  text-align: center;
  flex-shrink: 0;
}
</style>
