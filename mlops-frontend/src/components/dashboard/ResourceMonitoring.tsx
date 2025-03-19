'use client'

import {
  Box,
  SimpleGrid,
  Text,
  useColorModeValue,
  Flex,
  Icon,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  VStack,
} from '@chakra-ui/react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  FiCpu,
  FiHardDrive,
  FiDatabase,
  FiActivity,
  FiClock,
  FiCalendar,
} from 'react-icons/fi'
import { useState } from 'react'

// 모의 데이터 생성 함수
const generateMockData = (hours: number) => {
  const data = []
  const now = new Date()
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000)
    data.push({
      time: time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      cpu: Math.floor(Math.random() * 30 + 40),
      memory: Math.floor(Math.random() * 20 + 60),
      storage: Math.floor(Math.random() * 10 + 75),
      gpu: Math.floor(Math.random() * 40 + 30),
    })
  }
  return data
}

interface ResourceCardProps {
  title: string
  icon: any
  data: any[]
  dataKey: string
  color: string
  unit: string
  current: number
}

function ResourceCard({
  title,
  icon,
  data,
  dataKey,
  color,
  unit,
  current,
}: ResourceCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const subTextColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'md',
        borderColor: color,
      }}
    >
      <VStack spacing={4} align="stretch">
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Icon as={icon} color={color} boxSize={5} />
            <Text
              fontSize="sm"
              fontWeight="medium"
              color={textColor}
              fontFamily="Pretendard"
            >
              {title}
            </Text>
          </HStack>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color={color}
            fontFamily="Pretendard"
          >
            {current}
            {unit}
          </Text>
        </Flex>

        <Box h="120px">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: subTextColor }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: subTextColor }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                fill={`url(#gradient-${title})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </VStack>
    </Box>
  )
}

export default function ResourceMonitoring() {
  const [timeRange, setTimeRange] = useState(24)
  const data = generateMockData(timeRange)
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const subTextColor = useColorModeValue('gray.600', 'gray.400')

  const resources = [
    {
      title: 'CPU 사용량',
      icon: FiCpu,
      dataKey: 'cpu',
      color: '#3182ce',
      unit: '%',
      current: data[data.length - 1].cpu,
    },
    {
      title: '메모리 사용량',
      icon: FiDatabase,
      dataKey: 'memory',
      color: '#805ad5',
      unit: '%',
      current: data[data.length - 1].memory,
    },
    {
      title: '스토리지 사용량',
      icon: FiHardDrive,
      dataKey: 'storage',
      color: '#38a169',
      unit: '%',
      current: data[data.length - 1].storage,
    },
    {
      title: 'GPU 사용량',
      icon: FiActivity,
      dataKey: 'gpu',
      color: '#EB6100',
      unit: '%',
      current: data[data.length - 1].gpu,
    },
  ]

  return (
    <Box
      mx="auto"
      px={8}
      py={6}
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="md" color={textColor} letterSpacing="tight">
              리소스 모니터링
            </Heading>
            <Text fontSize="sm" color={subTextColor}>
              시스템 리소스 사용량 실시간 모니터링
            </Text>
          </VStack>

          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<FiClock />}
              size="sm"
              variant="outline"
              fontWeight="medium"
            >
              {timeRange === 24
                ? '최근 24시간'
                : timeRange === 12
                ? '최근 12시간'
                : '최근 6시간'}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setTimeRange(24)}>최근 24시간</MenuItem>
              <MenuItem onClick={() => setTimeRange(12)}>최근 12시간</MenuItem>
              <MenuItem onClick={() => setTimeRange(6)}>최근 6시간</MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {resources.map((resource) => (
            <ResourceCard
              key={resource.title}
              {...resource}
              data={data}
            />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  )
}
