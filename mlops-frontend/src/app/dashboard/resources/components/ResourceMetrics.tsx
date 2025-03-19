'use client'

import {
  Box,
  Grid,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

interface ResourceMetricsProps {
  name: string
  workers: {
    total: number
    utilization: number
  }
  gpus: {
    total: number
    utilization: number
  }
  cpus: {
    total: number
    utilization: number
  }
}

export function ResourceMetrics({ name, workers, gpus, cpus }: ResourceMetricsProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <MotionBox
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      p={4}
      shadow="sm"
    >
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        {name}
      </Text>
      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
        <Stat>
          <StatLabel>워커</StatLabel>
          <StatNumber>{workers.total}</StatNumber>
          <StatHelpText>사용률</StatHelpText>
          <Progress
            value={workers.utilization}
            size="sm"
            colorScheme={workers.utilization > 80 ? 'red' : 'blue'}
            borderRadius="full"
          />
        </Stat>
        <Stat>
          <StatLabel>GPU</StatLabel>
          <StatNumber>{gpus.total}</StatNumber>
          <StatHelpText>사용률</StatHelpText>
          <Progress
            value={gpus.utilization}
            size="sm"
            colorScheme={gpus.utilization > 80 ? 'red' : 'green'}
            borderRadius="full"
          />
        </Stat>
        <Stat>
          <StatLabel>CPU</StatLabel>
          <StatNumber>{cpus.total}</StatNumber>
          <StatHelpText>사용률</StatHelpText>
          <Progress
            value={cpus.utilization}
            size="sm"
            colorScheme={cpus.utilization > 80 ? 'red' : 'orange'}
            borderRadius="full"
          />
        </Stat>
      </Grid>
    </MotionBox>
  )
}
