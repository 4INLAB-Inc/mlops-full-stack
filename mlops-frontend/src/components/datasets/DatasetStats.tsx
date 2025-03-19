'use client'

import {
  Box,
  Grid,
  HStack,
  Icon,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
} from 'react-icons/fi'

interface DatasetStatsProps {
  dataset: any // 실제 구현시 타입 정의 필요
}

export function DatasetStats({ dataset }: DatasetStatsProps) {
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400')

  const stats = [
    {
      label: '평균값',
      value: dataset.statistics?.numerical?.mean?.[0]?.toFixed(4) || 'N/A',
      icon: FiTrendingUp,
      color: 'green.500',
    },
    {
      label: '표준편차',
      value: dataset.statistics?.numerical?.std?.[0]?.toFixed(4) || 'N/A',
      icon: FiActivity,
      color: 'blue.500',
    },
    {
      label: '최소값',
      value: dataset.statistics?.numerical?.min?.[0]?.toFixed(4) || 'N/A',
      icon: FiTrendingDown,
      color: 'red.500',
    },
  ]

  return (
    <Stack spacing={6}>
      <Text fontSize="lg" fontWeight="semibold">
        데이터셋 통계
      </Text>
      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(3, 1fr)',
        }}
        gap={6}
      >
        {stats.map((stat, index) => (
          <Box
            key={index}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
          >
            <HStack spacing={4}>
              <Icon as={stat.icon} boxSize={6} color={stat.color} />
              <Stack spacing={0}>
                <Text fontSize="sm" color={mutedTextColor}>
                  {stat.label}
                </Text>
                <Text fontSize="xl" fontWeight="bold">
                  {stat.value}
                </Text>
              </Stack>
            </HStack>
          </Box>
        ))}
      </Grid>
    </Stack>
  )
}
