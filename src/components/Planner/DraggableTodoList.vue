<script setup lang="ts">
import { ref } from 'vue';
import type { CreateTodoRequest, TodoResponse } from '@/types/todos';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import IftaLabel from 'primevue/iftalabel';
import Menu from 'primevue/menu';
import { DatePicker } from 'primevue';
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
const editDate = ref<Date | null>(new Date());
const editTime = ref<Date | null>(null);
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
  editDate.value = plannerStore.selectedDate || new Date();
  editTime.value = null;
  showAddDialog.value = true;
};

const handleOpenEditDialog = (todo: TodoResponse) => {
  editingTodo.value = todo;
  editTitle.value = todo.title;
  editDate.value = todo.schedule_date ? new Date(todo.schedule_date) : new Date();

  if (todo.schedule_time) {
    const parts = todo.schedule_time.split(':').map(Number);

    const h = parts[0] ?? 0;
    const m = parts[1] ?? 0;
    const s = parts[2] ?? 0;

    const d = new Date();
    d.setHours(h, m, s);
    editTime.value = d;
  } else {
    editTime.value = null;
  }

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

const formatTimeToString = (date: Date | null): string | undefined => {
  if (!date) return undefined;
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

const handleSaveAdd = async () => {
  if (!editTitle.value.trim()) return;

  const dateString = editDate.value!.toISOString().split('T')[0];

  showAddDialog.value = false;

  const createTodo: CreateTodoRequest = {
    schedule_date: dateString!,
    schedule_time: formatTimeToString(editTime.value),
    title: editTitle.value.trim(),
    is_priority: props.priority,
  };

  await plannerStore.createTodo(createTodo);
};

const handleSaveEdit = async () => {
  if (!editingTodo.value || !editTitle.value.trim()) return;

  const dateString = editDate.value!.toISOString().split('T')[0];

  showEditDialog.value = false;

  await plannerStore.updateTodo(editingTodo.value.id, {
    title: editTitle.value.trim(),
    schedule_date: dateString,
    schedule_time: formatTimeToString(editTime.value),
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
          class="flex-shrink-0 border-1 border-tertiary-50 dark:border-primary-400 bg-tertiary-50 dark:bg-primary-400 text-surface-500 dark:text-black/75 text-xs font-medium px-2.5 py-0.5 rounded-full"
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

    <Dialog
      v-model:visible="showAddDialog"
      :header="props.priority ? 'Add Priority' : 'Add To-Do'"
      :modal="true"
      :closable="true"
      class="w-full max-w-md"
    >
      <div class="space-y-4">
        <div class="flex flex-col gap-4">
          <IftaLabel class="w-full">
            <label for="title">Title</label>
            <InputText
              id="title"
              aria-label="Title"
              v-model="editTitle"
              placeholder="e.g. Go for a walk"
              autofocus
              fluid
              @keyup.enter="handleSaveAdd"
            />
          </IftaLabel>
        </div>
        <div class="flex flex-col gap-2 flex-1">
          <IftaLabel class="w-full">
            <label for="date">Date</label>
            <DatePicker inputId="date" v-model="editDate" dateFormat="yy-mm-dd" showIcon fluid />
          </IftaLabel>
        </div>
        <div class="flex flex-col gap-2 flex-1">
          <IftaLabel class="w-full">
            <label for="time">Time</label>
            <DatePicker inputId="time" v-model="editTime" timeOnly hourFormat="12" fluid />
          </IftaLabel>
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
        <div class="flex flex-col gap-4">
          <IftaLabel class="w-full">
            <label for="title">Title</label>
            <InputText
              id="title"
              aria-label="Title"
              v-model="editTitle"
              placeholder="e.g. Go for a walk"
              autofocus
              fluid
              @keyup.enter="handleSaveEdit"
            />
          </IftaLabel>
        </div>
        <div class="flex flex-col gap-2 flex-1">
          <IftaLabel class="w-full">
            <label for="date">Date</label>
            <DatePicker inputId="date" v-model="editDate" dateFormat="yy-mm-dd" showIcon fluid />
          </IftaLabel>
        </div>
        <div class="flex flex-col gap-2 flex-1">
          <IftaLabel class="w-full">
            <label for="time">Time</label>
            <DatePicker inputId="time" v-model="editTime" timeOnly hourFormat="12" fluid />
          </IftaLabel>
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
