'use client'

import {
  Box,
  Container,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Stack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  VStack,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Icon,
  Button,
  Flex,
  Spacer,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  CircularProgress,
  CircularProgressLabel,
  List,
  ListItem,
  ListIcon,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
  useToast,
} from '@chakra-ui/react'


import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area } from 'recharts'
import { FiCpu, FiDatabase, FiGitBranch, FiServer, FiThermometer, FiDroplet, FiSun, FiWind, FiActivity, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiMoreVertical, FiRefreshCw, FiDownload, FiSettings } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import { ModelMetrics, DeploymentStatus, ABTestResult, OptimizationMetrics, Alert, CropEnvironment, CropGrowthMetrics, DecisionSupport, ModelPerformanceHistory, AutoMLResult } from './types'

// 실시간 데이터처럼 보이는 환경 데이터 생성
const generateEnvironmentData = () => {
  const now = new Date()
  return {
    temperature: 25.5 + (Math.random() * 0.4 - 0.2),
    humidity: 65 + (Math.random() * 2 - 1),
    co2: 800 + (Math.random() * 20 - 10),
    light: 20000 + (Math.random() * 1000 - 500),
    soilMoisture: 45 + (Math.random() * 1 - 0.5),
    nutrientLevel: 75 + (Math.random() * 1 - 0.5),
    lastUpdated: now.toLocaleTimeString('ko-KR'),
  }
}

// 실시간 생육 데이터 생성
const generateGrowthData = () => {
  return {
    height: 45.5 + (Math.random() * 0.2 - 0.1),
    leafArea: 120 + (Math.random() * 2 - 1),
    stemDiameter: 2.8 + (Math.random() * 0.1 - 0.05),
    fruitCount: 12,
    predictedYield: 85 + (Math.random() * 1 - 0.5),
    growthStage: '개화기',
    healthScore: 92 + (Math.random() * 0.4 - 0.2),
    lastMeasured: new Date().toLocaleTimeString('ko-KR'),
  }
}

// 24시간 환경 데이터 히스토리 생성
const generate24HourHistory = () => {
  const data = []
  const now = new Date()
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() - (23 - i) * 3600000)
    data.push({
      time: time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      temperature: 25 + Math.sin(i / 24 * Math.PI * 2) * 2 + (Math.random() * 0.5),
      humidity: 65 + Math.sin(i / 24 * Math.PI * 2) * 5 + (Math.random() * 2),
      co2: 800 + Math.sin(i / 24 * Math.PI * 2) * 50 + (Math.random() * 20),
    })
  }
  return data
}

// 의사결정 지원 데이터 생성
const generateDecisionSupport = () => {
  return [
    {
      recommendation: '관수량 조절 필요',
      confidence: 85 + (Math.random() * 10 - 5),
      impact: 'high' as const,
      category: 'irrigation' as const,
      suggestedActions: ['시간당 수분 공급량 20% 증가', '토양 수분 모니터링 주기 단축'],
      expectedOutcome: '생육 스트레스 감소 및 수확량 10% 증가',
    },
    {
      recommendation: '질소 영양분 보충',
      confidence: 82 + (Math.random() * 10 - 5),
      impact: 'medium' as const,
      category: 'nutrition' as const,
      suggestedActions: ['질소 비료 추가 공급', '잎 색상 변화 모니터링'],
      expectedOutcome: '잎 성장 촉진 및 광합성 효율 15% 향상',
    },
    {
      recommendation: '환기 시스템 가동',
      confidence: 88 + (Math.random() * 10 - 5),
      impact: 'medium' as const,
      category: 'ventilation' as const,
      suggestedActions: ['환기 시스템 가동 시간 30분 연장', 'CO2 농도 모니터링'],
      expectedOutcome: '작물 호흡 환경 개선 및 생산성 8% 향상',
    }
  ]
}

// 모델 성능 히스토리 데이터 생성
const generateModelHistory = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - (6 - i) * 24 * 3600000);
    data.push({
      timestamp: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      metrics: {
        accuracy: 92 + (Math.random() * 2),
        precision: 91 + (Math.random() * 2),
        recall: 93 + (Math.random() * 2),
        f1Score: 92 + (Math.random() * 2),
      },
      latency: 100 + (Math.random() * 10),
      throughput: 1500 + (Math.random() * 200),
    });
  }
  return data;
}

