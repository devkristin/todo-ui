<script setup lang="ts">
import Button from 'primevue/button';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const close = () => {
  emit('update:visible', false);
};

const handleSignOut = async () => {
  await authStore.signOut();
  router.push('/');
  close();
};

const handleSignin = () => {
  router.push('/login');
  close();
};

const handleRegister = () => {
  router.push('/register');
  close();
};
</script>

<template>
  <div
    class="w-full sm:w-auto flex flex-wrap sm:flex-nowrap items-center justify-start sm:justify-end gap-4"
  >
    <Button
      v-if="authStore.isAuthenticated"
      label="Sign Out"
      severity="secondary"
      variant="outlined"
      size="small"
      fluid
      @click="handleSignOut"
    />
    <Button
      v-if="!authStore.isAuthenticated"
      label="Sign In"
      severity="secondary"
      size="small"
      fluid
      @click="handleSignin"
    />
    <Button
      v-if="!authStore.isAuthenticated"
      label="Register"
      severity="secondary"
      variant="outlined"
      size="small"
      fluid
      @click="handleRegister"
    />
  </div>
</template>
