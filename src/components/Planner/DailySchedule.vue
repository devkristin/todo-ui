<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlannerStore } from '@/stores/planner';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import Popover from 'primevue/popover';
import SelectButton from 'primevue/selectbutton';
import Select from 'primevue/select'; // PrimeVue v4 selection component

const plannerStore = usePlannerStore();

// Move configuration into internal component state variables
const startHour = ref(5);
const endHour = ref(23);
const increment = ref(30); // Dynamic block size: 15, 30, or 60 minutes

// Lists for the filter configuration options
const incrementOptions = [
  { label: '15 Min', value: 15 },
  { label: '30 Min', value: 30 },
  { label: '1 Hour', value: 60 },
];

// Generate simple 24h array blocks for hour dropdown filters
const hoursRange = Array.from({ length: 24 }, (_, i) => ({
  label: i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i - 12} PM` : `${i} AM`,
  value: i,
}));

// Filter hoursRange dynamically to prevent start hour from overlapping or exceeding the end hour
const filteredStartHours = computed(() => {
  return hoursRange.filter((h) => h.value < endHour.value);
});

const filteredEndHours = computed(() => {
  return hoursRange.filter((h) => h.value > startHour.value);
});

interface TimeSlot {
  label: string;
  hour: number;
  minute: number;
  rawTimeStr: string;
}

// Generate slots dynamically based on the component's internal ref configurations
const timeSlots = computed<TimeSlot[]>(() => {
  const slots: TimeSlot[] = [];
  const startMinutes = startHour.value * 60;
  const endMinutes = endHour.value * 60;

  for (let minutes = startMinutes; minutes <= endMinutes; minutes += increment.value) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? ' PM' : ' AM';
    const displayMinute = minute === 0 ? '00' : minute.toString().padStart(2, '0');
    const label = `${displayHour}:${displayMinute}${ampm}`;

    const rawTimeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    slots.push({ label, hour, minute, rawTimeStr });
  }
  return slots;
});

// Filters todos that fall within the current slot block
const getTodosForSlot = (currentSlot: TimeSlot, index: number) => {
  return plannerStore.scheduledDailyTodos.filter((todo) => {
    if (!todo.schedule_time) return false;

    // 1. Normalize the API time string (handles both "HH:mm:ss" and "HH:mm")
    const timeParts = todo.schedule_time.split(':');
    const todoHour = Number(timeParts[0]);
    const todoMinute = Number(timeParts[1]);

    // 2. Calculate absolute total minutes
    const todoTotalMinutes = todoHour * 60 + todoMinute;
    const currentSlotMinutes = currentSlot.hour * 60 + currentSlot.minute;

    // 3. Perfect Match Optimization: If it's a direct match for this slot's start time
    const normalizedTodoStr = `${todoHour.toString().padStart(2, '0')}:${todoMinute.toString().padStart(2, '0')}`;
    if (normalizedTodoStr === currentSlot.rawTimeStr) {
      return true;
    }

    // 4. Range Optimization: Check if it falls into this slot's bucket window
    const nextSlot = timeSlots.value[index + 1];
    if (nextSlot) {
      const nextSlotMinutes = nextSlot.hour * 60 + nextSlot.minute;
      return todoTotalMinutes >= currentSlotMinutes && todoTotalMinutes < nextSlotMinutes;
    } else {
      const endOfBlockMinutes = currentSlotMinutes + increment.value;
      return todoTotalMinutes >= currentSlotMinutes && todoTotalMinutes < endOfBlockMinutes;
    }
  });
};

const handleCheckboxChange = async (todo: any, checked: boolean) => {
  plannerStore.setUpdatingTodoId(todo.id);
  await plannerStore.updateTodo(todo.id, { is_completed: checked });
  plannerStore.setUpdatingTodoId(null);
};

const templateMenu = ref();
const filterPopover = ref();

const showTemplateMenu = (event: Event) => {
  templateMenu.value.toggle(event);
};

const toggleFilterPopover = (event: Event) => {
  filterPopover.value.toggle(event);
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
    <div
      class="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3"
    >
      <h2 class="text-lg font-bold">Schedule</h2>

      <div class="flex items-center gap-1">
        <Button
          class="!p-1.5 !rounded"
          variant="text"
          severity="secondary"
          @click="toggleFilterPopover"
        >
          <i class="pi pi-sliders-h"></i>
          <span class="font-medium text-sm hidden xs:inline ml-1">Layout</span>
        </Button>

        <Button
          class="!p-1.5 !rounded"
          variant="text"
          severity="secondary"
          @click="showTemplateMenu"
        >
          <i class="pi pi-copy"></i>
          <span class="font-medium text-sm hidden xs:inline">Templates</span>
        </Button>
      </div>

      <Menu ref="templateMenu" id="template_menu" :model="menuItems" :popup="true" />

      <Popover ref="filterPopover" id="filter_popover" :dismissable="true">
        <div class="p-2 flex flex-col gap-4 min-w-[16rem]">
          <div class="text-xs font-bold text-surface-400 uppercase tracking-wider">
            Schedule Layout
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
              Time Increments
            </label>
            <SelectButton
              v-model="increment"
              :options="incrementOptions"
              optionLabel="label"
              optionValue="value"
              :allowEmpty="false"
              fluid
            >
              <template #option="slotProps">
                <span
                  :class="[
                    increment === slotProps.option.value
                      ? '!text-[var(--p-text-color)]'
                      : 'text-surface-400',
                    'text-sm',
                  ]"
                >
                  {{ slotProps.option.value }}
                </span>
              </template>
            </SelectButton>
          </div>

          <div class="flex flex-col gap-3 border-t border-surface-100 dark:border-surface-800 pt-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
                Start Hour
              </label>
              <Select
                v-model="startHour"
                :options="filteredStartHours"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Start"
                class="!text-sm"
                appendTo="self"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-surface-600 dark:text-surface-400">
                End Hour
              </label>
              <Select
                v-model="endHour"
                :options="filteredEndHours"
                optionLabel="label"
                optionValue="value"
                placeholder="Select End"
                class="!text-sm"
                appendTo="self"
              />
            </div>
          </div>
        </div>
      </Popover>
    </div>

    <div class="flex flex-col transition-all">
      <div
        v-for="(slot, index) in timeSlots"
        :key="slot.rawTimeStr"
        class="flex items-start min-h-[3rem] border-b border-surface-100 dark:border-surface-800 py-2 animate-fadein"
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
