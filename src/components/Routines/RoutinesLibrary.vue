<script setup lang="ts">
import { ref } from 'vue';
import { useRoutinesStore } from '@/stores/routines';
import { Button, Tag } from 'primevue';

const routinesStore = useRoutinesStore();
const isCreating = ref(false);
const newRoutineTitle = ref('');

const handleCreateRoutine = async () => {
  if (!newRoutineTitle.value.trim()) return;

  await routinesStore.createRoutine({
    title: newRoutineTitle.value,
    is_active: true,
  });

  newRoutineTitle.value = '';
  isCreating.value = false;
};
</script>

<template>
  <div
    class="flex flex-col gap-4 bg-surface-0 dark:bg-surface-900 p-4 md:p-6 rounded-xl border border-surface-200 dark:border-surface-800 shadow-sm"
  >
    <div class="flex justify-between items-center mb-2">
      <h2 class="text-lg font-semibold text-[var(--p-text-color)]">Routines</h2>
      <Button
        icon="pi pi-plus"
        severity="secondary"
        rounded
        aria-label="Add Routine"
        @click="isCreating = !isCreating"
      />
    </div>

    <div v-if="isCreating" class="flex gap-2 mb-4">
      <input
        v-model="newRoutineTitle"
        @keyup.enter="handleCreateRoutine"
        type="text"
        placeholder="Routine name..."
        class="flex-1 p-2 border border-surface-300 dark:border-surface-700 rounded-md bg-transparent text-[var(--p-text-color)] focus:outline-none focus:ring-2 focus:ring-primary-500"
        autofocus
      />
      <Button icon="pi pi-check" @click="handleCreateRoutine" />
    </div>

    <div
      v-if="routinesStore.isLoading && routinesStore.routines.length === 0"
      class="flex justify-center p-4"
    >
      <i class="pi pi-spin pi-spinner text-2xl text-primary-500"></i>
    </div>

    <ul v-else class="flex flex-col gap-2 m-0 p-0 list-none">
      <li
        v-for="routine in routinesStore.routines"
        :key="routine.id"
        @click="routinesStore.selectRoutine(routine.id)"
        :class="[
          'flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors border',
          routinesStore.selectedRoutineId === routine.id
            ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800'
            : 'bg-transparent border-transparent hover:bg-surface-100 dark:hover:bg-surface-800',
        ]"
      >
        <span class="font-medium text-[var(--p-text-color)]">{{ routine.title }}</span>

        <div class="flex items-center gap-3">
          <Tag v-if="routine.recurrence_rule == 'manual'" value="Manual" severity="info" />

          <Tag
            v-if="routine.recurrence_rule !== 'manual'"
            :value="routine.is_active ? 'Active' : 'Paused'"
            :severity="routine.is_active ? 'success' : 'secondary'"
          />
          <i class="pi pi-chevron-right text-surface-400 text-sm"></i>
        </div>
      </li>
    </ul>

    <div
      v-if="!routinesStore.isLoading && routinesStore.routines.length === 0"
      class="text-sm text-surface-500 text-center py-4"
    >
      No routines yet. Create one to get started!
    </div>
  </div>
</template>
