'use client'

import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from '@chakra-ui/react'
import {
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiBarChart,
  FiList,
  FiGrid,
} from 'react-icons/fi'
import { datasetApi } from '@/services/api'
import { useQuery } from '@tanstack/react-query'

interface DatasetDetailProps {
  datasetId: string
}

interface ColumnStats {
  name: string
  type: string
  nullCount: number
  uniqueCount: number
  mean?: number
  std?: number
  min?: number
  max?: number
}

export function DatasetDetail({ datasetId }: DatasetDetailProps) {
  const toast = useToast()

  const { data: dataset, isLoading, error } = useQuery({
    queryKey: ['dataset', datasetId],
    queryFn: () => datasetApi.getById(datasetId), // Giả sử bạn sử dụng getById thay vì analyze
  })

  const handleDelete = async () => {
    try {
      await datasetApi.delete(datasetId)
      toast({
        title: '데이터셋이 삭제되었습니다.',
        status: 'success',
        duration: 3000,
      })
    } catch (error: any) {
      toast({
        title: '삭제 실패',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }

  // Kiểm tra xem dataset có được tải thành công không
  if (isLoading) return <Text>Loading...</Text>
  if (error) return <Text>Error loading dataset</Text>
  if (!dataset?.data) return <Text>No dataset found</Text> 

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          {/* Truy cập dataset.data thay vì dataset trực tiếp */}
          <Heading size="lg">{dataset.data.name || 'No name available'}</Heading>
          <Text color="gray.600" mt={1}>
            {dataset.data.description || '설명 없음'}
          </Text>
        </Box>
        <Flex gap={2}>
          <Button
            leftIcon={<Icon as={FiEdit2} />}
            variant="ghost"
            colorScheme="blue"
          >
            수정
          </Button>
          <Button
            leftIcon={<Icon as={FiDownload} />}
            variant="ghost"
            colorScheme="blue"
          >
            다운로드
          </Button>
          <Button
            leftIcon={<Icon as={FiTrash2} />}
            variant="ghost"
            colorScheme="red"
            onClick={handleDelete}
          >
            삭제
          </Button>
        </Flex>
      </Flex>

      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={8}>
        <Box p={4} bg="white" rounded="lg" shadow="sm">
          <Text color="gray.500" fontSize="sm">
            총 행 수
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {dataset.data.stats.rowCount.toLocaleString()}
          </Text>
        </Box>
        <Box p={4} bg="white" rounded="lg" shadow="sm">
          <Text color="gray.500" fontSize="sm">
            총 열 수
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {dataset.data.stats.columnCount.toLocaleString()}
          </Text>
        </Box>
        <Box p={4} bg="white" rounded="lg" shadow="sm">
          <Text color="gray.500" fontSize="sm">
            결측값
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {dataset.data.stats.missingValues.toLocaleString()}
          </Text>
        </Box>
        <Box p={4} bg="white" rounded="lg" shadow="sm">
          <Text color="gray.500" fontSize="sm">
            파일 크기
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {(dataset.data.size / 1024 / 1024).toFixed(2)} MB
          </Text>
        </Box>
      </Grid>

      <Tabs colorScheme="blue">
        <TabList>
          <Tab>
            <Icon as={FiGrid} mr={2} />
            데이터 미리보기
          </Tab>
          <Tab>
            <Icon as={FiBarChart} mr={2} />
            통계 분석
          </Tab>
          <Tab>
            <Icon as={FiList} mr={2} />
            컬럼 정보
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box overflowX="auto">
              {/* Add data preview table here */}
            </Box>
          </TabPanel>

          <TabPanel>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              {dataset.data.columns.map((column: ColumnStats) => (
                <Box
                  key={column.name}
                  p={4}
                  bg="white"
                  rounded="lg"
                  shadow="sm"
                >
                  <Text fontWeight="medium" mb={2}>
                    {column.name}
                  </Text>
                  <Grid templateColumns="1fr 1fr" gap={4} fontSize="sm">
                    <Box>
                      <Text color="gray.500">타입</Text>
                      <Text>{column.type}</Text>
                    </Box>
                    <Box>
                      <Text color="gray.500">결측값</Text>
                      <Text>{column.nullCount}</Text>
                    </Box>
                    <Box>
                      <Text color="gray.500">고유값</Text>
                      <Text>{column.uniqueCount}</Text>
                    </Box>
                    {column.type === 'numeric' && (
                      <>
                        <Box>
                          <Text color="gray.500">평균</Text>
                          <Text>{column.mean?.toFixed(2)}</Text>
                        </Box>
                        <Box>
                          <Text color="gray.500">표준편차</Text>
                          <Text>{column.std?.toFixed(2)}</Text>
                        </Box>
                        <Box>
                          <Text color="gray.500">최소값</Text>
                          <Text>{column.min?.toFixed(2)}</Text>
                        </Box>
                        <Box>
                          <Text color="gray.500">최대값</Text>
                          <Text>{column.max?.toFixed(2)}</Text>
                        </Box>
                      </>
                    )}
                  </Grid>
                </Box>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel>
            <Grid templateColumns="1fr" gap={4}>
              {dataset.data.columns.map((column: ColumnStats) => (
                <Box
                  key={column.name}
                  p={4}
                  bg="white"
                  rounded="lg"
                  shadow="sm"
                >
                  <Grid templateColumns="1fr 2fr 1fr 1fr" gap={4}>
                    <Text fontWeight="medium">{column.name}</Text>
                    <Text color="gray.600">{column.type}</Text>
                    <Text>결측값: {column.nullCount}</Text>
                    <Text>고유값: {column.uniqueCount}</Text>
                  </Grid>
                </Box>
              ))}
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
