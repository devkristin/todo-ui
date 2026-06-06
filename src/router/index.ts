import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LandingView from '../views/LandingView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LandingView },
    { path: '/login', component: () => import('../views/LoginView.vue') },
    { path: '/register', component: () => import('../views/RegisterView.vue') },
    {
      path: '/planner',
      component: () => import('../views/PlannerView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.token) {
    await authStore.init();
  }
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/';
  } else if (
    (to.path === '/' || to.path === '/login' || to.path === '/register') &&
    authStore.isAuthenticated
  ) {
    return '/planner';
  } else {
    return true;
  }
});

export default router;
