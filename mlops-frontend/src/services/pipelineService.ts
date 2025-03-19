import { Node, Edge } from 'reactflow'

export interface PipelineData {
  nodes: Node[]
  edges: Edge[]
  name: string
  description?: string
  version: string
  createdAt: string
  updatedAt: string
}

export interface Checkpoint {
  id: string
  name: string
  timestamp: string
  pipelineData: PipelineData
}

// 파이프라인 저장
export const savePipeline = async (pipelineData: PipelineData): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await fetch('/api/pipelines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipelineData),
    })
    
    if (!response.ok) {
      throw new Error('파이프라인 저장에 실패했습니다.')
    }

    return { success: true, message: '파이프라인이 성공적으로 저장되었습니다.' }
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' }
  }
}

// 파이프라인 불러오기
export const loadPipeline = async (id: string): Promise<PipelineData> => {
  const response = await fetch(`/api/pipelines/${id}`)
  if (!response.ok) {
    throw new Error('파이프라인을 불러오는데 실패했습니다.')
  }
  return response.json()
}

// 체크포인트 생성
export const createCheckpoint = async (pipelineData: PipelineData, name: string): Promise<Checkpoint> => {
  const response = await fetch('/api/checkpoints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pipelineData, name }),
  })
  
  if (!response.ok) {
    throw new Error('체크포인트 생성에 실패했습니다.')
  }
  
  return response.json()
}

// 체크포인트 불러오기
export const loadCheckpoint = async (id: string): Promise<Checkpoint> => {
  const response = await fetch(`/api/checkpoints/${id}`)
  if (!response.ok) {
    throw new Error('체크포인트를 불러오는데 실패했습니다.')
  }
  return response.json()
}

// 파이프라인 내보내기
export const exportPipeline = (pipelineData: PipelineData): void => {
  const dataStr = JSON.stringify(pipelineData, null, 2)
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
  
  const exportFileDefaultName = `pipeline_${pipelineData.name}_${pipelineData.version}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

// 파이프라인 가져오기
export const importPipeline = (file: File): Promise<PipelineData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const pipelineData = JSON.parse(event.target?.result as string)
        resolve(pipelineData)
      } catch (error) {
        reject(new Error('파이프라인 파일 형식이 올바르지 않습니다.'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('파일을 읽는 도중 오류가 발생했습니다.'))
    }
    
    reader.readAsText(file)
  })
}
