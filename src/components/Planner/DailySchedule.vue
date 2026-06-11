<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlannerStore } from '@/stores/planner';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Menu from 'primevue/menu';

const props = withDefaults(
  defineProps<{
    startHour?: number;
    endHour?: number;
    increment?: number;
  }>(),
  {
    startHour: 5,
    endHour: 23,
    increment: 30,
  },
);

const plannerStore = usePlannerStore();

interface TimeSlot {
  label: string;
  hour: number;
  minute: number;
  rawTimeStr: string;
}

// Generate slots based on start/end hours and the increment value
const timeSlots = computed<TimeSlot[]>(() => {
  const slots: TimeSlot[] = [];
  const startMinutes = props.startHour * 60;
  const endMinutes = props.endHour * 60;

  for (let minutes = startMinutes; minutes <= endMinutes; minutes += props.increment) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    // Formatting 12-hour display string (e.g., "5:30 AM", "12:00 PM")
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? ' PM' : ' AM';
    const displayMinute = minute === 0 ? '00' : minute.toString().padStart(2, '0');
    const label = `${displayHour}:${displayMinute}${ampm}`;

    // Used to match against todo.schedule_time formats (e.g., "05:30:00" or "17:00")
    const rawTimeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    slots.push({ label, hour, minute, rawTimeStr });
  }
  return slots;
});

// Filters todos that fall within the current slot block up until the next slot
const getTodosForSlot = (currentSlot: TimeSlot, index: number) => {
  return plannerStore.scheduledDailyTodos.filter((todo) => {
    if (!todo.schedule_time) return false;

    // Splits "HH:MM:SS" or "HH:MM" down to numbers
    const [todoHour, todoMinute] = todo.schedule_time.split(':').map(Number);
    if (!todoHour || !todoMinute) return false;
    const todoTotalMinutes = todoHour * 60 + todoMinute;

    const currentSlotMinutes = currentSlot.hour * 60 + currentSlot.minute;
    const nextSlot = timeSlots.value[index + 1];

    if (nextSlot) {
      const nextSlotMinutes = nextSlot.hour * 60 + nextSlot.minute;
      // Todo belongs here if it falls on or after this slot, but strictly before the next
      return todoTotalMinutes >= currentSlotMinutes && todoTotalMinutes < nextSlotMinutes;
    } else {
      // For the final slot block, handle everything up to the absolute end of that block
      const endOfBlockMinutes = currentSlotMinutes + props.increment;
      return todoTotalMinutes >= currentSlotMinutes && todoTotalMinutes < endOfBlockMinutes;
    }
  });
};

const handleCheckboxChange = async (todo: any, checked: boolean) => {
  plannerStore.setUpdatingTodoId(todo.id);
  await plannerStore.updateTodo(todo.id, { is_completed: checked });
  plannerStore.setUpdatingTodoId(null);
};

const menu = ref();

const showMenu = (event: Event) => {
  menu.value.toggle(event);
};

const menuItems = ref([
  {
    label: 'Import a Template',
    icon: 'pi pi-file-import',
    command: () => {
      handleImport();
    },
  },
  {
    label: 'Manage Templates',
    icon: 'pi pi-file-edit',
    command: () => {
      handleManage();
    },
  },
]);

const handleImport = () => {
  // TODO Import from library
};

const handleManage = () => {
  // TODO Manage in library
};
</script>

<template>
  <div class="rounded-xl shadow dark:bg-surface-950 p-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold">Schedule</h2>
      <Button class="!p-1 !rounded" rounded variant="text" @click="(event) => showMenu(event)">
        <i class="pi pi-copy"></i>
        <span class="font-medium">Templates</span>
        <i class="pi pi-chevron-down text-[.7rem] opacity-60"></i>
      </Button>
      <Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true" />
    </div>

    <div class="flex flex-col transition-all mt-4">
      <div
        v-for="(slot, index) in timeSlots"
        :key="slot.rawTimeStr"
        class="flex items-start min-h-[3rem] border-b border-surface-100 dark:border-surface-800 py-2"
      >
        <div class="w-20 text-xs font-medium text-surface-500 pt-1">
          {{ slot.label }}
        </div>

        <div class="flex-1 flex flex-col gap-2">
          <div
            v-for="todo in getTodosForSlot(slot, index)"
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
