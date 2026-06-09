<script setup lang="ts">
import { ref } from 'vue';
import type { CreateTodoRequest, TodoResponse } from '@/types/todos';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import AddEditTodoDialog from './AddEditTodoDialog.vue';
import Dialog from 'primevue/dialog';
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
const showAddEditDialog = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const activeTodo = ref<TodoResponse | null>(null);

const showDeleteDialog = ref(false);

const handleCheckboxChange = async (todo: TodoResponse, checked: boolean) => {
  try {
    plannerStore.setUpdatingTodoId(todo.id);
    await plannerStore.updateTodo(todo.id, { is_completed: checked });
  } finally {
    plannerStore.setUpdatingTodoId(null);
  }
};

const handleOpenAddDialog = () => {
  dialogMode.value = 'add';
  activeTodo.value = null;
  showAddEditDialog.value = true;
};

const handleOpenEditDialog = (todo: TodoResponse) => {
  dialogMode.value = 'edit';
  activeTodo.value = todo;
  showAddEditDialog.value = true;
};

const handleOpenDeleteDialog = (todo: TodoResponse) => {
  activeTodo.value = todo;
  showDeleteDialog.value = true;
};

const handlePriorityChange = async (todo: TodoResponse) => {
  await plannerStore.updateTodo(todo.id, {
    is_priority: !todo.is_priority,
  });
};

const formatTimeToString = (date: Date | null): string | null => {
  if (!date) return null;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const formatTo12Hour = (timeString: string) => {
  const parts = timeString.split(':').map(Number);

  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
};

const handleSave = async (payload: { title: string; date: Date; time: Date | null }) => {
  const dateString = payload.date!.toISOString().split('T')[0];

  if (dialogMode.value === 'add') {
    const createTodo: CreateTodoRequest = {
      schedule_date: dateString!,
      schedule_time: formatTimeToString(payload.time),
      title: payload.title.trim(),
      is_priority: props.priority,
    };
    await plannerStore.createTodo(createTodo);
  } else if (activeTodo.value) {
    await plannerStore.updateTodo(activeTodo.value.id, {
      title: payload.title.trim(),
      schedule_date: dateString,
      schedule_time: formatTimeToString(payload.time),
    });
  }
  activeTodo.value = null;
};

const handleSaveDelete = async () => {
  if (!activeTodo.value) return;
  showDeleteDialog.value = false;
  await plannerStore.deleteTodo(activeTodo.value.id);
  activeTodo.value = null;
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
    icon: 'pi pi-star',
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
      <h2 class="text-lg font-bold">
        {{ title }}
      </h2>
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
        class="text-center text-surface-500 dark:text-surface-400"
      >
        <p
          :class="{
            'rounded p-4 text-[var(--p-text-color)] dark:bg-transparent font-medium': true,
            'bg-secondary-200': props.priority,
            'bg-primary-200': !props.priority,
          }"
        >
          No to-dos yet. Add one to get started!
        </p>
      </div>

      <div
        v-for="todo in props.todos"
        :key="todo.id"
        draggable="true"
        @dragstart="plannerStore.handleDragStart(todo)"
        @dragover="plannerStore.handleDragOver($event, todo)"
        @dragend="plannerStore.handleDragEnd"
        @drop="plannerStore.handleDrop($event, todo)"
        :class="{
          'flex items-center gap-3 p-3 rounded-md border-2 cursor-move transition-all': true,

          // Dragged over state for Priority list items
          'border-secondary-400 dark:border-primary-600 bg-secondary-100 dark:bg-primary-900/20':
            todo.is_priority && plannerStore.draggedOverTodo?.id === todo.id,
          // Dragged over state for To-Do list items
          'border-primary-400 bg-primary-100 dark:bg-primary-900/20':
            !todo.is_priority && plannerStore.draggedOverTodo?.id === todo.id,

          // Dragging state
          'opacity-40 dark:opacity-50 bg-surface-100 dark:bg-surface-800':
            plannerStore.draggedTodo?.id === todo.id,

          // Default state for Priority list items
          'border-transparent hover:border-secondary-300 bg-secondary-200 hover:bg-secondary-200/75 dark:border-surface-700 dark:hover:border-surface-700 dark:bg-surface-900 dark:hover:bg-surface-800':
            todo.is_priority &&
            plannerStore.draggedOverTodo?.id !== todo.id &&
            plannerStore.draggedTodo?.id !== todo.id,
          // Default state for To-Do list items
          'border-transparent hover:border-primary-300 bg-primary-200 hover:bg-primary-200/75 dark:border-surface-700 dark:hover:border-surface-700 dark:bg-surface-900 dark:hover:bg-surface-800':
            !todo.is_priority &&
            plannerStore.draggedOverTodo?.id !== todo.id &&
            plannerStore.draggedTodo?.id !== todo.id,

          // Updating state
          'opacity-75 pointer-events-none': plannerStore.updatingTodoId === todo.id,
        }"
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
            'flex-1 text-sm transition-colors font-semibold',
            todo.is_completed
              ? 'line-through text-surface-400 dark:text-surface-500'
              : '!text-[var(--p-text-color)]',
          ]"
        >
          {{ todo.title }}
        </span>

        <div
          v-if="todo.schedule_time"
          class="flex-shrink-0 border-1 border-transparent bg-white/75 dark:bg-primary-400 text-surface-500 dark:text-black/75 text-xs font-medium px-2.5 py-0.5 rounded-full"
        >
          {{ formatTo12Hour(todo.schedule_time) }}
        </div>

        <div class="flex-shrink-0">
          <Button
            icon="pi pi-ellipsis-v"
            text
            rounded
            size="small"
            class="!text-[var(--p-text-color)] !bg-transparent"
            @click="(event) => showMenu(event, todo.id)"
          />
          <Menu :ref="(el) => setMenuRef(el, todo.id)" :model="menuItems(todo)" :popup="true" />
        </div>
      </div>
    </div>

    <AddEditTodoDialog
      v-model:visible="showAddEditDialog"
      :mode="dialogMode"
      :todo="activeTodo"
      :priority="props.priority"
      @save="handleSave"
    />

    <Dialog
      v-model:visible="showDeleteDialog"
      header="Delete"
      :modal="true"
      :closable="true"
      class="w-full max-w-md"
    >
      <div class="space-y-4">
        <div class="flex flex-col gap-2">
          <h3>Are you sure you want to delete "{{ activeTodo?.title }}"?</h3>
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
