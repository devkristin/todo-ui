<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import LotusIcon from './icons/LotusIcon.vue';

const isHovered = ref(false);
</script>

<template>
  <RouterLink
    to="/"
    class="!text-current flex items-center -ml-1 md:-ml-3"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <LotusIcon :isHovered="isHovered" class="max-w-20 sm:max-w-25 md:max-w-30 lg:max-w-35" />
    <span class="font-custom font-bold text-lg sm:text-xl lowercase pr-4 -ml-1 md:-ml-3">
      Lotus List
    </span>
  </RouterLink>
</template>
