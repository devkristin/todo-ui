<script setup lang="ts">
import DailyPlanner from '@/components/Planner/DailyPlanner.vue';
import type { PlannerType } from '@/types/planner';
import { ref } from 'vue';

const plannerType = ref<PlannerType>('Daily');
</script>

<template>
  <div class="grow w-full p-4">
    <h1 class="text-2xl font-bold mb-4">{{ plannerType }} Planner</h1>
    <DailyPlanner v-if="plannerType === 'Daily'" />
  </div>
</template>
