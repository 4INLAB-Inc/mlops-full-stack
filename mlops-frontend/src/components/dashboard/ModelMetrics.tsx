'use client'

import {
  Box,
  Flex,
  Text,
  Heading,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tooltip,
  Icon,
  HStack,
  Select,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  VStack,
} from '@chakra-ui/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
  Area,
  AreaChart,
} from 'recharts'
import {
  FiTrendingUp,
  FiTarget,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiRefreshCw,
} from 'react-icons/fi'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useState } from 'react'

interface MetricData {
  timestamp: string
  accuracy: number
  loss: number
  precision: number
  recall: number
}

const mockData: MetricData[] = [
  {
    timestamp: '2025-02-01',
    accuracy: 0.82,
    loss: 0.35,
    precision: 0.84,
    recall: 0.81,
  },
  {
    timestamp: '2025-02-02',
    accuracy: 0.85,
    loss: 0.32,
    precision: 0.86,
    recall: 0.83,
  },
  {
    timestamp: '2025-02-03',
    accuracy: 0.87,
    loss: 0.28,
    precision: 0.88,
    recall: 0.85,
  },
  {
    timestamp: '2025-02-04',
    accuracy: 0.89,
    loss: 0.25,
    precision: 0.90,
    recall: 0.87,
  },
  {
    timestamp: '2025-02-05',
    accuracy: 0.91,
    loss: 0.22,
    precision: 0.92,
    recall: 0.89,
  },
  {
    timestamp: '2025-02-06',
    accuracy: 0.92,
    loss: 0.20,
    precision: 0.93,
    recall: 0.90,
  },
]

interface MetricCardProps {
  title: string
  value: number
  change: number
  icon: any
  helpText: string
  format?: (value: number) => string
}

function MetricCard({
  title,
  value,
  change,
  icon,
  helpText,
  format = (v) => v.toFixed(2),
}: MetricCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const subTextColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
    >
      <Stat>
        <Flex justify="space-between" align="center" mb={2}>
          <StatLabel color={subTextColor} fontSize="sm" fontWeight="medium">
            {title}
          </StatLabel>
          <Icon as={icon} color={subTextColor} w={5} h={5} />
        </Flex>
        <StatNumber
          fontSize="3xl"
          fontWeight="bold"
          color={textColor}
          letterSpacing="tight"
        >
          {format(value)}
        </StatNumber>
        <StatHelpText mb={0}>
          <HStack spacing={2}>
            <StatArrow type={change >= 0 ? 'increase' : 'decrease'} />
            <Text color={change >= 0 ? 'green.500' : 'red.500'} fontWeight="medium">
              {Math.abs(change)}%
            </Text>
            <Text color={subTextColor}>{helpText}</Text>
          </HStack>
        </StatHelpText>
      </Stat>
    </Box>
  )
}

export default function ModelMetrics() {
  const [timeRange, setTimeRange] = useState('1w')
  const textColor = useColorModeValue('gray.800', 'white')
  const subTextColor = useColorModeValue('gray.600', 'gray.300')
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  const chartBgColor = useColorModeValue('white', 'gray.800')
  const chartGridColor = useColorModeValue('gray.100', 'gray.700')
  const chartTextColor = useColorModeValue('gray.600', 'gray.400')

  const latestMetrics = mockData[mockData.length - 1]
  const previousMetrics = mockData[mockData.length - 2]

  const getChange = (current: number, previous: number) => {
    return Number((((current - previous) / previous) * 100).toFixed(1))
  }

  return (
    <Box fontFamily="Pretendard">
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        bg={bgColor}
        p={6}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        shadow="sm"
      >
        <VStack align="start" spacing={1}>
          <Heading size="md" color={textColor} letterSpacing="tight">
            모델 성능 메트릭스
          </Heading>
          <Text fontSize="sm" color={subTextColor}>
            학습된 모델의 성능 지표 및 추이
          </Text>
        </VStack>
        <HStack spacing={4}>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<FiCalendar />}
              size="sm"
              variant="outline"
              fontWeight="medium"
            >
              {timeRange === '1w'
                ? '최근 1주'
                : timeRange === '2w'
                ? '최근 2주'
                : '최근 1개월'}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setTimeRange('1w')}>최근 1주</MenuItem>
              <MenuItem onClick={() => setTimeRange('2w')}>최근 2주</MenuItem>
              <MenuItem onClick={() => setTimeRange('1m')}>최근 1개월</MenuItem>
            </MenuList>
          </Menu>
          <Tooltip label="새로고침" placement="top">
            <IconButton
              aria-label="새로고침"
              icon={<FiRefreshCw />}
              size="sm"
              variant="ghost"
            />
          </Tooltip>
        </HStack>
      </Flex>

      {/* Metric Cards */}
      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={6} mb={6}>
        <MetricCard
          title="정확도"
          value={latestMetrics.accuracy}
          change={getChange(latestMetrics.accuracy, previousMetrics.accuracy)}
          icon={FiCheckCircle}
          helpText="지난 주 대비"
          format={(v) => `${(v * 100).toFixed(1)}%`}
        />
        <MetricCard
          title="손실"
          value={latestMetrics.loss}
          change={-getChange(latestMetrics.loss, previousMetrics.loss)}
          icon={FiAlertCircle}
          helpText="지난 주 대비"
          format={(v) => v.toFixed(3)}
        />
        <MetricCard
          title="정밀도"
          value={latestMetrics.precision}
          change={getChange(latestMetrics.precision, previousMetrics.precision)}
          icon={FiTarget}
          helpText="지난 주 대비"
          format={(v) => `${(v * 100).toFixed(1)}%`}
        />
        <MetricCard
          title="재현율"
          value={latestMetrics.recall}
          change={getChange(latestMetrics.recall, previousMetrics.recall)}
          icon={FiTrendingUp}
          helpText="지난 주 대비"
          format={(v) => `${(v * 100).toFixed(1)}%`}
        />
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Box
          bg={chartBgColor}
          p={6}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          height="400px"
        >
          <VStack align="start" spacing={6} height="100%">
            <Heading size="sm" color={textColor}>
              정확도 & 손실 추이
            </Heading>
            <Box flex={1} width="100%">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartGridColor}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="timestamp"
                    stroke={chartTextColor}
                    tick={{ fill: chartTextColor }}
                  />
                  <YAxis stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: chartBgColor,
                      border: `1px solid ${borderColor}`,
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    name="정확도"
                    stroke="#3182ce"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="loss"
                    name="손실"
                    stroke="#e53e3e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </VStack>
        </Box>

        <Box
          bg={chartBgColor}
          p={6}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          height="400px"
        >
          <VStack align="start" spacing={6} height="100%">
            <Heading size="sm" color={textColor}>
              정밀도 & 재현율 추이
            </Heading>
            <Box flex={1} width="100%">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartGridColor}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="timestamp"
                    stroke={chartTextColor}
                    tick={{ fill: chartTextColor }}
                  />
                  <YAxis stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: chartBgColor,
                      border: `1px solid ${borderColor}`,
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="precision"
                    name="정밀도"
                    stroke="#38a169"
                    fill="#38a16933"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="recall"
                    name="재현율"
                    stroke="#805ad5"
                    fill="#805ad533"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  )
}
