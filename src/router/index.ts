import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LoginView },
    { path: '/register', component: () => import('../views/RegisterView.vue') },
    {
      path: '/planner',
      component: () => import('../views/PlannerView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/');
  } else if ((to.path === '/' || to.path === '/register') && authStore.isAuthenticated) {
    next('/planner');
  } else {
    next();
  }
});

export default router;
