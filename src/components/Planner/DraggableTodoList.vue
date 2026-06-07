<script setup lang="ts">
import { ref } from 'vue';
import type { CreateTodoRequest, TodoResponse } from '@/types/todos';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { usePlannerStore } from '@/stores/planner';

interface Props {
  title: string;
  priority?: boolean;
  todos: TodoResponse[];
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  priority: false,
});

const plannerStore = usePlannerStore();

const menuRefs = ref<Record<string, InstanceType<typeof Menu>>>({});
const editingTodo = ref<TodoResponse | null>(null);
const editTitle = ref('');
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const showAddDialog = ref(false);

const handleCheckboxChange = async (todo: TodoResponse, checked: boolean) => {
  try {
    plannerStore.setUpdatingTodoId(todo.id);
    await plannerStore.updateTodo(todo.id, { is_completed: checked });
  } finally {
    plannerStore.setUpdatingTodoId(null);
  }
};

const handleOpenAddDialog = () => {
  editingTodo.value = null;
  editTitle.value = '';
  showAddDialog.value = true;
};

const handleOpenEditDialog = (todo: TodoResponse) => {
  editingTodo.value = todo;
  editTitle.value = todo.title;
  showEditDialog.value = true;
};

const handleOpenDeleteDialog = (todo: TodoResponse) => {
  editingTodo.value = todo;
  editTitle.value = todo.title;
  showDeleteDialog.value = true;
};

const handlePriorityChange = async (todo: TodoResponse) => {
  await plannerStore.updateTodo(todo.id, {
    is_priority: !todo.is_priority,
  });
};

const handleSaveAdd = async () => {
  if (!editTitle.value.trim()) return;
  showAddDialog.value = false;
  const createTodo: CreateTodoRequest = {
    schedule_date: plannerStore.formattedApiDate,
    title: editTitle.value.trim(),
    is_priority: props.priority,
  };
  await plannerStore.createTodo(createTodo);
};

const handleSaveEdit = async () => {
  if (!editingTodo.value || !editTitle.value.trim()) return;
  showEditDialog.value = false;
  await plannerStore.updateTodo(editingTodo.value.id, {
    title: editTitle.value.trim(),
  });
};

const handleSaveDelete = async () => {
  if (!editingTodo.value) return;
  showDeleteDialog.value = false;
  await plannerStore.deleteTodo(editingTodo.value.id);
};

const showMenu = (event: Event, todoId: string) => {
  menuRefs.value[todoId]?.toggle(event);
};

const setMenuRef = (el: any, id: string) => {
  if (el) {
    menuRefs.value[id] = el as InstanceType<typeof Menu>;
  } else {
    delete menuRefs.value[id];
  }
};

const menuItems = (todo: TodoResponse): MenuItem[] => [
  {
    label: 'Edit',
    icon: 'pi pi-pencil',
    command: () => {
      handleOpenEditDialog(todo);
    },
  },
  {
    label: todo.is_priority ? 'Deprioritize' : 'Prioritize',
    icon: todo.is_priority ? 'pi pi-arrow-down' : 'pi pi-arrow-up',
    command: () => {
      handlePriorityChange(todo);
    },
    visible: todo.is_follow_up === false,
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    command: () => {
      handleOpenDeleteDialog(todo);
    },
  },
];
</script>

<template>
  <div class="rounded-xl shadow dark:bg-surface-950 pt-3 px-4 pb-4">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-lg font-bold">{{ title }}</h2>
      <Button
        class="!p-1 !rounded"
        icon="pi pi-plus"
        rounded
        variant="text"
        aria-label="Add Todo"
        label="Add"
        @click="handleOpenAddDialog"
      />
    </div>

    <div class="space-y-2">
      <div
        v-if="props.todos.length === 0 && !isLoading"
        class="text-center py-8 text-surface-500 dark:text-surface-400"
      >
        <p>No to-dos yet. Add one to get started!</p>
      </div>

      <div
        v-for="todo in props.todos"
        :key="todo.id"
        draggable="true"
        @dragstart="plannerStore.handleDragStart(todo)"
        @dragover="plannerStore.handleDragOver($event, todo)"
        @dragend="plannerStore.handleDragEnd"
        @drop="plannerStore.handleDrop($event, todo)"
        :class="[
          'flex items-center gap-3 p-3 rounded-md shadow dark:border-2 cursor-move transition-all',
          plannerStore.draggedOverTodo?.id === todo.id
            ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20'
            : plannerStore.draggedTodo?.id === todo.id
              ? 'opacity-50 bg-surface-100 dark:bg-surface-800'
              : 'hover:bg-surface-50 dark:hover:bg-surface-800 border-surface-200 dark:border-surface-700',
          plannerStore.updatingTodoId === todo.id && 'opacity-75 pointer-events-none',
        ]"
      >
        <Checkbox
          :modelValue="todo.is_completed"
          :binary="true"
          :disabled="plannerStore.updatingTodoId === todo.id"
          @update:modelValue="(checked) => handleCheckboxChange(todo, checked as boolean)"
          class="flex-shrink-0"
        />

        <span
          :class="[
            'flex-1 text-sm transition-colors font-bold',
            todo.is_completed
              ? 'line-through text-surface-400 dark:text-surface-500'
              : '!text-[var(--p-text-color)]',
          ]"
        >
          {{ todo.title }}
        </span>

        <div
          v-if="todo.schedule_time"
          class="flex-shrink-0 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100 text-xs font-medium px-2.5 py-0.5 rounded-full"
        >
          {{ todo.schedule_time.substring(0, 5) }}
        </div>

        <div class="flex-shrink-0">
          <Button
            icon="pi pi-ellipsis-v"
            text
            rounded
            size="small"
            @click="(event) => showMenu(event, todo.id)"
          />
          <Menu :ref="(el) => setMenuRef(el, todo.id)" :model="menuItems(todo)" :popup="true" />
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showAddDialog"
      :header="props.priority ? 'Add Priority' : 'Add To-Do'"
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
            placeholder="e.g. Go for a walk"
            autofocus
            @keyup.enter="handleSaveAdd"
          />
        </div>
        <div class="flex gap-2 justify-end">
          <Button label="Cancel" severity="secondary" @click="showAddDialog = false" />
          <Button label="Save" :loading="isLoading" @click="handleSaveAdd" />
        </div>
      </div>
    </Dialog>

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
            placeholder="e.g. Go for a walk"
            autofocus
            @keyup.enter="handleSaveEdit"
          />
        </div>
        <div class="flex gap-2 justify-end">
          <Button label="Cancel" severity="secondary" @click="showEditDialog = false" />
          <Button label="Save" :loading="isLoading" @click="handleSaveEdit" />
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
          <Button label="Delete" :loading="isLoading" @click="handleSaveDelete" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.p-menu) {
  min-width: 10rem;
}
</style>
