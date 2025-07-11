'use client'
import type { ReactNode } from 'react';
import { 
  useState, 
  useEffect, 
  useMemo, 
  memo, 
  Suspense, 
  useTransition, 
  useRef, 
  useCallback,
} from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDatasets } from '@/hooks/useDatasets'
import { useToast } from '@chakra-ui/react'
import { ErrorBoundary } from 'react-error-boundary'
import type { IconType } from 'react-icons';
import {
  Box,
  VStack,
  HStack,
  Stack,
  Grid,
  GridItem,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  List,
  ListItem,
  InputGroup,
  InputLeftElement,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  FormLabel,
  FormControl,
  FormHelperText,
  Select,
  Textarea,
  IconButton,
  Divider,
  Container,
  Progress,
  Tag,
  TagLeftIcon,
  TagLabel,
  Tooltip,
  CircularProgress,
  CircularProgressLabel,
  Center,
  Collapse,
} from '@chakra-ui/react'

import {
  FiActivity,
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowUpRight,
  FiArrowDownRight,
  FiBarChart2,
  FiBox,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiClock,
  FiCloud,
  FiCpu,
  FiDatabase,
  FiDownload,
  FiFile,
  FiFilter,
  FiGitBranch,
  FiGitCommit,
  FiGitMerge,
  FiGitPullRequest,
  FiGrid,
  FiHardDrive,
  FiInfo,
  FiList,
  FiMaximize2,
  FiMinimize2,
  FiMonitor,
  FiMoreHorizontal,
  FiPlay,
  FiPlusCircle,
  FiRefreshCw,
  FiSearch,
  FiServer,
  FiSettings,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiUpload,
  FiUsers,
  FiZap,
} from 'react-icons/fi'

import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AddIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons'

import {
  Card, 
  Title, 
  Text as TremorText,
  Metric, 
  AreaChart,
  Color,
  ValueFormatter,
  BarChart,
  DonutChart,
  Legend,
  LineChart,
  ScatterChart,
  DeltaType,
} from '@tremor/react'

import { parseISO, isAfter, isBefore, startOfWeek, endOfWeek,subWeeks, isWithinInterval } from 'date-fns';
import { ApexOptions } from 'apexcharts';



const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })
const ModelPerformanceChart = dynamic(() => import('@/components/models/ModelPerformanceChart'), { 
  ssr: false,
  loading: () => <CircularProgress isIndeterminate color="orange.500" />
})
const ExperimentTracker = dynamic(() => import('@/components/experiments/ExperimentTracker'), {
  ssr: false,
  loading: () => <CircularProgress isIndeterminate color="orange.500" />
})

// 대시보드 통계 데이터 타입 정의
interface DashboardStats {
  totalModels: number;
  trainingModels: number;
  deployedModels: number;
  experiments: number;
}

