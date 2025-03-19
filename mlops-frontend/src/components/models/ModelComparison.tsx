'use client'

import { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  useColorModeValue,
  Badge,
  HStack,
  Icon,
  Progress,
  Tooltip,
} from '@chakra-ui/react'
import { FiTrendingUp, FiCheck, FiAlertTriangle } from 'react-icons/fi'

interface Model {
  id: string
  name: string
  version: string
  framework: string
  task: string
  status: string
  accuracy: number
  f1Score: number
  precision: number
  recall: number
  createdAt: string
  updatedAt: string
  author: string
}

interface ModelComparisonProps {
  models: Model[]
  onClose: () => void
}

export function ModelComparison({ models = [], onClose }: ModelComparisonProps) {
  const [selectedModels, setSelectedModels] = useState<string[]>(
    models?.length > 0 ? [models[0].id] : []
  )
  const brandColor = '#EB6100'
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const mutedText = useColorModeValue('gray.600', 'gray.400')
  const headerBg = useColorModeValue('gray.50', 'gray.700')

  const handleModelSelect = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId)
      }
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, modelId]
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'deployed':
        return 'green'
      case 'training':
        return 'blue'
      case 'failed':
        return 'red'
      case 'archived':
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

  const getBestMetric = (metric: keyof Pick<Model, 'accuracy' | 'f1Score' | 'precision' | 'recall'>) => {
    return Math.max(...models.map(model => model[metric]))
  }

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      borderWidth={1}
      borderColor={borderColor}
      overflow="hidden"
    >
      <Box p={4} borderBottomWidth={1} borderColor={borderColor} bg={headerBg}>
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Icon as={FiTrendingUp} color={brandColor} boxSize={5} />
            <Text fontWeight="bold" fontSize="lg">모델 성능 비교</Text>
          </HStack>
          <Text fontSize="sm" color={mutedText}>
            최대 3개 모델 선택 가능
          </Text>
        </Flex>
      </Box>

      <Box p={4} overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>모델</Th>
              <Th>버전</Th>
              <Th>상태</Th>
              <Th isNumeric>정확도</Th>
              <Th isNumeric>F1 Score</Th>
              <Th isNumeric>정밀도</Th>
              <Th isNumeric>재현율</Th>
              <Th>작성자</Th>
              <Th>수정일</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(models || []).map(model => {
              const isSelected = selectedModels.includes(model.id)
              const isDisabled = !isSelected && selectedModels.length >= 3

              return (
                <Tr
                  key={model.id}
                  bg={isSelected ? `rgba(235, 97, 0, 0.05)` : 'transparent'}
                  _hover={{ bg: isDisabled ? 'transparent' : `rgba(235, 97, 0, 0.02)` }}
                  cursor={isDisabled ? 'not-allowed' : 'pointer'}
                  opacity={isDisabled ? 0.5 : 1}
                >
                  <Td>
                    <HStack>
                      <Checkbox
                        isChecked={isSelected}
                        onChange={() => handleModelSelect(model.id)}
                        colorScheme="orange"
                        isDisabled={isDisabled}
                      />
                      <Text fontWeight={isSelected ? 'bold' : 'normal'}>
                        {model.name}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>{model.version}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(model.status)}>
                      {model.status}
                    </Badge>
                  </Td>
                  <Td isNumeric>
                    <Tooltip 
                      label={model.accuracy === getBestMetric('accuracy') ? '최고 성능' : ''} 
                      isDisabled={model.accuracy !== getBestMetric('accuracy')}
                    >
                      <Text 
                        color={`${getMetricColor(model.accuracy)}.500`}
                        fontWeight={model.accuracy === getBestMetric('accuracy') ? 'bold' : 'normal'}
                      >
                        {formatMetric(model.accuracy)}
                      </Text>
                    </Tooltip>
                  </Td>
                  <Td isNumeric>
                    <Tooltip 
                      label={model.f1Score === getBestMetric('f1Score') ? '최고 성능' : ''} 
                      isDisabled={model.f1Score !== getBestMetric('f1Score')}
                    >
                      <Text 
                        color={`${getMetricColor(model.f1Score)}.500`}
                        fontWeight={model.f1Score === getBestMetric('f1Score') ? 'bold' : 'normal'}
                      >
                        {formatMetric(model.f1Score)}
                      </Text>
                    </Tooltip>
                  </Td>
                  <Td isNumeric>
                    <Tooltip 
                      label={model.precision === getBestMetric('precision') ? '최고 성능' : ''} 
                      isDisabled={model.precision !== getBestMetric('precision')}
                    >
                      <Text 
                        color={`${getMetricColor(model.precision)}.500`}
                        fontWeight={model.precision === getBestMetric('precision') ? 'bold' : 'normal'}
                      >
                        {formatMetric(model.precision)}
                      </Text>
                    </Tooltip>
                  </Td>
                  <Td isNumeric>
                    <Tooltip 
                      label={model.recall === getBestMetric('recall') ? '최고 성능' : ''} 
                      isDisabled={model.recall !== getBestMetric('recall')}
                    >
                      <Text 
                        color={`${getMetricColor(model.recall)}.500`}
                        fontWeight={model.recall === getBestMetric('recall') ? 'bold' : 'normal'}
                      >
                        {formatMetric(model.recall)}
                      </Text>
                    </Tooltip>
                  </Td>
                  <Td>{model.author}</Td>
                  <Td>{model.updatedAt}</Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}
