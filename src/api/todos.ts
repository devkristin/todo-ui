import client from './client';
import type { TodoResponse, CreateTodoRequest, UpdateTodoRequest } from '../types/todos';

const TODOS_BASE_URL = '/todos';

export const todosApi = {
  /**
   * Fetch todos with optional filters
   */
  async getTodos(filters?: {
    date?: string;
    isPriority?: boolean;
    isFollowUp?: boolean;
  }): Promise<TodoResponse[]> {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.isPriority !== undefined) params.append('isPriority', String(filters.isPriority));
    if (filters?.isFollowUp !== undefined) params.append('isFollowUp', String(filters.isFollowUp));

    const query = params.toString();
    const url = query ? `${TODOS_BASE_URL}?${query}` : TODOS_BASE_URL;
    const res = await client.get<TodoResponse[]>(url);
    return res.data;
  },

  /**
   * Fetch scheduled todos for a given date (todos with assigned time)
   */
  async getScheduledTodos(date: string): Promise<TodoResponse[]> {
    const res = await client.get<TodoResponse[]>(`${TODOS_BASE_URL}/schedule?date=${date}`);
    return res.data;
  },

  /**
   * Create a new todo
   */
  async createTodo(todo: CreateTodoRequest): Promise<TodoResponse> {
    const res = await client.post<TodoResponse>(TODOS_BASE_URL, todo);
    return res.data;
  },

  /**
   * Update a todo
   */
  async updateTodo(id: string, updates: UpdateTodoRequest): Promise<TodoResponse> {
    const res = await client.put<TodoResponse>(`${TODOS_BASE_URL}/${id}`, updates);
    return res.data;
  },

  /**
   * Delete a todo
   */
  async deleteTodo(id: string): Promise<void> {
    await client.delete(`${TODOS_BASE_URL}/${id}`);
    return undefined;
  },

  /**
   * Move a todo's position in the list
   */
  async moveTodoPosition(
    id: string,
    aboveTodoPosition: number | null,
    belowTodoPosition: number | null,
  ): Promise<TodoResponse> {
    const res = await client.put<TodoResponse>(`${TODOS_BASE_URL}/${id}/position`, {
      aboveTodoPosition,
      belowTodoPosition,
    });
    return res.data;
  },
};
