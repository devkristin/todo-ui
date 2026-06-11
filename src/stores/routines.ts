import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { routinesApi } from '../api/routines';
import type {
  RoutineResponse,
  CreateRoutineRequest,
  UpdateRoutineRequest,
  BlueprintResponse,
  CreateBlueprintRequest,
  UpdateBlueprintRequest,
} from '../types/routines';

export const useRoutinesStore = defineStore('routines', () => {
  const routines = ref<RoutineResponse[]>([]);
  const activeBlueprints = ref<BlueprintResponse[]>([]);
  const selectedRoutineId = ref<string | null>(null);

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Returns only routines that are currently active
   */
  const activeRoutines = computed(() => {
    return routines.value.filter((routine) => routine.is_active);
  });

  /**
   * Sorts active blueprints by their position for UI display
   */
  const sortedBlueprints = computed(() => {
    return [...activeBlueprints.value].sort((a, b) => a.position - b.position);
  });

  const fetchRoutines = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      routines.value = await routinesApi.getRoutines();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch routines';
      routines.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const createRoutine = async (routine: CreateRoutineRequest) => {
    isLoading.value = true;
    error.value = null;

    try {
      await routinesApi.createRoutine(routine);
      await fetchRoutines();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create routine';
    } finally {
      isLoading.value = false;
    }
  };

  const updateRoutine = async (id: string, updates: UpdateRoutineRequest) => {
    isLoading.value = true;
    error.value = null;

    try {
      await routinesApi.updateRoutine(id, updates);
      await fetchRoutines();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update routine';
    } finally {
      isLoading.value = false;
    }
  };

  const deleteRoutine = async (id: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      await routinesApi.deleteRoutine(id);

      // If the deleted routine was the currently selected one, clear blueprints
      if (selectedRoutineId.value === id) {
        selectedRoutineId.value = null;
        activeBlueprints.value = [];
      }

      await fetchRoutines();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete routine';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Sets the active routine context and fetches its specific blueprints
   */
  const selectRoutine = async (id: string | null) => {
    selectedRoutineId.value = id;
    if (id) {
      await fetchBlueprints(id);
    } else {
      activeBlueprints.value = [];
    }
  };

  const fetchBlueprints = async (routineId: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      activeBlueprints.value = await routinesApi.getBlueprints(routineId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch blueprints';
      activeBlueprints.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const createBlueprint = async (routineId: string, blueprint: CreateBlueprintRequest) => {
    isLoading.value = true;
    error.value = null;

    try {
      await routinesApi.createBlueprint(routineId, blueprint);
      await fetchBlueprints(routineId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create blueprint';
    } finally {
      isLoading.value = false;
    }
  };

  const updateBlueprint = async (blueprintId: string, updates: UpdateBlueprintRequest) => {
    isLoading.value = true;
    error.value = null;

    try {
      await routinesApi.updateBlueprint(blueprintId, updates);
      if (selectedRoutineId.value) {
        await fetchBlueprints(selectedRoutineId.value);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update blueprint';
    } finally {
      isLoading.value = false;
    }
  };

  const deleteBlueprint = async (blueprintId: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      await routinesApi.deleteBlueprint(blueprintId);
      if (selectedRoutineId.value) {
        await fetchBlueprints(selectedRoutineId.value);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete blueprint';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    routines,
    activeBlueprints,
    selectedRoutineId,
    isLoading,
    error,
    activeRoutines,
    sortedBlueprints,
    fetchRoutines,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    selectRoutine,
    fetchBlueprints,
    createBlueprint,
    updateBlueprint,
    deleteBlueprint,
  };
});
