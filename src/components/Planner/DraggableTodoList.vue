<script setup lang="ts">
import { ref, computed } from 'vue';
import { todosApi } from '@/api/todos';
import type { CreateTodoRequest, TodoResponse } from '@/types/todos';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';

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

const emit = defineEmits<{
  'create-todo': [Partial<CreateTodoRequest>];
  'update-todo': [Partial<TodoResponse>];
  'delete-todo': [id: string];
  'todos-reordered': [];
}>();

const draggedItem = ref<TodoResponse | null>(null);
const draggedOverItem = ref<TodoResponse | null>(null);
const menuRefs = ref<Record<string, InstanceType<typeof Menu>>>({});
const updatingTodoId = ref<string | null>(null);
const editingTodo = ref<TodoResponse | null>(null);
const editTitle = ref('');
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const showAddDialog = ref(false);

const sortedTodos = computed(() => {
  return [...props.todos].sort((a, b) => a.position - b.position);
});

const handleDragStart = (todo: TodoResponse) => {
  draggedItem.value = todo;
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer!.dropEffect = 'move';
};

const handleDragEnter = (todo: TodoResponse) => {
  draggedOverItem.value = todo;
};

const handleDragLeave = () => {
  draggedOverItem.value = null;
};

const handleDrop = async (event: DragEvent, dropTarget: TodoResponse) => {
  event.preventDefault();

  if (!draggedItem.value || draggedItem.value.id === dropTarget.id) {
    draggedItem.value = null;
    draggedOverItem.value = null;
    return;
  }

  const draggedIndex = sortedTodos.value.findIndex((t) => t.id === draggedItem.value!.id);
  const dropIndex = sortedTodos.value.findIndex((t) => t.id === dropTarget.id);

  let abovePosition: number | null = null;
  let belowPosition: number | null = null;

  if (draggedIndex < dropIndex) {
    abovePosition = dropTarget.position;
    const belowIndex = dropIndex + 1;
    belowPosition = sortedTodos.value[belowIndex]?.position ?? null;
  } else {
    belowPosition = dropTarget.position;
    const aboveIndex = dropIndex - 1;
    abovePosition = sortedTodos.value[aboveIndex]?.position ?? null;
  }

  try {
    updatingTodoId.value = draggedItem.value!.id;
    await todosApi.moveTodoPosition(draggedItem.value!.id, abovePosition, belowPosition);
    emit('todos-reordered');
  } finally {
    updatingTodoId.value = null;
    draggedItem.value = null;
    draggedOverItem.value = null;
  }
};

const handleCheckboxChange = async (todo: TodoResponse, checked: boolean) => {
  try {
    updatingTodoId.value = todo.id;
    await todosApi.updateTodo(todo.id, { is_completed: checked });
    emit('todos-reordered');
  } finally {
    updatingTodoId.value = null;
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

const handleSaveAdd = () => {
  if (!editTitle.value.trim()) return;
  showAddDialog.value = false;
  emit('create-todo', {
    title: editTitle.value.trim(),
    is_priority: props.priority,
  });
};

const handleSaveEdit = () => {
  if (!editingTodo.value || !editTitle.value.trim()) return;
  showEditDialog.value = false;
  emit('update-todo', {
    id: editingTodo.value.id,
    title: editTitle.value.trim(),
  });
};

const handleSaveDelete = () => {
  if (!editingTodo.value) return;
  showDeleteDialog.value = false;
  emit('delete-todo', editingTodo.value.id);
};

const handlePriorityChange = (todo: TodoResponse) => {
  emit('update-todo', {
    id: todo.id,
    is_priority: !todo.is_priority,
  });
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
    label: 'Delete',
    icon: 'pi pi-trash',
    command: () => {
      handleOpenDeleteDialog(todo);
    },
  },
  {
    label: todo.is_priority ? 'Deprioritize' : 'Top Priority',
    icon: todo.is_priority ? 'pi pi-arrow-down' : 'pi pi-arrow-up',
    command: () => {
      handlePriorityChange(todo);
    },
    visible: todo.is_follow_up === false,
  },
];
</script>

<template>
  <div class="rounded-xl shadow dark:bg-surface-950 p-4">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold">{{ title }}</h2>
      <Button
        icon="pi pi-plus"
        rounded
        text
        aria-label="Add Todo"
        label="Add"
        @click="handleOpenAddDialog"
      />
    </div>

    <div class="space-y-2">
      <div
        v-if="sortedTodos.length === 0 && !isLoading"
        class="text-center py-8 text-surface-500 dark:text-surface-400"
      >
        <p>No to-dos yet. Add one to get started!</p>
      </div>

      <div
        v-for="todo in sortedTodos"
        :key="todo.id"
        draggable="true"
        @dragstart="handleDragStart(todo)"
        @dragover="handleDragOver"
        @dragenter="handleDragEnter(todo)"
        @dragleave="handleDragLeave"
        @drop="handleDrop($event, todo)"
        :class="[
          'flex items-center gap-3 p-3 rounded-md shadow dark:border-2 cursor-move transition-all',
          draggedOverItem?.id === todo.id
            ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20'
            : draggedItem?.id === todo.id
              ? 'opacity-50 bg-surface-100 dark:bg-surface-800'
              : 'hover:bg-surface-50 dark:hover:bg-surface-800 border-surface-200 dark:border-surface-700',
          updatingTodoId === todo.id && 'opacity-75 pointer-events-none',
        ]"
      >
        <Checkbox
          :modelValue="todo.is_completed"
          :binary="true"
          :disabled="updatingTodoId === todo.id"
          @update:modelValue="(checked) => handleCheckboxChange(todo, checked as boolean)"
          class="flex-shrink-0"
        />

        <span
          :class="[
            'flex-1 text-sm transition-colors font-bold !text-[var(--p-text-color)]',
            todo.is_completed
              ? 'line-through text-surface-400 dark:text-surface-500'
              : 'text-surface-900 dark:text-surface-0',
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
