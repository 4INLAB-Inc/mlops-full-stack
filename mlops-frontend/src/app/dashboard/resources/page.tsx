'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Select,
  Container,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Button,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { FiRefreshCcw } from 'react-icons/fi'
import { ResourceMetrics } from './components/ResourceMetrics'
import { ResourceChart } from './components/ResourceChart'
import { ResourceTable } from './components/ResourceTable'
import { fetchResourceMonitoring, fetchResourceHistory, generateMockData } from './api/service'
import { ResourceMonitoringData } from './api/types'

import axios from 'axios'

export default function ResourcesPage() {
  const [data, setData] = useState<ResourceMonitoringData | null>(null)
  const [timeRange, setTimeRange] = useState('3h')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const toast = useToast()

  // const fetchData = async () => {
  //   try {
  //     setIsRefreshing(true)
  //     // 실제 API 연동 시에는 아래 주석을 해제하고 generateMockData를 제거
  //     // const monitoringData = await fetchResourceMonitoring()
  //     // const historyData = await fetchResourceHistory(timeRange)
  //     const mockData = generateMockData()
  //     setData(mockData)
  //   } catch (error) {
  //     console.error('Error fetching resource data:', error)
  //     toast({
  //       title: '데이터 로딩 실패',
  //       description: '리소스 모니터링 데이터를 불러오는데 실패했습니다.',
  //       status: 'error',
  //       duration: 5000,
  //       isClosable: true,
  //     })
  //   } finally {
  //     setIsLoading(false)
  //     setIsRefreshing(false)
  //   }
  // }
  const fetchData = async () => {
    try {
      setIsRefreshing(true)
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/resource-monitoring/total`)
      if (!response.ok) {
        throw new Error(`API 호출 오류: ${response.status}`)
      }
  
      const realData = await response.json()
      setData(realData)
  
    } catch (error) {
      console.error('Error fetching resource data:', error)
      toast({
        title: '데이터 로딩 실패',
        description: '리소스 모니터링 데이터를 불러오는데 실패했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [timeRange])

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    )
  }

  if (!data) {
    return null
  }

  const getRangeInMs = (range: string): number => {
    const hours = parseInt(range.replace('h', ''))
    return hours * 60 * 60 * 1000
  }

  return (
    <Container maxW="100%" p={4}>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" mb={2}>
          <Heading size="lg">리소스 모니터링</Heading>
          <Button
            leftIcon={<FiRefreshCcw />}
            onClick={fetchData}
            isLoading={isRefreshing}
            colorScheme="blue"
            size="sm"
          >
            새로고침
          </Button>
        </HStack>

        {/* 상단 메트릭스 */}
        <Card>
          <CardBody>
            <ResourceMetrics
              name="로컬 워크스테이션"
              workers={{
                total: data.metrics.workers.total,
                utilization: (data.metrics.workers.running / data.metrics.workers.total) * 100,
              }}
              gpus={{
                total: data.metrics.gpus.total,
                utilization: (data.metrics.gpus.running / data.metrics.gpus.total) * 100,
              }}
              cpus={{
                total: data.metrics.cpus.total,
                utilization: (data.metrics.cpus.running / data.metrics.cpus.total) * 100,
              }}
            />
          </CardBody>
        </Card>

        {/* 리소스 사용량 차트 */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">전체 리소스 사용량</Heading>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                w="200px"
                size="sm"
              >
                <option value="1h">최근 1시간</option>
                <option value="3h">최근 3시간</option>
                <option value="6h">최근 6시간</option>
                <option value="12h">최근 12시간</option>
                <option value="24h">최근 24시간</option>
              </Select>
            </HStack>
          </CardHeader>
          <CardBody>
          <ResourceChart
            data={data.history.filter((entry) => {
              const now = Date.now()
              return now - entry.timestamp <= getRangeInMs(timeRange)
            })}
            height="300px"
          />
          </CardBody>
        </Card>

        {/* 리소스 그룹 테이블 */}
        <Card>
          <CardHeader>
            <Heading size="md">리소스 그룹 상세</Heading>
          </CardHeader>
          <CardBody>
            <ResourceTable data={data.groups} />
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}
