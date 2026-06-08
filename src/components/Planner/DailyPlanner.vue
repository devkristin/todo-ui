<script setup lang="ts">
import { usePlannerStore } from '@/stores/planner';
import { useSettingsStore } from '@/stores/settings.ts';
import DailyDatePicker from './DailyDatePicker.vue';
import DraggableTodoList from './DraggableTodoList.vue';
import DailySchedule from './DailySchedule.vue';
import { SelectButton } from 'primevue';
import { watch, computed } from 'vue';

const plannerStore = usePlannerStore();
const settingsStore = useSettingsStore();

watch(
  () => plannerStore.selectedDate,
  () => {
    plannerStore.fetchDailyTodos();
  },
  { immediate: true },
);

const options = [
  { icon: 'pi pi-calendar', value: true },
  { icon: 'pi pi-list', value: false },
];

const viewMode = computed({
  get: () => settingsStore.scheduleView,
  set: () => settingsStore.toggleScheduleView(),
});
</script>

<template>
  <div class="flex flex-col gap-2 md:gap-8">
    <DailyDatePicker />
    <div class="flex justify-center mt-2 md:hidden">
      <SelectButton
        v-model="viewMode"
        :options="options"
        optionLabel="icon"
        optionValue="value"
        :allowEmpty="false"
      >
        <template #option="slotProps">
          <i
            :class="[
              slotProps.option.icon,
              viewMode === slotProps.option.value
                ? '!text-[var(--p-text-color)]'
                : 'text-surface-400',
              'text-lg p-2',
            ]"
          ></i>
        </template>
      </SelectButton>
    </div>
    <section
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(450px,1fr)_2fr] gap-6 md:gap-10 lg:gap-14"
    >
      <div :class="[settingsStore.scheduleView ? 'block' : 'hidden', 'md:block']">
        <DailySchedule />
      </div>
      <div
        :class="[!settingsStore.scheduleView ? 'flex' : 'hidden', 'md:flex']"
        class="flex flex-col gap-6 md:gap-8 lg:gap-8"
      >
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
