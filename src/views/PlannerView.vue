<script setup lang="ts">
import DailyPlanner from '@/components/Planner/DailyPlanner.vue';
import type { PlannerType } from '@/types/planner';
import { ref } from 'vue';
import GenerateAI from '@/components/GenerateAI.vue';

const plannerType = ref<PlannerType>('Daily');
</script>

<template>
  <div class="grow w-full p-4 relative">
    <div class="lg:absolute lg:inset-x-4 flex flex-wrap justify-between items-center mb-4">
      <h1 class="text-2xl font-bold text-center sm:text-left">{{ plannerType }} Planner</h1>
      <GenerateAI class="hidden" />
    </div>
    <DailyPlanner v-if="plannerType === 'Daily'" />
  </div>
</template>
