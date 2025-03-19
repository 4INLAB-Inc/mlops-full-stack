'use client'

import {
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  IconButton,
  Tooltip,
  HStack,
  Flex,
  Select,
  TableContainer,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiEye } from 'react-icons/fi'
import { FiRepeat } from 'react-icons/fi'
import { FiDownload } from 'react-icons/fi'
import { FiShare2 } from 'react-icons/fi'
import { FiRefreshCw } from 'react-icons/fi'

const MotionBox = motion(Box)

interface Experiment {
  id: string
  name: string
  model: string
  accuracy: number
  loss: number
  status: 'completed' | 'running' | 'failed'
  duration: string
  timestamp: string
}

const mockExperiments: Experiment[] = [
  {
    id: '1',
    name: '이미지 분류 v1',
    model: 'ResNet50',
    accuracy: 0.92,
    loss: 0.08,
    status: 'completed',
    duration: '2시간 30분',
    timestamp: '2025-02-06 09:30',
  },
  {
    id: '2',
    name: '객체 감지 테스트',
    model: 'YOLO v5',
    accuracy: 0.88,
    loss: 0.12,
    status: 'running',
    duration: '1시간 45분',
    timestamp: '2025-02-06 09:45',
  },
  {
    id: '3',
    name: '감성 분석',
    model: 'BERT',
    accuracy: 0.85,
    loss: 0.15,
    status: 'failed',
    duration: '45분',
    timestamp: '2025-02-06 09:15',
  },
  {
    id: '4',
    name: '자연어 처리',
    model: 'GPT-2',
    accuracy: 0.89,
    loss: 0.11,
    status: 'completed',
    duration: '3시간 15분',
    timestamp: '2025-02-06 08:30',
  },
]

export default function RecentExperiments() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('gray.50', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  const getStatusColor = (status: Experiment['status']) => {
    switch (status) {
      case 'completed':
        return 'green'
      case 'running':
        return 'blue'
      case 'failed':
        return 'red'
      default:
        return 'gray'
    }
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg={bgColor}
      p={6}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      height="100%"
    >
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="lg" fontWeight="semibold">
          최근 실험
        </Text>
        <HStack spacing={2}>
          <Select size="sm" maxW="150px" defaultValue="all">
            <option value="all">모든 상태</option>
            <option value="completed">완료됨</option>
            <option value="running">실행 중</option>
            <option value="failed">실패</option>
          </Select>
          <IconButton
            aria-label="새로고침"
            icon={<FiRefreshCw />}
            size="sm"
            variant="ghost"
          />
        </HStack>
      </Flex>

      <TableContainer>
        <Table size="sm" variant="simple">
          <Thead>
            <Tr bg={headerBg}>
              <Th py={4}>실험명</Th>
              <Th py={4}>모델</Th>
              <Th isNumeric py={4}>정확도</Th>
              <Th isNumeric py={4}>Loss</Th>
              <Th py={4}>상태</Th>
              <Th py={4}>소요 시간</Th>
              <Th py={4} textAlign="right">액션</Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockExperiments.map((exp) => (
              <Tr
                key={exp.id}
                _hover={{ bg: hoverBg }}
                transition="background 0.2s"
              >
                <Td py={4} maxW="200px" isTruncated>
                  <Tooltip label={exp.name} hasArrow>
                    <Text>{exp.name}</Text>
                  </Tooltip>
                </Td>
                <Td py={4}>{exp.model}</Td>
                <Td
                  isNumeric
                  py={4}
                  color={exp.accuracy >= 0.9 ? 'green.500' : 'orange.500'}
                >
                  {(exp.accuracy * 100).toFixed(1)}%
                </Td>
                <Td
                  isNumeric
                  py={4}
                  color={exp.loss <= 0.1 ? 'green.500' : 'orange.500'}
                >
                  {exp.loss.toFixed(3)}
                </Td>
                <Td py={4}>
                  <Badge colorScheme={getStatusColor(exp.status)}>
                    {exp.status}
                  </Badge>
                </Td>
                <Td py={4} fontSize="sm" color={textColor}>
                  {exp.duration}
                </Td>
                <Td py={4}>
                  <HStack spacing={1} justify="flex-end">
                    <Tooltip label="상세 보기" placement="top" hasArrow>
                      <IconButton
                        aria-label="View details"
                        icon={<FiEye />}
                        size="sm"
                        variant="ghost"
                      />
                    </Tooltip>
                    <Tooltip label="재실행" placement="top" hasArrow>
                      <IconButton
                        aria-label="Rerun experiment"
                        icon={<FiRepeat />}
                        size="sm"
                        variant="ghost"
                        isDisabled={exp.status === 'running'}
                      />
                    </Tooltip>
                    <Tooltip label="결과 다운로드" placement="top" hasArrow>
                      <IconButton
                        aria-label="Download results"
                        icon={<FiDownload />}
                        size="sm"
                        variant="ghost"
                        isDisabled={exp.status !== 'completed'}
                      />
                    </Tooltip>
                    <Tooltip label="공유" placement="top" hasArrow>
                      <IconButton
                        aria-label="Share experiment"
                        icon={<FiShare2 />}
                        size="sm"
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </MotionBox>
  )
}
