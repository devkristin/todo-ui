import client from './client';
import type {
  RoutineResponse,
  CreateRoutineRequest,
  UpdateRoutineRequest,
  BlueprintResponse,
  CreateBlueprintRequest,
  UpdateBlueprintRequest,
} from '@/types/routines';

const ROUTINES_BASE_URL = '/routines';

export const routinesApi = {
  // --- Routine API Methods ---

  async getRoutines(): Promise<RoutineResponse[]> {
    const res = await client.get<RoutineResponse[]>(ROUTINES_BASE_URL);
    return res.data;
  },

  async createRoutine(routine: CreateRoutineRequest): Promise<RoutineResponse> {
    const res = await client.post<RoutineResponse>(ROUTINES_BASE_URL, routine);
    return res.data;
  },

  async updateRoutine(id: string, updates: UpdateRoutineRequest): Promise<RoutineResponse> {
    const res = await client.put<RoutineResponse>(`${ROUTINES_BASE_URL}/${id}`, updates);
    return res.data;
  },

  async deleteRoutine(id: string): Promise<void> {
    await client.delete(`${ROUTINES_BASE_URL}/${id}`);
  },

  // --- Blueprint API Methods ---

  async getBlueprints(routineId: string): Promise<BlueprintResponse[]> {
    const res = await client.get<BlueprintResponse[]>(
      `${ROUTINES_BASE_URL}/${routineId}/blueprints`,
    );
    return res.data;
  },

  async createBlueprint(
    routineId: string,
    blueprint: CreateBlueprintRequest,
  ): Promise<BlueprintResponse> {
    const res = await client.post<BlueprintResponse>(
      `${ROUTINES_BASE_URL}/${routineId}/blueprints`,
      blueprint,
    );
    return res.data;
  },

  async updateBlueprint(
    blueprintId: string,
    updates: UpdateBlueprintRequest,
  ): Promise<BlueprintResponse> {
    const res = await client.put<BlueprintResponse>(
      `${ROUTINES_BASE_URL}/blueprints/${blueprintId}`,
      updates,
    );
    return res.data;
  },

  async deleteBlueprint(blueprintId: string): Promise<void> {
    await client.delete(`${ROUTINES_BASE_URL}/blueprints/${blueprintId}`);
  },
};