// 대시보드 통계 데이터를 가져오는 훅
const useDashboardStats = (): DashboardStats => {
  const [stats, setStats] = useState<DashboardStats>({
    totalModels: 128,
    trainingModels: 12,
    deployedModels: 45,
    experiments: 256
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: API 연동 시 실제 엔드포인트로 교체
        // const response = await fetch('/api/dashboard/stats');
        // const data = await response.json();
        // setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return stats;
};

// 모델 상세 정보 컴포넌트
const ModelDetailContent = memo(() => (
  <VStack align="stretch" spacing={4}>
    <Text>현재 학습 중인 모델 상태</Text>
    <SimpleGrid columns={2} spacing={4}>
      <Box p={4} bg="gray.50" rounded="lg">
        <VStack>
          <Text color="gray.500">학습 완료</Text>
          <Text fontSize="2xl" fontWeight="bold">2</Text>
        </VStack>
      </Box>
      <Box p={4} bg="gray.50" rounded="lg">
        <VStack>
          <Text color="gray.500">학습 중</Text>
          <Text fontSize="2xl" fontWeight="bold">1</Text>
        </VStack>
      </Box>
    </SimpleGrid>
    <Box>
      <Text mb={2} fontWeight="medium">최근 학습 모델</Text>
      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between" p={3} bg="gray.50" rounded="lg">
          <Text>ResNet-50</Text>
          <Badge colorScheme="green">완료</Badge>
        </HStack>
        <HStack justify="space-between" p={3} bg="gray.50" rounded="lg">
          <Text>BERT-Base</Text>
          <Badge colorScheme="blue">학습중</Badge>
        </HStack>
      </VStack>
    </Box>
  </VStack>
));

// 데이터셋 상세 정보 컴포넌트
const DatasetDetailContent = memo(() => (
  <VStack align="stretch" spacing={4}>
    <Text>데이터셋 현황</Text>
    <SimpleGrid columns={2} spacing={4}>
      <Box p={4} bg="gray.50" rounded="lg">
        <VStack>
          <Text color="gray.500">전처리 완료</Text>
          <Text fontSize="2xl" fontWeight="bold">120</Text>
        </VStack>
      </Box>
      <Box p={4} bg="gray.50" rounded="lg">
        <VStack>
          <Text color="gray.500">전처리 중</Text>
          <Text fontSize="2xl" fontWeight="bold">36</Text>
        </VStack>
      </Box>
    </SimpleGrid>
    <Box>
      <Text mb={2} fontWeight="medium">최근 추가된 데이터셋</Text>
      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between" p={3} bg="gray.50" rounded="lg">
          <Text>CIFAR-10</Text>
          <Badge colorScheme="green">완료</Badge>
        </HStack>
        <HStack justify="space-between" p={3} bg="gray.50" rounded="lg">
          <Text>ImageNet-1K</Text>
          <Badge colorScheme="blue">처리중</Badge>
        </HStack>
      </VStack>
    </Box>
  </VStack>
));

// 스토리지 상세 정보 컴포넌트
const StorageDetailContent = memo(() => (
  <VStack align="stretch" spacing={4}>
    <Text>스토리지 사용량</Text>
    <SimpleGrid columns={2} spacing={4}>
      <Box p={4} bg="gray.50" rounded="lg">
        <VStack>
          <Text color="gray.500">총 용량</Text>
          <Text fontSize="2xl" fontWeight="bold">5 TB</Text>
        </VStack>
      </Box>
      <Box p={4} bg="gray.50" rounded="lg">
        <VStack>
          <Text color="gray.500">사용 중</Text>
          <Text fontSize="2xl" fontWeight="bold">2.4 TB</Text>
        </VStack>
      </Box>
    </SimpleGrid>
    <Box>
      <Progress value={48} size="sm" colorScheme="orange" rounded="full" />
      <Text mt={2} fontSize="sm" color="gray.500" textAlign="right">48% 사용 중</Text>
    </Box>
  </VStack>
));

// 성능 상세 정보 컴포넌트
const PerformanceDetailContent = memo(() => (
  <VStack align="stretch" spacing={4}>
    <Text>모델 성능 분석</Text>
    <SimpleGrid columns={2} spacing={4}>
      <Box p={4} bg="gray.50" rounded="lg">
        <VStack>
          <Text color="gray.500">최고 정확도</Text>
          <Text fontSize="2xl" fontWeight="bold">96.5%</Text>
        </VStack>
      </Box>
      <Box p={4} bg="gray.50" rounded="lg">
        <VStack>
          <Text color="gray.500">평균 정확도</Text>
          <Text fontSize="2xl" fontWeight="bold">94.2%</Text>
        </VStack>
      </Box>
    </SimpleGrid>
    <Box>
      <Text mb={2} fontWeight="medium">모델별 정확도</Text>
      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between" p={3} bg="gray.50" rounded="lg">
          <Text>ResNet-50</Text>
          <Text fontWeight="medium">96.5%</Text>
        </HStack>
        <HStack justify="space-between" p={3} bg="gray.50" rounded="lg">
          <Text>BERT-Base</Text>
          <Text fontWeight="medium">94.2%</Text>
        </HStack>
      </VStack>
    </Box>
  </VStack>
));

// StatCard 컴포넌트
const StatCard = memo(({ 
  icon, 
  label, 
  value, 
  unit, 
  change,
  href,
  detailContent,
  format = (v: number) => v.toString() 
}: {
  // icon: React.ReactElement;
  icon: IconType;
  label: string;
  value: number;
  unit?: string;
  change: number;
  href?: string;
  detailContent?: React.ReactNode;
  format?: (value: number) => string;
}) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  return (
    <>
      <Box
        position="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box
          as="button"
          onClick={() => setIsModalOpen(true)}
          bg={useColorModeValue('white', 'gray.700')}
          p={6}
          rounded="xl"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.100', 'gray.600')}
          shadow="sm"
          width="100%"
          _hover={{
            transform: 'translateY(-2px)',
            shadow: 'md',
            borderColor: 'orange.500',
            transition: 'all 0.2s'
          }}
          role="group"
          cursor="pointer"
        >
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between">
              <Icon 
                as={icon} 
                color="orange.500" 
                boxSize={6}
                _groupHover={{ transform: 'scale(1.1)' }}
                transition="all 0.2s"
              />
              <Badge
                colorScheme={change >= 0 ? 'green' : 'red'}
                variant="subtle"
                rounded="full"
                px={2}
              >
                {change >= 0 ? '+' : ''}{change}% 증가
              </Badge>
            </HStack>
            <VStack align="start" spacing={1}>
              <Text color="gray.500" fontSize="sm">
                {label}
              </Text>
              <HStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold">
                  {format(value)}
                </Text>
                {unit && (
                  <Text fontSize="sm" color="gray.500">
                    {unit}
                  </Text>
                )}
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* Quick Action Buttons */}
        {isHovered && (
          <HStack
            position="absolute"
            bottom={2}
            right={2}
            spacing={2}
            bg={useColorModeValue('white', 'gray.700')}
            p={2}
            rounded="lg"
            shadow="md"
            zIndex={1}
          >
            {href && (
              <IconButton
                aria-label="자세히 보기"
                icon={<FiArrowUpRight />}
                size="sm"
                colorScheme="orange"
                variant="solid"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(href);
                }}
              />
            )}
          </HStack>
        )}
      </Box>

      {/* Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={icon} color="orange.500" boxSize={5} />
              <Text>{label} 상세 정보</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {detailContent || <Text>상세 정보가 여기에 표시됩니다.</Text>}
          </ModalBody>
          <ModalFooter>
            {href && (
              <Button
                leftIcon={<FiArrowUpRight />}
                colorScheme="orange"
                mr={3}
                onClick={() => router.push(href)}
              >
                자세히 보기
              </Button>
            )}
            <Button onClick={() => setIsModalOpen(false)}>닫기</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

StatCard.displayName = 'StatCard';

// MetricCard 타입 정의
interface MetricCardProps {
  title: string
  value: number
  delta?: number
  icon: any
}

// MetricCard 컴포넌트
const MetricCard = memo(({ title, value, delta, icon }: MetricCardProps) => {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const isDeltaPositive = typeof delta === 'number' && delta > 0;

  return (
    <Box
      bg={cardBg}
      p={6}
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor={borderColor}
    >
      <VStack spacing={2} align="start">
        <HStack justify="space-between" width="100%">
          <Text color="gray.500" fontSize="sm" fontWeight="medium">
            {title}
          </Text>
          <Icon as={icon} boxSize={5} color="gray.500" />
        </HStack>
        <Text fontSize="2xl" fontWeight="bold">
          {(value || 0).toLocaleString()}
        </Text>
        {delta != null && (
          <HStack spacing={1}>
            <Icon
              as={isDeltaPositive ? FiArrowUpRight : FiArrowDownRight}
              color={isDeltaPositive ? 'green.500' : 'red.500'}
              boxSize={4}
            />
            <Text
              fontSize="sm"
              color={isDeltaPositive ? 'green.500' : 'red.500'}
            >
              {Math.abs(delta)}%
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  )
})

MetricCard.displayName = 'MetricCard'

// Error Fallback Component
import { FallbackProps } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <Box
      p={4}
      bg="red.50"
      borderRadius="lg"
      border="1px solid"
      borderColor="red.200"
    >
      <VStack align="start" spacing={4}>
        <HStack>
          <Icon as={FiAlertCircle} color="red.500" />
          <Text fontWeight="bold" color="red.500">오류가 발생했습니다</Text>
        </HStack>
        <Text color="red.600">{error.message}</Text>
        <Button
          leftIcon={<Icon as={FiRefreshCw} />}
          colorScheme="red"
          variant="outline"
          size="sm"
          onClick={resetErrorBoundary}
        >
          다시 시도
        </Button>
      </VStack>
    </Box>
  )
}

ErrorFallback.displayName = 'ErrorFallback'

// ResourceMonitor 컴포넌트 메모이제이션
const ResourceMonitor = memo(() => {
  const [resources, setResources] = useState({
    gpu: { value: 85, label: 'GPU 사용량', color: 'orange' },
    disk: { value: 65, label: '디스크', color: 'blue' },
    memory: { value: 45, label: '메모리', color: 'green' }
  })

  // 리소스 업데이트 함수 메모이제이션
  const updateResource = useCallback((key: string) => {
    setResources(prev => ({
      ...prev,
      [key]: {
        ...prev[key as keyof typeof prev],
        value: Math.min(100, prev[key as keyof typeof prev].value + (Math.random() * 10 - 5))
      }
    }))
  }, [])

  useEffect(() => {
    const intervals = Object.keys(resources).map(key => 
      setInterval(() => updateResource(key), 3000)
    )
    return () => intervals.forEach(clearInterval)
  }, [updateResource])

  return (
    <VStack spacing={4} align="stretch">
      {Object.entries(resources).map(([key, { value, label, color }]) => (
        <HStack key={key} justify="space-between">
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={FiCpu} color={`${color}.500`} />
              <Text fontWeight="medium">{label}</Text>
            </HStack>
            <Progress 
              value={value} 
              size="sm" 
              colorScheme={color} 
              w="200px" 
              borderRadius="full" 
            />
          </VStack>
          <CircularProgress 
            value={value} 
            color={`${color}.400`} 
            thickness="12px" 
            size="60px"
          >
            <CircularProgressLabel>{Math.round(value)}%</CircularProgressLabel>
          </CircularProgress>
        </HStack>
      ))}
    </VStack>
  )
})

ResourceMonitor.displayName = 'ResourceMonitor'

// 모델 타입 정의
interface Model {
  id: string;
  name: string;
  framework: string;
  version: string;
  status: 'deployed' | 'training' | 'failed' | 'ready';
  accuracy: number;
  trainTime: string;
  dataset: string;
  createdAt: string;
  updatedAt: string;
  servingStatus: {
    isDeployed: boolean;
    health: 'healthy' | 'error' | 'none' 
  };
}

// 모델별 성능 지표 타입 정의
interface ModelMetrics {
  [key: string]: {
    metrics: string[];
    description: string;
  }
}

const MODEL_METRICS: ModelMetrics = {
  'MNIST Classifier': {
    metrics: ['Accuracy', 'Loss', 'Precision', 'Recall'],
    description: '손글씨 분류 성능 지표'
  },
  'CIFAR-10 ResNet': {
    metrics: ['Accuracy', 'Loss', 'Top-5 Accuracy'],
    description: '이미지 분류 성능 지표'
  },
  'Customer Churn Predictor': {
    metrics: ['Accuracy', 'AUC-ROC', 'F1-Score'],
    description: '이진 분류 성능 지표'
  },
  'YoLO v5': {
    metrics: ['mAP', 'Precision', 'Recall', 'Inference Time'],
    description: '객체 탐지 성능 지표 (Object Detection)'
  },
  'LSTM': {
    metrics: ['MSE', 'RMSE', 'MAE', 'R^2 Score'],
    description: '시계열 예측 성능 지표 (Time-Series Forecasting)'
  },
  'GRU': {
    metrics: ['MSE', 'RMSE', 'MAE', 'R^2 Score'],
    description: '시계열 예측 성능 지표 (Time-Series Forecasting)'
  },
  'BiLSTM': {
    metrics: ['MSE', 'RMSE', 'MAE', 'R^2 Score'],
    description: '양방향 LSTM을 사용한 시계열 예측 성능 지표'
  },
  'Conv1D-BiLSTM': {
    metrics: ['MSE', 'RMSE', 'MAE', 'R^2 Score'],
    description: 'Conv1D와 BiLSTM을 결합한 하이브리드 모델 성능 지표'
  }
};

// 모델 성능 데이터 타입
interface ModelPerformanceData {
  [key: string]: {
    metrics: {
      [key: string]: number[];
    };
    epochs: string[];
  }
}

// ModelPerformance 컴포넌트 메모이제이션
const ModelPerformance = memo(() => {

  const [selectedModel, setSelectedModel] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedModel') || null;
    }
    return null;
  });


  const [selectedModelID, setSelectedModelID] = useState<string | null>(null); // ✅ Model ID 저장 (API 용)
  const [models, setModels] = useState<Model[]>([]);
  const [performanceData, setPerformanceData] = useState<ModelPerformanceData>({});
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(new Date().toLocaleTimeString());
  const [series, setSeries] = useState<any[]>([]);
  const [xAxisCategories, setXAxisCategories] = useState<number[]>([]); 

  // 모델 데이터 가져오기
  // 
  
  useEffect(() => {
    const fetchModels = async () => {
        try {
            // 📌 API를 호출하여 모델 목록 가져오기
            const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/models`);
            if (!response.ok) {
                throw new Error(`API 호출 오류: ${response.status}`);
            }
            
            // 📌 JSON 응답 변환
            const allModels = await response.json();
            setModels(allModels);
    
            const saved = localStorage.getItem('selectedModel');
            if (!saved && allModels.length > 0) {
              // const sortedModels = allModels.sort((a, b) => (b.version || 0) - (a.version || 0));
              const sortedModels = allModels.sort((a: { version: string }, b: { version: string }) =>
                parseFloat(b.version) - parseFloat(a.version)
              );

              const defaultModel = sortedModels[0].name;
              setSelectedModel(defaultModel);
              localStorage.setItem('selectedModel', defaultModel);
            }
            
          } catch (error) {
              console.error('모델 데이터를 가져오는 중 오류 발생:', error);
          }
      };

    fetchModels();
  }, []);

  
  useEffect(() => {
    const fetchPerformanceData = async () => {
        try {
            // 📌 API를 호출하여 성능 데이터 가져오기
            const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/models/performance`);
            if (!response.ok) {
                throw new Error(`API 호출 오류: ${response.status}`);
            }

            // 📌 JSON 응답 변환
            const apiData = await response.json();

            // 📌 상태를 API 데이터로 업데이트
            setPerformanceData(apiData);

            // 📌 선택된 모델(`selectedModel`)이 존재하는지 확인
            if (selectedModel && apiData[selectedModel]) {
                const modelData = apiData[selectedModel];

                // 📌 차트 데이터를 준비
                setSeries([
                    { name: '정확도 (Accuracy)', data: modelData.metrics.trainAccuracy || [] },
                    { name: '손실 (Loss)', data: modelData.metrics.trainLoss || [] },
                    // // { name: '검증 정확도 (Validation Accuracy)', data: modelData.metrics.valAccuracy || [] },
                    // { name: '검증 손실 (Validation Loss)', data: modelData.metrics.valLoss || [] }
                ]);

                // 📌 모델의 에포크 수에 따라 X축 카테고리 업데이트
                setXAxisCategories(modelData.epochs || []);
            }

            setLastUpdateTime(new Date().toLocaleTimeString());
        } catch (error) {
            console.error('성능 데이터를 가져오는 중 오류 발생:', error);
        }
    };

    // 📌 5초마다 데이터 갱신
    const interval = setInterval(fetchPerformanceData, 5000);
    
    return () => clearInterval(interval);
  }, [selectedModel]); 


  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);
    localStorage.setItem('selectedModel', modelName); // lưu lại
  };

  // 차트 옵션 (이전과 동일)
  
  const chartOptions = useMemo(() => ({
    chart: {
      type: 'area' as const,
      height: 400,
      toolbar: {
        show: true
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
      background: 'transparent'
    },
    stroke: {
      width: 3
    },
    colors: ['#1F2C5C', '#EB6100'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [50, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      // categories: ['Epoch 1', 'Epoch 2', 'Epoch 3', 'Epoch 4', 'Epoch 5'],
      categories: xAxisCategories,
      tickAmount: 20, // 👈 Limit to max 20 ticks (labels)
      title: {
        text: 'Epochs'
      },
      labels: {
        style: {
          colors: '#64748B',
          fontFamily: 'Pretendard'
        }
      }
    },
    yaxis: [
      {
        title: {
          text: '정확도 (%)'
        },
        labels: {
          formatter: function(value: number) {
            return `${value}%`;
          }
        }
      },
      {
        opposite: true,
        title: {
          text: '손실'
        },
        labels: {
          formatter: function (value: number) {
            return value.toFixed(5);
          },
          style: {
            fontFamily: 'Pretendard'
          }
        }
      }
    ],
    tooltip: {
      theme: 'dark',
      x: {
        show: false
      },
      y: {
        formatter: function (value: number, { seriesIndex }: { seriesIndex: number }) {
          if (seriesIndex === 1) {
            // 손실 (Loss)
            return value.toFixed(5);
          } else {

            // 정확도 (Accuracy)
            return `${value.toFixed(2)}%`;
          }
        }
      }
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'left' as const,
      floating: false,
      fontSize: '13px',
      fontFamily: 'Pretendard',
      height: 40,
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        radius: 2,
        offsetX: 0,
        offsetY: 0
      },
      itemMargin: {
        horizontal: 45,
        vertical: 0
      },
      formatter: function(seriesName: string) {
        return `   ${seriesName}   `;
      }
    }
  }), []);

  // 학습된 모델이 없을 때
  if (!models.length) {
    return (
      <Box p={6} borderRadius="xl" bg="white" boxShadow="lg" borderWidth="1px" borderColor="gray.100">
        <VStack spacing={4} align="center" justify="center" h="400px">
          <Icon as={FiActivity} boxSize={12} color="#1F2C5C" />
          <Text fontSize="xl" fontWeight="bold" color="#1F2C5C">
            학습된 모델이 없습니다
          </Text>
          <Text color="gray.500">
            첫 모델 학습을 시작해보세요
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6} borderRadius="xl" bg="white" boxShadow="lg" borderWidth="1px" borderColor="gray.100">
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="bold">모델 성능 분석</Text>
            <HStack spacing={2} color="gray.600">
              <Icon as={FiClock} />
              <Text>마지막 업데이트: {lastUpdateTime}</Text>
            </HStack>
          </VStack>
          <HStack spacing={4}>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="orange" variant="outline">
                {selectedModel || '모델 선택'}
              </MenuButton>
              <MenuList>
                {models.map((model) => (
                  <MenuItem 
                    key={model.id} 
                    onClick={() => handleModelChange(model.name)}
                    icon={model.status === 'ready' ? <Icon as={FiCpu} color="orange.100" /> : undefined}
                  >
                    <HStack justify="space-between" width="100%">
                      <Text>{model.name}</Text>
                      <Tag size="sm" colorScheme={
                        model.status === 'deployed' ? 'green' : 
                        model.status === 'training' ? 'blue' : 'red'
                      }>
                        {model.status}
                      </Tag>
                    </HStack>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </HStack>
        </HStack>

        {selectedModel && (
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <HStack>
                <Icon as={FiInfo} color="gray.500" />
                <Text color="gray.500" fontSize="sm">
                  {MODEL_METRICS[selectedModel.split(' v')[0]]?.description}
                </Text>
              </HStack>
              {models.find(m => m.name === selectedModel)?.status === 'training' && (
                <Tag size="lg" variant="subtle" colorScheme="blue">
                  <TagLeftIcon as={FiCpu} />
                  <TagLabel>학습 중</TagLabel>
                </Tag>
              )}
            </HStack>
            <Box h="400px" w="100%">
              <ReactApexChart 
                options={chartOptions} 
                series={series} 
                type="area" 
                height="100%"
              />
            </Box>
          </VStack>
        )}
      </VStack>
    </Box>
  );
});

ModelPerformance.displayName = 'ModelPerformance'

// // 리소스 사용량 차트 옵션
// const ResourceUsageStats = memo(() => {
//   const labelColor = useColorModeValue('#1F2C5C', '#CBD5E0')
//   const tooltipTheme = useColorModeValue('light', 'dark')
//   const gridColor = useColorModeValue('#f1f1f1', '#2D3748')

//   const chartOptions = useMemo(() => ({
//     chart: {
//       type: 'area',
//       height: 350,
//       toolbar: {
//         show: true
//       },
//       animations: {
//         enabled: true,
//         easing: 'easeinout',
//         speed: 800,
//       },
//       background: 'transparent',
//       fontFamily: 'Pretendard'
//     },
//     stroke: {
//       width: [3, 3],
//       curve: 'smooth'
//     },
//     colors: ['#FF6B00', '#1F2C5C'],
//     fill: {
//       type: ['gradient', 'gradient'],
//       gradient: {
//         shade: 'dark',
//         type: 'vertical',
//         shadeIntensity: 0.5,
//         opacityFrom: 0.7,
//         opacityTo: 0.1,
//         stops: [50, 100]
//       }
//     },
//     markers: {
//       size: 4,
//       colors: ['#FF6B00', '#1F2C5C'],
//       strokeColors: '#fff',
//       strokeWidth: 2,
//       hover: {
//         size: 7,
//         sizeOffset: 3
//       }
//     },
//     dataLabels: {
//       enabled: false
//     },
//     grid: {
//       borderColor: gridColor,
//       strokeDashArray: 5,
//       xaxis: {
//         lines: {
//           show: true
//         }
//       },
//       yaxis: {
//         lines: {
//           show: true
//         }
//       }
//     },
//     xaxis: {
//       categories: ['1h', '2h', '3h', '4h', '5h', '6h'],
//       labels: {
//         style: {
//           colors: labelColor,
//           fontSize: '12px',
//           fontFamily: 'Pretendard'
//         }
//       },
//       axisBorder: {
//         show: false
//       },
//       axisTicks: {
//         show: false
//       }
//     },
//     yaxis: {
//       labels: {
//         style: {
//           colors: labelColor,
//           fontSize: '12px',
//           fontFamily: 'Pretendard'
//         },
//         formatter: function(value) {
//           return `${value}%`
//         }
//       }
//     },
//     tooltip: {
//       enabled: true,
//       theme: tooltipTheme,
//       y: {
//         formatter: function(value) {
//           return `${value}%`
//         }
//       },
//       marker: {
//         show: true
//       }
//     },
//     legend: {
//       position: 'top',
//       horizontalAlign: 'left',
//       fontSize: '13px',
//       fontFamily: 'Pretendard',
//       height: 40,
//       markers: {
//         width: 12,
//         height: 12,
//         strokeWidth: 0,
//         radius: 2,
//         offsetX: 0,
//         offsetY: 0
//       },
//       itemMargin: {
//         horizontal: 45,
//         vertical: 0
//       },
//       formatter: function(seriesName, opts) {
//         return ['   ' + seriesName + '   ']
//       }
//     }
//   }), [labelColor, tooltipTheme, gridColor])

//   const chartData = useMemo(() => [
//     {
//       name: 'CPU 사용량',
//       data: [65, 72, 78, 75, 82, 78]
//     },
//     {
//       name: 'GPU 사용량',
//       data: [45, 55, 85, 78, 92, 88]
//     }
//   ], [])
import axios from 'axios';  // axios를 사용하여 API 호출
export interface MonitoringItem {
  time: string;
  cpu: number;
  cpu_core_total: number;
  cpu_core_using: number;
  memory: number;
  storage: number;
  gpu: {
    gpu_name: string;
    gpu_memory_total: string; // hoặc number nếu bạn convert "24564 MB" về số
    gpu_memory_used: string;
    gpu_memory_free: string;
    gpu_utilization: string; // ví dụ: "7 %"
  };
}

export interface ChartData {
  name: string;
  data: number[];
  time?: string[]; // tuỳ chọn
}
const ResourceUsageStats = memo(() => {
  const [chartData, setChartData] = useState<ChartData[]>([]);  // 차트 데이터를 저장할 상태

  // const [cpuUsage, setCpuUsage] = useState(null); // CPU 사용량
  // const [cpuCoreTotal, setCpuCoreTotal] = useState(null); // 총 CPU 코어 수
  // const [cpuCoreUsing, setCpuCoreUsing] = useState(null); // 사용 중인 CPU 코어 수

  // const [gpuUtilization, setGpuUtilization] = useState(null); // GPU 사용량
  // const [gpuName, setGpuName] = useState(null); // GPU 이름
  // const [gpuMemoryTotal, setGpuMemoryTotal] = useState(null); // GPU 총 메모리
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [cpuCoreTotal, setCpuCoreTotal] = useState<number>(0);
  const [cpuCoreUsing, setCpuCoreUsing] = useState<number>(0);

  const [gpuUtilization, setGpuUtilization] = useState<string>('');
  const [gpuName, setGpuName] = useState<string>('');
  const [gpuMemoryTotal, setGpuMemoryTotal] = useState<string>('');

  const [selectedDate, setSelectedDate] = useState(new Date());

  const labelColor = useColorModeValue('#1F2C5C', '#CBD5E0');
  const tooltipTheme = useColorModeValue('light', 'dark');
  const gridColor = useColorModeValue('#f1f1f1', '#2D3748');

  const isToday = (timeString: string) => {
    const currentDate = new Date();
    const timeDate = new Date(timeString);
    return (
      currentDate.getFullYear() === timeDate.getFullYear() &&
      currentDate.getMonth() === timeDate.getMonth() &&
      currentDate.getDate() === timeDate.getDate()
    );
  };

  // API로부터 데이터를 가져와서 차트 데이터 업데이트
  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/resource-monitoring/dashboard`);
      // const data = response.data;
      const data: MonitoringItem[] = response.data;

      
  
      // 오늘 날짜에 해당하는 데이터만 필터링
      const todayData = data.filter(item => isToday(item.time));
      const time = todayData.map(item => item.time);  // X축: 오늘의 시간
      const cpuUsage = todayData.map(item => item.cpu);  // CPU 사용량
      const gpuUsage = todayData.map(item => parseInt(item.gpu.gpu_utilization));  // GPU 사용량
  
      // 필터링된 데이터를 chartData에 업데이트
      setChartData([
        {
          name: 'CPU 사용량',
          data: cpuUsage,
          time: time,
        },
        {
          name: 'GPU 사용량',
          data: gpuUsage,
          time: time,
        }
      ]);


      const latestData = data[data.length - 1]; // 최신 데이터
      setCpuUsage(latestData.cpu); // CPU 사용량 (백분율)
      setCpuCoreTotal(latestData.cpu_core_total); // 총 CPU 코어 수
      setCpuCoreUsing(latestData.cpu_core_using); // 사용 중인 CPU 코어 수

      setGpuUtilization(latestData.gpu.gpu_utilization); // GPU 사용량
      setGpuName(latestData.gpu.gpu_name); // GPU 이름
      setGpuMemoryTotal(latestData.gpu.gpu_memory_total); // GPU 총 메모리

    } catch (error) {
      console.error("데이터를 가져오는 중 오류 발생: ", error);
    }
  };
  

  useEffect(() => {
    fetchData();  // 컴포넌트가 마운트되면 API 호출
  }, []);

  // 차트 옵션 설정
  const chartOptions = useMemo(() => ({
    chart: {
      type: 'area' as const,
      height: 350,
      toolbar: {
        show: true,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
      background: 'transparent',
      fontFamily: 'Pretendard',
    },
    stroke: {
      width: [3, 3],
      curve: 'smooth' as const,
    },
    colors: ['#FF6B00', '#1F2C5C'],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.5,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [50, 100],
      },
    },
    markers: {
      size: 4,
      colors: ['#FF6B00', '#1F2C5C'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 7,
        sizeOffset: 3,
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      categories: chartData.length > 0 ? chartData[0].time : [],
      labels: {
        style: {
          colors: labelColor,
          fontSize: '12px',
          fontFamily: 'Pretendard',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tickAmount: 12,  // 하루 동안 24개의 시간만큼의 레이블을 표시
    },
    yaxis: {
      labels: {
        style: {
          colors: labelColor,
          fontSize: '12px',
          fontFamily: 'Pretendard',
        },
        formatter: function (value: number) {
          return `${value}%`;  // Y축은 %로 표시
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: tooltipTheme,
      y: {
        formatter: function (value: number) {
          return `${value}%`;  // 툴팁에 % 표시
        },
      },
      marker: {
        show: true,
      },
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'left' as const,
      fontSize: '13px',
      fontFamily: 'Pretendard',
      // height: 40,
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        radius: 2,
        offsetX: 0,
        offsetY: 0,
      },
      itemMargin: {
        horizontal: 45,
        vertical: 0,
      },
      // formatter: function (seriesName, opts) {
      //   return ['   ' + seriesName + '   '];  // 범례 항목에 여백 추가
      // },
      formatter: (seriesName: string): string => `   ${seriesName}   `,
    },
  }), [labelColor, tooltipTheme, gridColor, chartData]);



  return (
    <DashboardCard title="리소스 모니터링" icon={FiServer}>
      <Box>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
          <Box 
            p={4} 
            bg={useColorModeValue('orange.50', 'gray.700')} 
            borderRadius="lg" 
            border="1px solid" 
            borderColor={useColorModeValue('orange.100', 'gray.600')}
          >
            <VStack spacing={2} align="start">
              {/* <HStack spacing={3}>
                <Icon as={FiCpu} color="orange.500" />
                <Text fontSize="sm" color="gray.500">CPU 현재 사용량</Text>
              </HStack>
              <HStack spacing={2} align="center">
                <CircularProgress
                  value={78}
                  color="orange.500"
                  size="50px"
                  thickness="8px"
                >
                  <CircularProgressLabel fontWeight="bold">78%</CircularProgressLabel>
                </CircularProgress>
                <VStack spacing={0} align="start">
                  <Text fontSize="sm" fontWeight="medium">정상</Text>
                  <Text fontSize="xs" color="gray.500">8 코어 중 6.2 코어</Text>
                </VStack>
              </HStack> */}
              <HStack spacing={3}>
                <Icon as={FiCpu} color="orange.500" />
                <Text fontSize="sm" color="gray.500">CPU 현재 사용량</Text>
              </HStack>
              <HStack spacing={2} align="center">
                <CircularProgress
                  value={cpuUsage ?? 0}  // CPU 사용량 (없으면 0)
                  color={
                    (cpuUsage ?? 0) <= 50 ? "green.500" : // 정상
                    (cpuUsage ?? 0) > 50 && (cpuUsage ?? 0) < 70 ? "yellow.500" : // 경고
                    (cpuUsage ?? 0) >= 70 && (cpuUsage ?? 0) < 85 ? "orange.500" : // 주의
                    (cpuUsage ?? 0) >= 85 && (cpuUsage ?? 0) < 95 ? "red.500" : // 심각
                    "red.600" // 과부하
                  }
                  size="50px"
                  thickness="8px"
                >
                  <CircularProgressLabel fontWeight="bold">{cpuUsage ?? 0}%</CircularProgressLabel>
                </CircularProgress>
                <VStack spacing={0} align="start">
                <Text fontSize="sm" fontWeight="medium">
                {
                  (cpuUsage ?? 0) <= 50 ? "정상" :
                  (cpuUsage ?? 0) > 50 && (cpuUsage ?? 0) < 70 ? "경고" :
                  (cpuUsage ?? 0) >= 70 && (cpuUsage ?? 0) < 85 ? "주의" :
                  (cpuUsage ?? 0) >= 85 && (cpuUsage ?? 0) < 95 ? "심각" :
                  "과부하"
                }
                </Text>
                  {cpuCoreTotal && cpuCoreUsing ? (
                    // CPU 코어 정보가 있을 경우 표시
                    <Text fontSize="xs" color="gray.500">
                      {cpuCoreTotal} 코어 중 {cpuCoreUsing} 코어 사용 중
                    </Text>
                  ) : (
                    // 데이터가 없을 경우 메시지 표시
                    <Text fontSize="xs" color="gray.500">
                      CPU 정보가 없습니다
                    </Text>
                  )}
                </VStack>
              </HStack>
            </VStack>
          </Box>

          <Box 
            p={4} 
            bg={useColorModeValue('blue.50', 'gray.700')} 
            borderRadius="lg" 
            border="1px solid" 
            borderColor={useColorModeValue('blue.100', 'gray.600')}
          >
            <VStack spacing={2} align="start">
              {/* <HStack spacing={3}>
                <Icon as={FiCpu} color="blue.500" />
                <Text fontSize="sm" color="gray.500">GPU 현재 사용량</Text>
              </HStack>
              <HStack spacing={2} align="center">
                <CircularProgress
                  value={88}
                  color="blue.500"
                  size="50px"
                  thickness="8px"
                >
                  <CircularProgressLabel fontWeight="bold">88%</CircularProgressLabel>
                </CircularProgress>
                <VStack spacing={0} align="start">
                  <Text fontSize="sm" fontWeight="medium">주의</Text>
                  <Text fontSize="xs" color="gray.500">NVIDIA RTX 4090 Ti - 24GB</Text>
                </VStack>
              </HStack> */}
              <HStack spacing={3}>
                <Icon as={FiCpu} color="blue.500" />
                <Text fontSize="sm" color="gray.500">GPU 현재 사용량</Text>
              </HStack>
              <HStack spacing={2} align="center">
                <CircularProgress
                  value={parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0}  // GPU 사용량 (없으면 0, % 기호 제거 후 숫자로 변환)
                  color={
                    (parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0) <= 50 ? "green.500" :  // 정상
                    (parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0) > 50 && (parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0) < 70 ? "yellow.500" :  // 경고
                    (parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0) >= 70 && (parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0) < 85 ? "orange.500" :  // 주의
                    (parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0) >= 85 && (parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0) < 95 ? "red.500" :  // 심각
                    "red.600"  // 과부하
                  }
                  size="50px"
                  thickness="8px"
                >
                  <CircularProgressLabel fontWeight="bold">{gpuUtilization || "0%"}</CircularProgressLabel>
                </CircularProgress>
                <VStack spacing={0} align="start">
                  <Text fontSize="sm" fontWeight="medium">
                    {
                      // Chuyển gpuUtilization từ chuỗi thành số và xử lý các mức cảnh báo
                      (parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0) <= 50 ? "정상" :
                      (parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0) > 50 && (parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0) < 70 ? "경고" :
                      (parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0) >= 70 && (parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0) < 85 ? "주의" :
                      (parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0) >= 85 && (parseFloat((gpuUtilization ?? "0%").replace('%', '')) || 0) < 95 ? "심각" :
                      "과부하"
                    }
                  </Text>
                  {gpuName && gpuMemoryTotal ? (
                    // GPU 정보가 있을 경우 표시
                    <Text fontSize="xs" color="gray.500">
                      {gpuName} - {gpuMemoryTotal}
                    </Text>
                  ) : (
                    // 데이터가 없을 경우 메시지 표시
                    <Text fontSize="xs" color="gray.500">
                      GPU 정보가 없습니다
                    </Text>
                  )}
                </VStack>
              </HStack>

            </VStack>
          </Box>
        </SimpleGrid>

        <Box height="500px">
          <ReactApexChart
            options={chartOptions}
            series={chartData}
            type="area"
            height="100%"
            width="100%"
          />
        </Box>
      </Box>
    </DashboardCard>
  )
})

