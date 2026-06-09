<script setup lang="ts">
import { usePlannerStore } from '@/stores/planner';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';

const plannerStore = usePlannerStore();

const goToPreviousDay = () => {
  const prev = new Date(plannerStore.selectedDate);
  prev.setDate(prev.getDate() - 1);
  plannerStore.setSelectedDate(prev);
};

const goToNextDay = () => {
  const next = new Date(plannerStore.selectedDate);
  next.setDate(next.getDate() + 1);
  plannerStore.setSelectedDate(next);
};
</script>

<template>
  <div class="flex justify-center relative">
    <Button
      icon="pi pi-chevron-left"
      @click="goToPreviousDay"
      text
      rounded
      aria-label="Previous Day"
    />
    <div class="w-full max-w-sm">
      <DatePicker
        v-model="plannerStore.selectedDate"
        dateFormat="DD, MM dd, yy"
        :manualInput="false"
        inputClass="text-center w-full font-bold !text-[var(--p-text-color)]"
        panelClass="!left-1/2 !-translate-x-1/2"
        fluid
      />
    </div>
    <Button icon="pi pi-chevron-right" @click="goToNextDay" text rounded aria-label="Next Day" />
  </div>
</template>
