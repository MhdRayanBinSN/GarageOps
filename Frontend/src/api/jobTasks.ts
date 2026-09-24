import api from './axiosInstance'
import type {
  CreateJobTaskRequest,
  AssignJobTaskRequest,
  UpdateJobTaskStatusRequest,
  JobTaskResponse,
} from '@/types'

export const jobTasksApi = {
  getAll: (_workshopId: string, jobCardId: string) =>
    api.get<JobTaskResponse[]>(`/api/job-cards/${jobCardId}/tasks`).then((r) => r.data),

  create: (_workshopId: string, jobCardId: string, data: CreateJobTaskRequest) =>
    api
      .post<JobTaskResponse>(`/api/job-cards/${jobCardId}/tasks`, data)
      .then((r) => r.data),

  assign: (_workshopId: string, jobCardId: string, taskId: string, data: AssignJobTaskRequest) =>
    api
      .put<JobTaskResponse>(`/api/job-cards/${jobCardId}/tasks/${taskId}/assign`, data)
      .then((r) => r.data),

  updateStatus: (_workshopId: string, jobCardId: string, taskId: string, data: UpdateJobTaskStatusRequest) =>
    api
      .put<JobTaskResponse>(`/api/job-cards/${jobCardId}/tasks/${taskId}/status`, data)
      .then((r) => r.data),
}
