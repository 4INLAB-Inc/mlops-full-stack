'use client'

import {
  Box,
  Button,
  Card,
  CardBody,
  Grid,
  GridItem,
  HStack,
  Icon,
  Image,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  Badge,
  Select,
  Divider,
  Progress,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react'
import {
  FiDownload,
  FiShare2,
  FiDatabase,
  FiGrid,
  FiCpu,
  FiHardDrive,
  FiAlertCircle,
  FiCheckCircle,
  FiBarChart2,
  FiClock,
  FiTag,
  FiLayers,
} from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { DatasetPreview } from '@/components/datasets/DatasetPreview'
import { DatasetAnalysis } from '@/components/datasets/DatasetAnalysis'
import { DatasetMetadata } from '@/components/datasets/DatasetMetadata'
import { DatasetVersions } from '@/components/datasets/DatasetVersions'

interface DatasetDetailClientProps {
  datasetId: string
}

export default function DatasetDetailClient({ datasetId }: DatasetDetailClientProps) {
  const [selectedVersion, setSelectedVersion] = useState('latest')  // 최신 버전 선택 상태
  const [dataset, setDataset] = useState<any>(null)  // 데이터셋 정보 상태
  const [loading, setLoading] = useState(true)  // 데이터 로딩 상태

  const bgCard = useColorModeValue('white', 'gray.800')  // 카드 배경색
  const borderColor = useColorModeValue('gray.200', 'gray.700')  // 카드 테두리 색상
  const brandColor = '#EB6100'  // 브랜드 색상

  // API로 데이터셋 정보 가져오기
  useEffect(() => {
    const fetchDatasetDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/datasets/client/${datasetId}`)
        const data = await response.json()
        console.log('📦 dataset loaded:', data) // 👉 In ra toàn bộ object
        console.log('🆔 dataset.id:', data.id)   // 👉 In riêng ID

        setDataset(data) 
      } catch (error) {
        console.error('데이터셋 세부 정보를 가져오는 중 오류 발생:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDatasetDetails()
  }, [datasetId])  // datasetId가 변경되면 데이터 새로 가져오기

  if (loading) {
    return <Text>Loading...</Text>  // 데이터 로딩 중일 때 표시
  }

  // 데이터셋 상태에 따라 색상 반환
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return brandColor
      case 'processing':
        return 'blue'
      case 'failed':
        return 'red'
      default:
        return 'gray'
    }
  }

  // 지표 변화 계산 함수
  const getMetricChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    return {
      value: change.toFixed(1),
      isPositive: change > 0,
    }
  }

  // 파일 크기 포맷 함수
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Byte'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString())
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
  <Box as="main" px="4" ml="0" maxW="100%" mt="80px">
    <Stack spacing={6}>
      {/* 헤더 */}
      <HStack justify="space-between" align="flex-start">
        <Stack spacing={1}>
          <Text fontSize="2xl" fontWeight="bold">
            {dataset.name}
          </Text>
          <Text color="gray.500">{dataset.description}</Text>
        </Stack>
        <HStack>
          <Button
            leftIcon={<Icon as={FiShare2} />}
            bg={brandColor}
            color="white"
            size="sm"
            _hover={{ bg: '#D55600' }}
          >
            공유
          </Button>
          <Button
            leftIcon={<Icon as={FiDownload} />}
            variant="outline"
            size="sm"
            borderColor={brandColor}
            color={brandColor}
            _hover={{ bg: '#FFF5ED' }}
          >
            다운로드
          </Button>
        </HStack>
      </HStack>

      {/* 주요 지표 */}
      <Grid templateColumns="repeat(4, 1fr)" gap={4}>
        {/* Các Card thống kê như bạn viết... */}
        {/* Không cần thay đổi ở đây */}
      </Grid>

      {/* 메인 컨텐츠 */}
      <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={6}>
        {/* 왼쪽: 썸네일 및 기본 정보 */}
        <Stack spacing={6}>
          <Card bg={bgCard} borderColor={borderColor}>
            <CardBody>
              <Stack spacing={4}>
                <Box
                  borderRadius="md"
                  overflow="hidden"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Image
                    src={dataset.thumbnail}
                    alt={dataset.name}
                    width="100%"
                    height="200px"
                    objectFit="cover"
                    fallbackSrc="https://via.placeholder.com/300x200?text=No+Thumbnail"
                  />
                </Box>

                <Stack spacing={3}>
                  <HStack justify="space-between">
                    <Text color="gray.500">데이터 유형</Text>
                    <Text fontWeight="medium">{dataset.type}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">버전</Text>
                    <Text fontWeight="medium">v{dataset.version}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">상태</Text>
                    <Badge colorScheme={getStatusColor(dataset.status)}>
                      {dataset.status === 'completed' ? '완료됨' : '처리중'}
                    </Badge>
                  </HStack>
                  <Divider />
                  <Stack spacing={2}>
                    <Text color="gray.500" fontSize="sm">
                      데이터 품질 지표
                    </Text>
                    <Stack spacing={3}>
                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm">완전성</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {dataset.quality.completeness}%
                          </Text>
                        </HStack>
                        <Progress
                          value={dataset.quality.completeness}
                          size="sm"
                          colorScheme="orange"
                        />
                      </Box>
                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm">일관성</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {dataset.quality.consistency}%
                          </Text>
                        </HStack>
                        <Progress
                          value={dataset.quality.consistency}
                          size="sm"
                          colorScheme="orange"
                        />
                      </Box>
                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm">균형성</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {dataset.quality.balance}%
                          </Text>
                        </HStack>
                        <Progress
                          value={dataset.quality.balance}
                          size="sm"
                          colorScheme="orange"
                        />
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          {/* 시스템 요구사항 */}
          <Card bg={bgCard} borderColor={borderColor} mt={4}>
            <CardBody>
              <Stack spacing={4}>
                <Text fontWeight="medium">시스템 요구사항</Text>
                <Stack spacing={3}>
                  <HStack justify="space-between">
                    <HStack>
                      <Icon
                        as={FiCpu}
                        color={
                          dataset.systemRequirements.cpu === 'met'
                            ? 'green.500'
                            : 'orange.500'
                        }
                      />
                      <Text>CPU</Text>
                    </HStack>
                    <Badge
                      colorScheme={
                        dataset.systemRequirements.cpu === 'met'
                          ? 'green'
                          : 'orange'
                      }
                    >
                      {dataset.systemRequirements.cpu === 'met'
                        ? '충족됨'
                        : '주의'}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <HStack>
                      <Icon
                        as={FiHardDrive}
                        color={
                          dataset.systemRequirements.memory === 'met'
                            ? 'green.500'
                            : 'orange.500'
                        }
                      />
                      <Text>메모리</Text>
                    </HStack>
                    <Badge
                      colorScheme={
                        dataset.systemRequirements.memory === 'met'
                          ? 'green'
                          : 'orange'
                      }
                    >
                      {dataset.systemRequirements.memory === 'met'
                        ? '충족됨'
                        : '주의'}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <HStack>
                      <Icon
                        as={FiDatabase}
                        color={
                          dataset.systemRequirements.storage === 'met'
                            ? 'green.500'
                            : 'orange.500'
                        }
                      />
                      <Text>스토리지</Text>
                    </HStack>
                    <Badge
                      colorScheme={
                        dataset.systemRequirements.storage === 'met'
                          ? 'green'
                          : 'orange'
                      }
                    >
                      {dataset.systemRequirements.storage === 'met'
                        ? '충족됨'
                        : '주의'}
                    </Badge>
                  </HStack>
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          {/* 태그 */}
          <Card bg={bgCard} borderColor={borderColor} mt={4}>
            <CardBody>
              <Stack spacing={3}>
                <Text fontWeight="medium">태그</Text>
                <HStack flexWrap="wrap" spacing={2}>
                  {dataset.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      colorScheme="orange"
                      variant="subtle"
                      px={2}
                      py={1}
                    >
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              </Stack>
            </CardBody>
          </Card>
        </Stack>

        {/* 오른쪽: 탭 컨텐츠 */}
        <Stack spacing={6}>
          <Card bg={bgCard} borderColor={borderColor}>
            <CardBody>
              <Tabs isLazy>
                <TabList>
                  <Tab>데이터 미리보기</Tab>
                  <Tab>통계 분석</Tab>
                  <Tab>메타데이터</Tab>
                  <Tab>버전 관리</Tab>
                </TabList>
                {/* <TabPanels>
                  <TabPanel>
                    <DatasetPreview datasetId={dataset.id} />
                  </TabPanel>
                  <TabPanel>
                    <DatasetAnalysis dataset={dataset} />
                  </TabPanel>
                  <TabPanel>
                    <DatasetMetadata dataset={dataset} />
                  </TabPanel>
                  <TabPanel>
                    <DatasetVersions datasetId={dataset.id} />
                  </TabPanel>
                </TabPanels> */}
                <TabPanels>
                  <TabPanel key="preview">
                    {dataset?.id && <DatasetPreview datasetId={dataset.id} />}
                  </TabPanel>
                  <TabPanel key="analysis">
                    <DatasetAnalysis dataset={dataset} />
                  </TabPanel>
                  <TabPanel key="metadata">
                    <DatasetMetadata dataset={dataset} />
                  </TabPanel>
                  <TabPanel key="versions">
                    {dataset?.id && <DatasetVersions datasetId={dataset.id} />}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </Stack>
      </Grid>
    </Stack>
  </Box>
  )
}