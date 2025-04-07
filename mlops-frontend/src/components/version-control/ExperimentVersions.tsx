'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Stack,
  HStack,
  Text,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
  Tooltip,
  Tag,
} from '@chakra-ui/react'
import { ChevronDownIcon, CopyIcon } from '@chakra-ui/icons'
import { FiGitBranch } from 'react-icons/fi'

interface ExperimentVersion {
  id: string
  version: string
  name: string
  framework: string
  metrics: {
    accuracy: number
    loss: number
  }
  hyperparameters: {
    learningRate: number
    batchSize: number
    epochs: number
  }
  status: 'completed' | 'running' | 'failed'
  createdAt: string
  updatedAt: string
}

// const mockExperimentVersions: ExperimentVersion[] = [
//   {
//     id: '1',
//     version: 'v1.0.0',
//     name: 'Base Configuration',
//     framework: 'PyTorch',
//     metrics: {
//       accuracy: 0.892,
//       loss: 0.245,
//     },
//     hyperparameters: {
//       learningRate: 0.001,
//       batchSize: 32,
//       epochs: 100,
//     },
//     status: 'completed',
//     createdAt: '2025-02-20T10:30:00',
//     updatedAt: '2025-02-20T10:30:00',
//   },
//   {
//     id: '2',
//     version: 'v1.1.0',
//     name: 'Optimized Configuration',
//     framework: 'PyTorch',
//     metrics: {
//       accuracy: 0.915,
//       loss: 0.198,
//     },
//     hyperparameters: {
//       learningRate: 0.0005,
//       batchSize: 64,
//       epochs: 150,
//     },
//     status: 'running',
//     createdAt: '2025-02-21T09:15:00',
//     updatedAt: '2025-02-21T09:15:00',
//   },
//   {
//     id: '3',
//     version: 'v0.9.0',
//     name: 'Failed Configuration',
//     framework: 'PyTorch',
//     metrics: {
//       accuracy: 0,
//       loss: 0,
//     },
//     hyperparameters: {
//       learningRate: 0.01,
//       batchSize: 16,
//       epochs: 50,
//     },
//     status: 'failed',
//     createdAt: '2025-02-19T14:20:00',
//     updatedAt: '2025-02-19T14:20:00',
//   },
// ]

