<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

const email = ref('');
const password = ref('');

const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value);
    router.push('/planner');
  } catch (err) {
    // Handled by store
  }
};
</script>

<template>
  <div>
    <Card>
      <template #title>
        <div class="text-center">
          <i class="pi pi-sign-in" style="font-size: 2rem"></i>
          <h2 class="text-4xl">Welcome Back</h2>
        </div>
      </template>

      <template #subtitle>
        <p class="text-center">Sign in to manage your daily planner</p>
      </template>

      <template #content>
        <form class="flex flex-col pt-4 gap-5" @submit.prevent="handleLogin">
          <div>
            <label>
              Email Address
              <IconField>
                <InputIcon class="pi pi-envelope" />
                <InputText
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  size="large"
                  fluid
                  required
                  autocomplete="email"
                />
              </IconField>
            </label>
          </div>

          <div>
            <label>
              Password
              <IconField>
                <InputIcon class="pi pi-lock" />
                <Password
                  id="password"
                  v-model="password"
                  placeholder="••••••••"
                  :feedback="false"
                  toggleMask
                  size="large"
                  fluid
                  required
                  autocomplete="current-password"
                />
              </IconField>
            </label>
          </div>

          <div v-if="authStore.error" class="flex gap-2 items-center">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ authStore.error }}</span>
          </div>

          <Button type="submit" label="Sign In" :loading="authStore.loading" size="large" fluid />
        </form>
      </template>

      <template #footer>
        <div>
          Don't have an account?
          <Button variant="link" as="router-link" label="Register here" to="register" />
        </div>
      </template>
    </Card>
  </div>
</template>