// 모델 최적화 데이터 생성
const generateOptimizationData = () => {
  return [
    {
      technique: '양자화',
      originalSize: 250,
      optimizedSize: 85 + (Math.random() * 10 - 5),
      speedup: 2.1 + (Math.random() * 0.2 - 0.1),
      accuracyDrop: 0.3 + (Math.random() * 0.1 - 0.05),
    },
    {
      technique: '프루닝',
      originalSize: 250,
      optimizedSize: 125 + (Math.random() * 10 - 5),
      speedup: 1.5 + (Math.random() * 0.2 - 0.1),
      accuracyDrop: 0.1 + (Math.random() * 0.1 - 0.05),
    },
    {
      technique: '지식 증류',
      originalSize: 250,
      optimizedSize: 95 + (Math.random() * 10 - 5),
      speedup: 1.8 + (Math.random() * 0.2 - 0.1),
      accuracyDrop: 0.2 + (Math.random() * 0.1 - 0.05),
    },
  ];
};

// 모델 배포 데이터 생성
const generateDeploymentData = () => {
  const statuses = ['운영중', '검증중', '준비중'];
  const environments = ['Production', 'Staging', 'Development'];
  
  return Array.from({ length: 5 }, (_, i) => {
    const version = (2.0 + i * 0.1).toFixed(1);
    const randomIndex = Math.floor(Math.random() * 3);
    const deployedAt = new Date();
    deployedAt.setDate(deployedAt.getDate() - i * 2);
    
    return {
      modelVersion: `v${version}`,
      environment: environments[randomIndex],
      status: statuses[randomIndex],
      accuracy: (95 + Math.random() * 3).toFixed(2),
      latency: (120 + Math.random() * 30).toFixed(1),
      deployedAt: deployedAt.toLocaleDateString('ko-KR'),
      health: (90 + Math.random() * 10).toFixed(1),
    };
  });
};

