

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
  useToast,
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
  FiServer,
} from 'react-icons/fi'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'
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
  Line,
} from 'recharts'

interface PerformanceTabProps {
  modelId: string // Thêm modelId để truyền vào API
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ modelId }) => {
  const [versionData, setVersionData] = useState<any>(null)
  const [activeVersion, setActiveVersion] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const toast = useToast()

  // Fetch version data from API
  useEffect(() => {
    if (!modelId) {
      console.error('modelId is missing');
      toast({
        title: 'Error',
        description: 'Model ID is required.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setIsLoading(false);
      return; // Return early if modelId is not provided
    }
  
    const fetchVersionData = async () => {
      try {
        const response = await axios.get(`http://192.168.219.52:8686/api/models/versions/${modelId}`)
        const data = response.data
        setVersionData(data)
        setActiveVersion(data.currentVersion.version)
      } catch (error) {
        console.error('Error fetching version data:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch version data.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchVersionData()
  }, [modelId, toast])

  // If loading, show a loading message
  if (isLoading) {
    return <Text>Loading...</Text>
  }

  if (!versionData) {
    return <Text>No version data found.</Text>
  }

  const { currentVersion, previousVersion } = versionData

  // Mock data for the chart
  const chartData = useMemo(() => {
    if (!currentVersion) {
      return []; // Nếu currentVersion không có dữ liệu, trả về mảng rỗng
    }
    // Lấy dữ liệu từ currentVersion nếu có
    return currentVersion.trainingHistory.map((item: any) => ({
      epoch: item.epoch,
      trainAccuracy: item.trainAccuracy,
      valAccuracy: item.valAccuracy,
      trainLoss: item.trainLoss,
      valLoss: item.valLoss,
    }));
  }, [currentVersion]);

  const performanceMetrics = useMemo(() => {
    if (!currentVersion) return []
    return [
      { name: 'Accuracy', current: currentVersion.metrics.accuracy, previous: previousVersion?.metrics.accuracy },
      { name: 'Precision', current: currentVersion.metrics.precision, previous: previousVersion?.metrics.precision },
      { name: 'Recall', current: currentVersion.metrics.recall, previous: previousVersion?.metrics.recall },
      { name: 'F1 Score', current: currentVersion.metrics.f1Score, previous: previousVersion?.metrics.f1Score },
    ]
  }, [currentVersion, previousVersion])

  const handleVersionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveVersion(e.target.value)
  }, [])

  const handleRollback = useCallback(async () => {
    setIsLoading(true)
    try {
      // Simulate rollback logic (you should replace this with an actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: 'Rollback Complete',
        description: `Rolled back to version ${activeVersion}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Rollback Failed',
        description: 'There was an issue with the rollback process.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [activeVersion, toast])

  return (
    <Stack spacing={6}>
      {/* Basic Overview */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Card>
          <CardBody>
            <Text>Version: {currentVersion.version}</Text>
            <Text>Status: {currentVersion.status}</Text>
            <Text>Training Time: {currentVersion.trainingTime}</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {performanceMetrics.map(metric => (
          <Card key={metric.name}>
            <CardBody>
              <Text>{metric.name}</Text>
              <Text>Current: {metric.current}</Text>
              <Text>Previous: {metric.previous}</Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Training History Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="epoch" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="trainAccuracy" stroke="#8884d8" />
          <Line type="monotone" dataKey="valAccuracy" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>

      {/* Rollback Button */}
      <Button
        onClick={handleRollback}
        leftIcon={<FiRotateCcw />}
        colorScheme="orange"
        isLoading={isLoading}
        isDisabled={!previousVersion}
      >
        Rollback to previous version
      </Button>
    </Stack>
  )
}

export default PerformanceTab

