<script setup lang="ts">
import { RouterView } from 'vue-router';
import Header from './components/Header.vue';
import { useHealthCheck } from './composables/useHealthCheck.ts';
import { onMounted } from 'vue';

const healthCheck = useHealthCheck();

onMounted(() => {
  healthCheck.init();
});
</script>

<template>
  <div class="grow flex flex-col lg:px-10 pb-8 lg:pb-10">
    <Header />
    <main class="grow flex flex-col items-center justify-center">
      <RouterView />
    </main>
  </div>
</template>
