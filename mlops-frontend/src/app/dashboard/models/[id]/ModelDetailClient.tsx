'use client'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Image,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  Badge,
  Divider,
  Progress,
  VStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Wrap,
} from '@chakra-ui/react'
import {
  FiCpu,
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiDatabase,
  FiPackage,
  FiGitBranch,
  FiCheckCircle,
  FiAlertCircle,
  FiRotateCcw,
  FiBarChart2,
  FiHash,
} from 'react-icons/fi'
import React, { useState, useEffect } from 'react'
import { ModelDeployment } from '@/components/models/ModelDeployment'
import { ModelComparison } from '@/components/models/ModelComparison'
import PerformanceTab from '@/components/models/PerformanceTab'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ModelDetailClientProps {
  modelId: string
}

export default function ModelDetailClient({ modelId }: ModelDetailClientProps) {
  const [modelData, setModelData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])

  const bgCard = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const brandColor = '#EB6100'


  useEffect(() => {
    const fetchModelDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/models/detailed/${modelId}`)
        const data = await response.json()
        setModelData(data) 
      } catch (error) {
        console.error('Error fetching model details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchModelDetails()
  }, [modelId]) 

  if (loading) {
    return <Text>Loading...</Text>  
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case '배포됨':
      case '정상':
      case '충족':
        return 'green'
      case '훈련중':
        return 'blue'
      case '실패':
      case '경고':
        return 'red'
      case '아카이브됨':
        return 'gray'
      default:
        return 'gray'
    }
  }

  const getMetricColor = (value: number) => {
    if (value >= 0.95) return 'green'
    if (value >= 0.9) return 'blue'
    if (value >= 0.8) return 'yellow'
    return 'red'
  }

  const formatMetric = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }


  const performanceMetricsData = [
    {
      metric: '정확도',
      현재: modelData.metrics.accuracy,
      이전: modelData.previousMetrics.accuracy,
    },
    {
      metric: '정밀도',
      현재: modelData.metrics.precision,
      이전: modelData.previousMetrics.precision,
    },
    {
      metric: '재현율',
      현재: modelData.metrics.recall,
      이전: modelData.previousMetrics.recall,
    },
    {
      metric: 'F1 점수',
      현재: modelData.metrics.f1Score,
      이전: modelData.previousMetrics.f1Score,
    },
    {
      metric: 'AUC',
      현재: modelData.metrics.auc,
      이전: modelData.previousMetrics.auc,
    },
  ]

  const currentVersion = modelData.versions.find((v: any) => v.version === modelData.version)
  const trainingHistoryData = currentVersion?.trainingHistory || []

  return (
    <Box p={4}>
      <Grid templateColumns="repeat(12, 1fr)" gap={4}>
        {/* 모델 개요 카드 */}
        <GridItem colSpan={12}>
          <Card bg={bgCard} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                <GridItem colSpan={2}>
                  <Image
                    src={modelData.thumbnail || 'https://via.placeholder.com/150'}
                    alt={modelData.name}
                    borderRadius="lg"
                    fallbackSrc="https://via.placeholder.com/150"
                  />
                </GridItem>
                <GridItem colSpan={7}>
                  <Stack spacing={2}>
                    <HStack>
                      <Text fontSize="2xl" fontWeight="bold">
                        {modelData.name}
                      </Text>
                      <Badge colorScheme={getStatusColor(modelData.status)}>
                        {modelData.status}
                      </Badge>
                    </HStack>
                    <Text color="gray.500">{modelData.description}</Text>
                    <HStack spacing={4}>
                      <HStack>
                        <Icon as={FiPackage} />
                        <Text>{modelData.framework}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiGitBranch} />
                        <Text>v{modelData.version}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiDatabase} />
                        <Text>{modelData.dataset.name}</Text>
                      </HStack>
                    </HStack>
                  </Stack>
                </GridItem>
                <GridItem colSpan={3}>
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <Text fontSize="sm" color="gray.500">서빙 상태</Text>
                      <HStack mt={1}>
                        <Icon
                          as={modelData.servingStatus.health === '정상' ? FiCheckCircle : FiAlertCircle}
                          color={modelData.servingStatus.health === '정상' ? 'green.500' : 'orange.500'}
                        />
                        <Text>{modelData.servingStatus.health}</Text>
                      </HStack>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">성능</Text>
                      <HStack mt={1}>
                        <Icon as={FiActivity} />
                        <Text>지연시간 {modelData.servingStatus.latency}</Text>
                      </HStack>
                    </Box>
                  </VStack>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>
        </GridItem>

        {/* 탭 섹션 */}
        <GridItem colSpan={12}>
          <Tabs variant="enclosed">
            <TabList>
              <Tab>개요</Tab>
              <Tab>배포</Tab>
              <Tab>성능</Tab>
              <Tab>버전</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Grid templateColumns="repeat(12, 1fr)" gap={4}>
                  {/* 성능 메트릭스 */}
                  <GridItem colSpan={8}>
                    <Card bg={bgCard}>
                      <CardBody>
                        <Text fontSize="lg" fontWeight="bold" mb={4}>성능 메트릭스</Text>
                        <Box height="300px" mb={6}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={performanceMetricsData}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="metric" />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} />
                              <Radar
                                name="현재 버전"
                                dataKey="현재"
                                stroke={brandColor}
                                fill={brandColor}
                                fillOpacity={0.3}
                              />
                              <Radar
                                name="이전 버전"
                                dataKey="이전"
                                stroke="#777777"
                                fill="#777777"
                                fillOpacity={0.3}
                              />
                              <Legend />
                            </RadarChart>
                          </ResponsiveContainer>
                        </Box>
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          {Object.entries(modelData.metrics)
                            .filter(([key]) => key !== 'confusionMatrix')
                            .map(([key, value]) => (
                              <GridItem key={key}>
                                <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                                  <HStack justify="space-between" align="center">
                                    <Text fontWeight="medium" color="gray.500" textTransform="capitalize">
                                      {key === 'accuracy' ? '정확도' :
                                       key === 'precision' ? '정밀도' :
                                       key === 'recall' ? '재현율' :
                                       key === 'f1Score' ? 'F1 점수' :
                                       key === 'auc' ? 'AUC' : key}
                                    </Text>
                                    <HStack spacing={2}>
                                      <Text fontWeight="bold">
                                        {typeof value === 'number' ? value.toFixed(3) : value}
                                      </Text>
                                      {modelData.previousMetrics && modelData.previousMetrics[key] && (
                                        <Badge
                                          colorScheme={value > modelData.previousMetrics[key] ? 'green' : 'red'}
                                          fontSize="xs"
                                          display="flex"
                                          alignItems="center"
                                        >
                                          <Icon
                                            as={value > modelData.previousMetrics[key] ? FiTrendingUp : FiTrendingDown}
                                            mr={1}
                                          />
                                          {(
                                            ((value - modelData.previousMetrics[key]) /
                                              modelData.previousMetrics[key]) *
                                            100
                                          ).toFixed(1)}
                                          %
                                        </Badge>
                                      )}
                                    </HStack>
                                  </HStack>
                                </Box>
                              </GridItem>
                            ))}
                        </Grid>
                      </CardBody>
                    </Card>
                  </GridItem>

                  {/* 리소스 상태 */}
                  <GridItem colSpan={4}>
                    <Card bg={bgCard}>
                      <CardBody>
                        <Text fontSize="lg" fontWeight="bold" mb={4}>리소스 상태</Text>
                        <Stack spacing={4}>
                          <Box>
                            <HStack justify="space-between" mb={2}>
                              <Text>CPU 사용량</Text>
                              <Badge
                                colorScheme={modelData.servingStatus.requirements.cpu === '충족' ? 'green' : 'orange'}
                              >
                                {modelData.servingStatus.requirements.cpu}
                              </Badge>
                            </HStack>
                            <Progress
                              value={75}
                              colorScheme={modelData.servingStatus.requirements.cpu === '충족' ? 'green' : 'orange'}
                            />
                          </Box>
                          <Box>
                            <HStack justify="space-between" mb={2}>
                              <Text>메모리 사용량</Text>
                              <Badge
                                colorScheme={modelData.servingStatus.requirements.memory === '충족' ? 'green' : 'orange'}
                              >
                                {modelData.servingStatus.requirements.memory}
                              </Badge>
                            </HStack>
                            <Progress
                              value={60}
                              colorScheme={modelData.servingStatus.requirements.memory === '충족' ? 'green' : 'orange'}
                            />
                          </Box>
                          <Box>
                            <HStack justify="space-between" mb={2}>
                              <Text>GPU 사용량</Text>
                              <Badge
                                colorScheme={modelData.servingStatus.requirements.gpu === '충족' ? 'green' : 'orange'}
                              >
                                {modelData.servingStatus.requirements.gpu}
                              </Badge>
                            </HStack>
                            <Progress
                              value={90}
                              colorScheme={modelData.servingStatus.requirements.gpu === '충족' ? 'green' : 'orange'}
                            />
                          </Box>
                        </Stack>
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>
              </TabPanel>

              <TabPanel>
              {modelData && modelData.id && (
                <ModelDeployment
                  model={{
                    id: modelData.id,
                    name: modelData.name,
                    currentVersion: modelData.version,
                    versions: modelData.versions.map((v: any) => v.version),
                  }}
                />
              )}
                            </TabPanel>

              <TabPanel>
                <PerformanceTab
                  versions={modelData.versions}
                  selectedVersions={selectedVersions}
                  setSelectedVersions={setSelectedVersions}
                />
              </TabPanel>

              <TabPanel>
                <Card bg={bgCard}>
                  <CardBody>
                    <Stack spacing={6}>
                      {modelData.versions.map((version: any, index: number) => (
                        <Box
                          key={version.version}
                          p={6}
                          borderWidth="1px"
                          borderRadius="lg"
                          borderColor={borderColor}
                          transition="all 0.2s"
                          _hover={{
                            borderColor: brandColor,
                            transform: 'translateY(-2px)',
                            boxShadow: 'md'
                          }}
                        >
                          <Stack spacing={4}>
                            {/* 버전 헤더 */}
                            <Grid templateColumns="repeat(12, 1fr)" gap={4} alignItems="center">
                              <GridItem colSpan={3}>
                                <HStack>
                                  <Badge
                                    colorScheme={version.version === modelData.version
                                        ? 'orange'
                                        : version.status === 'deployed'
                                        ? 'green'
                                        : 'gray'
                                    }
                                    fontSize="sm"
                                    px={2}
                                    py={1}
                                  >
                                    {version.version === modelData.version ? '현재' : 
                                     version.status === 'deployed' ? '배포됨' : '아카이브'}
                                  </Badge>
                                  <Text fontWeight="bold">v{version.version}</Text>
                                </HStack>
                              </GridItem>
                              <GridItem colSpan={3}>
                                <HStack>
                                  <Icon as={FiClock} color={brandColor} />
                                  <Text color="gray.500">{version.createdAt}</Text>
                                </HStack>
                              </GridItem>
                              <GridItem colSpan={4}>
                                <SimpleGrid columns={3} spacing={4}>
                                  <Stat size="sm">
                                    <StatLabel color="gray.500">정확도</StatLabel>
                                    <StatNumber>{(version.metrics.accuracy).toFixed(1)}%</StatNumber>
                                    {index < modelData.versions.length - 1 && (
                                      <StatHelpText>
                                        <StatArrow 
                                          type={version.metrics.accuracy > modelData.versions[index + 1].metrics.accuracy ? 'increase' : 'decrease'} 
                                        />
                                        {Math.abs((version.metrics.accuracy - modelData.versions[index + 1].metrics.accuracy) * 100).toFixed(1)}%
                                      </StatHelpText>
                                    )}
                                  </Stat>
                                  <Stat size="sm">
                                    <StatLabel color="gray.500">F1 점수</StatLabel>
                                    <StatNumber>{(version.metrics.f1Score * 100).toFixed(1)}%</StatNumber>
                                    {index < modelData.versions.length - 1 && (
                                      <StatHelpText>
                                        <StatArrow 
                                          type={version.metrics.f1Score > modelData.versions[index + 1].metrics.f1Score ? 'increase' : 'decrease'} 
                                        />
                                        {Math.abs((version.metrics.f1Score - modelData.versions[index + 1].metrics.f1Score) * 100).toFixed(1)}%
                                      </StatHelpText>
                                    )}
                                  </Stat>
                                  <Stat size="sm">
                                    <StatLabel color="gray.500">지연시간</StatLabel>
                                    <StatNumber>{version.metrics.latency}ms</StatNumber>
                                    {index < modelData.versions.length - 1 && (
                                      <StatHelpText>
                                        <StatArrow 
                                          type={version.metrics.latency < modelData.versions[index + 1].metrics.latency ? 'increase' : 'decrease'} 
                                        />
                                        {Math.abs(version.metrics.latency - modelData.versions[index + 1].metrics.latency)}ms
                                      </StatHelpText>
                                    )}
                                  </Stat>
                                </SimpleGrid>
                              </GridItem>
                              <GridItem colSpan={2}>
                                <HStack justify="flex-end" spacing={2}>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    leftIcon={<Icon as={FiRotateCcw} />}
                                    isDisabled={version.version === modelData.version}
                                    colorScheme="orange"
                                    _hover={{
                                      bg: 'orange.50',
                                      transform: 'scale(1.05)'
                                    }}
                                    _active={{
                                      bg: 'orange.100'
                                    }}
                                  >
                                    롤백
                                  </Button>
                                </HStack>
                              </GridItem>
                            </Grid>

                            {/* 버전 상세 정보 */}
                            <Divider />
                            <SimpleGrid columns={3} spacing={4}>
                              <Box>
                                <Text fontSize="sm" fontWeight="medium" color="gray.500" mb={2}>학습 데이터</Text>
                                <Stack spacing={2}>
                                  <HStack>
                                    <Icon as={FiDatabase} color={brandColor} />
                                    <Text>데이터셋: {modelData.dataset.name}</Text>
                                  </HStack>
                                  <HStack>
                                    <Icon as={FiHash} color={brandColor} />
                                    <Text>샘플 수: {modelData.dataset.size}</Text>
                                  </HStack>
                                </Stack>
                              </Box>
                              <Box>
                                <Text fontSize="sm" fontWeight="medium" color="gray.500" mb={2}>학습 시간</Text>
                                <Stack spacing={2}>
                                  <HStack>
                                    <Icon as={FiClock} color={brandColor} />
                                    <Text>{modelData.trainTime}</Text>
                                  </HStack>
                                </Stack>
                              </Box>
                              <Box>
                                <Text fontSize="sm" fontWeight="medium" color="gray.500" mb={2}>성능 지표</Text>
                                <Stack spacing={2}>
                                  <HStack>
                                    <Icon as={FiActivity} color={brandColor} />
                                    <Text>처리량: {version.metrics.throughput} 요청/초</Text>
                                  </HStack>
                                  <HStack>
                                    <Icon as={FiBarChart2} color={brandColor} />
                                    <Text>정밀도: {(version.metrics.precision * 100).toFixed(1)}%</Text>
                                  </HStack>
                                </Stack>
                              </Box>
                            </SimpleGrid>
                          </Stack>
                        </Box>
                      ))}

                    </Stack>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </GridItem>
      </Grid>
    </Box>
  )
}