export function ExperimentVersions() {
  const [versions, setVersions] = useState<ExperimentVersion[]>([])
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    // 실제 환경에서는 API 호출로 대체
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/experiments/`)
        if (!response.ok) {
          throw new Error('실험 데이터를 불러오는 데 실패했습니다.')
        }
        const data = await response.json()

        // 🛠 데이터를 객체에서 배열로 변환
        const datasetArray = data.map((item: any) => ({
          id: item.id,
          version: item.version, // 또는 id가 없는 경우 필요에 따라 설정
          name: item.name,
          framework: item.framework,
          metrics: {
            accuracy: item.metrics.accuracy,
            loss: item.metrics.loss,
          },
          hyperparameters: {
            learningRate: item.hyperparameters.learningRate,
            batchSize: item.hyperparameters.batchSize,
            epochs: item.hyperparameters.epochs,
          },
          status: item.status === 'FINISHED' ? 'completed' : 'running',
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }))
        // // 🛠 데이터를 객체에서 배열로 변환
        // const datasetArray = data.map((item: any) => {
        //   // Nếu accuracy không trong khoảng [0, 1], gán giá trị ngẫu nhiên trong [0.8, 0.99]
        //   if (item.metrics.accuracy <= 0 || item.metrics.accuracy > 1) {
        //     item.metrics.accuracy = Math.random() * (0.99 - 0.85) + 0.85;
        //   }

        //   // Nếu loss không trong khoảng [0, 1], gán giá trị ngẫu nhiên trong [0.001, 0.02]
        //   if (item.metrics.loss <= 0 || item.metrics.loss >= 1) {
        //     item.metrics.loss = (Math.random() * (0.02 - 0.001) + 0.001).toFixed(4);  // Random giữa 0.001 và 0.02
        //     const randomLoss = Math.random() * (0.02 - 0.001) + 0.001;
        //     item.metrics.loss = randomLoss;  // Sửa giá trị loss với giá trị ngẫu nhiên
        //     item.metrics.loss = parseFloat(randomLoss.toFixed(4));  // Định dạng với 4 chữ số sau dấu thập phân
        //   }

        //   return {
        //     id: item.id,
        //     version: item.version, // hoặc id가 없는 경우 필요에 따라 설정
        //     name: item.name,
        //     framework: item.framework,
        //     metrics: {
        //       accuracy: item.metrics.accuracy,
        //       loss: item.metrics.loss,
        //     },
        //     hyperparameters: {
        //       learningRate: item.hyperparameters.learningRate,
        //       batchSize: item.hyperparameters.batchSize,
        //       epochs: item.hyperparameters.epochs,
        //     },
        //     status: item.status === 'FINISHED' ? 'completed' : 'running',
        //     createdAt: item.createdAt,
        //     updatedAt: item.updatedAt,
        //   }
        // })

        // 상태 업데이트
        setVersions(datasetArray)
      } catch (error) {
        console.error('데이터셋 정보를 불러오는 중 오류 발생:', error)
      }
    }

    fetchData()
  }, [])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Stack spacing={4} p={4}>
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="bold">
          실험 구성 버전 목록
        </Text>
        <Button colorScheme="blue" size="sm">
          새 실험 구성
        </Button>
      </HStack>

      <Table variant="simple" borderWidth="1px" borderColor={borderColor}>
        <Thead>
          <Tr>
            <Th>버전</Th>
            <Th>이름</Th>
            <Th>프레임워크</Th>
            <Th>하이퍼파라미터</Th>
            <Th>메트릭스</Th>
            <Th>상태</Th>
            <Th>생성일</Th>
            <Th>수정일</Th>
            <Th>작업</Th>
          </Tr>
        </Thead>
        <Tbody>
          {versions.map((version) => (
            <Tr key={version.id}>
              <Td fontFamily="mono">{version.version}</Td>
              <Td>{version.name}</Td>
              <Td>{version.framework}</Td>
              <Td>
                <HStack spacing={2}>
                  <Tooltip label={`Learning Rate: ${version.hyperparameters.learningRate}`}>
                    <Tag size="sm">lr: {version.hyperparameters.learningRate}</Tag>
                  </Tooltip>
                  <Tooltip label={`Batch Size: ${version.hyperparameters.batchSize}`}>
                    <Tag size="sm">bs: {version.hyperparameters.batchSize}</Tag>
                  </Tooltip>
                  <Tooltip label={`Epochs: ${version.hyperparameters.epochs}`}>
                    <Tag size="sm">epochs: {version.hyperparameters.epochs}</Tag>
                  </Tooltip>
                </HStack>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <Tooltip label="Accuracy">
                    <Tag size="sm" colorScheme="green">
                      acc: {(version.metrics.accuracy).toFixed(1)}%
                    </Tag>
                  </Tooltip>
                  <Tooltip label="Loss">
                    <Tag size="sm" colorScheme="red">
                      loss: {version.metrics.loss.toFixed(3)}
                    </Tag>
                  </Tooltip>
                </HStack>
              </Td>
              <Td>
                <Badge colorScheme={getStatusColor(version.status)}>
                  {version.status}
                </Badge>
              </Td>
              <Td>{formatDate(version.createdAt)}</Td>
              <Td>{formatDate(version.updatedAt)}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Duplicate experiment"
                    icon={<CopyIcon />}
                    size="sm"
                    variant="ghost"
                  />
                  <IconButton
                    aria-label="Create branch"
                    icon={<FiGitBranch />}
                    size="sm"
                    variant="ghost"
                  />
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="More options"
                      icon={<ChevronDownIcon />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem>상세 정보</MenuItem>
                      <MenuItem>실험 실행</MenuItem>
                      <MenuItem>비교 분석</MenuItem>
                      <MenuItem color="red.500">삭제</MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Stack>
  )
}
