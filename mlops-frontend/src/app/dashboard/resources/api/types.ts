export interface ResourceMetrics {
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
}

export interface ResourceUsage {
  timestamp: number
  cpuCount: number
  gpuCount: number
  cpuUtilization: number
  gpuUtilization: number
}

export interface ResourceGroupDetails {
  name: string
  workerCount: number
  avgGpuUtil: number
  avgCpuLoad: number
  ramTotal: number
  ramFree: number
  freeHomeSpace: number
  networkStatus: {
    upload: number
    download: number
  }
}

export interface ResourceMonitoringData {
  metrics: ResourceMetrics
  history: ResourceUsage[]
  groups: ResourceGroupDetails[]
}
