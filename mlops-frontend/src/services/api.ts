import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 인터셉터 설정
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 리소스 관련 API
export const resourceApi = {
  getUsage: () => api.get('/api/resources/usage'),
  getHistory: (params: { startDate: string; endDate: string }) =>
    api.get('/api/resources/history', { params }),
}

// 실험 관련 API
export const experimentApi = {
  create: (data: any) => api.post('/api/experiments', data),
  getList: (params?: any) => api.get('/api/experiments', { params }),
  getById: (id: string) => api.get(`/api/experiments/${id}`),
  update: (id: string, data: any) => api.put(`/api/experiments/${id}`, data),
  delete: (id: string) => api.delete(`/api/experiments/${id}`),
}

// 파이프라인 관련 API
export const pipelineApi = {
  create: (data: any) => api.post('/api/pipelines', data),
  getList: (params?: any) => api.get('/api/pipelines', { params }),
  getById: (id: string) => api.get(`/api/pipelines/${id}`),
  update: (id: string, data: any) => api.put(`/api/pipelines/${id}`, data),
  delete: (id: string) => api.delete(`/api/pipelines/${id}`),
  run: (id: string) => api.post(`/api/pipelines/${id}/run`),
  stop: (id: string) => api.post(`/api/pipelines/${id}/stop`),
  getLogs: (id: string) => api.get(`/api/pipelines/${id}/logs`),
}

// 데이터셋 관련 API
export const datasetApi = {
  upload: (formData: FormData) => api.post('/api/datasets/upload', formData),
  getList: (params?: any) => api.get('/api/datasets', { params }),
  getById: (id: string) => api.get(`/api/datasets/${id}`),
  update: (id: string, data: any) => api.put(`/api/datasets/${id}`, data),
  delete: (id: string) => api.delete(`/api/datasets/${id}`),
  getStats: (id: string) => api.get(`/api/datasets/${id}/stats`),
}

// 모델 관련 API
export const modelApi = {
  getList: (params?: any) => api.get('/api/models', { params }),
  getById: (id: string) => api.get(`/api/models/${id}`),
  update: (id: string, data: any) => api.put(`/api/models/${id}`, data),
  delete: (id: string) => api.delete(`/api/models/${id}`),
  getMetrics: (id: string) => api.get(`/api/models/${id}/metrics`),
  deploy: (id: string) => api.post(`/api/models/${id}/deploy`),
  predict: (id: string, data: any) => api.post(`/api/models/${id}/predict`, data),
}

// 설정 관련 API
export const settingsApi = {
  get: () => api.get('/api/settings'),
  update: (data: any) => api.put('/api/settings', data),
}
