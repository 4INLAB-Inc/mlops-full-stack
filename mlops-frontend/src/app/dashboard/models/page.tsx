'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  Box,
  Button,
  Card,
  CardBody,
  Grid,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiGrid, FiList, FiSearch, FiServer, FiZap } from 'react-icons/fi'
import { ModelCard } from '@/components/models/ModelCard'
import { CreateModelModal } from '@/components/models/CreateModelModal'
import Link from 'next/link'

export default function ModelsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')  // 모델 뷰 모드 (그리드 또는 리스트)
  const [searchQuery, setSearchQuery] = useState('')  // 검색어 상태 관리
  const [statusFilter, setStatusFilter] = useState('all')  // 상태 필터 상태 관리
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)  // 모델 생성 모달 상태 관리
  const [models, setModels] = useState<any[]>([])  // API에서 받은 모델 데이터를 저장
  const [loading, setLoading] = useState<boolean>(true)  // 데이터 로딩 상태

  const bgCard = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // 상태에 따른 색상 반환 함수
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'green'
      case 'training':
        return 'blue'
      case 'failed':
        return 'red'
      default:
        return 'gray'
    }
  }

  // 상태 및 헬스 아이콘 반환 함수
  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return { icon: FiZap, color: 'green.500' }
      case 'warning':
        return { icon: FiZap, color: 'yellow.500' }
      case 'error':
        return { icon: FiZap, color: 'red.500' }
      default:
        return { icon: FiServer, color: 'gray.500' }
    }
  }

  // API에서 모델 데이터를 가져오기
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/models`)
      .then((response) => {
        setModels(response.data)  // API에서 받은 데이터 모델을 상태에 저장
        setLoading(false)  // 데이터 로딩 완료
      })
      .catch((error) => {
        console.error('API에서 모델 데이터를 가져오는 중 오류 발생:', error)  // 오류 처리
        setLoading(false)  // 오류 발생 시 로딩 상태 종료
      })
  }, [])

  // 필터링된 모델 목록
  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase())  // 검색어와 일치하는 모델 찾기
    const matchesStatus = statusFilter === 'all' || model.servingStatus.health === statusFilter  // 상태 필터 적용
    return matchesSearch && matchesStatus  // 두 조건을 만족하는 모델 반환
  })

  return (
    <Box as="main" pt="80px" px="4" maxW="100%">
      <Stack spacing={6} mt="-70px">
        {/* ✅ 헤더 */}
        <HStack justify="space-between">
          <Stack>
            <Text fontSize="2xl" fontWeight="bold">모델 관리</Text>
            <Text color="gray.500">학습된 모델을 관리하고 배포 상태를 모니터링하세요</Text>
          </Stack>
          <Button colorScheme="orange" onClick={() => setIsCreateModalOpen(true)}>
            새 모델 등록
          </Button>
        </HStack>

        {/* 검색 및 필터 */}
        <HStack spacing={4}>
          <InputGroup maxW="320px">
            <InputLeftElement>
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="모델 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}  // 검색어 입력 시 상태 업데이트
            />
          </InputGroup>
          <Select
            maxW="200px"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}  // 상태 필터 상태 업데이트
          >
            <option value="all">모든 상태</option>
            <option value="healthy">정상</option>
            <option value="warning">주의</option>
            <option value="error">오류</option>
            <option value="none">미배포</option>
          </Select>
          <HStack spacing={2}>
            <IconButton
              aria-label="Grid view"
              icon={<Icon as={FiGrid} />}
              variant={viewMode === 'grid' ? 'solid' : 'ghost'}
              colorScheme={viewMode === 'grid' ? 'brand' : 'gray'}
              onClick={() => setViewMode('grid')}  // 그리드 뷰로 전환
            />
            <IconButton
              aria-label="List view"
              icon={<Icon as={FiList} />}
              variant={viewMode === 'list' ? 'solid' : 'ghost'}
              colorScheme={viewMode === 'list' ? 'brand' : 'gray'}
              onClick={() => setViewMode('list')}  // 리스트 뷰로 전환
            />
          </HStack>
        </HStack>

        {/* 모델 목록 */}
        {loading ? (
          <Text>Loading...</Text>  // 데이터 로딩 중일 때 "Loading..." 표시
        ) : viewMode === 'grid' ? (
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={6}
          >
            {filteredModels.map(model => (
              <Link key={model.id} href={`/dashboard/models/${model.id}`}>
                <ModelCard
                  model={model}
                  viewMode="grid"
                  onViewDetails={() => {}}
                />
              </Link>
            ))}
          </Grid>
        ) : (
          <Card bg={bgCard} borderColor={borderColor} borderWidth={1}>
            <CardBody>
              <Stack spacing={4}>
                {filteredModels.map(model => (
                  <Link key={model.id} href={`/dashboard/models/${model.id}`}>
                    <ModelCard
                      model={model}
                      viewMode="list"
                      onViewDetails={() => {}}
                    />
                  </Link>
                ))}
              </Stack>
            </CardBody>
          </Card>
        )}
      </Stack>

      {/* 모델 생성 모달 */}
      <CreateModelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}  // 모델 생성 모달 닫기
      />
    </Box>
  )
}
