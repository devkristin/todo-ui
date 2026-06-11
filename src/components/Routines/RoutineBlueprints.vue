<script setup lang="ts">
import { ref } from 'vue';
import { useRoutinesStore } from '@/stores/routines';
import type { BlueprintResponse, CreateBlueprintRequest } from '@/types/routines';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Menu from 'primevue/menu';
import DatePicker from 'primevue/datepicker'; // 1. Import this
import type { MenuItem } from 'primevue/menuitem';
import { parseDbTimeToDate, getRoundedDate, formatTimeForDb } from '@/utils/time'; // 2. Add formatTimeForDb

const routinesStore = useRoutinesStore();

const menuRefs = ref<Record<string, InstanceType<typeof Menu>>>({});
const showAddEditDialog = ref(false);
const showDeleteDialog = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const activeBlueprint = ref<BlueprintResponse | null>(null);

// Form State
const formData = ref({
  title: '',
  is_priority: false,
  schedule_time: null as Date | null,
});

// Drag & Drop State
const draggedBlueprint = ref<BlueprintResponse | null>(null);
const draggedOverBlueprint = ref<BlueprintResponse | null>(null);

// --- Actions ---

const handleTimeFocus = () => {
  if (!formData.value.schedule_time) {
    formData.value.schedule_time = getRoundedDate();
  }
};

const formatTo12Hour = (timeString: string) => {
  const parts = timeString.split(':').map(Number);

  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
};

const handleOpenAddDialog = () => {
  dialogMode.value = 'add';
  activeBlueprint.value = null;
  formData.value = {
    title: '',
    is_priority: false,
    schedule_time: null,
  };
  showAddEditDialog.value = true;
};

// Update handleOpenEditDialog
const handleOpenEditDialog = (bp: BlueprintResponse) => {
  dialogMode.value = 'edit';
  activeBlueprint.value = bp;

  // Use the utility to map DB string to Date
  formData.value = {
    title: bp.title,
    is_priority: bp.is_priority,
    schedule_time: parseDbTimeToDate(bp.schedule_time),
  };
  showAddEditDialog.value = true;
};

const handleOpenDeleteDialog = (bp: BlueprintResponse) => {
  activeBlueprint.value = bp;
  showDeleteDialog.value = true;
};

const handlePriorityChange = async (bp: BlueprintResponse) => {
  await routinesStore.updateBlueprint(bp.id, {
    is_priority: !bp.is_priority,
  });
};

const handleSave = async () => {
  if (!formData.value.title.trim() || !routinesStore.selectedRoutineId) return;

  // Use the utility to format back to DB string
  const timeString = formatTimeForDb(formData.value.schedule_time);

  const payload: CreateBlueprintRequest = {
    title: formData.value.title.trim(),
    is_priority: formData.value.is_priority,
    schedule_time: timeString,
  };

  if (dialogMode.value === 'add') {
    await routinesStore.createBlueprint(routinesStore.selectedRoutineId, payload);
  } else if (activeBlueprint.value) {
    await routinesStore.updateBlueprint(activeBlueprint.value.id, payload);
  }
  showAddEditDialog.value = false;
};

const handleSaveDelete = async () => {
  if (!activeBlueprint.value) return;
  await routinesStore.deleteBlueprint(activeBlueprint.value.id);
  showDeleteDialog.value = false;
  activeBlueprint.value = null;
};

// --- Menu Handling ---

const showMenu = (event: Event, id: string) => {
  menuRefs.value[id]?.toggle(event);
};

const setMenuRef = (el: any, id: string) => {
  if (el) {
    menuRefs.value[id] = el as InstanceType<typeof Menu>;
  } else {
    delete menuRefs.value[id];
  }
};

const menuItems = (bp: BlueprintResponse): MenuItem[] => [
  {
    label: 'Edit',
    icon: 'pi pi-pencil',
    command: () => handleOpenEditDialog(bp),
  },
  {
    label: bp.is_priority ? 'Deprioritize' : 'Prioritize',
    icon: 'pi pi-star',
    command: () => handlePriorityChange(bp),
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    command: () => handleOpenDeleteDialog(bp),
  },
];

// --- Drag and Drop Handling ---

const handleDragStart = (bp: BlueprintResponse) => {
  draggedBlueprint.value = bp;
};

const handleDragOver = (event: DragEvent, bp: BlueprintResponse) => {
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  draggedOverBlueprint.value = bp;
};

const handleDragEnd = () => {
  draggedBlueprint.value = null;
  draggedOverBlueprint.value = null;
};

const handleDrop = async (event: DragEvent, targetBp: BlueprintResponse) => {
  event.preventDefault();

  const dragged = draggedBlueprint.value;

  if (!dragged || dragged.id === targetBp.id) {
    handleDragEnd();
    return;
  }

  const list = routinesStore.sortedBlueprints;
  const targetIndex = list.findIndex((b) => b.id === targetBp.id);
  const draggedIndex = list.findIndex((b) => b.id === dragged.id);

  let newPosition: number;

  if (draggedIndex < targetIndex) {
    // Moving item down the list
    const nextItem = list[targetIndex + 1];

    newPosition = nextItem ? (targetBp.position + nextItem.position) / 2 : targetBp.position + 1.0;
  } else {
    // Moving item up the list
    const prevItem = list[targetIndex - 1];

    newPosition = prevItem ? (targetBp.position + prevItem.position) / 2 : targetBp.position / 2;
  }

  await routinesStore.updateBlueprint(dragged.id, {
    position: newPosition,
  });
  handleDragEnd();
};
</script>

