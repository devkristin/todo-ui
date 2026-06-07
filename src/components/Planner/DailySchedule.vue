<script setup lang="ts">
import { usePlannerStore } from '@/stores/planner';

const plannerStore = usePlannerStore();
</script>

<template>
  <div class="grow rounded-xl shadow dark:bg-surface-950 p-4">
    <h2 class="text-lg font-bold">Schedule</h2>
    <div v-for="todo in plannerStore.scheduledDailyTodos" :key="`${todo.id}-${todo.schedule_date}`">
      {{ todo.title }}
    </div>
  </div>
</template>
