<script setup lang="ts">
import { computed } from 'vue';
import { usePlannerStore } from '@/stores/planner';
import Checkbox from 'primevue/checkbox';

const props = withDefaults(
  defineProps<{
    startHour?: number;
    endHour?: number;
  }>(),
  {
    startHour: 7,
    endHour: 22,
  },
);

const plannerStore = usePlannerStore();

const hours = computed(() => {
  const slots = [];
  for (let i = props.startHour; i <= props.endHour; i++) {
    slots.push(i);
  }
  return slots;
});

const getTodosForHour = (hour: number) => {
  return plannerStore.scheduledDailyTodos.filter((todo) => {
    const time = todo.schedule_time;

    if (!time) return false;
    const formattedTime = (time as string).split(':')[0];
    const todoHour = parseInt(formattedTime ?? '');
    return todoHour === hour;
  });
};

const handleCheckboxChange = async (todo: any, checked: boolean) => {
  plannerStore.setUpdatingTodoId(todo.id);
  await plannerStore.updateTodo(todo.id, { is_completed: checked });
  plannerStore.setUpdatingTodoId(null);
};
</script>

<template>
  <div class="rounded-xl shadow dark:bg-surface-950 p-4">
    <h2 class="text-lg font-bold mb-4">Schedule</h2>

    <div class="flex flex-col gap-1">
      <div
        v-for="hour in hours"
        :key="hour"
        class="flex items-start min-h-[3rem] border-b border-surface-100 dark:border-surface-800 py-2"
      >
        <div class="w-16 text-xs font-medium text-surface-500 pt-1">
          {{ hour > 12 ? hour - 12 : hour }}{{ hour >= 12 ? ' PM' : ' AM' }}
        </div>

        <div class="flex-1 flex flex-col gap-2">
          <div
            v-for="todo in getTodosForHour(hour)"
            :key="todo.id"
            class="flex items-center gap-3 bg-tertiary-100 dark:bg-surface-900 p-2 rounded-md border border-transparent dark:border-surface-700"
          >
            <Checkbox
              :modelValue="todo.is_completed"
              :binary="true"
              @update:modelValue="(checked) => handleCheckboxChange(todo, checked as boolean)"
            />
            <span
              class="text-sm font-medium"
              :class="{ 'line-through text-surface-400': todo.is_completed }"
            >
              {{ todo.title }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
