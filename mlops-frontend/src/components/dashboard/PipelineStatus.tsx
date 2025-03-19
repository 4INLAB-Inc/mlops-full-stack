'use client'

import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
  Flex,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Divider,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import {
  FiCalendar,
  FiRefreshCw,
  FiFilter,
  FiGrid,
  FiList,
} from 'react-icons/fi'
import { useState } from 'react'
import PipelineCard from '../pipeline/PipelineCard'
import DashboardSummary from './DashboardSummary'

const mockPipelines = [
  {
    id: 1,
    name: '이미지 분류 모델 v2',
    status: 'running',
    progress: 45,
    startTime: '2024-02-06T04:30:00Z',
    endTime: null,
    type: 'training',
    resources: {
      cpu: '4 cores',
      memory: '16GB',
      gpu: '1 x T4',
    },
  },
  {
    id: 2,
    name: '자연어 처리 파이프라인',
    status: 'completed',
    progress: 100,
    startTime: '2024-02-05T15:20:00Z',
    endTime: '2024-02-05T18:45:00Z',
    type: 'inference',
    resources: {
      cpu: '8 cores',
      memory: '32GB',
      gpu: '2 x V100',
    },
  },
  {
    id: 3,
    name: '시계열 예측 모델',
    status: 'failed',
    progress: 67,
    startTime: '2024-02-06T01:15:00Z',
    endTime: '2024-02-06T02:30:00Z',
    type: 'training',
    resources: {
      cpu: '6 cores',
      memory: '24GB',
      gpu: '1 x A100',
    },
  },
  {
    id: 4,
    name: '추천 시스템 v3',
    status: 'queued',
    progress: 0,
    startTime: null,
    endTime: null,
    type: 'training',
    resources: {
      cpu: '8 cores',
      memory: '32GB',
      gpu: '2 x A100',
    },
  },
]

export default function PipelineStatus() {
  const [timeRange, setTimeRange] = useState('1w')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [statusFilter, setStatusFilter] = useState('all')

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const subTextColor = useColorModeValue('gray.600', 'gray.400')

  const filteredPipelines = mockPipelines.filter((pipeline) => {
    if (statusFilter === 'all') return true
    return pipeline.status === statusFilter
  })

  return (
    <Box fontFamily="Pretendard">
      <DashboardSummary />
      
      <Box
        mt={8}
        mx="auto"
        px={8}
        py={6}
        bg={bgColor}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        shadow="sm"
      >
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="md" color={textColor} letterSpacing="tight">
                파이프라인 상태
              </Heading>
              <Text fontSize="sm" color={subTextColor}>
                현재 실행 중인 파이프라인 및 작업 현황
              </Text>
            </VStack>

            <HStack spacing={4}>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<FiFilter />}
                  size="sm"
                  variant="outline"
                  fontWeight="medium"
                >
                  {statusFilter === 'all'
                    ? '모든 상태'
                    : statusFilter === 'running'
                    ? '실행 중'
                    : statusFilter === 'completed'
                    ? '완료됨'
                    : statusFilter === 'failed'
                    ? '실패'
                    : '대기 중'}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setStatusFilter('all')}>
                    모든 상태
                  </MenuItem>
                  <MenuItem onClick={() => setStatusFilter('running')}>
                    실행 중
                  </MenuItem>
                  <MenuItem onClick={() => setStatusFilter('completed')}>
                    완료됨
                  </MenuItem>
                  <MenuItem onClick={() => setStatusFilter('failed')}>
                    실패
                  </MenuItem>
                  <MenuItem onClick={() => setStatusFilter('queued')}>
                    대기 중
                  </MenuItem>
                </MenuList>
              </Menu>

              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<FiCalendar />}
                  size="sm"
                  variant="outline"
                  fontWeight="medium"
                >
                  {timeRange === '1w'
                    ? '최근 1주'
                    : timeRange === '2w'
                    ? '최근 2주'
                    : '최근 1개월'}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setTimeRange('1w')}>최근 1주</MenuItem>
                  <MenuItem onClick={() => setTimeRange('2w')}>최근 2주</MenuItem>
                  <MenuItem onClick={() => setTimeRange('1m')}>
                    최근 1개월
                  </MenuItem>
                </MenuList>
              </Menu>

              <HStack spacing={2} borderLeft="1px" borderColor={borderColor} pl={4}>
                <Tooltip label="그리드 보기">
                  <IconButton
                    aria-label="그리드 보기"
                    icon={<FiGrid />}
                    size="sm"
                    variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                    colorScheme={viewMode === 'grid' ? 'blue' : 'gray'}
                    onClick={() => setViewMode('grid')}
                  />
                </Tooltip>
                <Tooltip label="리스트 보기">
                  <IconButton
                    aria-label="리스트 보기"
                    icon={<FiList />}
                    size="sm"
                    variant={viewMode === 'list' ? 'solid' : 'ghost'}
                    colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
                    onClick={() => setViewMode('list')}
                  />
                </Tooltip>
              </HStack>

              <Tooltip label="새로고침">
                <IconButton
                  aria-label="새로고침"
                  icon={<FiRefreshCw />}
                  size="sm"
                  variant="ghost"
                />
              </Tooltip>
            </HStack>
          </Flex>

          <Divider />

          {/* Pipeline Grid */}
          <SimpleGrid
            columns={viewMode === 'grid' ? { base: 1, lg: 2 } : 1}
            spacing={6}
          >
            {filteredPipelines.map((pipeline) => (
              <PipelineCard key={pipeline.id} pipeline={pipeline} />
            ))}
          </SimpleGrid>
        </VStack>
      </Box>
    </Box>
  )
}
