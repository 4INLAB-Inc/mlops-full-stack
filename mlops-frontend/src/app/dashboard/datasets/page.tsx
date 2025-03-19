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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { FiGrid, FiList, FiSearch, FiPlus } from 'react-icons/fi'
import { DatasetCard } from '@/components/datasets/DatasetCard'
import { DatasetUploadModal } from '@/components/datasets/DatasetUploadModal'
import Link from 'next/link'

export default function DatasetsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')  // 데이터셋 뷰 모드 (그리드 또는 리스트)
  const [searchQuery, setSearchQuery] = useState('')  // 검색어 상태 관리
  const [typeFilter, setTypeFilter] = useState('all')  // 데이터셋 유형 필터 상태 관리
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure()  // 데이터셋 업로드 모달 열기/닫기 상태 관리
  const [datasets, setDatasets] = useState<any[]>([])  // API에서 가져온 데이터셋 저장
  const [loading, setLoading] = useState<boolean>(true)  // 데이터 로딩 상태 관리

  const bgCard = useColorModeValue('white', 'gray.800')  // 카드 배경색
  const borderColor = useColorModeValue('gray.200', 'gray.700')  // 카드 테두리 색상

  // useEffect를 사용하여 컴포넌트가 처음 렌더링될 때 API 호출
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/datasets`)  // API에서 데이터셋을 가져옴
      .then((response) => {
        // 데이터가 객체인 경우 배열로 변환하여 상태에 저장
        if (response.data && typeof response.data === 'object') {
          setDatasets(Object.values(response.data))  // 객체를 배열로 변환하여 데이터셋 상태에 저장
        } else {
          console.error('데이터는 객체가 아닙니다:', response.data)  // 데이터가 객체가 아닐 경우 오류 출력
        }
        setLoading(false)  // 로딩 상태 종료
      })
      .catch((error) => {
        console.error('API에서 데이터를 가져오는 중 오류가 발생했습니다:', error)  // 에러 처리
        setLoading(false)  // 에러 발생 시 로딩 상태 종료
      })
  }, [])  // 컴포넌트가 처음 렌더링될 때만 호출

  // 데이터셋을 검색어 및 유형 필터에 맞게 필터링
  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())  // 검색어와 일치하는 데이터셋을 찾음
    const matchesType =
      typeFilter === 'all' || dataset.type.toLowerCase() === typeFilter.toLowerCase()  // 유형 필터와 일치하는 데이터셋을 찾음
    return matchesSearch && matchesType  // 두 조건을 만족하는 데이터셋 반환
  })

  return (
    <Box as="main" pt="80px" px="4" maxW="100%">
      <Stack spacing={6} mt="-70px">
        {/* 헤더 */}
        <HStack justify="space-between">
          <Stack>
            <Text fontSize="2xl" fontWeight="bold">데이터셋 관리</Text>
            <Text color="gray.500">데이터셋을 관리하고 분석하세요</Text>
          </Stack>
          <Button
            leftIcon={<Icon as={FiPlus} />}
            colorScheme="orange"
            onClick={onUploadOpen}  // 새 데이터셋 업로드 모달 열기
          >
            새 데이터셋
          </Button>
        </HStack>

        {/* 검색 및 필터 */}
        <HStack spacing={4}>
          <InputGroup maxW="320px">
            <InputLeftElement>
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="데이터셋 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}  // 검색어 상태 업데이트
            />
          </InputGroup>
          <Select
            maxW="200px"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}  // 유형 필터 상태 업데이트
          >
            <option value="all">모든 유형</option>
            <option value="timeseries">시계열</option>
            <option value="structured">정형</option>
            <option value="image">이미지</option>
          </Select>
          <HStack spacing={2}>
            <IconButton
              aria-label="Grid view"
              icon={<Icon as={FiGrid} />}
              variant={viewMode === 'grid' ? 'solid' : 'ghost'}  // 그리드 뷰로 전환
              colorScheme={viewMode === 'grid' ? 'brand' : 'gray'}
              onClick={() => setViewMode('grid')}  // 뷰 모드를 그리드로 설정
            />
            <IconButton
              aria-label="List view"
              icon={<Icon as={FiList} />}
              variant={viewMode === 'list' ? 'solid' : 'ghost'}  // 리스트 뷰로 전환
              colorScheme={viewMode === 'list' ? 'brand' : 'gray'}
              onClick={() => setViewMode('list')}  // 뷰 모드를 리스트로 설정
            />
          </HStack>
        </HStack>

        {/* 데이터셋 목록 */}
        {loading ? (
          <Text>Loading...</Text>  // 데이터 로딩 중이면 "Loading..." 표시
        ) : viewMode === 'grid' ? (
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={6}
          >
            {filteredDatasets.map(dataset => (
              <Link key={dataset.id} href={`/dashboard/datasets/${dataset.id}`}>
                <DatasetCard
                  dataset={dataset}
                  viewMode="grid"  // 그리드 뷰에서 카드 표시
                  isSelected={false}
                  onSelect={() => {}}
                />
              </Link>
            ))}
          </Grid>
        ) : (
          <Card bg={bgCard} borderColor={borderColor} borderWidth={1}>
            <CardBody>
              <Stack spacing={4}>
                {filteredDatasets.map(dataset => (
                  <Link key={dataset.id} href={`/dashboard/datasets/${dataset.id}`}>
                    <DatasetCard
                      dataset={dataset}
                      viewMode="list"  // 리스트 뷰에서 카드 표시
                      isSelected={false}
                      onSelect={() => {}}
                    />
                  </Link>
                ))}
              </Stack>
            </CardBody>
          </Card>
        )}
      </Stack>

      {/* 데이터셋 업로드 모달 */}
      <DatasetUploadModal isOpen={isUploadOpen} onClose={onUploadClose} />
    </Box>
  )
}