<template>
  <div
    class="rounded-xl shadow bg-surface-0 dark:bg-surface-950 pt-3 px-4 pb-4 border border-surface-200 dark:border-surface-800"
  >
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-[var(--p-text-color)]">Routine Tasks</h2>
      <Button
        class="!p-1 !rounded"
        icon="pi pi-plus"
        rounded
        variant="text"
        aria-label="Add Task"
        label="Add"
        @click="handleOpenAddDialog"
      />
    </div>

    <div class="space-y-2">
      <div
        v-if="routinesStore.sortedBlueprints.length === 0 && !routinesStore.isLoading"
        class="text-center rounded p-4 bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 font-medium"
      >
        No tasks in this routine yet.
      </div>

      <div
        v-for="bp in routinesStore.sortedBlueprints"
        :key="bp.id"
        draggable="true"
        @dragstart="handleDragStart(bp)"
        @dragover="handleDragOver($event, bp)"
        @dragend="handleDragEnd"
        @drop="handleDrop($event, bp)"
        :class="{
          'flex items-center gap-3 p-3 rounded-md border-2 cursor-move transition-all': true,

          // Priority Styling
          'bg-secondary-200 hover:bg-secondary-200/75 dark:bg-surface-900 dark:hover:bg-surface-800':
            bp.is_priority,
          'border-secondary-400 dark:border-primary-600 bg-secondary-100 dark:bg-primary-900/20':
            bp.is_priority && draggedOverBlueprint?.id === bp.id,
          'border-transparent hover:border-secondary-300 dark:border-surface-700':
            bp.is_priority && draggedOverBlueprint?.id !== bp.id,

          // Standard Styling
          'bg-primary-200 hover:bg-primary-200/75 dark:bg-surface-900 dark:hover:bg-surface-800':
            !bp.is_priority,
          'border-primary-400 bg-primary-100 dark:bg-primary-900/20':
            !bp.is_priority && draggedOverBlueprint?.id === bp.id,
          'border-transparent hover:border-primary-300 dark:border-surface-700':
            !bp.is_priority && draggedOverBlueprint?.id !== bp.id,

          // Dragging state
          'opacity-40 dark:opacity-50 bg-surface-100 dark:bg-surface-800':
            draggedBlueprint?.id === bp.id,
        }"
      >
        <div
          class="flex items-center justify-center w-6 cursor-grab text-surface-400 dark:text-surface-500"
        >
          <i class="pi pi-bars"></i>
        </div>

        <span class="flex-1 text-sm transition-colors font-semibold !text-[var(--p-text-color)]">
          {{ bp.title }}
        </span>

        <i
          v-if="bp.is_priority"
          class="pi pi-star-fill text-secondary-500 dark:text-secondary-400 text-sm"
        ></i>

        <div
          v-if="bp.schedule_time"
          class="flex-shrink-0 border-1 border-transparent bg-white/75 dark:bg-primary-400 text-surface-500 dark:text-black/75 text-xs font-medium px-2.5 py-0.5 rounded-full"
        >
          {{ formatTo12Hour(bp.schedule_time) }}
        </div>

        <div class="flex-shrink-0">
          <Button
            icon="pi pi-ellipsis-v"
            text
            rounded
            size="small"
            class="!text-[var(--p-text-color)] !bg-transparent"
            @click="(event) => showMenu(event, bp.id)"
          />
          <Menu :ref="(el) => setMenuRef(el, bp.id)" :model="menuItems(bp)" :popup="true" />
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showAddEditDialog"
      :header="dialogMode === 'add' ? 'Add Task' : 'Edit Task'"
      :modal="true"
      :closable="true"
      class="w-full max-w-md"
    >
      <div class="flex flex-col gap-4 mt-2">
        <div class="flex flex-col gap-2">
          <label for="title" class="font-semibold text-sm">Title</label>
          <InputText id="title" v-model="formData.title" autofocus autocomplete="off" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="font-semibold text-sm">Time</label>
          <DatePicker
            v-model="formData.schedule_time"
            placeholder="Select Time"
            timeOnly
            hourFormat="12"
            :stepMinute="15"
            fluid
            showClear
            @focus="handleTimeFocus"
          />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="formData.is_priority" inputId="priority" :binary="true" />
          <label for="priority" class="text-sm cursor-pointer">Mark as Priority</label>
        </div>
        <div class="flex gap-2 justify-end mt-4">
          <Button label="Cancel" severity="secondary" text @click="showAddEditDialog = false" />
          <Button label="Save" :loading="routinesStore.isLoading" @click="handleSave" />
        </div>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showDeleteDialog"
      header="Delete Task"
      :modal="true"
      :closable="true"
      class="w-full max-w-md"
    >
      <div class="space-y-4">
        <p class="mt-2">
          Are you sure you want to remove "<strong>{{ activeBlueprint?.title }}</strong
          >" from this routine?
        </p>
        <div class="flex gap-2 justify-end mt-4">
          <Button label="Cancel" severity="secondary" text @click="showDeleteDialog = false" />
          <Button
            label="Delete"
            severity="danger"
            :loading="routinesStore.isLoading"
            @click="handleSaveDelete"
          />
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
