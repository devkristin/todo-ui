<script setup lang="ts">
import { usePlannerStore } from '@/stores/planner';
import { ref, watch } from 'vue';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { todosApi } from '@/api/todos';
import type { TodoResponse } from '@/types/todos';
import DraggableTodoList from './DraggableTodoList.vue';

const plannerStore = usePlannerStore();
const editingTodo = ref<TodoResponse | null>(null);
const editTitle = ref('');
const showEditDialog = ref(false);
const isSaving = ref(false);

watch(
  () => plannerStore.selectedDate,
  () => {
    plannerStore.fetchDailyTodos();
  },
  { immediate: true },
);

const goToPreviousDay = () => {
  const prev = new Date(plannerStore.selectedDate);
  prev.setDate(prev.getDate() - 1);
  plannerStore.setSelectedDate(prev);
};

const goToNextDay = () => {
  const next = new Date(plannerStore.selectedDate);
  next.setDate(next.getDate() + 1);
  plannerStore.setSelectedDate(next);
};

const handleAddTodo = () => {
  // TODO: Show dialog to add new todo
};

const handleEditTodo = (todo: TodoResponse) => {
  editingTodo.value = todo;
  editTitle.value = todo.title;
  showEditDialog.value = true;
};

const handleSaveEdit = async () => {
  if (!editingTodo.value || !editTitle.value.trim()) return;

  try {
    isSaving.value = true;
    await todosApi.updateTodo(editingTodo.value.id, { title: editTitle.value });
    await plannerStore.fetchDailyTodos();
    showEditDialog.value = false;
  } catch (error) {
    console.error('Failed to update todo:', error);
  } finally {
    isSaving.value = false;
  }
};

const handleTodosReordered = () => {
  plannerStore.fetchDailyTodos();
};
</script>

<template>
  <div>
    <div class="flex justify-center">
      <Button
        icon="pi pi-chevron-left"
        @click="goToPreviousDay"
        text
        rounded
        aria-label="Previous Day"
      />

      <div class="w-full max-w-sm">
        <DatePicker
          v-model="plannerStore.selectedDate"
          dateFormat="DD, MM dd, yy"
          :manualInput="false"
          inputClass="text-center w-full"
          panelClass="!left-1/2 !-translate-x-1/2"
          fluid
        />
      </div>
      <Button icon="pi pi-chevron-right" @click="goToNextDay" text rounded aria-label="Next Day" />
    </div>

    <div class="grid">
      <DraggableTodoList
        title="TO-DO LIST"
        :todos="plannerStore.dailyTodos"
        :isLoading="plannerStore.isLoading"
        @add-todo="handleAddTodo"
        @edit-todo="handleEditTodo"
        @todos-reordered="handleTodosReordered"
      />
    </div>

    <Dialog
      v-model:visible="showEditDialog"
      header="Edit Todo"
      :modal="true"
      :closable="true"
      class="w-full max-w-md"
    >
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <label for="title" class="font-medium text-sm">Title</label>
          <InputText
            id="title"
            v-model="editTitle"
            placeholder="Enter todo title"
            @keyup.enter="handleSaveEdit"
          />
        </div>
        <div class="flex gap-2 justify-end">
          <Button label="Cancel" severity="secondary" @click="showEditDialog = false" />
          <Button label="Save" :loading="isSaving" @click="handleSaveEdit" />
        </div>
      </div>
    </Dialog>
  </div>
</template>
