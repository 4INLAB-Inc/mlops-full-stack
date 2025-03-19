export type Pipeline = {
  id: string
  name: string
  description: string
  status: 'running' | 'stopped' | 'failed' | 'completed'
  progress: number
  createdAt: string
  updatedAt: string
  type: 'training' | 'inference' | 'data-processing'
  owner: string
  resources: {
    cpu: string
    memory: string
    gpu?: string
  }
}