ResourceUsageStats.displayName = 'ResourceUsageStats'

interface DatasetSplit {
  train_set: number;
  val_set: number;
  test_set: number;
  outside_set: number;
}

interface DatasetItem {
  id: string;
  name: string;
  lastModified: string;
  split_ratio?: DatasetSplit;
  [key: string]: any; // cho phép phần dư
}


// 데이터셋 분포 차트 옵션
const DatasetDistribution = memo(()=> {
  const [datasetSplit, setDatasetSplit] = useState<DatasetSplit>({
    train_set: 0,
    val_set: 0,
    test_set: 0,
    outside_set: 0
  })
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')
  const borderColor = useColorModeValue('gray.100', 'gray.700')

  useEffect(() => {
    const fetchLatestDatasetSplit = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/datasets/`)
        const data = await response.json()
        // const datasets = Object.values(data)
        const datasets = Object.values(data) as DatasetItem[];

        if (datasets.length === 0) return

        const latest = datasets.reduce((a: any, b: any) => {
          return new Date(a.lastModified) > new Date(b.lastModified) ? a : b
        })

        if (latest.split_ratio) {
          setDatasetSplit(latest.split_ratio)
        }
      } catch (error) {
        console.error('Failed to fetch dataset split:', error)
      }
    }

    fetchLatestDatasetSplit()
  }, [])


  const datasets = [
    {
      type: '학습',
      // count: 12500,
      count: datasetSplit.train_set ?? 0,
      trend: '+2.4%',
      color: useColorModeValue('#4C6FFF', '#6B8AFF'), // 밝은 파랑
    },
    {
      type: '검증',
      count: datasetSplit.val_set ?? 0,
      trend: '+1.2%',
      color: useColorModeValue('#00B7D4', '#19CDEA'), // 청록색
    },
    {
      type: '테스트',
      count: datasetSplit.test_set ?? 0,
      trend: '+1.8%',
      color: useColorModeValue('#8E33FF', '#A05FFF'), // 보라색
    },
    {
      type: '외부',
      count: datasetSplit.outside_set ?? 0,
      trend: '+3.1%',
      color: useColorModeValue('#00CC88', '#19E6A1'), // 민트
    }
  ]

  const totalCount = datasets.reduce((sum, dataset) => sum + dataset.count, 0)

  const chartOptions = {
    chart: {
      type: 'donut' as const,
      background: 'transparent',
      fontFamily: 'inherit',
      sparkline: {
        enabled: true
      }
    },
    colors: datasets.map(d => d.color),
    labels: datasets.map(d => d.type),
    legend: {
      show: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '85%',
          labels: {
            show: true,
            name: {
              show: false
            },
            value: {
              show: true,
              fontSize: '28px',
              fontWeight: 700,
              color: textColor,
              formatter: function(val: string) {
                const num = parseFloat(val);
                return isNaN(num) ? val : num.toLocaleString();
              }
            },
            total: {
              show: true,
              label: '전체',
              fontSize: '13px',
              color: mutedColor,
              formatter: function() {
                return totalCount.toLocaleString()
              }
            }
          }
        }
      }
    },
    stroke: {
      width: 0
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(val: number) {
          return val.toLocaleString() + ' 건';
        }
      }
    }
  }

  return (
    <Stack spacing={8}>
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
        {/* 차트 */}
        <GridItem>
          <Box 
            bg={bgColor} 
            borderRadius="2xl" 
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
            position="relative"
            height="100%"
          >
            <Box position="absolute" top={6} left={6}>
              <Text fontSize="sm" color={mutedColor} letterSpacing="wider">
                데이터셋 분포
              </Text>
            </Box>
            <Box pt={16} pb={6} px={6}>
              <ReactApexChart
                options={chartOptions}
                series={datasets.map(d => d.count)}
                type="donut"
                height={280}
              />
            </Box>
          </Box>
        </GridItem>

        {/* 상세 정보 */}
        <GridItem>
          <Box 
            bg={bgColor} 
            borderRadius="2xl" 
            border="1px solid"
            borderColor={borderColor}
            p={6}
            height="100%"
          >
            <Text fontSize="sm" color={mutedColor} mb={6} letterSpacing="wider">
              데이터셋 상세
            </Text>
            <Stack spacing={6}>
              {datasets.map((dataset, idx) => (
                <HStack key={dataset.type} justify="space-between" align="center">
                  <VStack align="start" spacing={1}>
                    <HStack spacing={2} align="center">
                      <Box w="3" h="3" borderRadius="full" bg={dataset.color} />
                      <Text fontSize="sm" color={mutedColor}>
                        {dataset.type} 데이터
                      </Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="bold" color={textColor}>
                      {dataset.count.toLocaleString()}
                    </Text>
                  </VStack>
                  <Text 
                    fontSize="sm" 
                    color={dataset.trend.startsWith('+') ? 'green.500' : 'red.500'}
                    fontWeight="medium"
                  >
                    {dataset.trend}
                  </Text>
                </HStack>
              ))}
            </Stack>
          </Box>
        </GridItem>
      </Grid>
    </Stack>
  )
})

DatasetDistribution.displayName = 'DatasetDistribution'

// 데이터셋 통계 데이터 타입 정의
interface DatasetStats {
  totalDatasets: number;
  totalSize: number;
  datasetTypes: {
    [key: string]: number;
  };
}

// 데이터셋 통계 데이터를 가져오는 훅
const useDatasetStats = () => {
  const [stats, setStats] = useState<DatasetStats>({
    totalDatasets: 0,
    totalSize: 0,
    datasetTypes: {}
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: API 연동 시 실제 엔드포인트로 교체
        // const response = await fetch('/api/datasets/stats');
        // const data = await response.json();
        // setStats(data);
      } catch (error) {
        console.error('Failed to fetch dataset stats:', error);
      }
    };

    fetchStats();
  }, []);

  return stats;
};

// DatasetStats 컴포넌트 메모이제이션
const DatasetStats = memo(() => {
  const [selectedView, setSelectedView] = useState('overview')
  const [hoveredDataset, setHoveredDataset] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadType, setUploadType] = useState('structured')
  const [uploadName, setUploadName] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const itemsPerPage = 5
  const bgHover = useColorModeValue('orange.50', 'rgba(251, 146, 60, 0.1)')
  const { datasets, getSummary } = useDatasets()
  const summary = useMemo(() => getSummary(), [datasets])
  const toast = useToast()

  const handleUpload = async () => {
    if (!uploadFile || !uploadName.trim()) {
      toast({
        title: '입력 확인',
        description: '파일과 데이터셋 이름은 필수입니다.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsUploading(true)
    try {
      // TODO: 실제 업로드 API 연동
      await new Promise(resolve => setTimeout(resolve, 2000)) // 임시 지연
      toast({
        title: '업로드 완료',
        description: '데이터셋이 성공적으로 업로드되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      setIsUploadModalOpen(false)
      // 폼 초기화
      setUploadFile(null)
      setUploadName('')
      setUploadDescription('')
      setUploadType('structured')
    } catch (error) {
      toast({
        title: '업로드 실패',
        description: '데이터셋 업로드 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsUploading(false)
    }
  }

  // 데이터셋 유형별 분포 계산
  const typeDistribution = useMemo(() => {
    const types = Object.values(datasets).reduce((acc: Record<string, number>, dataset) => {
      const type = dataset.type.toLowerCase()
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
    
    const total = Object.values(types).reduce((a: number, b: number) => a + b, 0)
    return Object.entries(types).map(([_, count]) => (count / total) * 100)
  }, [datasets])

  // 품질 지표 추이 계산 (최근 5개 데이터셋)
  const qualityTrend = useMemo(() => {
    const recentDatasets = Object.values(datasets)
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, 5)
      .reverse()

    return [
      {
        name: '완전성',
        data: recentDatasets.map(d => d.quality.completeness)
      },
      {
        name: '일관성',
        data: recentDatasets.map(d => d.quality.consistency)
      },
      {
        name: '균형성',
        data: recentDatasets.map(d => d.quality.balance)
      }
    ]
  }, [datasets])

  // 데이터셋 필터링 및 페이지네이션
  const filteredAndPaginatedDatasets = useMemo(() => {
    const filtered = Object.values(datasets)
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .filter(dataset => 
        dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dataset.type.toLowerCase().includes(searchQuery.toLowerCase())
      )

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }

    const start = (currentPage - 1) * itemsPerPage
    return {
      data: filtered.slice(start, start + itemsPerPage),
      totalPages,
      totalItems: filtered.length
    }
  }, [datasets, searchQuery, currentPage])

  // 차트 옵션
  
  const distributionOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'donut' as const,
      height: 200,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: Object.keys(summary.datasetTypes).map((_, idx) => {
      const colors = ['#FF9F89', '#91D8E4', '#BFEAF5', '#FFC8DD', '#A8E6CF']
      return colors[idx % colors.length]
    }),
    labels: Object.keys(summary.datasetTypes),
    legend: {
      position: 'bottom' as const,
      fontSize: '14px',
      fontFamily: 'Pretendard',
      markers: {
        width: 12,
        height: 12,
        radius: 6
      } as any, // 👈 ép kiểu tại đây
      itemMargin: {
        horizontal: 15
      },
      labels: {
        colors: useColorModeValue('#1A202C', '#FFFFFF')
      }
    },
    stroke: { 
      width: 0,
      lineCap: 'round'
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: false
          }
        }
      }
    },
    tooltip: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontFamily: 'Pretendard'
      },
      y: {
        formatter: function(val: number) {
          return Math.round(val) + '%'
        }
      }
    }
  }), []);

  // const qualityTrendOptions = useMemo(() => ({
  const qualityTrendOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'line' as const,
      height: 200,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'smooth',
        speed: 1000,
        animateGradually: {
          enabled: true,
          delay: 150
        }
      },
      background: 'transparent',
      dropShadow: {
        enabled: true,
        opacity: 0.1,
        blur: 3,
        left: 2,
        top: 2
      }
    },
    stroke: {
      curve: 'smooth',
      width: 4,
      lineCap: 'round'
    },
    colors: ['#FF9F89', '#91D8E4', '#A8E6CF'],
    markers: {
      size: 6,
      strokeWidth: 0,
      hover: {
        size: 9
      }
    },
    grid: {
      show: true,
      borderColor: useColorModeValue('#E2E8F0', '#2D3748'),
      strokeDashArray: 5,
      position: 'back',
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      categories: Object.values(datasets)
        .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
        .slice(0, 5)
        .reverse()
        .map(d => new Date(d.lastModified).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })),
      labels: {
        style: {
          colors: useColorModeValue('#1A202C', '#FFFFFF'),
          fontSize: '12px',
          fontFamily: 'Pretendard'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: useColorModeValue('#1A202C', '#FFFFFF'),
          fontSize: '12px',
          fontFamily: 'Pretendard'
        },
        formatter: function(val: number) {
          return Math.round(val) + '%'
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '14px',
      fontFamily: 'Pretendard',
      markers: {
        width: 12,
        height: 12,
        radius: 6,
        size: 12,
        strokeWidth: 0,
        shape: 'circle'
      } as any,
      itemMargin: {
        horizontal: 15
      },
      labels: {
        colors: useColorModeValue('#1A202C', '#FFFFFF')
      }
    },
    tooltip: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontFamily: 'Pretendard'
      },
      y: {
        formatter: function(val: number) {
          return Math.round(val) + '%'
        }
      }
    }
  }), []);

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between" align="center" mb={4}>
        <Tabs variant="soft-rounded" colorScheme="orange" size="sm">
          <TabList gap={2}>
            <Tab>개요</Tab>
            <Tab>품질 지표</Tab>
            <Tab>최근 업데이트</Tab>
          </TabList>
        </Tabs>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="orange"
          size="sm"
          onClick={() => setIsUploadModalOpen(true)}
        >
          새 데이터셋
        </Button>
      </HStack>

      <TabPanels>
        <TabPanel px={0}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box 
              p={6} 
              bg={useColorModeValue('white', 'gray.800')} 
              borderRadius="xl" 
              boxShadow="sm"
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              transition="all 0.2s"
            >
              <Text fontSize="lg" fontWeight="semibold" mb={4}>데이터셋 유형 분포</Text>
              <ReactApexChart
                options={distributionOptions}
                series={Object.values(summary.datasetTypes)}
                type="donut"
                height={280}
              />
            </Box>
            <Box 
              p={6} 
              bg={useColorModeValue('white', 'gray.800')} 
              borderRadius="xl" 
              boxShadow="sm"
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              transition="all 0.2s"
            >
              <Text fontSize="lg" fontWeight="semibold" mb={4}>주요 통계</Text>
              <SimpleGrid columns={2} spacing={6}>
                <Stat>
                  <StatLabel fontSize="sm" color="gray.500">전체 데이터셋</StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold" color={useColorModeValue('black.500', 'black.300')}>
                    {summary.totalDatasets}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    23.36%
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel fontSize="sm" color="gray.500">총 용량</StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold" color={useColorModeValue('black.500', 'black.300')}>
                    {(summary.totalSize / (1024 * 1024 * 1024)).toFixed(1)} TB
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    12.5%
                  </StatHelpText>
                </Stat>
              </SimpleGrid>
            </Box>
          </SimpleGrid>
        </TabPanel>

        <TabPanel px={0}>
          <Box 
            p={6} 
            bg={useColorModeValue('white', 'gray.800')} 
            borderRadius="xl" 
            boxShadow="sm"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            transition="all 0.2s"
          >
            <Text fontSize="lg" fontWeight="semibold" mb={4}>품질 지표 추이</Text>
            <ReactApexChart
              options={qualityTrendOptions}
              series={qualityTrend}
              type="line"
              height="300"
            />
          </Box>
        </TabPanel>

        <TabPanel px={0}>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={SearchIcon} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="데이터셋 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderRadius="lg"
                />
              </InputGroup>
              <Text color="gray.500" fontSize="sm" whiteSpace="nowrap">
                총 {filteredAndPaginatedDatasets.totalItems}개
              </Text>
            </HStack>

            {filteredAndPaginatedDatasets.data.map((dataset) => (
              <Box
                key={dataset.id}
                p={6}
                bg={useColorModeValue('white', 'gray.800')}
                borderRadius="xl"
                boxShadow="sm"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                transition="all 0.2s"
                _hover={{
                  boxShadow: 'md',
                  transform: 'translateY(-2px)',
                  cursor: 'pointer'
                }}
              >
                <HStack justify="space-between">
                  <Box flex={1}>
                    <Text fontSize="lg" fontWeight="semibold">{dataset.name}</Text>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      {dataset.type} · {new Date(dataset.lastModified).toLocaleDateString('ko-KR')}
                    </Text>
                  </Box>
                  <Badge
                    colorScheme="green"
                    variant="subtle"
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    완료
                  </Badge>
                </HStack>
              </Box>
            ))}

            {filteredAndPaginatedDatasets.totalPages > 1 && (
              <HStack justify="center" spacing={2} mt={4}>
                <IconButton
                  aria-label="이전 페이지"
                  icon={<ChevronLeftIcon />}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  isDisabled={currentPage === 1}
                  size="sm"
                />
                {Array.from({ length: filteredAndPaginatedDatasets.totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? 'solid' : 'ghost'}
                    colorScheme={currentPage === page ? 'orange' : 'gray'}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <IconButton
                  aria-label="다음 페이지"
                  icon={<ChevronRightIcon />}
                  onClick={() => setCurrentPage(p => Math.min(filteredAndPaginatedDatasets.totalPages, p + 1))}
                  isDisabled={currentPage === filteredAndPaginatedDatasets.totalPages}
                  size="sm"
                />
              </HStack>
            )}

            {filteredAndPaginatedDatasets.data.length === 0 && (
              <Box
                p={8}
                textAlign="center"
                bg={useColorModeValue('white', 'gray.800')}
                borderRadius="xl"
                border="1px dashed"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
              >
                <Text color="gray.500">검색 결과가 없습니다</Text>
              </Box>
            )}
          </VStack>
        </TabPanel>
      </TabPanels>
    </VStack>
  )
})

DatasetStats.displayName = 'DatasetStats'

// 알림 타입 정의
interface Alert {
  severity: 'error' | 'warning' | 'info'
  message: string
  time: string
}

// Mock 알림 데이터
const alerts: Alert[] = [
  {
    severity: 'error',
    message: 'GPU 메모리 사용량이 90%를 초과했습니다',
    time: '5분 전'
  },
  {
    severity: 'warning',
    message: '모델 학습 성능이 기준치 이하입니다',
    time: '15분 전'
  },
  {
    severity: 'info',
    message: '새로운 데이터셋이 업로드되었습니다',
    time: '30분 전'
  }
]

// AlertsTimeline 컴포넌트 메모이제이션
const AlertsTimeline = memo(() => {
  return (
    <VStack spacing={4} align="stretch">
      {alerts.map((alert, idx) => (
        <HStack
          key={idx}
          p={4}
          bg={useColorModeValue('gray.50', 'gray.700')}
          borderRadius="lg"
          borderLeftWidth={4}
          borderLeftColor={
            alert.severity === 'error' ? 'red.500' :
            alert.severity === 'warning' ? 'orange.500' : 'blue.500'
          }
        >
          <Icon
            as={
              alert.severity === 'error' ? FiAlertCircle :
              alert.severity === 'warning' ? FiAlertTriangle : FiInfo
            }
            color={
              alert.severity === 'error' ? 'red.500' :
              alert.severity === 'warning' ? 'orange.500' : 'blue.500'
            }
            boxSize={5}
          />
          <VStack align="start" spacing={0} flex={1}>
            <Text fontWeight="medium">{alert.message}</Text>
            <Text fontSize="sm" color="gray.500">{alert.time}</Text>
          </VStack>
        </HStack>
      ))}
    </VStack>
  )
})

AlertsTimeline.displayName = 'AlertsTimeline'

// API 타입 정의
interface Model {
  id: string
  name: string
  framework: string
  version: string
  status: 'training' | 'deployed' | 'failed' | 'ready'
  accuracy: number
  trainTime: string
  dataset: string
  createdAt: string
  updatedAt: string
  servingStatus: {
    isDeployed: boolean
    health: 'healthy' | 'error' | 'none'
  }
}

interface Experiment {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed'
  startTime: string | string[]         // tùy API trả string hay array
  endTime?: string | string[] | null   // thường nullable
  metrics: {
    accuracy: number
    loss: number
  }
  metrics_history?: {
    trainAcc: number[]
    valAcc: number[]
    trainLoss: number[]
    valLoss: number[]
  }
  hyperparameters?: {
    learningRate: number
    batchSize: number
    epochs: number
  }
  createdAt?: string | string[]
  updatedAt?: string | string[]
  runtime?: string
  timestamp?: string
  description?: string
}


interface ResourceUsage {
  cpu: number
  memory: number
  gpu: number
  storage: number
}

interface DatasetMetrics {
  totalDatasets: number
  totalSamples: number
  avgQualityScore: number
  lastUpdated: string
}

interface DatasetChange {
  // change: number
  changeText: string
  color: string
}

interface Dataset {
  id: string
  name: string
  type: string
  version: string
  size: number
  lastModified: string
  createdAt: string
  updatedAt: string
  rows: number
  records: number
  columns: number
  status: string
  progress: number
  tags: string[]
  description: string
  features: {
    name: string
    type: string
    missing: number
  }[]
  split_ratio: {
    train_set: number
    val_set: number
    test_set: number
    outside_set: number
  }
  statistics: {
    numerical: {
      mean: number[]
      std: number[]
      min: number[]
      max: number[]
    }
    categorical: {
      unique: string[]
      top: string[]
      freq: string[]
    }
  }
  quality: {
    completeness: number
    consistency: number
    balance: number
  }
  qualityScore: number
}


// // API 호출 함수들
// const fetchDashboardData = async () => {
//   // TODO: 실제 API 엔드포인트로 교체
//   // const response = await fetch('/api/dashboard')
//   // return response.json()
  
//   // 목업 데이터
//   return {
//     models: [
//       {
//         id: '1',
//         name: 'MNIST Classifier v2.1',
//         framework: 'PyTorch',
//         version: '2.1.0',
//         status: 'deployed',
//         accuracy: 0.985,
//         trainTime: '2h 15m',
//         dataset: 'MNIST',
//         createdAt: '2025-02-07',
//         updatedAt: '2025-02-07',
//         servingStatus: {
//           isDeployed: true,
//           health: 'healthy',
//         }
//       },
//       {
//         id: '2',
//         name: 'CIFAR-10 ResNet',
//         framework: 'TensorFlow',
//         version: '1.0.0',
//         status: 'training',
//         accuracy: 0.92,
//         trainTime: '4h 30m',
//         dataset: 'CIFAR-10',
//         createdAt: '2025-02-06',
//         updatedAt: '2025-02-07',
//         servingStatus: {
//           isDeployed: false,
//           health: 'none',
//         }
//       },
//       {
//         id: '3',
//         name: 'Customer Churn Predictor',
//         framework: 'XGBoost',
//         version: '1.2.0',
//         status: 'failed',
//         accuracy: 0.88,
//         trainTime: '1h 45m',
//         dataset: 'Customer Data',
//         createdAt: '2025-02-05',
//         updatedAt: '2025-02-07',
//         servingStatus: {
//           isDeployed: false,
//           health: 'error',
//         }
//       }
//     ],
//     experiments: [
//       {
//         id: '1',
//         name: 'MNIST Hyperparameter Tuning',
//         status: 'running',
//         startTime: '2025-02-21T01:00:00Z',
//         metrics: {
//           accuracy: 0.97,
//           loss: 0.08
//         }
//       },
//       {
//         id: '2',
//         name: 'CIFAR-10 Architecture Search',
//         status: 'completed',
//         startTime: '2025-02-20T10:00:00Z',
//         endTime: '2025-02-20T18:00:00Z',
//         metrics: {
//           accuracy: 0.94,
//           loss: 0.12
//         }
//       },
//       {
//         id: '3',
//         name: 'Churn Prediction Feature Selection',
//         status: 'running',
//         startTime: '2025-02-21T02:00:00Z',
//         metrics: {
//           accuracy: 0.89,
//           loss: 0.22
//         }
//       }
//     ],
//     resourceUsage: {
//       cpu: 65,
//       memory: 78,
//       gpu: 92,
//       storage: 45
//     },
//     datasetMetrics: {
//       totalDatasets: 12,
//       totalSamples: 150000,
//       avgQualityScore: 0.92,
//       lastUpdated: '2025-02-21T01:30:00Z'
//     }
//   }
// }


const fetchDashboardData = async () => {
  try {
    // 실험 데이터 가져오기 API 호출
    const experimentsResponse = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/experiments/`);
    // const experimentsData = await experimentsResponse.json();
    const experimentsData: Experiment[] = await experimentsResponse.json();

    // 모델 데이터 가져오기 API 호출
    const modelsResponse = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/models`);
    // const modelsData = await modelsResponse.json();
    const modelsData: Model[] = await modelsResponse.json();

    // 데이터셋 데이터 가져오기 API 호출
    const datasetsResponse = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/datasets/`);
    // const datasetsData = await datasetsResponse.json();
    const datasetsData: Record<string, Dataset> = await datasetsResponse.json();


    // 모델 데이터 변환
    const models = modelsData.map(model => ({
      id: model.id,
      name: model.name,
      framework: model.framework,
      version: model.version,
      status: model.status,
      accuracy: model.accuracy,
      trainTime: model.trainTime,
      dataset: model.dataset,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      servingStatus: model.servingStatus
    }));

    // 실험 데이터 변환
    const experiments = experimentsData.map(exp => ({
      id: exp.id,
      name: exp.name,
      status: exp.status,
      startTime: Array.isArray(exp.startTime) ? exp.startTime[0] : exp.startTime,
      endTime: Array.isArray(exp.endTime) ? exp.endTime[0] : exp.endTime,
      metrics: exp.metrics,
      metrics_history: exp.metrics_history,
      hyperparameters: exp.hyperparameters,
      createdAt: Array.isArray(exp.createdAt) ? exp.createdAt[0] : exp.createdAt,
      updatedAt: Array.isArray(exp.updatedAt) ? exp.updatedAt[0] : exp.updatedAt,
      runtime: exp.runtime,
      timestamp: exp.timestamp,
      description: exp.description,
    }));

    // 데이터셋 통계 계산
    const allDatasets = Object.values(datasetsData);
    const totalDatasets = Object.keys(datasetsData).length;
    const totalSamples = Object.values(datasetsData).reduce((acc, dataset) => acc + dataset.rows, 0);
    const avgQualityScore = Object.values(datasetsData).reduce((acc, dataset) => acc + dataset.quality.consistency, 0) / totalDatasets;
    const lastUpdated = Object.values(datasetsData).reduce((latest, dataset) => 
      new Date(dataset.lastModified) > new Date(latest) ? dataset.lastModified : latest, "");

    // Calculate dataset change (this week vs last week)
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const lastWeekStart = subWeeks(thisWeekStart, 1);            // Monday last week
    const lastWeekEnd = new Date(thisWeekStart.getTime() - 1);   // Sunday last week

    const thisWeek = allDatasets.filter(ds => {
      const created = parseISO(ds.createdAt);
      return isWithinInterval(created, { start: thisWeekStart, end: now });
    });

    const lastWeek = allDatasets.filter(ds => {
      const created = parseISO(ds.createdAt);
      return isWithinInterval(created, { start: lastWeekStart, end: lastWeekEnd });
    });

    const rawChange = thisWeek.length - lastWeek.length;


    const datasetChange = {
      // change: Math.abs(rawChange), // Ví dụ: 17.3%
      changeText: `${Math.abs(rawChange)}개 ${rawChange >= 0 ? "증가" : "감소"}`, // (이번주: ${thisWeek.length}개 → 지난주: ${lastWeek.length}개)
      color: rawChange >= 0 ? "orange" : "red",
    };

    // 리소스 사용량 데이터 (API 제공 없음으로 인해 가상 데이터 사용)
    const resourceUsage = {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      gpu: Math.floor(Math.random() * 100),
      storage: Math.floor(Math.random() * 100)
    };

    return {
      models,
      experiments,
      resourceUsage,
      datasetMetrics: {
        totalDatasets,
        totalSamples,
        avgQualityScore,
        lastUpdated
      },
      datasetChange
    };
  } catch (error) {
    console.error('대시보드 데이터를 가져오는 중 오류 발생:', error);
    return null;
  }
};

