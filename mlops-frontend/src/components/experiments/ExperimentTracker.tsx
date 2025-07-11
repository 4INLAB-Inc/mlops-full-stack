'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  Text,
  HStack,
  Icon,
  Tooltip,
  Spinner,
} from '@chakra-ui/react'
import { FiClock, FiCheck, FiX } from 'react-icons/fi'

// 실험 상태에 따른 배지 색상 설정
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
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

// 더미 데이터 - 실제로는 API에서 가져올 데이터
// const experiments = [
//   {
//     id: 'exp_001',
//     name: 'Image Classification v1',
//     model: 'ResNet50',
//     status: 'Completed',
//     accuracy: '89.5%',
//     loss: '0.234',
//     runtime: '2h 15m',
//     timestamp: '2024-02-20 14:30'
//   },
//   {
//     id: 'exp_002',
//     name: 'Text Classification v2',
//     model: 'BERT-base',
//     status: 'Running',
//     accuracy: '87.2%',
//     loss: '0.312',
//     runtime: '1h 45m', //need to add
//     timestamp: '2024-02-20 16:45' //need to add
//   },
//   {
//     id: 'exp_003',
//     name: 'Object Detection v1',
//     model: 'YOLO v5',
//     status: 'Failed',
//     accuracy: '-',
//     loss: '-',
//     runtime: '0h 25m',
//     timestamp: '2024-02-20 17:30'
//   },
//   {
//     id: 'exp_004',
//     name: 'Sentiment Analysis v1',
//     model: 'KoBERT',
//     status: 'Completed',
//     accuracy: '91.2%',
//     loss: '0.189',
//     runtime: '3h 30m',
//     timestamp: '2024-02-20 18:15'
//   },
// ]
interface MetricsHistory {
  trainAcc: number[];
  valAcc: number[];
  trainLoss: number[];
  valLoss: number[];
}

interface Hyperparameters {
  learningRate: number;
  batchSize: number;
  epochs: number;
}

interface Experiment {
  id: string;
  name: string;
  status: string;
  dataset: string;
  model: string;
  version: string;
  framework: string;
  metrics: {
    accuracy: number;
    loss: number;
  };
  metrics_history: MetricsHistory;
  hyperparameters: Hyperparameters;
  startTime: string[];
  endTime: string[];
  createdAt: string[];
  updatedAt: string;
  runtime: string;
  timestamp: string;
  description: string;
}


const ExperimentTracker = () => {

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('gray.50', 'gray.700')
  const rowHoverBg = useColorModeValue('gray.50', 'gray.700')
  

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/experiments/`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setExperiments(data);

      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message); // Now we can safely access error.message
        } else {
          setError('An unknown error occurred'); // Fallback if the error is not an instance of Error
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  // useEffect(() => {
  //   axios.get(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/experiments`)  // API call using environment variable
  //     .then((response) => {
  //       // Get the experiments data
  //       const updatedExperiments = response.data.map((experiment) => {
  //         // Check and modify accuracy if it's not in the range [0, 1]
  //         if (experiment.metrics.accuracy < 0 || experiment.metrics.accuracy > 1 && typeof experiment.metrics.accuracy === 'number') {
  //           // Generate a random accuracy value between 0.85 and 0.99, and ensure it's a valid number
  //           experiment.metrics.accuracy = parseFloat((Math.random() * (0.99 - 0.85) + 0.85).toFixed(4));  // Random between 0.85 and 0.99
  //         } else {
  //           // Ensure accuracy is a valid number
  //           experiment.metrics.accuracy = 0;
  //         }
  
  //         // Check and modify loss if it's greater than 1
  //         if (experiment.metrics.loss > 1) {
  //           // Generate a random loss value between 0.001 and 0.02, and ensure it's a valid number
  //           const randomLoss = Math.random() * (0.02 - 0.001) + 0.001;
  //           experiment.metrics.loss = parseFloat(randomLoss.toFixed(4));  // Format the loss to 4 decimal places
  //         }
  
  //         return experiment;
  //       });
  
  //       setExperiments(updatedExperiments);  // Store modified experiments data in state
  //       setLoading(false);  // Update the loading state to false when data fetching is complete
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching experiments:', error);
  //       setLoading(false);  // Update the loading state even if there is an error
  //     });
  // }, []);

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
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
    >
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead bg={headerBg}>
            <Tr>
              <Th>실험 ID</Th>
              <Th>실험명</Th>
              <Th>모델</Th>
              <Th>상태</Th>
              <Th>정확도</Th>
              <Th>Loss</Th>
              <Th>실행 시간</Th>
              <Th>타임스탬프</Th>
            </Tr>
          </Thead>
          <Tbody>
            {experiments.map((exp) => (
              <Tr
                key={exp.id}
                _hover={{ bg: rowHoverBg }}
                cursor="pointer"
                transition="background-color 0.2s"
              >
                <Td fontSize="sm">{exp.id}</Td>
                <Td fontSize="sm">
                  <Text fontWeight="medium">{exp.name}</Text>
                </Td>
                <Td fontSize="sm">{exp.model}</Td>
                <Td>
                  <Badge
                    colorScheme={getStatusColor(exp.status)}
                    borderRadius="full"
                    px={2}
                    py={1}
                  >
                    <HStack spacing={1}>
                      <Icon
                        as={
                          exp.status === 'Completed'
                            ? FiCheck
                            : exp.status === 'Running'
                            ? FiClock
                            : FiX
                        }
                        boxSize={3}
                      />
                      <Text fontSize="xs">{exp.status}</Text>
                    </HStack>
                  </Badge>
                </Td>
                <Td fontSize="sm">
                  {exp.metrics && exp.metrics.accuracy !== undefined
                    ? `${exp.metrics.accuracy.toFixed(1)}%`
                    : 'N/A'}
                </Td>
                <Td fontSize="sm">
                  {exp.metrics && exp.metrics.loss !== undefined
                    ? `${exp.metrics.loss.toFixed(5)}`
                    : 'N/A'}
                </Td>
                <Td fontSize="sm">
                  <Tooltip label="Total runtime" placement="top">
                    <Text>{exp.runtime}</Text>
                  </Tooltip>
                </Td>
                <Td fontSize="sm">{exp.timestamp}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}

export default ExperimentTracker
