<script setup lang="ts">
import { usePlannerStore } from '@/stores/planner';
import DailyDatePicker from './DailyDatePicker.vue';
import DraggableTodoList from './DraggableTodoList.vue';
import DailySchedule from './DailySchedule.vue';
import { watch } from 'vue';

const plannerStore = usePlannerStore();

watch(
  () => plannerStore.selectedDate,
  () => {
    plannerStore.fetchDailyTodos();
  },
  { immediate: true },
);
</script>

<template>
  <div>
    <DailyDatePicker />
    <section
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(450px,1fr)_2fr] gap-6 md:gap-10 lg:gap-14"
    >
      <DailySchedule />
      <div class="flex flex-col gap-6 md:gap-8 lg:gap-8">
        <DraggableTodoList
          title="Top Priorities"
          priority
          :todos="plannerStore.topPriorityTodos"
          :isLoading="plannerStore.isLoading"
        />
        <DraggableTodoList
          title="To-Do List"
          :todos="plannerStore.dailyTodos"
          :isLoading="plannerStore.isLoading"
        />
      </div>
    </section>
  </div>
</template>