// Custom Hook
const useDashboardData = () => {
  const [data, setData] = useState<{
    models: Model[]
    experiments: Experiment[]
    resourceUsage: ResourceUsage
    datasetMetrics: DatasetMetrics
    datasetChange: DatasetChange
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await fetchDashboardData()
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // 30초마다 데이터 새로고침
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

// 리소스 사용량 카드 컴포넌트
const ResourceUsageCard = ({ label, value, icon }: { label: string; value: number; icon: IconType }) => {
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  
  return (
    <Box p={4} bg={cardBg} borderRadius="lg" boxShadow="sm">
      <VStack spacing={2} align="start">
        <HStack spacing={2}>
          <Icon as={icon} color="orange.500" />
          <Text color={textColor}>{label}</Text>
        </HStack>
        <Text fontSize="2xl" fontWeight="bold">
          {value}%
        </Text>
        <Progress
          value={value}
          size="sm"
          width="100%"
          colorScheme={value > 80 ? 'red' : value > 60 ? 'orange' : 'green'}
        />
      </VStack>
    </Box>
  )
}

// 데이터셋 메트릭 카드 컴포넌트
const DatasetMetricCard = ({ label, value, unit }: { label: string; value: number; unit: string }) => {
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <Box p={4} bg={cardBg} borderRadius="lg" boxShadow="sm">
      <VStack spacing={2} align="start">
        <Text color={textColor}>{label}</Text>
        <Text fontSize="2xl" fontWeight="bold">
          {value.toLocaleString()} {unit}
        </Text>
      </VStack>
    </Box>
  )
}


interface DashboardCardProps {
  title: string;
  icon?: any; // hoặc dùng: React.ElementType nếu bạn dùng <Icon as={icon}>
  children: ReactNode;
}


const DashboardCard = ({ title, icon, children }: DashboardCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      borderRadius="xl"
      p={6}
      boxShadow="sm"
      border="1px solid"
      borderColor={borderColor}
      position="relative"
      transition="all 0.2s"
    >
      <HStack justify="space-between" mb={4}>
        <HStack>
          <Icon as={icon} boxSize={5} color="blue.500" />
          <Text fontSize="lg" fontWeight="semibold">{title}</Text>
        </HStack>
        <IconButton
          icon={isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
          aria-label={isExpanded ? "Minimize" : "Maximize"}
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        />
      </HStack>
      <Box
        transition="all 0.2s"
        height={isExpanded ? "600px" : "auto"}
        overflow="hidden"
      >
        {children}
      </Box>
    </Box>
  );
};

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardData()
  const [isPending, startTransition] = useTransition()
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // 새로고침 핸들러 메모이제이션
  const handleRefresh = useCallback(() => {
    startTransition(() => {
      refetch()
    })
  }, [refetch])

  if (isLoading) {
    return (
      <Center h="100vh">
        <CircularProgress isIndeterminate color="orange.500" />
      </Center>
    )
  }

  if (error) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Icon as={FiAlertCircle} boxSize={8} color="red.500" />
          <Text>데이터를 불러오는 중 오류가 발생했습니다</Text>
          <Button onClick={handleRefresh} colorScheme="orange">
            다시 시도
          </Button>
        </VStack>
      </Center>
    )
  }

  if (!data) {
    return null
  }

  const { models, experiments, resourceUsage, datasetMetrics } = data

  const stats = {
    totalModels: models.length,
    // trainingModels: models.filter(model => model.status === 'training').length,
    trainingModels: experiments.filter(experiment => experiment.status === 'running').length,  //설험 실행 중인 것 표시시
    deployedModels: models.filter(model => model.servingStatus?.isDeployed).length,
    experiments: experiments.length
  }

  //Gets completed experiments updated this week.
  const experimentsThisWeek = experiments.filter(e => {
    if (e.status !== 'completed') return false;

    const updated = parseISO(
      Array.isArray(e.updatedAt) ? e.updatedAt[0] : e.updatedAt || ''
    );
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

    return isAfter(updated, weekStart) && isBefore(updated, weekEnd);
  });


  //Function to Calculate and compares weekly average accuracy of valid models.
  function getModelAverageAccuracyStats(models: Model[]) {
    const now = new Date();
  
    // Get the start of this week (Monday) and last week
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = subWeeks(thisWeekStart, 1);
    const lastWeekEnd = new Date(thisWeekStart.getTime() - 1); // Sunday of last week
  
    // Filter models that have a valid accuracy (greater than 0)
    const validModels = models.filter(m => m.accuracy > 0);
  
    // Filter models updated this week
    const thisWeekModels = validModels.filter(m => {
      const updated = parseISO(m.updatedAt);
      return isWithinInterval(updated, { start: thisWeekStart, end: now });
    });
  
    // Filter models updated last week
    const lastWeekModels = validModels.filter(m => {
      const updated = parseISO(m.updatedAt);
      return isWithinInterval(updated, { start: lastWeekStart, end: lastWeekEnd });
    });
  
    // Helper to calculate average accuracy
    const avg = (arr: Model[]): number =>
      arr.length > 0
        ? arr.reduce((sum: number, m: Model) => sum + m.accuracy, 0)
        : 0;
  
    const thisWeekAvg = avg(thisWeekModels);
    const lastWeekAvg = avg(lastWeekModels);
  
    const change = thisWeekAvg - lastWeekAvg; // giữ kiểu number
    const isImproved = thisWeekAvg >= lastWeekAvg;
    const changeText = `${Math.abs(change).toFixed(1)}% ${isImproved ? "향상" : "감소"}`; // format sau khi Math.abs
    const color = isImproved ? "green" : "red";
  
    return {
      value: thisWeekAvg.toFixed(1), // Current average accuracy
      change: Math.abs(change),      // Absolute change from last week
      changeText,                    // "Improved" or "Decreased"
      color                          // Color indicator for display
    };
  }
  const model_stats = getModelAverageAccuracyStats(models);




  return (
    <Box as="main" p={4}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Stack spacing={4} w="100%">
          {/* 헤더 */}
          <HStack justify="space-between" align="center" w="100%">

            <HStack spacing={2}>
              <Button
                leftIcon={<Icon as={FiCalendar} />}
                colorScheme="orange"
                variant="ghost"
                size="sm"
              >
                기간 선택
              </Button>
              <Button
                leftIcon={<Icon as={FiRefreshCw} />}
                colorScheme="orange"
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                isLoading={isPending}
              >
                새로고침
              </Button>
              <Menu>
                <MenuButton
                  as={Button}
                  leftIcon={<Icon as={FiSettings} />}
                  colorScheme="orange"
                  variant="ghost"
                  size="sm"
                >
                  설정
                </MenuButton>
                <MenuList>
                  <MenuItem>대시보드 설정</MenuItem>
                  <MenuItem>알림 설정</MenuItem>
                  <MenuItem>데이터 설정</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </HStack>

          {/* 주요 지표 */}
          <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={4} w="100%">
            <StatsCard
              icon={FiDatabase}
              title="총 데이터셋"
              value={datasetMetrics.totalDatasets}
              unit="개"
              // change={12}
              // changeText="증가"
              // color="orange"
              changeText={data.datasetChange.changeText}
              color={data.datasetChange.color}
            />

            <StatsCard
              icon={FiCpu}
              title="학습 중인 모델"
              value={stats.trainingModels}
              unit="개"
              status="실시간"
              color="blue"
            />
            <StatsCard
              icon={FiActivity}
              title="평균 정확도"
              // value={(stats.deployedModels / stats.totalModels * 100).toFixed(1)}
              // unit="%"
              // change={2.4}
              // changeText="향상"
              // color="green"
              value={model_stats.value}
              unit="%"
              change={model_stats.change}
              changeText={model_stats.changeText}
              color={model_stats.color}
            />
            <StatsCard
              icon={FiCheckCircle}
              title="완료된 실험"
              value={experiments.filter(e => e.status === 'completed').length}
              unit="개"
              status={`이번 주 ${experimentsThisWeek.length}개`}
              color="purple"
            />
          </SimpleGrid>

          {/* 리소스 모니터링 */}
          <CollapsibleCard title="리소스 모니터링">
            <ResourceUsageStats />
          </CollapsibleCard>

          {/* 모델 성능 차트 */}
          <CollapsibleCard title="모델 성능 분석">
            <ModelPerformance />
          </CollapsibleCard>

          {/* 데이터셋 분포와 실험 추적 */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={4} w="100%">
            <GridItem>
              <CollapsibleCard title="데이터셋 분포">
                <DatasetDistribution />
              </CollapsibleCard>
            </GridItem>
            <GridItem>
              <CollapsibleCard title="실험 현황">
                <ExperimentTracker />
              </CollapsibleCard>
            </GridItem>
          </Grid>

          {/* 알림 센터 */}
          <CollapsibleCard title="알림 센터">
            <NotificationCenter />
          </CollapsibleCard>
        </Stack>
      </ErrorBoundary>
    </Box>
  )
}

