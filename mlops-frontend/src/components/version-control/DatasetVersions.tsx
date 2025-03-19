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
  Progress,
} from '@chakra-ui/react'
import { ChevronDownIcon, DownloadIcon } from '@chakra-ui/icons'
import { FiGitBranch } from 'react-icons/fi'

interface DatasetVersion {
  id: string
  version: string
  name: string
  records: number
  qualityScore: number
  status: 'active' | 'archived' | 'processing' | 'completed'
  createdAt: string
  updatedAt: string
}

// const mockDatasetVersions: DatasetVersion[] = [
//   {
//     id: '1',
//     version: 'v1.0.0',
//     name: 'Training Dataset',
//     records: 50000,
//     qualityScore: 0.95,
//     status: 'active',
//     createdAt: '2025-02-20T10:30:00',
//     updatedAt: '2025-02-20T10:30:00',
//   },
//   {
//     id: '2',
//     version: 'v1.1.0',
//     name: 'Enhanced Dataset',
//     records: 75000,
//     qualityScore: 0.98,
//     status: 'processing',
//     createdAt: '2025-02-21T09:15:00',
//     updatedAt: '2025-02-21T09:15:00',
//   },
//   {
//     id: '3',
//     version: 'v0.9.0',
//     name: 'Beta Dataset',
//     records: 25000,
//     qualityScore: 0.92,
//     status: 'archived',
//     createdAt: '2025-02-19T14:20:00',
//     updatedAt: '2025-02-19T14:20:00',
//   },
// ]

export function DatasetVersions() {
  const [versions, setVersions] = useState<DatasetVersion[]>([])
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    // 📡 API에서 데이터셋 정보를 가져옴
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/datasets/`)
        if (!response.ok) {
          throw new Error('데이터를 가져오는 데 실패했습니다.')
        }
        const data = await response.json()

        // 🛠 데이터를 객체에서 배열로 변환
        const datasetArray = Object.values(data).map((item: any) => ({
          id: item.id,
          version: item.version,
          name: item.name,
          records: item.records,
          qualityScore: item.qualityScore,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }))

        // 📌 상태 업데이트
        setVersions(datasetArray)
      } catch (error) {
        console.error('데이터셋 정보를 불러오는 중 오류 발생:', error)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green'
      case 'processing':
        return 'blue'
      case 'archived':
        return 'gray'
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num)
  }

  return (
    <Stack spacing={4} p={4}>
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="bold">
          데이터셋 버전 목록
        </Text>
        <Button colorScheme="blue" size="sm">
          새 버전 업로드
        </Button>
      </HStack>

      <Table variant="simple" borderWidth="1px" borderColor={borderColor}>
        <Thead>
          <Tr>
            <Th>버전</Th>
            <Th>이름</Th>
            <Th isNumeric>레코드 수</Th>
            <Th>데이터 품질</Th>
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
              <Td isNumeric>{formatNumber(version.records)}</Td>
              <Td>
                <HStack spacing={2}>
                  <Progress
                    value={version.qualityScore}
                    size="sm"
                    width="100px"
                    colorScheme={version.qualityScore >= 0.95 ? 'green' : 'orange'}
                  />
                  <Text>{(version.qualityScore).toFixed(1)}%</Text>
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
                    aria-label="Download dataset"
                    icon={<DownloadIcon />}
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
                      <MenuItem>데이터 분석</MenuItem>
                      <MenuItem>아카이브</MenuItem>
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
