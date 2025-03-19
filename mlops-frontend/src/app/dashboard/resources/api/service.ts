import { ResourceMonitoringData } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export async function fetchResourceMonitoring(): Promise<ResourceMonitoringData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resources/monitoring`)
    if (!response.ok) {
      throw new Error('Failed to fetch resource monitoring data')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching resource monitoring data:', error)
    throw error
  }
}

export async function fetchResourceHistory(timeRange: string): Promise<ResourceMonitoringData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resources/history?timeRange=${timeRange}`)
    if (!response.ok) {
      throw new Error('Failed to fetch resource history')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching resource history:', error)
    throw error
  }
}

// 모의 데이터 생성 (개발용)
export function generateMockData(): ResourceMonitoringData {
  const now = Date.now()
  const history = Array.from({ length: 24 }, (_, i) => ({
    timestamp: now - (23 - i) * 5 * 60 * 1000,
    cpuCount: Math.floor(Math.random() * 100) + 100,
    gpuCount: Math.floor(Math.random() * 4) + 4,
    cpuUtilization: Math.random() * 40 + 30,
    gpuUtilization: Math.random() * 40 + 30,
  }))

  return {
    metrics: {
      workers: {
        total: 8,
        running: 6,
      },
      gpus: {
        total: 8,
        running: 6,
      },
      cpus: {
        total: 64,
        running: 48,
      },
    },
    history,
    groups: [
      {
        name: '로컬 워크스테이션',
        workerCount: 8,
        avgGpuUtil: 75.00,
        avgCpuLoad: 65.00,
        ramTotal: 128.00,
        ramFree: 32.00,
        freeHomeSpace: 500.00,
        networkStatus: {
          upload: 1.00,
          download: 1.00,
        },
      }
    ],
  }
}