// 최적화된 통계 카드 컴포넌트
interface StatsCardProps {
  icon: IconType;
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeText?: string;
  status?: string;
  color?: string;
}
const StatsCard = memo(({
  icon,
  title,
  value,
  unit,
  change,
  changeText,
  status,
  color
}: StatsCardProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bgColor}
      p={4}
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor={borderColor}
      w="100%"
    >
      <VStack spacing={2} align="start">
        <HStack spacing={2}>
          <Icon as={icon} boxSize={5} color={`${color}.500`} />
          <Text fontSize="sm" color="gray.500">{title}</Text>
        </HStack>
        <Text fontSize="2xl" fontWeight="bold">
          {value}
          <Text as="span" fontSize="sm" color="gray.500" ml={1}>{unit}</Text>
        </Text>
        {/* {(change || status) && (
          <Badge colorScheme={color} variant="subtle" borderRadius="full">
            <HStack spacing={1}>
              {change && <Icon as={FiArrowUpRight} boxSize={3} />}
              <Text>{change ? `${change}% ${changeText}` : status}</Text>
            </HStack>
          </Badge>
        )} */}
        {(changeText || status) && (
          <Badge colorScheme={color} variant="subtle" borderRadius="full">
            <HStack spacing={1}>
              {changeText && <Icon
                                as={changeText.includes("감소") ? FiArrowDownRight : FiArrowUpRight}
                                boxSize={3}
                              />}
              <Text>{changeText ?? status}</Text>
            </HStack>
          </Badge>
        )}
      </VStack>
    </Box>
  )
})

