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
  Spinner,
} from '@chakra-ui/react';
import { FiCheck, FiClock, FiXCircle } from 'react-icons/fi';

// Định nghĩa kiểu cho phần tử trong experiments
interface Metrics {
  accuracy: number;
  loss: number;
}

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
  metrics: Metrics;
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

export default function ExperimentTracker() {
  const [experiments, setExperiments] = useState<Experiment[]>([]); // Đảm bảo kiểu dữ liệu là Experiment[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const accentColor = '#EB6100';

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/experiments/`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setExperiments(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred.');
        }
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
            <Th>Experiment ID</Th>
            <Th>Name</Th>
            <Th>Status</Th>
            <Th>Accuracy</Th>
            <Th>Runtime</Th>
            <Th>Timestamp</Th>
            <Th>Description</Th>
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
              <Td>{exp.id}</Td>
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
                <Progress
                  value={exp.metrics.accuracy}
                  size="sm"
                  width="100px"
                  borderRadius="full"
                  colorScheme="orange"
                />
                <Text>{exp.metrics.accuracy}%</Text>
              </Td>
              <Td>{exp.runtime}</Td>
              <Td color="gray.500">{exp.timestamp}</Td>
              <Td>{exp.description}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'green';
    case 'running':
      return 'blue';
    case 'failed':
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return FiCheck;
    case 'running':
      return FiClock;
    case 'failed':
      return FiXCircle;
    default:
      return FiCheck;
  }
};
