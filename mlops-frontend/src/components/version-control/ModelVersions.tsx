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
} from '@chakra-ui/react'
import { ChevronDownIcon, DownloadIcon } from '@chakra-ui/icons'
import { FiGitBranch } from 'react-icons/fi'

interface ModelVersion {
  id: string
  version: string
  name: string
  accuracy: number
  status: 'active' | 'archived' | 'testing'
  createdAt: string
  updatedAt: string
}

// const mockModelVersions: ModelVersion[] = [
//   {
//     id: '1',
//     version: 'v1.0.0',
//     name: 'ResNet50-Base',
//     accuracy: 0.892,
//     status: 'active',
//     createdAt: '2025-02-20T10:30:00',
//     updatedAt: '2025-02-20T10:30:00',
//   },
//   {
//     id: '2',
//     version: 'v1.1.0',
//     name: 'ResNet50-Improved',
//     accuracy: 0.915,
//     status: 'testing',
//     createdAt: '2025-02-21T09:15:00',
//     updatedAt: '2025-02-21T09:15:00',
//   },
//   {
//     id: '3',
//     version: 'v0.9.0',
//     name: 'ResNet50-Beta',
//     accuracy: 0.878,
//     status: 'archived',
//     createdAt: '2025-02-19T14:20:00',
//     updatedAt: '2025-02-19T14:20:00',
//   },
// ]

export function ModelVersions() {
  const [versions, setVersions] = useState<ModelVersion[]>([])
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    // API에서 데이터 가져오기
    const fetchModelVersions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/models/`)
        const data = await response.json()

        // API에서 가져온 데이터를 ModelVersion[] 형식으로 변환
        const formattedVersions: ModelVersion[] = data.map((model: any) => ({
          id: model.id,
          version: model.version,
          name: model.name,
          accuracy: model.accuracy,
          status: model.status.toLowerCase() as 'active' | 'archived' | 'testing',
          createdAt: model.createdAt,
          updatedAt: model.updatedAt,
        }))
        // // API에서 가져온 데이터를 ModelVersion[] 형식으로 변환
        // const formattedVersions: ModelVersion[] = data.map((model: any) => {
        //   // Kiểm tra và sửa giá trị accuracy nếu không nằm trong khoảng [0, 1]
        //   if (model.accuracy <= 0 || model.accuracy > 1) {
        //     model.accuracy = Math.random() * (0.99 - 0.85) + 0.85;  // Gán giá trị ngẫu nhiên từ 0.8 đến 0.99
        //   }

        //   return {
        //     id: model.id,
        //     version: model.version,
        //     name: model.name,
        //     accuracy: model.accuracy,
        //     status: model.status.toLowerCase() as 'active' | 'archived' | 'testing',
        //     createdAt: model.createdAt,
        //     updatedAt: model.updatedAt,
        //   }
        // })

        setVersions(formattedVersions)
      } catch (error) {
        console.error('모델 버전 데이터를 가져오는 중 오류 발생:', error)
      }
    }

    fetchModelVersions()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green'
      case 'testing':
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

  return (
    <Stack spacing={4} p={4}>
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="bold">
          모델 버전 목록
        </Text>
        <Button colorScheme="blue" size="sm">
          새 버전 생성
        </Button>
      </HStack>

      <Table variant="simple" borderWidth="1px" borderColor={borderColor}>
        <Thead>
          <Tr>
            <Th>버전</Th>
            <Th>이름</Th>
            <Th isNumeric>정확도</Th>
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
              <Td isNumeric>{(version.accuracy).toFixed(1)}%</Td>
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
                    aria-label="Download model"
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
                      <MenuItem>성능 비교</MenuItem>
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