// 최적화된 알림 센터 컴포넌트
const NotificationCenter = memo(() => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor={borderColor}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="semibold">알림 센터</Text>
          <Badge colorScheme="red">2개의 새 알림</Badge>
        </HStack>
        <VStack align="stretch" spacing={3}>
          <NotificationItem
            type="warning"
            title="GPU 사용량 경고"
            description="GPU-01 사용량 90% 초과"
            time="10분 전"
          />
          <NotificationItem
            type="success"
            title="모델 학습 완료"
            description="ResNet50 v2 학습 완료"
            time="23분 전"
          />
        </VStack>
      </VStack>
    </Box>
  )
})

// 최적화된 알림 아이템 컴포넌트
interface NotificationItemProps {
  type: 'success' | 'warning' | 'info' | 'error'; // thêm các loại nếu cần
  title: string;
  description: string;
  time: string;
}
const NotificationItem = memo(({ type, title, description, time }: NotificationItemProps) => {
  const bgColor = useColorModeValue(
    type === 'warning' ? 'orange.50' : 'green.50',
    'gray.700'
  )
  const borderColor = type === 'warning' ? 'orange.500' : 'green.500'

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="lg"
      borderLeft="4px"
      borderLeftColor={borderColor}
    >
      <HStack justify="space-between">
        <VStack align="start" spacing={1}>
          <Text fontWeight="medium">{title}</Text>
          <Text fontSize="sm" color="gray.500">{description}</Text>
        </VStack>
        <Text fontSize="xs" color="gray.500">{time}</Text>
      </HStack>
    </Box>
  )
})

