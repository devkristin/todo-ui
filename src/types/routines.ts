export interface RoutineResponse {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  recurrence_rule: string;
  created_at: string;
}

export interface CreateRoutineRequest {
  title: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateRoutineRequest {
  title?: string;
  description?: string;
  is_active?: boolean;
}

export interface BlueprintResponse {
  id: string;
  routine_id: string;
  title: string;
  is_priority: boolean;
  position: number;
  schedule_time: string | null; // HH:MM:SS
}

export interface CreateBlueprintRequest {
  title: string;
  is_priority?: boolean;
  schedule_time: string | null; // HH:MM:SS
}

export interface UpdateBlueprintRequest {
  title?: string;
  is_priority?: boolean;
  position?: number;
  schedule_time?: string | null; // HH:MM:SS
}
