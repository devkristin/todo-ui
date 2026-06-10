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
  }>(),
  {
    startHour: 5,
    endHour: 23,
  },
);

const plannerStore = usePlannerStore();

const hours = computed(() => {
  const slots = [];
  for (let i = props.startHour; i <= props.endHour; i++) {
    slots.push(i);
  }
  return slots;
});

const getTodosForHour = (hour: number) => {
  return plannerStore.scheduledDailyTodos.filter((todo) => {
    if (!todo.schedule_time) return false;
    const todoHour = Number(todo.schedule_time.split(':')[0]);
    return todoHour === hour;
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

    <div class="flex flex-col gap-1 transition-all">
      <div
        v-for="hour in hours"
        :key="hour"
        class="flex items-start min-h-[3rem] border-b border-surface-100 dark:border-surface-800 py-2"
      >
        <div class="w-16 text-xs font-medium text-surface-500 pt-1">
          {{ hour > 12 ? hour - 12 : hour }}{{ hour >= 12 ? ' PM' : ' AM' }}
        </div>

        <div class="flex-1 flex flex-col gap-2">
          <div
            v-for="todo in getTodosForHour(hour)"
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
