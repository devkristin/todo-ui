<script setup lang="ts">
import { usePlannerStore } from '@/stores/planner';
import { watch } from 'vue';
import DailyDatePicker from './DailyDatePicker.vue';
import DraggableTodoList from './DraggableTodoList.vue';

const plannerStore = usePlannerStore();

watch(
  () => plannerStore.selectedDate,
  () => {
    plannerStore.fetchDailyTodos();
  },
  { immediate: true },
);

const handleCreateTodo = async (title: string) => {
  if (!title.trim()) return;

  try {
    await plannerStore.createTodo({
      schedule_date: plannerStore.formattedApiDate,
      title: title.trim(),
    });
  } catch (error) {
    console.error('Failed to add todo:', error);
  }
};

const handleUpdateTodo = async (payload: { id: string; title: string }) => {
  if (!payload.title.trim()) return;

  try {
    await plannerStore.updateTodo(payload.id, { title: payload.title.trim() });
  } catch (error) {
    console.error('Failed to update todo:', error);
  }
};

const handleDeleteTodo = async (id: string) => {
  try {
    await plannerStore.deleteTodo(id);
  } catch (error) {
    console.error('Failed to delete todo:', error);
  }
};

const handleTodosReordered = () => {
  plannerStore.fetchDailyTodos();
};
</script>

<template>
  <div>
    <DailyDatePicker />
    <section class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-14">
      <div class="grow rounded-xl shadow dark:bg-surface-950 p-4">
        <h2 class="text-lg font-bold uppercase">Schedule</h2>
      </div>
      <div>
        <DraggableTodoList
          title="TO-DO LIST"
          :todos="plannerStore.dailyTodos"
          :isLoading="plannerStore.isLoading"
          @create-todo="handleCreateTodo"
          @update-todo="handleUpdateTodo"
          @delete-todo="handleDeleteTodo"
          @todos-reordered="handleTodosReordered"
        />
      </div>
    </section>
  </div>
</template>
