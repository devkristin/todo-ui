import client from './client';

const HEALTH_BASE_URL = '/health';

export interface HealthCheck {
  status: string;
  database: string;
}

export const healthApi = {
  /**
   * Health check
   */
  async getHealth(): Promise<HealthCheck> {
    const res = await client.get<HealthCheck>(HEALTH_BASE_URL);
    return res.data;
  },
};
