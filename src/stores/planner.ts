import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { todosApi } from '../api/todos';
import type {
  CreateTodoRequest,
  MoveTodoPositionRequest,
  TodoResponse,
  UpdateTodoRequest,
} from '../types/todos';

export const usePlannerStore = defineStore('planner', () => {
  const selectedDate = ref(new Date());
  const todos = ref<TodoResponse[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const draggedTodo = ref<TodoResponse | null>(null);
  const draggedOverTodo = ref<TodoResponse | null>(null);
  const updatingTodoId = ref<string | null>(null);

  const formattedApiDate = computed(() => {
    const d = selectedDate.value;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  });

  const setUpdatingTodoId = (id: string | null) => {
    updatingTodoId.value = id;
  };

  const setDraggedTodo = (todo: TodoResponse | null) => {
    draggedTodo.value = todo;
  };

  const setDraggedOverTodo = (todo: TodoResponse | null) => {
    draggedOverTodo.value = todo;
  };

  const handleDragStart = (todo: TodoResponse) => {
    setDraggedTodo(todo);
  };

  const handleDragOver = (event: DragEvent, todo: TodoResponse) => {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    setDraggedOverTodo(todo);
  };

  const handleDragEnd = () => {
    setDraggedTodo(null);
    setDraggedOverTodo(null);
  };

  const getTargetList = (dropTarget: TodoResponse) => {
    return todos.value
      .filter((todo) => {
        if (dropTarget.is_follow_up) return todo.is_follow_up;
        return todo.is_priority === dropTarget.is_priority && !todo.is_follow_up;
      })
      .sort((a, b) => a.position - b.position);
  };

  const calculateAboveBelowPositions = (
    dragged: TodoResponse,
    target: TodoResponse,
    list: TodoResponse[],
    index: number,
  ) => {
    const isSameList =
      dragged.is_priority === target.is_priority && dragged.is_follow_up === target.is_follow_up;

    if (isSameList) {
      return dragged.position < target.position
        ? { abovePosition: target.position, belowPosition: list[index + 1]?.position ?? null }
        : { abovePosition: list[index - 1]?.position ?? null, belowPosition: target.position };
    }

    // Cross-list
    return {
      abovePosition: index === 0 ? null : (list[index - 1]?.position ?? null),
      belowPosition: index === list.length - 1 ? null : target.position,
    };
  };

  const handleDrop = async (event: DragEvent, dropTarget: TodoResponse) => {
    event.preventDefault();
    if (!draggedTodo.value || draggedTodo.value.id === dropTarget.id) {
      setDraggedTodo(null);
      setDraggedOverTodo(null);
      return;
    }

    const categoryList = getTargetList(dropTarget);
    const dropIndex = categoryList.findIndex((todo) => todo.id === dropTarget.id);

    const { abovePosition, belowPosition } = calculateAboveBelowPositions(
      draggedTodo.value,
      dropTarget,
      categoryList,
      dropIndex,
    );

    await updateTodo(
      draggedTodo.value.id,
      { is_priority: dropTarget.is_priority },
      { aboveTodoPosition: abovePosition, belowTodoPosition: belowPosition },
    );

    handleDragEnd();
  };

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
    return todos.value
      .filter((todo) => {
        return todo.is_priority === false && todo.is_follow_up === false;
      })
      .sort((a, b) => a.position - b.position);
  });

  /**
   * Get top priority todos (non-follow-up)
   */
  const topPriorityTodos = computed(() => {
    return todos.value
      .filter((todo) => {
        return todo.is_priority === true && todo.is_follow_up === false;
      })
      .sort((a, b) => a.position - b.position);
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
  const updateTodo = async (
    id: string,
    todo: Partial<TodoResponse>,
    positionChange?: MoveTodoPositionRequest,
  ) => {
    isLoading.value = true;
    error.value = null;

    const updateTodoRequest: UpdateTodoRequest = {
      todo: todo,
      position_change: positionChange,
    };

    try {
      await todosApi.updateTodo(id, updateTodoRequest);
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

  /**
   * Move todo
   */
  const moveTodo = async (
    id: string,
    abovePosition: number | null,
    belowPosition: number | null,
  ) => {
    isLoading.value = true;
    error.value = null;
    try {
      await todosApi.moveTodoPosition(id, abovePosition, belowPosition);
      await fetchDailyTodos();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reorder todos';
      todos.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    selectedDate,
    formattedApiDate,
    updatingTodoId,
    draggedTodo,
    draggedOverTodo,
    todos,
    isLoading,
    error,
    dailyTodos,
    topPriorityTodos,
    setUpdatingTodoId,
    setDraggedTodo,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    fetchDailyTodos,
    setSelectedDate,
    updateTodo,
    deleteTodo,
    createTodo,
    moveTodo,
  };
});
