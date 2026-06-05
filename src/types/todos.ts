export interface TodoResponse {
  id: string;
  user_id: string;
  schedule_date: string;
  schedule_time: string | null;
  title: string;
  is_priority: boolean;
  is_follow_up: boolean;
  is_completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoRequest {
  schedule_date: string; // YYYY-MM-DD
  schedule_time?: string; // HH:MM:SS
  title: string;
  is_priority?: boolean;
  is_follow_up?: boolean;
}

export interface UpdateTodoRequest {
  title?: string;
  schedule_date?: string;
  schedule_time?: string | null;
  is_priority?: boolean;
  is_follow_up?: boolean;
}