export default function MonitoringPage() {
  // const [environment, setEnvironment] = useState<CropEnvironment>({
  //   temperature: 0,
  //   humidity: 0,
  //   co2: 0,
  // })
  const [environment, setEnvironment] = useState<CropEnvironment>({
    temperature: 0,
    humidity: 0,
    co2: 0,
    light: 0,
    soilMoisture: 0,
    nutrientLevel: 0,
    lastUpdated: new Date().toISOString(), // hoặc '' nếu string
  })
  // const [growthMetrics, setGrowthMetrics] = useState<CropGrowthMetrics>({
  //   growthStage: '',
  //   healthScore: 0,
  //   predictedYield: 0,
  //   height: 0,
  // })
  const [growthMetrics, setGrowthMetrics] = useState<CropGrowthMetrics>({
    growthStage: '',
    healthScore: 0,
    predictedYield: 0,
    height: 0,
    leafArea: 0,
    stemDiameter: 0,
    fruitCount: 0,
    lastMeasured: new Date().toISOString(), // hoặc ''
  })
  const [environmentHistory, setEnvironmentHistory] = useState<Array<any>>([])
  const [decisionSupport, setDecisionSupport] = useState<DecisionSupport[]>([])
  const [modelHistory, setModelHistory] = useState<Array<any>>([])
  const [optimizations, setOptimizations] = useState<Array<any>>([])
  const [deployments, setDeployments] = useState<Array<any>>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const toast = useToast()

  // 초기 데이터 로드
  useEffect(() => {
    setEnvironment(generateEnvironmentData())
    setGrowthMetrics(generateGrowthData())
    setEnvironmentHistory(generate24HourHistory())
    setDecisionSupport(generateDecisionSupport())
    setModelHistory(generateModelHistory())
    setOptimizations(generateOptimizationData())
    setDeployments(generateDeploymentData())
  }, [])

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const headingColor = useColorModeValue('gray.700', 'white')

  useEffect(() => {
    const interval = setInterval(() => {
      setEnvironment(generateEnvironmentData())
      setGrowthMetrics(generateGrowthData())
      setDecisionSupport(generateDecisionSupport())
      setModelHistory(generateModelHistory())
      setOptimizations(generateOptimizationData())
      setDeployments(generateDeploymentData())
      setEnvironmentHistory(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          temperature: environment.temperature,
          humidity: environment.humidity,
          co2: environment.co2,
        }]
        return newData
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [environment])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setEnvironment(generateEnvironmentData())
      setGrowthMetrics(generateGrowthData())
      setIsRefreshing(false)
      toast({
        title: '데이터 새로고침 완료',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    }, 1000)
  }

  const handleExport = () => {
    toast({
      title: '데이터 내보내기 시작',
      description: '현재 데이터를 CSV 형식으로 내보내는 중입니다...',
      status: 'info',
      duration: 2000,
    })
  }

  return (
    <Box maxW="100%" overflow="hidden" px={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg" color={headingColor}>스마트팜 통합 모니터링 시스템</Heading>
          <Text color={textColor} mt={1}>실시간 작물 생육 관리 및 AI 기반 의사결정 지원</Text>
        </Box>
        <HStack spacing={4}>
          <Tooltip label="데이터 새로고침">
            <IconButton
              aria-label="새로고침"
              icon={<FiRefreshCw />}
              isLoading={isRefreshing}
              onClick={handleRefresh}
            />
          </Tooltip>
          <Tooltip label="데이터 내보내기">
            <IconButton
              aria-label="내보내기"
              icon={<FiDownload />}
              onClick={handleExport}
            />
          </Tooltip>
          <Tooltip label="설정">
            <IconButton
              aria-label="설정"
              icon={<FiSettings />}
            />
          </Tooltip>
        </HStack>
      </Flex>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList mb={4}>
          <Tab _selected={{ color: 'blue.500', borderColor: 'blue.500' }}>실시간 모니터링</Tab>
          <Tab _selected={{ color: 'blue.500', borderColor: 'blue.500' }}>생육 분석</Tab>
          <Tab _selected={{ color: 'blue.500', borderColor: 'blue.500' }}>AI 예측</Tab>
          <Tab _selected={{ color: 'blue.500', borderColor: 'blue.500' }}>시스템 상태</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4} mb={6}>
              <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
                <CardHeader pb={2}>
                  <HStack>
                    <Icon as={FiThermometer} color="red.400" />
                    <Heading size="sm">온도</Heading>
                    <Spacer />
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem>상세 보기</MenuItem>
                        <MenuItem>알림 설정</MenuItem>
                        <MenuItem>데이터 내보내기</MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={2}>
                    <Stat>
                      <StatNumber fontSize="3xl">{environment.temperature.toFixed(1)}°C</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        0.5°C from last hour
                      </StatHelpText>
                    </Stat>
                    <Box h="100px">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={environmentHistory.slice(-12)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="temperature" stroke="#F56565" fill="#FEB2B2" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
                <CardHeader pb={2}>
                  <HStack>
                    <Icon as={FiDroplet} color="blue.400" />
                    <Heading size="sm">습도</Heading>
                    <Spacer />
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem>상세 보기</MenuItem>
                        <MenuItem>알림 설정</MenuItem>
                        <MenuItem>데이터 내보내기</MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={2}>
                    <Stat>
                      <StatNumber fontSize="3xl">{environment.humidity.toFixed(1)}%</StatNumber>
                      <StatHelpText>
                        <StatArrow type="decrease" />
                        2.3% from last hour
                      </StatHelpText>
                    </Stat>
                    <Box h="100px">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={environmentHistory.slice(-12)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="humidity" stroke="#4299E1" fill="#BEE3F8" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
                <CardHeader pb={2}>
                  <HStack>
                    <Icon as={FiWind} color="green.400" />
                    <Heading size="sm">CO₂</Heading>
                    <Spacer />
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem>상세 보기</MenuItem>
                        <MenuItem>알림 설정</MenuItem>
                        <MenuItem>데이터 내보내기</MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={2}>
                    <Stat>
                      <StatNumber fontSize="3xl">{environment.co2.toFixed(0)} ppm</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        15 ppm from last hour
                      </StatHelpText>
                    </Stat>
                    <Box h="100px">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={environmentHistory.slice(-12)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="co2" stroke="#48BB78" fill="#C6F6D5" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
                <CardHeader pb={2}>
                  <HStack>
                    <Icon as={FiActivity} color="purple.400" />
                    <Heading size="sm">생육 상태</Heading>
                    <Spacer />
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem>상세 보기</MenuItem>
                        <MenuItem>알림 설정</MenuItem>
                        <MenuItem>데이터 내보내기</MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color={textColor}>현재 단계</Text>
                        <Text fontSize="lg" fontWeight="bold">{growthMetrics.growthStage}</Text>
                      </VStack>
                      <CircularProgress value={growthMetrics.healthScore} color="green.400" size="70px" thickness="8px">
                        <CircularProgressLabel>{growthMetrics.healthScore.toFixed(1)}%</CircularProgressLabel>
                      </CircularProgress>
                    </HStack>
                    <Divider />
                    <SimpleGrid columns={2} spacing={4}>
                      <VStack align="start">
                        <Text fontSize="sm" color={textColor}>예상 수확량</Text>
                        <Text fontSize="md" fontWeight="bold">{growthMetrics.predictedYield.toFixed(1)} kg/m²</Text>
                      </VStack>
                      <VStack align="start">
                        <Text fontSize="sm" color={textColor}>생장 높이</Text>
                        <Text fontSize="md" fontWeight="bold">{growthMetrics.height.toFixed(1)} cm</Text>
                      </VStack>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Card bg={cardBg} borderColor={borderColor} borderWidth={1} mb={8}>
              <CardHeader>
                <Heading size="md">환경 조건 트렌드</Heading>
              </CardHeader>
              <CardBody>
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={environmentHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="temperature" stroke="#48BB78" name="온도" />
                      <Line type="monotone" dataKey="humidity" stroke="#4299E1" name="습도" />
                      <Line type="monotone" dataKey="co2" stroke="#F56565" name="CO₂" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel p={0} pt={4}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
                <CardHeader>
                  <HStack>
                    <Icon as={FiTrendingUp} color="blue.400" />
                    <Heading size="sm">AI 기반 의사결정 지원</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Stack spacing={4}>
                    {decisionSupport.map((decision, idx) => (
                      <Card key={idx} variant="outline">
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <HStack>
                              <Badge colorScheme={decision.impact === 'high' ? 'red' : 'orange'} fontSize="sm">
                                {decision.impact === 'high' ? '높은 우선순위' : '중간 우선순위'}
                              </Badge>
                              <Badge colorScheme="blue">{decision.category}</Badge>
                              <Badge colorScheme="green">{decision.confidence.toFixed(1)}% 신뢰도</Badge>
                            </HStack>
                            <Heading size="sm">{decision.recommendation}</Heading>
                            <List spacing={2}>
                              {decision.suggestedActions.map((action, actionIdx) => (
                                <ListItem key={actionIdx}>
                                  <ListIcon as={FiCheckCircle} color="green.500" />
                                  {action}
                                </ListItem>
                              ))}
                            </List>
                            <Text fontSize="sm" color="gray.500">
                              예상 효과: {decision.expectedOutcome}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </Stack>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
                <CardHeader>
                  <Heading size="md">생육 예측 분석</Heading>
                </CardHeader>
                <CardBody>
                  <Stack spacing={4}>
                    <Box h="200px">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={modelHistory}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="timestamp" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="metrics.accuracy" stroke="#48BB78" name="예측 정확도" />
                          <Line type="monotone" dataKey="metrics.f1Score" stroke="#4299E1" name="F1 Score" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>메트릭</Th>
                          <Th>현재 값</Th>
                          <Th>변화</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>정확도</Td>
                          <Td>{modelHistory.length > 0 ? `${modelHistory[modelHistory.length - 1].metrics.accuracy}%` : '-'}</Td>
                          <Td>
                            <Stat>
                              <StatHelpText>
                                <StatArrow type="increase" />
                                1.3%
                              </StatHelpText>
                            </Stat>
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>정밀도</Td>
                          <Td>{modelHistory.length > 0 ? `${modelHistory[modelHistory.length - 1].metrics.precision}%` : '-'}</Td>
                          <Td>
                            <Stat>
                              <StatHelpText>
                                <StatArrow type="increase" />
                                1.5%
                              </StatHelpText>
                            </Stat>
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </Stack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          <TabPanel p={0} pt={4}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
                <CardHeader>
                  <HStack>
                    <Icon as={FiCpu} color="purple.400" />
                    <Heading size="sm">모델 성능 지표</Heading>
                    <Spacer />
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem>상세 분석</MenuItem>
                        <MenuItem>데이터 내보내기</MenuItem>
                        <MenuItem>알림 설정</MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={2} spacing={4}>
                      <Card variant="outline">
                        <CardBody>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color={textColor}>현재 정확도</Text>
                            <Heading size="lg" color="purple.500">
                              {modelHistory.length > 0 ? `${modelHistory[modelHistory.length - 1].metrics.accuracy.toFixed(1)}%` : '-'}
                            </Heading>
                            <Stat>
                              <StatHelpText>
                                <StatArrow type="increase" />
                                {modelHistory.length > 1 ? 
                                  `${((modelHistory[modelHistory.length - 1].metrics.accuracy - modelHistory[0].metrics.accuracy)).toFixed(1)}% from last week` 
                                  : '-'}
                              </StatHelpText>
                            </Stat>
                          </VStack>
                        </CardBody>
                      </Card>
                      <Card variant="outline">
                        <CardBody>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color={textColor}>평균 응답 시간</Text>
                            <Heading size="lg" color="blue.500">
                              {modelHistory.length > 0 ? modelHistory[modelHistory.length - 1].latency.toFixed(0) : '-'}
                              <Text as="span" fontSize="md">ms</Text>
                            </Heading>
                            <Stat>
                              <StatHelpText>
                                <StatArrow type="decrease" />
                                5ms from last week
                              </StatHelpText>
                            </Stat>
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                    
                    <Box h="200px">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={modelHistory}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                          <YAxis domain={[85, 100]} tick={{ fontSize: 10 }} />
                          <RechartsTooltip />
                          <Line 
                            type="monotone" 
                            dataKey="metrics.accuracy" 
                            name="정확도" 
                            stroke="#805AD5" 
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="metrics.precision" 
                            name="정밀도" 
                            stroke="#4299E1" 
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="metrics.recall" 
                            name="재현율" 
                            stroke="#48BB78" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>

                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th>성능 지표</Th>
                          <Th isNumeric>현재</Th>
                          <Th isNumeric>변화량</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>정확도</Td>
                          <Td isNumeric>{modelHistory.length > 0 ? `${modelHistory[modelHistory.length - 1].metrics.accuracy.toFixed(1)}%` : '-'}</Td>
                          <Td isNumeric>
                            <Text color="green.500">
                              {modelHistory.length > 1 ? `+${((modelHistory[modelHistory.length - 1].metrics.accuracy - modelHistory[0].metrics.accuracy)).toFixed(1)}%` : '-'}
                            </Text>
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>정밀도</Td>
                          <Td isNumeric>{modelHistory.length > 0 ? `${modelHistory[modelHistory.length - 1].metrics.precision.toFixed(1)}%` : '-'}</Td>
                          <Td isNumeric>
                            <Text color="green.500">
                              {modelHistory.length > 1 ? `+${((modelHistory[modelHistory.length - 1].metrics.precision - modelHistory[0].metrics.precision)).toFixed(1)}%` : '-'}
                            </Text>
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>재현율</Td>
                          <Td isNumeric>{modelHistory.length > 0 ? `${modelHistory[modelHistory.length - 1].metrics.recall.toFixed(1)}%` : '-'}</Td>
                          <Td isNumeric>
                            <Text color="green.500">
                              {modelHistory.length > 1 ? `+${((modelHistory[modelHistory.length - 1].metrics.recall - modelHistory[0].metrics.recall)).toFixed(1)}%` : '-'}
                            </Text>
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>F1 Score</Td>
                          <Td isNumeric>{modelHistory.length > 0 ? `${modelHistory[modelHistory.length - 1].metrics.f1Score.toFixed(1)}%` : '-'}</Td>
                          <Td isNumeric>
                            <Text color="green.500">
                              {modelHistory.length > 1 ? `+${((modelHistory[modelHistory.length - 1].metrics.f1Score - modelHistory[0].metrics.f1Score)).toFixed(1)}%` : '-'}
                            </Text>
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
                <CardHeader>
                  <HStack>
                    <Icon as={FiServer} color="orange.400" />
                    <Heading size="sm">모델 최적화 현황</Heading>
                    <Spacer />
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem>상세 분석</MenuItem>
                        <MenuItem>최적화 설정</MenuItem>
                        <MenuItem>보고서 생성</MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={3} spacing={4}>
                      {optimizations.map((opt) => (
                        <Card key={opt.technique} variant="outline">
                          <CardBody>
                            <VStack align="start" spacing={2}>
                              <HStack>
                                <Badge colorScheme="orange">{opt.technique}</Badge>
                                <Spacer />
                                <Icon 
                                  as={opt.accuracyDrop <= 0.2 ? FiCheckCircle : FiAlertCircle} 
                                  color={opt.accuracyDrop <= 0.2 ? "green.500" : "orange.500"}
                                />
                              </HStack>
                              <Box w="100%">
                                <Text fontSize="sm" color={textColor}>모델 크기 감소</Text>
                                <Text fontSize="lg" fontWeight="bold">
                                  {((opt.originalSize - opt.optimizedSize) / opt.originalSize * 100).toFixed(1)}%
                                </Text>
                              </Box>
                              <Divider />
                              <SimpleGrid columns={2} spacing={2} w="100%">
                                <Box>
                                  <Text fontSize="sm" color={textColor}>속도 향상</Text>
                                  <Text fontSize="md" fontWeight="bold" color="green.500">
                                    {opt.speedup.toFixed(1)}x
                                  </Text>
                                </Box>
                                <Box>
                                  <Text fontSize="sm" color={textColor}>정확도 변화</Text>
                                  <Text 
                                    fontSize="md" 
                                    fontWeight="bold"
                                    color={opt.accuracyDrop > 0.2 ? "orange.500" : "green.500"}
                                  >
                                    -{opt.accuracyDrop.toFixed(1)}%
                                  </Text>
                                </Box>
                              </SimpleGrid>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                    <Box h="200px">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={optimizations}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="technique" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="speedup" name="속도 향상" fill="#ED8936" />
                          <Bar dataKey="accuracyDrop" name="정확도 감소" fill="#F56565" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          <TabPanel p={0} pt={4}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
              <CardHeader>
                <Heading size="md">배포 상태</Heading>
              </CardHeader>
              <CardBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>버전</Th>
                      <Th>상태</Th>
                      <Th>시작 시간</Th>
                      <Th>마지막 업데이트</Th>
                      <Th>상태</Th>
                      <Th>트래픽</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {deployments.map((deployment) => (
                      <Tr key={deployment.modelVersion}>
                        <Td>{deployment.modelVersion}</Td>
                        <Td>
                          <Badge colorScheme={deployment.status === '운영중' ? 'green' : 'orange'}>{deployment.status}</Badge>
                        </Td>
                        <Td>{deployment.deployedAt}</Td>
                        <Td>{deployment.deployedAt}</Td>
                        <Td>
                          <Progress
                            value={deployment.health}
                            colorScheme={deployment.health > 90 ? 'green' : 'orange'}
                            size="sm"
                          />
                        </Td>
                        <Td>{Math.random() * 100}%</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel p={0} pt={4}>
            <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
              <CardHeader>
                <Flex>
                  <Heading size="md">A/B 테스트 결과</Heading>
                  <Spacer />
                  <Button colorScheme="blue" size="sm">
                    새 테스트 시작
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>모델 버전</Th>
                      <Th>정확도</Th>
                      <Th>지연 시간</Th>
                      <Th>처리량</Th>
                      <Th>샘플 크기</Th>
                      <Th>개선율</Th>
                      <Th>상태</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Tr key={i}>
                        <Td>v{2.0 + i * 0.1}</Td>
                        <Td>{(95 + Math.random() * 3).toFixed(2)}%</Td>
                        <Td>{(120 + Math.random() * 30).toFixed(1)}ms</Td>
                        <Td>{(1500 + Math.random() * 200)}/hour</Td>
                        <Td>{Math.floor(Math.random() * 1000)}</Td>
                        <Td>
                          <Text color={Math.random() > 0.5 ? 'green.500' : 'gray.500'}>
                            {Math.random() > 0.5 ? `+${(Math.random() * 10).toFixed(1)}%` : '기준'}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={Math.random() > 0.5 ? 'green' : 'orange'}>완료</Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel p={0} pt={4}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
                <CardHeader>
                  <Heading size="md">모델 최적화 메트릭스</Heading>
                </CardHeader>
                <CardBody>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>최적화 기법</Th>
                        <Th>모델 크기 감소</Th>
                        <Th>속도 향상</Th>
                        <Th>정확도 변화</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {optimizations.map((opt) => (
                        <Tr key={opt.technique}>
                          <Td>{opt.technique}</Td>
                          <Td>
                            {((opt.originalSize - opt.optimizedSize) / opt.originalSize * 100).toFixed(1)}%
                          </Td>
                          <Td>{opt.speedup}x</Td>
                          <Td>
                            <Text color={opt.accuracyDrop > 0.5 ? 'red.500' : 'green.500'}>
                              -{opt.accuracyDrop}%
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
                <CardHeader>
                  <Heading size="md">최적화 효과 비교</Heading>
                </CardHeader>
                <CardBody>
                  <Box h="300px">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={optimizations}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="technique" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="speedup" name="속도 향상" fill="#48BB78" />
                        <Bar dataKey="accuracyDrop" name="정확도 감소" fill="#F56565" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
