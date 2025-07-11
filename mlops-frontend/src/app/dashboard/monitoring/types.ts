export interface ModelMetrics {
  accuracy: number;
  latency: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface DeploymentStatus {
  modelVersion: string;
  status: 'running' | 'deploying' | 'failed';
  startTime: string;
  lastUpdated: string;
  health: number;
  trafficPercentage: number;
}

export interface ABTestResult {
  modelVersion: string;
  accuracy: number;
  latency: number;
  throughput: number;
  sampleSize: number;
  improvement: number;
  status: 'running' | 'completed' | 'failed';
}

export interface OptimizationMetrics {
  originalSize: number;
  optimizedSize: number;
  speedup: number;
  accuracyDrop: number;
  technique: string;
}

export interface Alert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  model: string;
  timestamp: string;
}

export interface CropEnvironment {
  temperature: number;
  humidity: number;
  co2: number;
  light: number;
  soilMoisture: number;
  nutrientLevel: number;
  lastUpdated: string;
}

export interface CropGrowthMetrics {
  height: number;
  leafArea: number;
  stemDiameter: number;
  fruitCount: number;
  predictedYield: number;
  actualYield?: number;
  growthStage: string;
  healthScore: number;
  lastMeasured: string;
}

export interface DecisionSupport {
  recommendation: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: 'irrigation' | 'nutrition' | 'environment' | 'pest' | 'ventilation';
  suggestedActions: string[];
  expectedOutcome: string;
}

export interface ModelPerformanceHistory {
  version: string;
  timestamp: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  environmentConditions: Partial<CropEnvironment>;
}

export interface AutoMLResult {
  modelVersion: string;
  hyperparameters: Record<string, number | string>;
  performance: {
    accuracy: number;
    trainingTime: number;
    resourceUsage: number;
  };
  status: 'training' | 'completed' | 'failed';
}
