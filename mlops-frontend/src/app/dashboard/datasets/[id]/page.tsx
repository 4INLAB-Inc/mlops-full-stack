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
  Divider,
  Progress,
  Alert,
  AlertIcon,
  Container,
  VStack,
  Heading,
} from '@chakra-ui/react'
import {
  FiDownload,
  FiDatabase,
  FiBarChart2,
  FiGitBranch,
  FiEye,
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi'
import { DatasetPreview } from '@/components/datasets/DatasetPreview'
import { DatasetVersions } from '@/components/datasets/DatasetVersions'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface DatasetDetailPageProps {
  params: {
    id: string
  }
}

export default function DatasetDetailPage() {
  const params = useParams()
  const [dataset, setDataset] = useState<any>(null)
  const [selectedFormat, setSelectedFormat] = useState('csv')
  const bgCard = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const brandColor = '#EB6100'

  // Fetch dataset from API using the datasetId
  useEffect(() => {
    const fetchDataset = async (datasetId: string) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/datasets/${datasetId}`);
        if (response.ok) {
          const data = await response.json();
          setDataset(data);
        } else {
          console.error('데이터셋을 가져오는 데 실패했습니다');
        }
      } catch (error) {
        console.error('데이터셋을 가져오는 중 오류가 발생했습니다:', error);
      }
    };

    if (params.id) {
      fetchDataset(params.id);
    }
  }, [params.id]);

  const getQualityIcon = (score: number) => {
    if (score >= 95) return FiCheckCircle
    if (score >= 80) return FiAlertCircle
    return FiAlertCircle
  }

  const getQualityColor = (score: number) => {
    if (score >= 95) return 'green.500'
    if (score >= 80) return 'orange.500'
    return 'red.500'
  }

  if (!dataset) {
    return (
      <Box pt="80px">
        <Container maxW="container.xl" centerContent py={16}>
          <VStack spacing={6} align="center">
            <Icon as={FiDatabase} boxSize={12} color="gray.400" />
            <Heading size="lg" color="gray.500">데이터셋을 찾을 수 없습니다</Heading>
            <Text color="gray.500">요청하신 데이터셋이 존재하지 않거나 접근 권한이 없습니다.</Text>
            <Button
              leftIcon={<Icon as={FiDatabase} />}
              colorScheme="orange"
              onClick={() => window.history.back()}
            >
              데이터셋 목록으로 돌아가기
            </Button>
          </VStack>
        </Container>
      </Box>
    )
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
              leftIcon={<Icon as={FiEye} />}
              bg={brandColor}
              color="white"
              size="sm"
              _hover={{ bg: '#D55600' }}
            >
              미리보기
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

        {/* 데이터셋 정보 */}
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
                      src="/dataset-thumbnails/default.png"
                      alt={dataset.name}
                      width="100%"
                      height="200px"
                      objectFit="cover"
                      fallbackSrc="https://via.placeholder.com/300x200?text=No+Thumbnail"
                    />
                  </Box>
                  <Stack spacing={3}>
                    <HStack justify="space-between">
                      <Text color="gray.500">타입</Text>
                      <Text fontWeight="medium">{dataset.type}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">버전</Text>
                      <Text fontWeight="medium">v{dataset.version}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">상태</Text>
                      <Badge colorScheme="green" variant="subtle">
                        {dataset.status}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">크기</Text>
                      <Text fontWeight="medium">{(dataset.size / 1000000000).toFixed(2)} GB</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">행 수</Text>
                      <Text fontWeight="medium">{dataset.stats.rows.toLocaleString()}</Text>
                    </HStack>
                  </Stack>

                  <Divider />

                  {/* 데이터 품질 */}
                  <Stack spacing={3}>
                    <Text fontWeight="medium">데이터 품질</Text>
                    <HStack justify="space-between">
                      <Text color="gray.500">완전성</Text>
                      <HStack>
                        <Icon
                          as={getQualityIcon(dataset.quality.completeness)}
                          color={getQualityColor(dataset.quality.completeness)}
                        />
                        <Text fontWeight="medium">
                          {dataset.quality.completeness}%
                        </Text>
                      </HStack>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">일관성</Text>
                      <HStack>
                        <Icon
                          as={getQualityIcon(dataset.quality.consistency)}
                          color={getQualityColor(dataset.quality.consistency)}
                        />
                        <Text fontWeight="medium">
                          {dataset.quality.consistency}%
                        </Text>
                      </HStack>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.500">균형성</Text>
                      <HStack>
                        <Icon
                          as={getQualityIcon(dataset.quality.balance)}
                          color={getQualityColor(dataset.quality.balance)}
                        />
                        <Text fontWeight="medium">
                          {dataset.quality.balance}%
                        </Text>
                      </HStack>
                    </HStack>
                  </Stack>

                  <Divider />

                  {/* 데이터셋 내보내기 */}
                  <Stack spacing={3}>
                    <Text fontWeight="medium">데이터셋 내보내기</Text>
                    <Button
                      leftIcon={<Icon as={FiPackage} />}
                      variant="outline"
                      size="sm"
                      borderColor={brandColor}
                      color={brandColor}
                      _hover={{ bg: '#FFF5ED' }}
                    >
                      {selectedFormat.toUpperCase()} 형식으로 내보내기
                    </Button>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          </Stack>

          {/* 오른쪽: 상세 정보 탭 */}
          <Card bg={bgCard} borderColor={borderColor}>
            <CardBody>
              <Tabs>
                <TabList>
                  <Tab
                    _selected={{
                      color: brandColor,
                      borderColor: brandColor,
                    }}
                  >
                    <HStack spacing={2}>
                      <Icon as={FiEye} />
                      <Text>미리보기</Text>
                    </HStack>
                  </Tab>
                  <Tab
                    _selected={{
                      color: brandColor,
                      borderColor: brandColor,
                    }}
                  >
                    <HStack spacing={2}>
                      <Icon as={FiBarChart2} />
                      <Text>통계</Text>
                    </HStack>
                  </Tab>
                  <Tab
                    _selected={{
                      color: brandColor,
                      borderColor: brandColor,
                    }}
                  >
                    <HStack spacing={2}>
                      <Icon as={FiGitBranch} />
                      <Text>버전</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* 미리보기 탭 */}
                  <TabPanel>
                    <DatasetPreview datasetId={params.id} />
                  </TabPanel>

                  {/* 통계 탭 */}
                  <TabPanel>
                    <Stack spacing={6}>
                      <Card>
                        <CardBody>
                          <Stack spacing={4}>
                            <Text fontWeight="medium">데이터 분포</Text>
                            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                              <Card variant="outline">
                                <CardBody>
                                  <Stack spacing={2}>
                                    <Text color="gray.500" fontSize="sm">
                                      학습 데이터
                                    </Text>
                                    <Text fontSize="xl" fontWeight="bold">
                                      {dataset.stats.rows * 0.8}
                                    </Text>
                                    <Progress
                                      value={85.7}
                                      size="sm"
                                      colorScheme="orange"
                                    />
                                  </Stack>
                                </CardBody>
                              </Card>
                              <Card variant="outline">
                                <CardBody>
                                  <Stack spacing={2}>
                                    <Text color="gray.500" fontSize="sm">
                                      테스트 데이터
                                    </Text>
                                    <Text fontSize="xl" fontWeight="bold">
                                      {dataset.stats.rows * 0.2}
                                    </Text>
                                    <Progress
                                      value={14.3}
                                      size="sm"
                                      colorScheme="orange"
                                    />
                                  </Stack>
                                </CardBody>
                              </Card>
                            </Grid>
                          </Stack>
                        </CardBody>
                      </Card>

                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        데이터셋에 대한 자세한 통계는 실험 관리 페이지에서 확인할 수
                        있습니다.
                      </Alert>
                    </Stack>
                  </TabPanel>

                  {/* 버전 탭 */}
                  <TabPanel>
                    <DatasetVersions datasetId={params.id} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </Grid>
      </Stack>
    </Box>
  )
}
