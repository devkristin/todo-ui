import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { todosApi } from '../api/todos';
import type { CreateTodoRequest, TodoResponse } from '../types/todos';

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
   * Fetch todos for the selected date
   */
  const fetchDailyTodos = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      todos.value = await todosApi.getTodos({
        date: formattedApiDate.value,
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
  const dailyTodos = computed(() => {
    return todos.value.filter((todo) => {
      return todo.is_priority === false && todo.is_follow_up === false;
    });
  });

  /**
   * Get top priority todos (non-follow-up)
   */
  const topPriorityTodos = computed(() => {
    return todos.value.filter((todo) => {
      return todo.is_priority === true && todo.is_follow_up === false;
    });
  });

  /**
   * Set the selected date
   */
  const setSelectedDate = (date: Date) => {
    selectedDate.value = date;
  };

  /**
   * Update todo
   */
  const updateTodo = async (id: string, todo: Partial<TodoResponse>) => {
    isLoading.value = true;
    error.value = null;

    try {
      await todosApi.updateTodo(id, todo);
      await fetchDailyTodos();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch todos';
      todos.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Delete todo
   */
  const deleteTodo = async (id: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      await todosApi.deleteTodo(id);
      await fetchDailyTodos();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch todos';
      todos.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Create todo
   */
  const createTodo = async (todo: CreateTodoRequest) => {
    isLoading.value = true;
    error.value = null;

    try {
      await todosApi.createTodo(todo);
      await fetchDailyTodos();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch todos';
      todos.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    selectedDate,
    formattedApiDate,
    todos,
    isLoading,
    error,
    dailyTodos,
    topPriorityTodos,
    fetchDailyTodos,
    setSelectedDate,
    updateTodo,
    deleteTodo,
    createTodo,
  };
});
