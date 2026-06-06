<script setup lang="ts">
import { usePlannerStore } from '@/stores/planner';
import { ref, watch } from 'vue';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import type { TodoResponse } from '@/types/todos';
import DraggableTodoList from './DraggableTodoList.vue';

const plannerStore = usePlannerStore();
const editingTodo = ref<TodoResponse | null>(null);
const editTitle = ref('');
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const showAddDialog = ref(false);

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
  editingTodo.value = null;
  editTitle.value = '';
  showAddDialog.value = true;
};

const handleEditTodo = (todo: TodoResponse) => {
  editingTodo.value = todo;
  editTitle.value = todo.title;
  showEditDialog.value = true;
};

const handleDeleteTodo = (todo: TodoResponse) => {
  editingTodo.value = todo;
  editTitle.value = todo.title;
  showDeleteDialog.value = true;
};

const handleSaveEdit = async () => {
  if (!editingTodo.value || !editTitle.value.trim()) return;

  try {
    await plannerStore.updateTodo(editingTodo.value.id, { title: editTitle.value });
    showEditDialog.value = false;
  } catch (error) {
    console.error('Failed to update todo:', error);
  }
};

const handleSaveDelete = async () => {
  if (!editingTodo.value || !editTitle.value.trim()) return;

  try {
    await plannerStore.deleteTodo(editingTodo.value.id);
    showDeleteDialog.value = false;
  } catch (error) {
    console.error('Failed to delete todo:', error);
  }
};

const handleSaveAdd = async () => {
  if (!editTitle.value.trim()) return;

  try {
    await plannerStore.createTodo({
      schedule_date: plannerStore.formattedApiDate,
      title: editTitle.value,
    });
    showAddDialog.value = false;
  } catch (error) {
    console.error('Failed to add todo:', error);
  }
};

const handleTodosReordered = () => {
  plannerStore.fetchDailyTodos();
};
</script>

<template>
  <div>
    <div class="flex justify-center mb-12">
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

    <div class="grid grid-cols-1 md:grid-cols-2 gap-14">
      <div class="grow rounded-xl bg-surface-100 dark:bg-surface-950 p-4">
        <h2 class="text-lg font-bold uppercase">Schedule</h2>
      </div>
      <DraggableTodoList
        title="TO-DO LIST"
        :todos="plannerStore.dailyTodos"
        :isLoading="plannerStore.isLoading"
        @add-todo="handleAddTodo"
        @edit-todo="handleEditTodo"
        @delete-todo="handleDeleteTodo"
        @todos-reordered="handleTodosReordered"
      />
    </div>

    <Dialog
      v-model:visible="showEditDialog"
      header="Edit"
      :modal="true"
      :closable="true"
      class="w-full max-w-md"
    >
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <InputText
            id="title"
            aria-label="Title"
            v-model="editTitle"
            placeholder="Enter to-do item"
            autofocus
            @keyup.enter="handleSaveEdit"
          />
        </div>
        <div class="flex gap-2 justify-end">
          <Button label="Cancel" severity="secondary" @click="showEditDialog = false" />
          <Button label="Save" :loading="plannerStore.isLoading" @click="handleSaveEdit" />
        </div>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showDeleteDialog"
      header="Delete"
      :modal="true"
      :closable="true"
      class="w-full max-w-md"
    >
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <h2>Are you sure you want to delete "{{ editTitle }}" from your to-do list?</h2>
        </div>
        <div class="flex gap-2 justify-end">
          <Button label="Cancel" severity="secondary" @click="showDeleteDialog = false" />
          <Button label="Delete" :loading="plannerStore.isLoading" @click="handleSaveDelete" />
        </div>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showAddDialog"
      header="Add"
      :modal="true"
      :closable="true"
      class="w-full max-w-md"
    >
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <InputText
            id="title"
            aria-label="Title"
            v-model="editTitle"
            placeholder="Enter to-do item"
            autofocus
            @keyup.enter="handleSaveAdd"
          />
        </div>
        <div class="flex gap-2 justify-end">
          <Button label="Cancel" severity="secondary" @click="showAddDialog = false" />
          <Button label="Save" :loading="plannerStore.isLoading" @click="handleSaveAdd" />
        </div>
      </div>
    </Dialog>
  </div>
</template>
