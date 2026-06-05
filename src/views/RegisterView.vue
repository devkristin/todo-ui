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
const confirmPassword = ref('');
const localError = ref<string | null>(null);

const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  localError.value = null;

  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match';
    return;
  }

  try {
    await authStore.register(email.value, password.value);
    router.push('/login');
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
          <i class="pi pi-user-plus" style="font-size: 2rem"></i>
          <h2 class="text-4xl">Create Account</h2>
        </div>
      </template>

      <template #subtitle>
        <p class="text-center">Get started with your new daily planner</p>
      </template>

      <template #content>
        <form class="flex flex-col pt-4 gap-5" @submit.prevent="handleRegister">
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
                  autocomplete="new-password"
                />
              </IconField>
            </label>
          </div>

          <div>
            <label>
              Confirm Password
              <IconField>
                <InputIcon class="pi pi-shield" />
                <Password
                  id="confirmPassword"
                  v-model="confirmPassword"
                  placeholder="••••••••"
                  :feedback="false"
                  toggleMask
                  size="large"
                  fluid
                  required
                  autocomplete="new-password"
                />
              </IconField>
            </label>
          </div>

          <div v-if="authStore.error || localError" class="flex gap-2 items-center">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ localError || authStore.error }}</span>
          </div>

          <Button type="submit" label="Register" :loading="authStore.loading" size="large" fluid />
        </form>
      </template>

      <template #footer>
        <div>
          Already have an account?
          <Button variant="link" as="router-link" label="Sign in here" to="/login" />
        </div>
      </template>
    </Card>
  </div>
</template>
