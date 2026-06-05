<script setup lang="ts">
import { RouterView } from 'vue-router';
import Header from './components/Header.vue';
</script>

<template>
  <Header />
  <main class="grow flex flex-col items-center justify-center">
    <RouterView />
  </main>
</template>
