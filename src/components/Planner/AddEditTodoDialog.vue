<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { TodoResponse } from '@/types/todos';
import Dialog from 'primevue/dialog';
import { Form, FormField } from '@primevue/forms';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { DatePicker } from 'primevue';
import { usePlannerStore } from '@/stores/planner';

const props = defineProps<{
  todo?: TodoResponse | null;
  mode: 'add' | 'edit';
  priority?: boolean;
}>();

const plannerStore = usePlannerStore();

const visible = defineModel<boolean>('visible');
const emit = defineEmits(['save']);

const title = ref('');
const date = ref<Date>(new Date());
const time = ref<Date | null>(null);

const headerText = computed(() => {
  const addText = props.priority ? 'Add Priority Item' : 'Add To-Do Item';
  const editText = 'Edit';
  return props.mode == 'add' ? addText : editText;
});

const getRoundedDate = (date: Date = new Date()): Date => {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const remainder = minutes % 15;

  if (remainder !== 0) {
    rounded.setMinutes(minutes + (15 - remainder));
  }
  rounded.setSeconds(0);
  rounded.setMilliseconds(0);
  return rounded;
};

const handleTimeFocus = () => {
  if (!time.value) {
    time.value = getRoundedDate();
  }
};

const getDate = (todo: TodoResponse | null) => {
  if (todo?.schedule_date) {
    new Date(todo.schedule_date);
  }
  return plannerStore.selectedDate || new Date();
};

const getTime = (todo: TodoResponse | null) => {
  if (todo?.schedule_time) {
    const parts = todo.schedule_time.split(':').map(Number);

    const h = parts[0] ?? 0;
    const m = parts[1] ?? 0;
    const s = parts[2] ?? 0;

    const d = new Date();
    d.setHours(h, m, s);
    return d;
  }
  return null;
};

watch(visible, (newVal) => {
  if (newVal) {
    title.value = props.todo?.title ?? '';
    date.value = getDate(props.todo ?? null);
    time.value = getTime(props.todo ?? null);
  }
});

const handleSave = () => {
  emit('save', {
    title: title.value,
    date: date.value,
    time: time.value,
  });
  visible.value = false;
};
</script>

<template>
  <Dialog v-model:visible="visible" :header="headerText" modal class="w-full max-w-sm">
    <Form class="flex flex-col gap-4">
      <FormField>
        <InputText
          v-model="title"
          placeholder="Title"
          id="title"
          fluid
          autofocus
          class="!relative"
          @keyup.enter="handleSave"
        />
      </FormField>
      <FormField>
        <DatePicker v-model="date" placeholder="Date" dateFormat="yy-mm-dd" fluid required />
      </FormField>
      <FormField>
        <DatePicker
          v-model="time"
          placeholder="Time"
          timeOnly
          hourFormat="12"
          :stepMinute="15"
          fluid
          showClear
          @focus="handleTimeFocus"
        />
      </FormField>
      <div class="flex justify-end gap-2 pt-34">
        <Button label="Cancel" severity="secondary" @click="visible = false" />
        <Button label="Save" @click="handleSave" />
      </div>
    </Form>
  </Dialog>
</template>