// 컴포넌트 displayName 설정
StatsCard.displayName = 'StatsCard'
NotificationCenter.displayName = 'NotificationCenter'
NotificationItem.displayName = 'NotificationItem'

// 카드 헤더 컴포넌트 추가
interface CardHeaderProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}
const CardHeader = memo(({ title, isOpen, onToggle }: CardHeaderProps) => {
  return (
    <HStack 
      justify="space-between" 
      w="100%" 
      py={2} 
      px={4} 
      borderBottom="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      bg={useColorModeValue('gray.50', 'gray.800')}
      borderTopRadius="xl"
      cursor="pointer"
      onClick={onToggle}
      _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
    >
      <Text fontSize="lg" fontWeight="semibold">{title}</Text>
      <Icon
        as={isOpen ? FiChevronUp : FiChevronDown}
        transition="transform 0.2s"
      />
    </HStack>
  )
})

CardHeader.displayName = 'CardHeader'

// 접을 수 있는 카드 컴포넌트
interface CollapsibleCardProps {
  title: string;
  children: ReactNode;
  defaultIsOpen?: boolean;
}

const CollapsibleCard = memo(({ title, children, defaultIsOpen = true }: CollapsibleCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      w="100%"
      overflow="hidden"
    >
      <CardHeader 
        title={title}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
      <Collapse in={isOpen} animateOpacity>
        <Box p={4}>
          {children}
        </Box>
      </Collapse>
    </Box>
  )
})

CollapsibleCard.displayName = 'CollapsibleCard'
