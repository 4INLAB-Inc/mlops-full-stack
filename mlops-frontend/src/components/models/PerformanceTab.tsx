'use client'

import {
  useColorModeValue,
  Box,
  Card,
  CardBody,
  Stack,
  HStack,
  VStack,
  Text,
  Heading,
  Button,
  Badge,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  useToken,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip as ChakraTooltip,
  useToast,
  Tag,
  TagLabel,
  TagCloseButton,
  Stat,
  StatLabel,
  StatNumber,
  Divider
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import {
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
  FiCheckCircle,
  FiBarChart2,
  FiClock,
  FiZap,
  FiGitCommit,
  FiInfo,
  FiRotateCcw,
  FiDatabase,
  FiTag,
  FiHash,
  FiServer,
} from 'react-icons/fi'
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts'
import axios from 'axios';
interface PerformanceTabProps {
  versions: any[];
  modelId: string;  // Add this line for modelId
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ versions, modelId }) => {
  const sortedVersions = useMemo(() => {
    return [...versions].sort((a, b) => parseFloat(b.version) - parseFloat(a.version));
  }, [versions]);

  // const bestAccuracyVersion = useMemo(() => {
  //   return versions.reduce((best, current) => {
  //     const bestAcc = best.metrics?.accuracy ?? 0;
  //     const currentAcc = current.metrics?.accuracy ?? 0;
  //     return currentAcc > bestAcc ? current : best;
  //   }, versions[0]);
  // }, [versions]);
 
  // //Select the first version
  // const [activeVersion, setActiveVersion] = useState(versions[0]?.version || '');
  // const [selectedVersions, setSelectedVersions] = useState<string[]>([versions[0]?.version || '']);

  //Select the newest version
  const [activeVersion, setActiveVersion] = useState(sortedVersions[0]?.version || '');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([sortedVersions[0]?.version || '']);

  // //Select the best performance (Accurracy) version
  // const [activeVersion, setActiveVersion] = useState(bestAccuracyVersion?.version || '');
  // const [selectedVersions, setSelectedVersions] = useState<string[]>([bestAccuracyVersion?.version || '']);


  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiVersionData, setApiVersionData] = useState<any>(null);
  const toast = useToast();


  // 메모이제이션된 색상 값들
  const colors = useMemo(() => ({
    bg: useColorModeValue('white', 'gray.800'),
    borderColor: useColorModeValue('gray.100', 'gray.700'),
    textColor: useColorModeValue('gray.600', 'gray.400'),
    headingColor: useColorModeValue('gray.700', 'white'),
    chartGridColor: useColorModeValue('gray.100', 'gray.700'),
    cardHoverBg: useColorModeValue('orange.50', 'gray.700')
  }), [])

  // 메모이제이션된 스타일
  const styles = useMemo(() => ({
    card: {
      bg: colors.bg,
      borderWidth: '1px',
      borderColor: colors.borderColor,
      borderRadius: 'lg',
      transition: 'all 0.2s',
      _hover: {
        borderColor: colors.orange,
        transform: 'translateY(-2px)',
        boxShadow: 'lg'
      }
    },
    metricCard: {
      bg: colors.bg,
      borderWidth: '1px',
      borderColor: colors.borderColor,
      borderRadius: 'md',
      p: 4,
      transition: 'all 0.2s',
      cursor: 'pointer',
      _hover: {
        borderColor: colors.orange,
        transform: 'translateY(-2px)',
        boxShadow: 'md'
      }
    },
    button: {
      bg: 'transparent',
      color: colors.orange,
      borderColor: colors.orange,
      _hover: {
        bg: 'orange.50'
      }
    },
    overview: {
      container: {
        borderWidth: '1px',
        borderColor: colors.borderColor,
        borderRadius: 'lg',
        p: 4,
        bg: colors.bg,
        transition: 'all 0.2s',
        _hover: {
          borderColor: colors.orange,
          transform: 'translateY(-2px)',
          boxShadow: 'md'
        }
      },
      heading: {
        color: colors.headingColor,
        fontSize: 'sm',
        fontWeight: 'semibold',
        mb: 3
      },
      value: {
        color: colors.headingColor,
        fontSize: 'lg',
        fontWeight: 'bold'
      },
      label: {
        color: colors.textColor,
        fontSize: 'sm'
      }
    }
  }), [colors])

  // 메모이제이션된 차트 스타일
  const chartStyles = useMemo(() => ({
    tooltip: {
      backgroundColor: colors.bg,
      border: `1px solid ${colors.borderColor}`,
      borderRadius: '12px',
      padding: '16px',
      boxShadow: 'lg',
      fontSize: '13px'
    },
    radar: {
      current: {
        stroke: 'url(#gradientCurrent)',
        fill: 'url(#gradientCurrentFill)',
        fillOpacity: 0.25,
        strokeWidth: 3
      },
      previous: {
        stroke: 'url(#gradientPrevious)',
        fill: 'url(#gradientPreviousFill)',
        fillOpacity: 0.2,
        strokeWidth: 2
      },
      difference: {
        improved: {
          fill: 'url(#gradientImproved)',
          fillOpacity: 0.1,
          stroke: '#48BB78',
          strokeWidth: 1.5,
          strokeDasharray: '3 3'
        },
        degraded: {
          fill: 'url(#gradientDegraded)',
          fillOpacity: 0.1,
          stroke: '#E53E3E',
          strokeWidth: 1.5,
          strokeDasharray: '3 3'
        }
      }
    },
    line: {
      train: {
        stroke: 'url(#gradientCurrent)',
        strokeWidth: 3,
      },
      validation: {
        stroke: 'url(#gradientPrevious)',
        strokeWidth: 2.5,
      }
    },
    grid: {
      stroke: colors.chartGridColor,
      strokeDasharray: '3 3',
      opacity: 0.4
    }
  }), [colors])

  // // 메모이제이션된 목업 데이터
  // const mockVersionData = useMemo(() => ({
  //   currentVersion: {
  //     version: "2.1.0",
  //     status: 'deployed',
  //     metrics: {
  //       accuracy: 0.9856,
  //       precision: 0.9823,
  //       recall: 0.9789,
  //       f1Score: 0.9806,
  //       auc: 0.9912,
  //       latency: 45,
  //       throughput: 120,
  //       truePositives: 4892,
  //       falsePositives: 108,
  //       falseNegatives: 89,
  //       trueNegatives: 4911,
  //       specificity: 0.9784,
  //       mcc: 0.9712,
  //       kappa: 0.9623
  //     },
  //     trainingTime: '185',
  //     epochs: 50,
  //     batchSize: 32,
  //     learningRate: 0.001,
  //     optimizer: 'Adam',
  //     lossFunction: 'CrossEntropy',
  //     trainingHistory: Array.from({ length: 50 }, (_, i) => ({
  //       epoch: i + 1,
  //       trainAccuracy: 0.7 + (0.28 * (1 - Math.exp(-i/20))),
  //       valAccuracy: 0.65 + (0.33 * (1 - Math.exp(-i/18))),
  //       trainLoss: 0.8 * Math.exp(-i/15),
  //       valLoss: 0.9 * Math.exp(-i/14)
  //     })),
  //     resources: {
  //       cpu: 45,
  //       gpu: 78,
  //       memory: 4096,
  //       disk: 2048
  //     }
  //   },
  //   previousVersion: {
  //     version: "2.0.0",
  //     metrics: {
  //       accuracy: 0.9723,
  //       precision: 0.9645,
  //       recall: 0.9689,
  //       f1Score: 0.9667,
  //       auc: 0.9834,
  //       latency: 52,
  //       throughput: 100,
  //       truePositives: 4562,
  //       falsePositives: 165,
  //       falseNegatives: 146,
  //       trueNegatives: 4627,
  //       specificity: 0.9654,
  //       mcc: 0.9445,
  //       kappa: 0.9412
  //     },
  //     trainingTime: '210',
  //     epochs: 45,
  //     batchSize: 32,
  //     learningRate: 0.001,
  //     optimizer: 'Adam',
  //     lossFunction: 'CrossEntropy',
  //     trainingHistory: Array.from({ length: 45 }, (_, i) => ({
  //       epoch: i + 1,
  //       trainAccuracy: 0.65 + (0.31 * (1 - Math.exp(-i/22))),
  //       valAccuracy: 0.6 + (0.36 * (1 - Math.exp(-i/20))),
  //       trainLoss: 0.9 * Math.exp(-i/18),
  //       valLoss: 1.0 * Math.exp(-i/16)
  //     })),
  //     resources: {
  //       cpu: 42,
  //       gpu: 75,
  //       memory: 3840,
  //       disk: 1920
  //     }
  //   }
  // }), [])

  // // 메모이제이션된 버전 데이터
  // const versionData = useMemo(() => ({
  //   currentVersion: mockVersionData.currentVersion,
  //   previousVersion: mockVersionData.previousVersion
  // }), [mockVersionData])

  // 메모이제이션된 차트 데이터
  useEffect(() => {
    const fetchVersionData = async () => {
      try {
        const response = await axios.get(`http://192.168.219.52:8686/api/models/compare/${modelId}`);
        setApiVersionData(response.data);
      } catch (error) {
        console.error('Error fetching version data:', error);
      }
    };
    fetchVersionData();
  }, [modelId]);

  // const versionData = useMemo(() => {
  //   if (!apiVersionData) return { currentVersion: {}, previousVersion: {} }; // Return empty data if still loading
  //   return {
  //     currentVersion: apiVersionData.currentVersion,
  //     previousVersion: apiVersionData.previousVersion,
  //   };
  // }, [apiVersionData]);
  const versionData = useMemo(() => {
    if (!apiVersionData) return { currentVersion: {}, previousVersion: {} };
  
    const allVersions = Object.keys(apiVersionData)
      .filter(key => key.startsWith("version"))
      .sort((a, b) => {
        const verA = parseFloat(apiVersionData[a].version);
        const verB = parseFloat(apiVersionData[b].version);
        return verA - verB;
      });
  
    const currentIndex = allVersions.findIndex(v => apiVersionData[v].version === activeVersion);
    const currentKey = allVersions[currentIndex];
    const previousKey = allVersions[currentIndex - 1];
  
    return {
      currentVersion: apiVersionData[currentKey],
      previousVersion: apiVersionData[previousKey] || {},
    };
  }, [apiVersionData, activeVersion]);
  

  const chartData = useMemo(() => {
    if (!versionData.currentVersion) return []

    return Array.from({ length: 20 }, (_, i) => ({
      epoch: i + 1,
      trainAccuracy: Math.random() * 0.2 + 0.7,
      valAccuracy: Math.random() * 0.15 + 0.65,
      trainLoss: Math.random() * 0.3,
      valLoss: Math.random() * 0.4
    }))
  }, [versionData.currentVersion])

  // 메모이제이션된 성능 메트릭스
  const performanceMetrics = useMemo(() => {
    if (!versionData.currentVersion) return []
    return [
      { name: '정확도', current: 0.95, previous: 0.92 },
      { name: '정밀도', current: 0.94, previous: 0.91 },
      { name: '재현율', current: 0.93, previous: 0.90 },
      { name: 'F1 스코어', current: 0.935, previous: 0.905 }
    ]
  }, [versionData.currentVersion])

  // 메모이제이션된 성능 비교 데이터
  const performanceComparisonData = useMemo(() => {
    if (!versionData.currentVersion?.metrics || !versionData.previousVersion?.metrics) return [];
  
    return [
      { metric: '정확도', 현재: versionData.currentVersion.metrics.accuracy , 이전: versionData.previousVersion?.metrics.accuracy },
      { metric: '정밀도', 현재: versionData.currentVersion.metrics.precision * 100, 이전: versionData.previousVersion?.metrics.precision * 100 },
      { metric: '재현율', 현재: versionData.currentVersion.metrics.recall * 100, 이전: versionData.previousVersion?.metrics.recall * 100 },
      { metric: 'F1 점수', 현재: versionData.currentVersion.metrics.f1Score * 100, 이전: versionData.previousVersion?.metrics.f1Score * 100 },
      { metric: 'AUC', 현재: versionData.currentVersion.metrics.auc * 100, 이전: versionData.previousVersion?.metrics.auc * 100 },
    ]
  }, [versionData.currentVersion, versionData.previousVersion])

  // 메모이제이션된 메트릭스 정의
  const metrics = useMemo(() => [
    { key: 'accuracy', label: '정확도', icon: FiCheckCircle, description: '전체 예측 중 올바르게 예측한 비율입니다. (TP + TN) / (TP + TN + FP + FN)' },
    { key: 'precision', label: '정밀도', icon: FiBarChart2, description: '양성으로 예측한 것 중 실제 양성인 비율입니다. TP / (TP + FP)' },
    { key: 'recall', label: '재현율', icon: FiActivity, description: '실제 양성 중 양성으로 예측한 비율입니다. TP / (TP + FN)' },
    { key: 'f1Score', label: 'F1 점수', icon: FiTrendingUp, description: '정밀도와 재현율의 조화평균입니다. 2 * (정밀도 * 재현율) / (정밀도 + 재현율)' },
    { key: 'auc', label: 'AUC', icon: FiZap, description: 'ROC 곡선 아래 면적으로, 모델의 분류 성능을 나타냅니다. 1에 가까울수록 좋습니다.' },
    { key: 'latency', label: '지연시간', icon: FiClock, description: '모델이 추론 요청에 응답하는 데 걸리는 평균 시간입니다.', format: 'ms' },
    { key: 'throughput', label: '처리량', icon: FiServer, description: '초당 처리할 수 있는 추론 요청의 수입니다.', format: 'rps' }
  ], [])

  const [orange500] = useToken('colors', ['orange.500'])

  const getPerformanceStatus = (current: number, previous: number) => {
    if (!previous) return { icon: FiActivity, color: 'gray' }
    const diff = (current - previous) * 100
    if (diff > 0) return { icon: FiTrendingUp, color: 'green' }
    if (diff < 0) return { icon: FiTrendingDown, color: 'red' }
    return { icon: FiActivity, color: 'gray' }
  }

  // 콜백 함수들
  const handleVersionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveVersion(e.target.value)
  }, [])

  const handleVersionAdd = useCallback((version: string) => {
    setSelectedVersions(prev => [...prev, version])
  }, [])

  const handleVersionRemove = useCallback((version: string) => {
    setSelectedVersions(prev => prev.filter(v => v !== version))
  }, [])

  // 롤백 처리
  const handleRollback = async (version: string) => {
    setIsLoading(true)
    try {
      // TODO: API 호출 구현
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: '롤백 완료',
        description: `버전 ${version}으로 롤백되었습니다.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      setIsRollbackDialogOpen(false)
    } catch (error) {
      toast({
        title: '롤백 실패',
        description: '버전 롤백 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Stack spacing={6}>
      {/* 개요 섹션 */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Box {...styles.overview.container}>
          <Text {...styles.overview.heading}>학습 데이터</Text>
          <SimpleGrid columns={2} spacing={4}>
            <VStack align="start" spacing={1}>
              <Text {...styles.overview.label}>전체 샘플</Text>
              <Text {...styles.overview.value}>
                {versionData.currentVersion?.trainingData?.totalSamples?.toLocaleString() || 0}
              </Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text {...styles.overview.label}>클래스 수</Text>
              <Text {...styles.overview.value}>
                {versionData.currentVersion?.trainingData?.numClasses || 0}
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>

        <Box {...styles.overview.container}>
          <Text {...styles.overview.heading}>학습 시간</Text>
          <SimpleGrid columns={2} spacing={4}>
            <VStack align="start" spacing={1}>
              <Text {...styles.overview.label}>총 시간</Text>
              <Text {...styles.overview.value}>
                {versionData.currentVersion?.trainingTime || 0}
              </Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text {...styles.overview.label}>에포크</Text>
              <Text {...styles.overview.value}>
                {versionData.currentVersion?.epochs || 0}
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>

        <Box {...styles.overview.container}>
          <Text {...styles.overview.heading}>리소스 사용</Text>
          <SimpleGrid columns={2} spacing={4}>
            <VStack align="start" spacing={1}>
              <Text {...styles.overview.label}>GPU</Text>
              <Text {...styles.overview.value}>
                {versionData.currentVersion?.resources?.gpu || 0}%
              </Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text {...styles.overview.label}>메모리</Text>
              <Text {...styles.overview.value}>
                {(versionData.currentVersion?.resources?.memory / 1024).toFixed(1) || 0}GB
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>
      </SimpleGrid>

      {/* 버전 선택 및 성능 지표 */}
      <Card {...styles.card}>
        <CardBody p={6}>
          <Stack spacing={6}>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="medium" color={colors.textColor}>현재 버전</Text>
                <HStack spacing={3}>
                  <Heading size="lg" color={colors.headingColor}>v{activeVersion}</Heading>
                  <Badge colorScheme="orange" fontSize="md" px={3} py={1} borderRadius="full">
                    {versionData.currentVersion?.status === 'deployed' ? '배포됨' : '준비됨'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="orange"
                    leftIcon={<Icon as={FiRotateCcw} />}
                    onClick={() => setIsRollbackDialogOpen(true)}
                    isDisabled={!versionData.previousVersion}
                  >
                    롤백
                  </Button>
                </HStack>
              </VStack>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  variant="outline"
                  {...styles.button}
                  size="md"
                  px={4}
                >
                  버전 선택
                </MenuButton>
                <MenuList>
                  {/* {versions.map(v => ( */}
                  {sortedVersions.map(v => (
                    <MenuItem
                      key={v.version}
                      onClick={() => setActiveVersion(v.version)}
                      color={v.version === activeVersion ? colors.orange : colors.textColor}
                      fontWeight={v.version === activeVersion ? 'bold' : 'normal'}
                      px={4}
                      py={2}
                    >
                      <HStack spacing={2}>
                        <Icon as={FiGitCommit} />
                        <Text>v{v.version}</Text>
                        {v.version === activeVersion && (
                          <Badge colorScheme="orange" variant="subtle" ml={2}>
                            현재
                          </Badge>
                        )}
                      </HStack>
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </HStack>

            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              {metrics.map(metric => {
                const current = versionData.currentVersion?.metrics?.[metric.key] || 0;
                const previous = versionData.previousVersion?.metrics?.[metric.key] || 0;
                const diff = current - previous
                const diffPercentage = previous ? (diff / previous) * 100 : 0

                return (
                  <Card 
                    key={metric.key} 
                    variant="outline"
                    {...styles.metricCard}
                  >
                    <CardBody>
                      <VStack spacing={3} align="start">
                        <HStack spacing={2}>
                          <Icon as={metric.icon} color={colors.orange} boxSize={5} />
                          <ChakraTooltip 
                            label={
                              <VStack spacing={2} p={2}>
                                <Text fontWeight="bold">{metric.label}</Text>
                                <Text>{metric.description}</Text>
                              </VStack>
                            }
                            placement="top"
                            hasArrow
                          >
                            <Text fontSize="sm" color={colors.textColor}>{metric.label}</Text>
                          </ChakraTooltip>
                        </HStack>
                        <Heading size="md" color={colors.headingColor}>
                          {metric.format === 'ms' 
                            ? `${current}ms`
                            : metric.format === 'rps'
                              ? `${current}/s`
                              : `${(current).toFixed(1)}%`
                          }
                        </Heading>
                        {previous > 0 && (
                          <Badge
                            colorScheme={
                              metric.format === 'ms'
                                ? diff < 0 ? 'green' : 'red'
                                : diff > 0 ? 'green' : 'red'
                            }
                            variant="subtle"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            <HStack spacing={1}>
                              <Icon 
                                as={
                                  metric.format === 'ms'
                                    ? diff < 0 ? FiTrendingUp : FiTrendingDown
                                    : diff > 0 ? FiTrendingUp : FiTrendingDown
                                }
                                fontSize="xs"
                              />
                              <Text>{Math.abs(diffPercentage).toFixed(1)}%</Text>
                            </HStack>
                          </Badge>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                )
              })}
            </SimpleGrid>
          </Stack>
        </CardBody>
      </Card>

      {/* 성능 비교 차트 */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Card {...styles.card}>
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="semibold" color={colors.headingColor}>
                    성능 메트릭스 비교
                  </Text>
                  <Text fontSize="xs" color={colors.textColor}>
                    녹색 영역은 개선된 부분, 빨간색 영역은 성능이 저하된 부분을 나타냅니다.
                  </Text>
                </VStack>
                <HStack spacing={4}>
                  <HStack>
                    <Box w="3" h="3" bgGradient="linear(to-r, orange.400, orange.500)" borderRadius="full" />
                    <Text fontSize="sm" color={colors.textColor}>현재</Text>
                  </HStack>
                  <HStack>
                    <Box w="3" h="3" bgGradient="linear(to-r, gray.400, gray.500)" borderRadius="full" />
                    <Text fontSize="sm" color={colors.textColor}>이전</Text>
                  </HStack>
                </HStack>
              </HStack>
              <Box h="350px" p={2}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={performanceComparisonData}>
                    <defs>
                      <linearGradient id="gradientCurrent" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ED8936" />
                        <stop offset="100%" stopColor="#DD6B20" />
                      </linearGradient>
                      <linearGradient id="gradientCurrentFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ED8936" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#DD6B20" stopOpacity="0.1" />
                      </linearGradient>
                      <linearGradient id="gradientPrevious" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#718096" />
                        <stop offset="100%" stopColor="#4A5568" />
                      </linearGradient>
                      <linearGradient id="gradientPreviousFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#718096" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#4A5568" stopOpacity="0.1" />
                      </linearGradient>
                      <linearGradient id="gradientImproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#48BB78" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#48BB78" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="gradientDegraded" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E53E3E" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#E53E3E" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <PolarGrid stroke={chartStyles.grid.stroke} strokeDasharray={chartStyles.grid.strokeDasharray} opacity={chartStyles.grid.opacity} />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      tick={{ 
                        fill: colors.headingColor, 
                        fontSize: 13,
                        fontWeight: 'bold',
                        dy: 4
                      }}
                      stroke={colors.chartGridColor}
                      opacity={0.6}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ 
                        fill: colors.textColor, 
                        fontSize: 12,
                        dx: 4
                      }}
                      stroke={colors.chartGridColor}
                      opacity={0.6}
                      tickFormatter={(value) => `${value}%`}
                    />
                    {/* 성능 차이 영역 표시 */}
                    {performanceComparisonData.map((entry, index) => {
                      const diff = entry.현재 - entry.이전;
                      if (Math.abs(diff) > 0) {
                        return (
                          <Radar
                            key={`diff-${index}`}
                            name="차이"
                            dataKey="현재"
                            data={[entry]}
                            {...(diff > 0 ? chartStyles.radar.difference.improved : chartStyles.radar.difference.degraded)}
                          />
                        );
                      }
                      return null;
                    })}
                    <Radar
                      name="이전"
                      dataKey="이전"
                      {...chartStyles.radar.previous}
                    />
                    <Radar
                      name="현재"
                      dataKey="현재"
                      {...chartStyles.radar.current}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const diff = data.현재 - data.이전;
                          const diffPercentage = ((diff / data.이전) * 100).toFixed(1);
                          const isImproved = diff > 0;

                          return (
                            <Box
                              bg={colors.bg}
                              p={4}
                              borderWidth="1px"
                              borderColor={colors.borderColor}
                              borderRadius="xl"
                              boxShadow="xl"
                            >
                              <VStack align="start" spacing={3}>
                                <Text fontSize="lg" fontWeight="bold">{data.metric}</Text>
                                <Divider />
                                <SimpleGrid columns={2} spacing={4}>
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="sm" color={colors.textColor}>현재</Text>
                                    <Text fontSize="lg" fontWeight="bold" color={colors.headingColor}>
                                      {data.현재.toFixed(1)}%
                                    </Text>
                                  </VStack>
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="sm" color={colors.textColor}>이전</Text>
                                    <Text fontSize="lg" fontWeight="bold" color={colors.headingColor}>
                                      {data.이전.toFixed(1)}%
                                    </Text>
                                  </VStack>
                                </SimpleGrid>
                                <Badge
                                  colorScheme={isImproved ? 'green' : 'red'}
                                  variant="subtle"
                                  px={3}
                                  py={1}
                                  borderRadius="full"
                                  fontSize="sm"
                                >
                                  <HStack spacing={1}>
                                    <Icon as={isImproved ? FiTrendingUp : FiTrendingDown} />
                                    <Text>
                                      {isImproved ? '개선' : '저하'}: {Math.abs(diff).toFixed(1)}%
                                      ({isImproved ? '+' : ''}{diffPercentage}%)
                                    </Text>
                                  </HStack>
                                </Badge>
                              </VStack>
                            </Box>
                          );
                        }
                        return null;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Card {...styles.card}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="semibold" color={colors.headingColor}>
                  학습 히스토리
                </Text>
                <HStack spacing={4}>
                  <HStack>
                    <Box w="3" h="3" bg={useToken("colors", ["orange.500"])[0]} borderRadius="full" />
                    <Text fontSize="sm" color={colors.textColor}>학습</Text>
                  </HStack>
                  <HStack>
                    <Box w="3" h="3" bg={colors.borderColor} borderRadius="full" />
                    <Text fontSize="sm" color={colors.textColor}>검증</Text>
                  </HStack>
                </HStack>
              </HStack>
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={versionData.currentVersion?.trainingHistory || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.grid.stroke} />
                    <XAxis
                      dataKey="epoch"
                      tick={{ fill: colors.headingColor, fontSize: 12 }}
                      stroke={chartStyles.grid.stroke}
                      label={{ 
                        value: '에포크', 
                        position: 'insideBottom', 
                        offset: -5,
                        fill: colors.headingColor,
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}
                    />
                    <YAxis
                      tick={{ fill: colors.headingColor, fontSize: 12 }}
                      stroke={chartStyles.grid.stroke}
                      domain={[0, 1]}
                      tickFormatter={(value) => `${(value).toFixed(0)}%`}
                      label={{
                        value: '정확도',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 10,
                        fill: colors.headingColor,
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}
                    />
                    <Tooltip 
                      contentStyle={chartStyles.tooltip}
                      formatter={(value) => `${(Number(value)).toFixed(1)}%`}
                    />
                    <Line
                      type="monotone"
                      dataKey="trainAccuracy"
                      name="학습 정확도"
                      {...chartStyles.line.train}
                      dot={false}
                      activeDot={{ r: 4, fill: colors.orange }}
                    />
                    <Line
                      type="monotone"
                      dataKey="valAccuracy"
                      name="검증 정확도"
                      {...chartStyles.line.validation}
                      dot={false}
                      activeDot={{ r: 4, fill: colors.borderColor }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* 버전 비교 섹션 */}
      <Card {...styles.card}>
        <CardBody>
          <Stack spacing={6}>
            <HStack justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="semibold" color={colors.headingColor}>
                버전 비교
              </Text>
              <HStack spacing={2}>
                {selectedVersions.map((version) => (
                  <Tag
                    key={version}
                    size="md"
                    borderRadius="full"
                    variant="subtle"
                    colorScheme={version === activeVersion ? 'orange' : 'gray'}
                  >
                    <TagLabel>v{version}</TagLabel>
                    <TagCloseButton
                      onClick={() => handleVersionRemove(version)}
                    />
                  </Tag>
                ))}
              </HStack>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {versions
                .filter(v => !selectedVersions.includes(v.version))
                .map(version => (
                  <Card
                    key={version.version}
                    variant="outline"
                    borderColor={colors.borderColor}
                    {...styles.metricCard}
                    onClick={() => handleVersionAdd(version.version)}
                  >
                    <CardBody>
                      <VStack spacing={4} align="start">
                        <HStack justify="space-between" w="100%">
                          <HStack spacing={2}>
                            <Badge
                              colorScheme={version.version === activeVersion ? 'orange' : 'gray'}
                              px={2}
                              py={1}
                              borderRadius="full"
                            >
                              v{version.version}
                            </Badge>
                            {version.version === activeVersion && (
                              <Badge colorScheme="green" variant="subtle">
                                현재
                              </Badge>
                            )}
                          </HStack>
                          <Icon 
                            as={FiGitCommit} 
                            color={colors.orange}
                            opacity={0.5}
                          />
                        </HStack>

                        <SimpleGrid columns={2} spacing={4} w="100%">
                          <Stat size="sm">
                            <StatLabel color={colors.textColor}>정확도</StatLabel>
                            <StatNumber fontSize="md">
                              {(version.metrics.accuracy).toFixed(1)}%
                            </StatNumber>
                          </Stat>
                          <Stat size="sm">
                            <StatLabel color={colors.textColor}>F1 점수</StatLabel>
                            <StatNumber fontSize="md">
                              {(version.metrics.f1Score * 100).toFixed(1)}%
                            </StatNumber>
                          </Stat>
                        </SimpleGrid>

                        <HStack spacing={4} color={colors.textColor} fontSize="sm" w="100%">
                          <HStack>
                            <Icon as={FiClock} />
                            <Text>{new Date(version.createdAt).toLocaleDateString()}</Text>
                          </HStack>
                          <HStack>
                            <Icon as={FiZap} />
                            <Text>{version.metrics.latency}ms</Text>
                          </HStack>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
            </SimpleGrid>
          </Stack>
        </CardBody>
      </Card>

      {/* 상세 성능 분석 */}
      <Card {...styles.card}>
        <CardBody>
          <Stack spacing={6}>
            <Text fontSize="sm" fontWeight="semibold" color={colors.headingColor}>
              상세 성능 분석
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* 혼동 행렬 */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={4} color={colors.headingColor}>
                  혼동 행렬
                </Text>
                <SimpleGrid columns={2} spacing={4}>
                {[
                  { label: '진양성 (TP)', value: versionData.currentVersion?.metrics?.truePositives || 0, prevValue: versionData.previousVersion?.metrics?.truePositives || 0 },
                  { label: '위양성 (FP)', value: versionData.currentVersion?.metrics?.falsePositives || 0, prevValue: versionData.previousVersion?.metrics?.falsePositives || 0 },
                  { label: '위음성 (FN)', value: versionData.currentVersion?.metrics?.falseNegatives || 0, prevValue: versionData.previousVersion?.metrics?.falseNegatives || 0 },
                  { label: '진음성 (TN)', value: versionData.currentVersion?.metrics?.trueNegatives || 0, prevValue: versionData.previousVersion?.metrics?.trueNegatives || 0 }
                ].map(item => {
                    const diff = item.value - item.prevValue;
                    const diffPercentage = (diff / item.prevValue) * 100;
                    return (
                      <Box
                        key={item.label}
                        p={4}
                        {...styles.metricCard}
                      >
                        <VStack spacing={2} align="start">
                          <Text fontSize="sm" color={colors.textColor}>{item.label}</Text>
                          <HStack spacing={2} align="baseline">
                            <Text fontSize="xl" fontWeight="bold" color={colors.headingColor}>
                              {item.value.toLocaleString()}
                            </Text>
                            {Math.abs(diffPercentage) > 0 && (
                              <Badge
                                colorScheme={diffPercentage > 0 ? 'green' : 'red'}
                                variant="subtle"
                                fontSize="xs"
                              >
                                <HStack spacing={1}>
                                  <Icon 
                                    as={diffPercentage > 0 ? FiTrendingUp : FiTrendingDown}
                                    fontSize="xs"
                                  />
                                  <Text>{Math.abs(diffPercentage).toFixed(1)}%</Text>
                                </HStack>
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>

              {/* 추가 메트릭스 */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={4} color={colors.headingColor}>
                  추가 메트릭스
                </Text>
                <Stack spacing={4}>
                  {[
                    { 
                      label: '특이도', 
                      value: versionData.currentVersion?.metrics?.specificity || 0, 
                      prevValue: versionData.previousVersion?.metrics?.specificity || 0, 
                      description: '실제 음성 중 음성으로 예측한 비율입니다. TN / (TN + FP)',
                      formula: 'TN / (TN + FP)',
                      example: '예: 실제 정상인 1000개의 샘플 중 950개를 정상으로 올바르게 분류한 경우 특이도는 95%입니다.'
                    },
                    { 
                      label: 'MCC', 
                      value: versionData.currentVersion?.metrics?.mcc || 0, 
                      prevValue: versionData.previousVersion?.metrics?.mcc || 0, 
                      description: 'Matthews 상관 계수로, -1에서 1 사이의 값을 가지며 1에 가까울수록 좋은 성능을 나타냅니다.',
                      formula: '(TP × TN - FP × FN) / √((TP + FP)(TP + FN)(TN + FP)(TN + FN))',
                      example: '예: MCC가 0.8이면 모델이 양성과 음성 클래스를 모두 잘 분류하고 있음을 의미합니다.'
                    },
                    { 
                      label: 'Kappa', 
                      value: versionData.currentVersion?.metrics?.kappa || 0, 
                      prevValue: versionData.previousVersion?.metrics?.kappa || 0, 
                      description: 'Cohen의 Kappa 계수로, 우연에 의한 정확도를 고려한 지표입니다. -1에서 1 사이의 값을 가집니다.',
                      formula: '(관찰된 일치도 - 기대되는 일치도) / (1 - 기대되는 일치도)',
                      example: '예: Kappa가 0.7이면 우연의 일치를 제외하고도 상당히 좋은 성능을 보이고 있음을 의미합니다.'
                    },
                  ].map(item => {
                    const diff = item.value - item.prevValue;
                    const diffPercentage = (diff / item.prevValue) * 100;
                    return (
                      <Box
                        key={item.label}
                        p={4}
                        {...styles.metricCard}
                      >
                        <VStack align="start" spacing={3}>
                          <HStack justify="space-between" w="100%">
                            <HStack>
                              <Text fontSize="sm" color={colors.textColor}>{item.label}</Text>
                              <ChakraTooltip 
                                label={
                                  <VStack spacing={2} p={2}>
                                    <Text fontWeight="bold">{item.label}</Text>
                                    <Text>{item.description}</Text>
                                    <Text fontWeight="bold">계산식:</Text>
                                    <Text>{item.formula}</Text>
                                    <Text fontWeight="bold">예시:</Text>
                                    <Text>{item.example}</Text>
                                  </VStack>
                                } 
                                hasArrow
                                placement="top"
                              >
                                <Icon as={FiInfo} color={colors.textColor} cursor="help" />
                              </ChakraTooltip>
                            </HStack>
                            {Math.abs(diffPercentage) > 0 && (
                              <Badge
                                colorScheme={diffPercentage > 0 ? 'green' : 'red'}
                                variant="subtle"
                                fontSize="xs"
                              >
                                <HStack spacing={1}>
                                  <Icon 
                                    as={diffPercentage > 0 ? FiTrendingUp : FiTrendingDown}
                                    fontSize="xs"
                                  />
                                  <Text>{Math.abs(diffPercentage).toFixed(1)}%</Text>
                                </HStack>
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="xl" fontWeight="bold" color={colors.headingColor}>
                            {(item.value * 100).toFixed(1)}%
                          </Text>
                          <Text fontSize="xs" color={colors.textColor}>
                            {item.description}
                          </Text>
                        </VStack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </SimpleGrid>
          </Stack>
        </CardBody>
      </Card>

      {/* 성능 상세 정보 */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Card {...styles.card}>
          <CardBody>
            <Stack spacing={6}>
              <Text fontSize="sm" fontWeight="semibold" color={colors.headingColor}>
                학습 세부 정보
              </Text>
              <SimpleGrid columns={2} spacing={4}>
                {[
                  { label: '학습 시간', value: versionData.currentVersion?.trainingTime || '0', prevValue: versionData.previousVersion?.trainingTime || '0', unit: '' },
                  { label: '에포크 수', value: versionData.currentVersion?.epochs || 0, prevValue: versionData.previousVersion?.epochs || 0 },
                  { label: '배치 크기', value: versionData.currentVersion?.batchSize || 0, prevValue: versionData.previousVersion?.batchSize || 0 },
                  { label: '학습률', value: versionData.currentVersion?.learningRate || 0, prevValue: versionData.previousVersion?.learningRate || 0 },
                  { label: '옵티마이저', value: versionData.currentVersion?.optimizer || '-', prevValue: versionData.previousVersion?.optimizer || '-' },
                  { label: '손실 함수', value: versionData.currentVersion?.lossFunction || '-', prevValue: versionData.previousVersion?.lossFunction || '-' },
                ].map(item => {
                  const isNumeric = typeof item.value === 'number';
                  const diff = isNumeric ? (item.value as number) - (item.prevValue as number) : 0;
                  const diffPercentage = isNumeric && item.prevValue ? (diff / (item.prevValue as number)) * 100 : 0;
                  
                  return (
                    <Box
                      key={item.label}
                      p={4}
                      {...styles.metricCard}
                    >
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color={colors.textColor}>{item.label}</Text>
                        <HStack spacing={2} align="baseline">
                          <Text fontSize="xl" fontWeight="bold" color={colors.headingColor}>
                            {item.unit ? `${item.value}${item.unit}` : item.value}
                          </Text>
                          {isNumeric && Math.abs(diffPercentage) > 0 && (
                            <Badge
                              colorScheme={diffPercentage > 0 ? 'green' : 'red'}
                              variant="subtle"
                              fontSize="xs"
                            >
                              <HStack spacing={1}>
                                <Icon 
                                  as={diffPercentage > 0 ? FiTrendingUp : FiTrendingDown}
                                  fontSize="xs"
                                />
                                <Text>{Math.abs(diffPercentage).toFixed(1)}%</Text>
                              </HStack>
                            </Badge>
                          )}
                        </HStack>
                      </VStack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </CardBody>
        </Card>

        <Card {...styles.card}>
          <CardBody>
            <Stack spacing={6}>
              <Text fontSize="sm" fontWeight="semibold" color={colors.headingColor}>
                리소스 사용량
              </Text>
              <SimpleGrid columns={2} spacing={4}>
                {[
                  { label: 'CPU 사용량', value: versionData.currentVersion?.resources?.cpu || 0, prevValue: versionData.previousVersion?.resources?.cpu || 0, unit: '%' },
                  { label: 'GPU 사용량', value: versionData.currentVersion?.resources?.gpu || 0, prevValue: versionData.previousVersion?.resources?.gpu || 0, unit: '%' },
                  { label: '메모리 사용량', value: versionData.currentVersion?.resources?.memory || 0, prevValue: versionData.previousVersion?.resources?.memory || 0, unit: 'MB' },
                  { label: '디스크 사용량', value: versionData.currentVersion?.resources?.disk || 0, prevValue: versionData.previousVersion?.resources?.disk || 0, unit: 'MB' },
                ].map(item => {
                  const diff = item.value - item.prevValue;
                  const diffPercentage = (diff / item.prevValue) * 100;
                  const formattedValue = item.unit === 'MB' ? `${(item.value / 1024).toFixed(1)}GB` : `${item.value}${item.unit}`;
                  
                  return (
                    <Box
                      key={item.label}
                      p={4}
                      {...styles.metricCard}
                    >
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color={colors.textColor}>{item.label}</Text>
                        <HStack spacing={2} align="baseline">
                          <Text fontSize="xl" fontWeight="bold" color={colors.headingColor}>
                            {formattedValue}
                          </Text>
                          {Math.abs(diffPercentage) > 0 && (
                            <Badge
                              colorScheme={diffPercentage > 0 ? 'red' : 'green'}
                              variant="subtle"
                              fontSize="xs"
                            >
                              <HStack spacing={1}>
                                <Icon 
                                  as={diffPercentage > 0 ? FiTrendingUp : FiTrendingDown}
                                  fontSize="xs"
                                />
                                <Text>{Math.abs(diffPercentage).toFixed(1)}%</Text>
                              </HStack>
                            </Badge>
                          )}
                        </HStack>
                      </VStack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* 롤백 확인 다이얼로그 */}
      <AlertDialog
        isOpen={isRollbackDialogOpen}
        leastDestructiveRef={null}
        onClose={() => setIsRollbackDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={colors.bg}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color={colors.headingColor}>
              버전 롤백
            </AlertDialogHeader>

            <AlertDialogBody color={colors.textColor}>
              버전 {activeVersion}으로 롤백하시겠습니까? 이 작업은 현재 버전의 모든 변경사항을 되돌립니다.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={() => setIsRollbackDialogOpen(false)}>
                취소
              </Button>
              <Button 
                colorScheme="orange" 
                onClick={() => handleRollback(activeVersion)} 
                ml={3}
                isLoading={isLoading}
              >
                롤백
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Stack>
  )
}

export default PerformanceTab;
