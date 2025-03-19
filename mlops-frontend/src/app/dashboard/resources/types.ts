export interface ResourceGroup {
  name: string
  workerCount: number
  avgGpuUtil: number
  avgCpuLoad: number
  ramTotal: number
  ramFree: number
  freeHomeSpace: number
  networkTwin: string
}

export interface ClusterMetrics {
  workers: {
    total: number
    running: number
  }
  gpus: {
    total: number
    running: number
  }
  cpus: {
    total: number
    running: number
  }
  clusters: {
    name: string
    workers: {
      total: number
      utilization: number
    }
    gpus: {
      total: number
      utilization: number
    }
    cpus: {
      total: number
      utilization: number
    }
  }[]
  history: {
    timestamp: number
    cpuCount: number
    gpuCount: number
    cpuUtilization: number
    gpuUtilization: number
  }[]
  resourceGroups: ResourceGroup[]
}
