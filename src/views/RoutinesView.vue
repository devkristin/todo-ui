<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoutinesStore } from '@/stores/routines';
import RoutinesLibrary from '@/components/Routines/RoutinesLibrary.vue';
import RoutineBlueprints from '@/components/Routines/RoutineBlueprints.vue';

const routinesStore = useRoutinesStore();

onMounted(() => {
  routinesStore.fetchRoutines();
});
</script>

<template>
  <div class="flex flex-col gap-2 md:gap-8 grow w-full p-4">
    <header class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-center sm:text-left text-[var(--p-text-color)] mb-4">
        Routine Library
      </h1>
    </header>

    <section
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(450px,1fr)_2fr] gap-6 md:gap-10 lg:gap-14"
    >
      <div class="flex flex-col gap-6">
        <RoutinesLibrary />
      </div>

      <div class="flex flex-col gap-6 md:gap-8 lg:gap-8">
        <div v-if="routinesStore.selectedRoutineId">
          <RoutineBlueprints />
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center h-full min-h-[300px] text-surface-500 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl p-8"
        >
          <i class="pi pi-list text-4xl mb-4 text-surface-400"></i>
          <p>Select a routine from your library to view and manage its tasks.</p>
        </div>
      </div>
    </section>
  </div>
</template>
