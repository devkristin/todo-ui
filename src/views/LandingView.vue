<script setup lang="ts">
import { useRouter } from 'vue-router';

import Button from 'primevue/button';

const router = useRouter();
</script>

<template>
  <div class="flex flex-wrap lg:flex-nowrap w-full gap-4 justify-center">
    <div class="w-full md:w-2/3 lg:max-w-1/2 px-4">
      <img src="../assets/landing.png" alt="Logo" />
    </div>
    <div class="w-full md:w-2/3 lg:max-w-1/3 lg:max-w-2/5 px-4 mb-8">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-4">
        <span class="xl:block">Focused</span> Planning
      </h1>
      <p class="text-lg md:text-xl mb-8 dark:text-primary-300 mb-10">
        Organize your day and sharpen your focus with a personalized daily planner
      </p>
      <div class="flex flex-col md:flex-row gap-4">
        <Button label="Sign In" size="medium" fluid @click="router.push('/login')" />
        <Button label="Register" size="medium" outlined fluid @click="router.push('/register')" />
      </div>
    </div>
  </div>
</template>
