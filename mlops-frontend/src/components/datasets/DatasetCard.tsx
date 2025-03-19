'use client'

import {
  Box,
  Card,
  CardBody,
  Text,
  Stack,
  Badge,
  HStack,
  VStack,
  Icon,
  Progress,
  Tag,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { FiDatabase, FiClock, FiGrid } from 'react-icons/fi'

interface Dataset {
  id: string
  name: string
  description: string
  type: string
  size: number
  lastModified: string
  rows: number
  columns: number
  status: string
  progress: number
  tags: string[]
  features?: { name: string; type: string; missing: number }[]
  statistics?: {
    numerical?: {
      mean: number[]
      std: number[]
      min: number[]
      max: number[]
    }
    categorical?: {
      unique: number[]
      top: string[]
      freq: number[]
    }
  }
  quality?: {
    completeness: number
    consistency: number
    balance: number
  }
}

interface DatasetCardProps {
  dataset: Dataset
  viewMode: 'grid' | 'list'
  isSelected: boolean
  onSelect: () => void
}

export function DatasetCard({ dataset, viewMode, isSelected, onSelect }: DatasetCardProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const bgCard = useColorModeValue('white', 'gray.800')
  const mutedText = useColorModeValue('gray.600', 'gray.400')
  const accentColor = '#EB6100'
  const hoverBg = useColorModeValue('orange.50', 'rgba(235, 97, 0, 0.1)')
  const selectedBg = useColorModeValue('orange.50', 'rgba(235, 97, 0, 0.2)')

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Byte'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i]
  }

  const getStatusColorScheme = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'green'
      case 'processing':
        return 'blue'
      case 'failed':
        return 'red'
      case 'pending':
        return 'yellow'
      default:
        return 'gray'
    }
  }

  const getQualityColorScheme = (metric: string, value: number) => {
    if (value >= 90) return 'green'
    if (value >= 70) return 'blue'
    if (value >= 50) return 'yellow'
    return 'red'
  }

  const getTagColorScheme = (index: number) => {
    const colors = ['purple', 'cyan', 'pink', 'teal', 'blue', 'green']
    return colors[index % colors.length]
  }

  if (viewMode === 'list') {
    return (
      <Box
        p={4}
        borderBottom="1px"
        borderColor={isSelected ? accentColor : borderColor}
        bg={isSelected ? selectedBg : 'transparent'}
        _hover={{ 
          bg: hoverBg,
          borderColor: accentColor,
          transform: 'translateY(-1px)',
          transition: 'all 0.2s'
        }}
        cursor="pointer"
        onClick={onSelect}
      >
        <HStack spacing={4} justify="space-between">
          <HStack spacing={4}>
            <Icon as={FiDatabase} boxSize={6} color={accentColor} />
            <Stack spacing={0}>
              <Text fontWeight="bold">{dataset.name}</Text>
              <Text fontSize="sm" color={mutedText}>
                {dataset.description}
              </Text>
            </Stack>
          </HStack>
          <HStack spacing={4}>
            <Stack align="end">
              <Text fontSize="sm">{formatBytes(dataset.size)}</Text>
              <Text fontSize="sm" color={mutedText}>
                {dataset.lastModified}
              </Text>
            </Stack>
            <Badge colorScheme={getStatusColorScheme(dataset.status)}>
              {dataset.status}
            </Badge>
          </HStack>
        </HStack>
      </Box>
    )
  }

  return (
    <Card
      borderColor={isSelected ? accentColor : borderColor}
      borderWidth={1}
      bg={isSelected ? selectedBg : bgCard}
      h="100%"
      _hover={{ 
        shadow: 'lg',
        borderColor: accentColor,
        transform: 'translateY(-2px)',
        transition: 'all 0.2s'
      }}
      cursor="pointer"
      onClick={onSelect}
    >
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Box
                bg={isSelected ? 'orange.100' : 'orange.50'}
                p={2}
                borderRadius="lg"
                color={accentColor}
              >
                <Icon as={FiDatabase} boxSize={5} />
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="lg">
                  {dataset.name}
                </Text>
                <Text fontSize="sm" color={mutedText}>
                  {dataset.description}
                </Text>
              </Box>
            </HStack>
            <Badge colorScheme={getStatusColorScheme(dataset.status)}>
              {dataset.status}
            </Badge>
          </HStack>

          {dataset.status === 'processing' && (
            <Box>
              <Progress
                value={dataset.progress}
                size="sm"
                colorScheme="blue"
                borderRadius="full"
              />
              <Text fontSize="sm" color={mutedText} mt={1}>
                {dataset.progress}% 완료
              </Text>
            </Box>
          )}

          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <Stat size="sm">
              <StatLabel color={mutedText}>데이터 크기</StatLabel>
              <StatNumber fontSize="md">{formatBytes(dataset.size)}</StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel color={mutedText}>레코드 수</StatLabel>
              <StatNumber fontSize="md">
                {dataset.rows.toLocaleString()}
              </StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel color={mutedText}>컬럼 수</StatLabel>
              <StatNumber fontSize="md">{dataset.columns}</StatNumber>
            </Stat>
            <Stat size="sm">
              <StatLabel color={mutedText}>마지막 수정</StatLabel>
              <StatNumber fontSize="md">{dataset.lastModified}</StatNumber>
            </Stat>
          </Grid>

          {dataset.quality && (
            <HStack spacing={2}>
              <Tag 
                size="sm" 
                variant="subtle" 
                colorScheme={getQualityColorScheme('completeness', dataset.quality.completeness)}
              >
                완성도 {dataset.quality.completeness}%
              </Tag>
              <Tag 
                size="sm" 
                variant="subtle" 
                colorScheme={getQualityColorScheme('consistency', dataset.quality.consistency)}
              >
                일관성 {dataset.quality.consistency}%
              </Tag>
              <Tag 
                size="sm" 
                variant="subtle" 
                colorScheme={getQualityColorScheme('balance', dataset.quality.balance)}
              >
                균형도 {dataset.quality.balance}%
              </Tag>
            </HStack>
          )}

          <HStack spacing={2} flexWrap="wrap">
            <Tag size="sm" colorScheme="orange">
              {dataset.type}
            </Tag>
            {dataset.tags.map((tag, index) => (
              <Tag 
                key={tag} 
                size="sm" 
                variant="subtle"
                colorScheme={getTagColorScheme(index)}
              >
                {tag}
              </Tag>
            ))}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}
