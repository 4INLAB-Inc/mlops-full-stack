'use client'

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Icon,
  Tooltip,
  HStack,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { FiDatabase, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'

const datasets = [
  {
    name: '이미지넷 2024',
    type: 'images',
    size: '1.2TB',
    samples: '1.4M',
    lastSync: '10분 전',
    quality: 'high',
  },
  {
    name: '한국어 말뭉치 v3',
    type: 'text',
    size: '450GB',
    samples: '890K',
    lastSync: '1시간 전',
    quality: 'warning',
  },
  {
    name: '센서 데이터 2024-Q1',
    type: 'tabular',
    size: '250GB',
    samples: '2.1M',
    lastSync: '30분 전',
    quality: 'high',
  }
]

const getQualityColor = (quality: string) => {
  switch (quality) {
    case 'high':
      return 'green'
    case 'warning':
      return 'orange'
    case 'low':
      return 'red'
    default:
      return 'gray'
  }
}

const getQualityIcon = (quality: string) => {
  switch (quality) {
    case 'high':
      return FiCheckCircle
    case 'warning':
    case 'low':
      return FiAlertTriangle
    default:
      return FiDatabase
  }
}

export default function DatasetMonitor() {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>데이터셋</Th>
            <Th>유형</Th>
            <Th>크기</Th>
            <Th>샘플 수</Th>
            <Th>데이터 품질</Th>
            <Th>마지막 동기화</Th>
          </Tr>
        </Thead>
        <Tbody>
          {datasets.map((dataset, index) => (
            <Tr
              key={index}
              _hover={{ bg: hoverBg }}
              cursor="pointer"
              transition="background-color 0.2s"
            >
              <Td>
                <HStack>
                  <Icon as={FiDatabase} color="#EB6100" />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">{dataset.name}</Text>
                  </VStack>
                </HStack>
              </Td>
              <Td>
                <Badge colorScheme="purple">{dataset.type}</Badge>
              </Td>
              <Td>{dataset.size}</Td>
              <Td>{dataset.samples}</Td>
              <Td>
                <HStack>
                  <Icon
                    as={getQualityIcon(dataset.quality)}
                    color={`${getQualityColor(dataset.quality)}.500`}
                  />
                  <Badge colorScheme={getQualityColor(dataset.quality)}>
                    {dataset.quality}
                  </Badge>
                </HStack>
              </Td>
              <Td color="gray.500">{dataset.lastSync}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}
