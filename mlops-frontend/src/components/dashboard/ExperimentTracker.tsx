'use client'
import React, { useState, useEffect } from 'react';

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
} from '@chakra-ui/react'
import { FiCheck, FiClock, FiXCircle } from 'react-icons/fi'

const experiments = [
  {
    id: 'EXP-001',
    name: 'ResNet-50 하이퍼파라미터 최적화',
    status: 'completed',
    accuracy: 95.2,
    runtime: '2h 15m',
    timestamp: '1시간 전'
  },
  {
    id: 'EXP-002',
    name: 'BERT 파인튜닝 v2',
    status: 'running',
    accuracy: 88.7,
    runtime: '45m',
    timestamp: '진행 중'
  },
  {
    id: 'EXP-003',
    name: 'YOLOv8 데이터 증강 테스트',
    status: 'failed',
    accuracy: 0,
    runtime: '10m',
    timestamp: '30분 전'
  }
]

const getStatusColor = (status: string) => {
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return FiCheck
    case 'running':
      return FiClock
    case 'failed':
      return FiXCircle
    default:
      return FiCheck
  }
}

export default function ExperimentTracker() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const accentColor = '#EB6100'

  useEffect(() => {
      const fetchExperiments = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/experiments/`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setExperiments(data);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchExperiments();
    }, []);
  
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Spinner size="xl" />
        </Box>
      );
    }
  
    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Text color="red.500">Error: {error}</Text>
        </Box>
      );
    }

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>실험 ID</Th>
            <Th>이름</Th>
            <Th>상태</Th>
            <Th>정확도</Th>
            <Th>실행 시간</Th>
            <Th>타임스탬프</Th>
          </Tr>
        </Thead>
        <Tbody>
          {experiments.map((exp) => (
            <Tr
              key={exp.id}
              _hover={{ bg: hoverBg }}
              cursor="pointer"
              transition="background-color 0.2s"
            >
              <Td fontFamily="mono">{exp.id}</Td>
              <Td maxW="300px" isTruncated>
                <Tooltip label={exp.name}>
                  <Text>{exp.name}</Text>
                </Tooltip>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <Icon
                    as={getStatusIcon(exp.status)}
                    color={`${getStatusColor(exp.status)}.500`}
                  />
                  <Badge colorScheme={getStatusColor(exp.status)}>
                    {exp.status}
                  </Badge>
                </HStack>
              </Td>
              <Td>
                {exp.accuracy > 0 ? (
                  <HStack spacing={2}>
                    <Progress
                      value={exp.accuracy}
                      size="sm"
                      width="100px"
                      borderRadius="full"
                      colorScheme="orange"
                    />
                    <Text>{exp.accuracy}%</Text>
                  </HStack>
                ) : (
                  '-'
                )}
              </Td>
              <Td>{exp.runtime}</Td>
              <Td color="gray.500">{exp.timestamp}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}
