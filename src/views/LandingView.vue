<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted, onUnmounted } from 'vue';
import Button from 'primevue/button';

const router = useRouter();
const wordsList = ['Coordinate', 'Motivate', 'Automate', 'Regulate', 'Celebrate'];
const wordIndex = ref(0);
const word = ref(wordsList[0]);

let interval: ReturnType<typeof setInterval>;

onMounted(() => {
  interval = setInterval(() => {
    wordIndex.value = (wordIndex.value + 1) % wordsList.length;
    word.value = wordsList[wordIndex.value];
  }, 2000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <div class="flex flex-wrap lg:flex-nowrap w-full gap-4 justify-center items-center">
    <div class="w-full md:w-2/3 lg:max-w-1/2 px-4">
      <img src="../assets/landing.png" alt="Logo" />
    </div>
    <div class="w-full md:w-2/3 lg:max-w-1/3 lg:max-w-2/5 xl:max-w-1/2 px-4 mb-8">
      <h1
        class="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-4 leading-snug"
      >
        <span class="block">Your Space</span>
        <span>to </span>
        <Transition name="word-slide" mode="out-in">
          <i :key="word">
            <span class="bg-primary-200 dark:bg-tertiary-500/25 px-4">
              {{ word }}
            </span>
          </i>
        </Transition>
      </h1>
      <p class="text-lg md:text-xl mb-8 dark:text-primary-300 mb-10">
        An all-in-one productivity toolkit designed to help organize your life and improve your
        overall health and wellness.
      </p>
      <div class="flex flex-col md:flex-row gap-4">
        <Button label="Sign In" size="medium" fluid @click="router.push('/login')" />
        <Button label="Register" size="medium" outlined fluid @click="router.push('/register')" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.word-slide-enter-active,
.word-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  display: inline-block;
}

.word-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.word-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
