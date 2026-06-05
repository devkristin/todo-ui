import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { todosApi } from '../api/todos';
import type { TodoResponse } from '../types/todos';

export const usePlannerStore = defineStore('planner', () => {
  const selectedDate = ref(new Date());
  const todos = ref<TodoResponse[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const formattedApiDate = computed(() => {
    const d = selectedDate.value;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  });

  /**
   * Fetch todos for the selected date that aren't priority and aren't follow ups
   */
  const fetchDailyTodos = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      todos.value = await todosApi.getTodos({
        date: formattedApiDate.value,
        isPriority: false,
        isFollowUp: false,
      });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch todos';
      todos.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get daily todos (non-priority, non-follow-up)
   */
  const dailyTodos = computed(() => todos.value);

  /**
   * Set the selected date
   */
  const setSelectedDate = (date: Date) => {
    selectedDate.value = date;
  };

  return {
    selectedDate,
    todos,
    isLoading,
    error,
    dailyTodos,
    fetchDailyTodos,
    setSelectedDate,
  };
});
