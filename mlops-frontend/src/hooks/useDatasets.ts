import { useState, useEffect } from 'react'

// DatasetFeature defines information about the features of the dataset.
export interface DatasetFeature {
  name: string
  type: string
  missing: number
}

// DatasetStatistics defines the statistics of the dataset, including numerical and categorical statistics.
export interface DatasetStatistics {
  numerical?: {
    mean: number[]   // Mean values of numerical columns
    std: number[]    // Standard deviation of numerical columns
    min: number[]    // Minimum values of numerical columns
    max: number[]    // Maximum values of numerical columns
  }
  categorical?: {
    unique: number[]  // The number of unique values in categorical columns
    top: string[]     // The most frequent values in categorical columns
    freq: number[]    // Frequency of the most frequent values in categorical columns
  }
}

// DatasetQuality defines the quality of the dataset (completeness, consistency, balance).
export interface DatasetQuality {
  completeness: number  // Completeness of the dataset
  consistency: number   // Consistency of the dataset
  balance: number       // Balance of data classes in the dataset
}

// Dataset defines the structure of a dataset, including its size, status, features, statistics, and quality.
export interface Dataset {
  id: string
  name: string
  type: string
  size: number
  lastModified: string
  rows: number
  columns: number
  status: 'completed' | 'processing' | 'failed'  // The status of the dataset
  progress: number
  tags: string[]   // Tags associated with the dataset
  description: string
  features: DatasetFeature[]   // Features of the dataset
  statistics: DatasetStatistics  // Statistical information of the dataset
  quality: DatasetQuality      // Quality metrics of the dataset
}

// DatasetSummary provides a summary of datasets.
export interface DatasetSummary {
  totalDatasets: number
  totalSize: number
  processingDatasets: number
  datasetTypes: { [key: string]: number }  // Dataset types and the number of datasets of each type
  recentUpdates: Dataset[]   // List of the most recent dataset updates
}

// Mock data: Example datasets to simulate a real dataset collection
const mockDatasets: { [key: string]: Dataset } = {
  'production-timeseries': {
    id: 'production-timeseries',
    name: '생산라인 센서 데이터',  // Name of the dataset in Korean
    type: 'TimeSeries',
    size: 52428800,  // Dataset size in bytes
    lastModified: '2024-02-07',  // Date of last modification
    rows: 87600,  // Number of rows in the dataset
    columns: 12,  // Number of columns in the dataset
    status: 'completed',  // Status of the dataset
    progress: 100,  // Completion progress percentage
    tags: ['시계열', '생산', '센서'],  // Tags in Korean
    description: '생산라인의 실시간 센서 데이터 (온도, 압력, 진동 등)',  // Description in Korean
    features: [
      { name: 'timestamp', type: 'datetime', missing: 0 },
      { name: 'temperature', type: 'float32', missing: 12 },
      { name: 'pressure', type: 'float32', missing: 8 },
      { name: 'vibration', type: 'float32', missing: 15 },
      { name: 'speed', type: 'float32', missing: 10 },
    ],
    statistics: {
      numerical: {
        mean: [85.2, 2.1, 0.15, 60.5],
        std: [5.4, 0.3, 0.05, 10.2],
        min: [70.0, 1.5, 0.05, 30.0],
        max: [95.0, 3.0, 0.25, 80.0],
      },
    },
    quality: {
      completeness: 99.2,
      consistency: 98.7,
      balance: 97.5,
    },
  },
  'quality-inspection': {
    id: 'quality-inspection',
    name: '품질 검사 데이터',  // Name in Korean
    type: 'Structured',
    size: 157286400,
    lastModified: '2024-02-06',
    rows: 250000,
    columns: 25,
    status: 'completed',
    progress: 100,
    tags: ['정형', '품질', '검사'],  // Tags in Korean
    description: '제품 품질 검사 결과 데이터 (치수, 외관, 성능 등)',  // Description in Korean
    features: [
      { name: 'product_id', type: 'string', missing: 0 },
      { name: 'dimension_x', type: 'float32', missing: 0 },
      { name: 'dimension_y', type: 'float32', missing: 0 },
      { name: 'weight', type: 'float32', missing: 5 },
      { name: 'defect_type', type: 'string', missing: 85 },
    ],
    statistics: {
      numerical: {
        mean: [100.2, 50.5, 1.5],
        std: [0.2, 0.15, 0.05],
        min: [99.8, 50.0, 1.4],
        max: [100.6, 51.0, 1.6],
      },
      categorical: {
        unique: [5],
        top: ['정상', '치수미달', '표면불량'],
        freq: [220000, 15000, 10000],
      },
    },
    quality: {
      completeness: 99.8,
      consistency: 99.5,
      balance: 92.3,
    },
  },
  'defect-images': {
    id: 'defect-images',
    name: '제품 결함 이미지',  // Name in Korean
    type: 'Image',
    size: 5368709120,
    lastModified: '2024-02-05',
    rows: 100000,
    columns: 4,
    status: 'processing',
    progress: 85,
    tags: ['이미지', '결함', '검사'],  // Tags in Korean
    description: '제품 표면 결함 검사 이미지 데이터',  // Description in Korean
    features: [
      { name: 'image_id', type: 'string', missing: 0 },
      { name: 'defect_class', type: 'string', missing: 0 },
      { name: 'image_path', type: 'string', missing: 0 },
      { name: 'metadata', type: 'json', missing: 150 },
    ],
    statistics: {
      numerical: {
        mean: [1024, 1024],
        std: [0, 0],
        min: [1024, 1024],
        max: [1024, 1024],
      },
      categorical: {
        unique: [8],
        top: ['스크래치', '찍힘', '변색'],
        freq: [35000, 25000, 15000],
      },
    },
    quality: {
      completeness: 99.9,
      consistency: 98.2,
      balance: 88.5,
    },
  },
}

// useDatasets hook manages datasets state and provides methods to manipulate datasets
export const useDatasets = () => {
  const [datasets, setDatasets] = useState<{ [key: string]: Dataset }>(mockDatasets)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // getSummary provides a summary of all datasets
  const getSummary = (): DatasetSummary => {
    const datasetList = Object.values(datasets)
    
    return {
      totalDatasets: datasetList.length,
      totalSize: datasetList.reduce((acc, dataset) => acc + dataset.size, 0),
      processingDatasets: datasetList.filter(d => d.status === 'processing').length,
      datasetTypes: datasetList.reduce((acc, dataset) => {
        acc[dataset.type] = (acc[dataset.type] || 0) + 1
        return acc
      }, {} as { [key: string]: number }),
      recentUpdates: datasetList
        .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
        .slice(0, 5)
    }
  }

  // addDataset adds a new dataset to the state
  const addDataset = (dataset: Dataset) => {
    setDatasets(prev => ({
      ...prev,
      [dataset.id]: dataset
    }))
  }

  // updateDataset updates an existing dataset with new information
  const updateDataset = (id: string, updates: Partial<Dataset>) => {
    setDatasets(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }))
  }

  // deleteDataset removes a dataset from the state
  const deleteDataset = (id: string) => {
    setDatasets(prev => {
      const newDatasets = { ...prev }
      delete newDatasets[id]
      return newDatasets
    })
  }

  return {
    datasets,
    isLoading,
    error,
    getSummary,
    addDataset,
    updateDataset,
    deleteDataset
  }
}
