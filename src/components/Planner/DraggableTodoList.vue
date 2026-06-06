<script setup lang="ts">
import { ref, computed } from 'vue';
import { todosApi } from '@/api/todos';
import type { TodoResponse } from '@/types/todos';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';

interface Props {
  title: string;
  todos: TodoResponse[];
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const emit = defineEmits<{
  'add-todo': [];
  'edit-todo': [todo: TodoResponse];
  'delete-todo': [todo: TodoResponse];
  'todos-reordered': [];
}>();

const draggedItem = ref<TodoResponse | null>(null);
const draggedOverItem = ref<TodoResponse | null>(null);
const menuRefs = ref<Record<string, InstanceType<typeof Menu>>>({});
const updatingTodoId = ref<string | null>(null);

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

  // Calculate boundary conditions based on drop direction
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
      emit('edit-todo', todo);
    },
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    command: () => {
      emit('delete-todo', todo);
    },
  },
];
</script>

<template>
  <div class="rounded-lg transition-colors">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold">{{ title }}</h2>
      <Button
        icon="pi pi-plus"
        rounded
        text
        aria-label="Add Todo"
        label="Add"
        @click="$emit('add-todo')"
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
          'flex items-center gap-3 p-3 rounded-md border-2 border-surface-100 cursor-move transition-all',
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
            'flex-1 text-sm transition-colors',
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
  </div>
</template>

<style scoped>
:deep(.p-menu) {
  min-width: 10rem;
}
</style>
