'use client'

import {
  Box,
  Text,
  SimpleGrid,
  CircularProgress,
  CircularProgressLabel,
  Heading,
  useColorModeValue,
  Flex,
  IconButton,
} from '@chakra-ui/react'
import { FiRefreshCw } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

interface ResourceData {
  cpu: number
  memory: number
  storage: number
  gpu: number
}

export default function ResourceUsage() {
  const [resources, setResources] = useState<ResourceData>({
    cpu: 45,
    memory: 62,
    storage: 75,
    gpu: 42,
  })
  const [isLoading, setIsLoading] = useState(false)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const headingColor = useColorModeValue('gray.700', 'white')
  const progressTrackColor = useColorModeValue('gray.100', 'gray.700')

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'red.400'
    if (value >= 60) return 'orange.400'
    return 'green.400'
  }

  const refreshData = () => {
    setIsLoading(true)
    // 실제 API 호출로 대체해야 함
    setTimeout(() => {
      setResources({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        storage: Math.floor(Math.random() * 100),
        gpu: Math.floor(Math.random() * 100),
      })
      setIsLoading(false)
    }, 1000)
  }

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 30000) // 30초마다 갱신
    return () => clearInterval(interval)
  }, [])

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md" color={headingColor}>
          리소스 사용량
        </Heading>
        <IconButton
          icon={<FiRefreshCw />}
          aria-label="새로고침"
          size="sm"
          variant="ghost"
          isLoading={isLoading}
          onClick={refreshData}
        />
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
        {[
          { label: 'CPU', value: resources.cpu, unit: '%' },
          { label: '메모리', value: resources.memory, unit: 'GB' },
          { label: '스토리지', value: resources.storage, unit: 'GB' },
          { label: 'GPU', value: resources.gpu, unit: '%' },
        ].map((resource) => (
          <MotionBox
            key={resource.label}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Box textAlign="center">
              <CircularProgress
                value={resource.value}
                size="120px"
                thickness="8px"
                color={getProgressColor(resource.value)}
                trackColor={progressTrackColor}
              >
                <CircularProgressLabel>
                  <Text fontSize="xl" fontWeight="bold">
                    {resource.value}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    {resource.unit}
                  </Text>
                </CircularProgressLabel>
              </CircularProgress>
              <Text mt={2} fontWeight="medium" color={headingColor}>
                {resource.label}
              </Text>
              <Text fontSize="sm" color={textColor}>
                {resource.value >= 80
                  ? '높음'
                  : resource.value >= 60
                  ? '보통'
                  : '양호'}
              </Text>
            </Box>
          </MotionBox>
        ))}
      </SimpleGrid>
    </Box>
  )
}
