import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Text,
  HStack,
  Button,
  Icon,
  Stack,
  Card,
  CardBody,
  Badge,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Alert,
  AlertIcon,
  VStack,
  Progress,
  Grid,
  GridItem,
  IconButton,
  Flex,
  Tag,
  TagLabel,
  TagLeftIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Link,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import {
  FiGitBranch,
  FiGitCommit,
  FiGitMerge,
  FiDownload,
  FiUpload,
  FiClock,
  FiUser,
  FiPackage,
  FiCheck,
  FiX,
  FiArrowRight,
  FiArrowLeft,
  FiGitPullRequest,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi'
import { useState, useEffect } from 'react'

interface DatasetVersionsProps {
  datasetId: string
}

interface Version {
  version: string
  date: string
  changes: string
  author: string
  status?: 'stable' | 'testing' | 'deprecated'
  size?: number
  quality?: {
    completeness: number
    consistency: number
    balance: number
  }
  metadata?: {
    rows: number
    columns: number
    format: string
  }
}

import axios from 'axios'

export function DatasetVersions({ datasetId }: DatasetVersionsProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const bgCard = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const mutedText = useColorModeValue('gray.600', 'gray.400')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const brandColor = '#EB6100'

  // useEffect(() => {
  //   // 임시 데이터 로드
  //   const mockVersions: Version[] = [
  //     {
  //       version: '2.1.0',
  //       date: '2025-02-14',
  //       changes: '데이터 품질 개선 및 이상치 제거',
  //       author: '다어반권 수석',
  //       status: 'stable',
  //       size: 2458000000,
  //       quality: {
  //         completeness: 99.8,
  //         consistency: 98.5,
  //         balance: 97.2,
  //       },
  //       metadata: {
  //         rows: 8640000,
  //         columns: 6,
  //         format: 'parquet',
  //       },
  //     },
  //     {
  //       version: '2.0.0',
  //       date: '2025-02-13',
  //       changes: '새로운 특성 추가 및 데이터 구조 변경',
  //       author: '박진제 연구소장',
  //       status: 'deprecated',
  //       size: 2158000000,
  //       quality: {
  //         completeness: 98.5,
  //         consistency: 97.2,
  //         balance: 96.8,
  //       },
  //       metadata: {
  //         rows: 8540000,
  //         columns: 5,
  //         format: 'parquet',
  //       },
  //     },
  //     {
  //       version: '1.1.0',
  //       date: '2025-02-12',
  //       changes: '데이터 업데이트 및 오류 수정',
  //       author: '오석민 책임',
  //       status: 'testing',
  //       size: 2058000000,
  //       quality: {
  //         completeness: 97.2,
  //         consistency: 96.8,
  //         balance: 95.5,
  //       },
  //       metadata: {
  //         rows: 8440000,
  //         columns: 5,
  //         format: 'parquet',
  //       },
  //     },
  //     {
  //       version: '1.0.0',
  //       date: '2025-02-11',
  //       changes: '초기 데이터셋 구성',
  //       author: '천설이 연구원',
  //       status: 'deprecated',
  //       size: 1958000000,
  //       quality: {
  //         completeness: 95.5,
  //         consistency: 94.2,
  //         balance: 93.8,
  //       },
  //       metadata: {
  //         rows: 8340000,
  //         columns: 5,
  //         format: 'parquet',
  //       },
  //     },
  //   ]
  //   setVersions(mockVersions)
  // }, [datasetId])


  // API 호출하여 버전 정보 로드
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/datasets/versions/${datasetId}`
        )
        setVersions(response.data)  // 받은 데이터로 상태 업데이트
      } catch (error) {
        console.error('Failed to fetch versions:', error)
      }
    }

    fetchVersions()
  }, [datasetId])  // datasetId가 변경될 때마다 호출


  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'stable':
        return 'green'
      case 'testing':
        return 'orange'
      case 'deprecated':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getQualityIcon = (score: number) => {
    if (score >= 95) return FiCheckCircle
    if (score >= 80) return FiAlertCircle
    return FiX
  }

  const getQualityColor = (score: number) => {
    if (score >= 95) return 'green.500'
    if (score >= 80) return 'orange.500'
    return 'red.500'
  }

  const handleVersionClick = (version: Version) => {
    setSelectedVersion(version)
    onOpen()
  }

  return (
    <Box>
      <Stack spacing={6}>
        {/* 버전 목록 */}
        <VStack spacing={4} align="stretch">
          {versions.map((version, index) => (
            <Card
              key={version.version}
              variant="outline"
              cursor="pointer"
              _hover={{ bg: hoverBg }}
              onClick={() => handleVersionClick(version)}
            >
              <CardBody>
                <Grid templateColumns="1fr auto" gap={4}>
                  <Stack spacing={3}>
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={FiGitBranch} color={brandColor} />
                        <Text fontWeight="bold">버전 {version.version}</Text>
                        <Badge colorScheme={getStatusColor(version.status)}>
                          {version.status}
                        </Badge>
                      </HStack>
                      <Text color={mutedText} fontSize="sm">
                        {version.date}
                      </Text>
                    </HStack>
                    <Text>{version.changes}</Text>
                    <HStack spacing={4}>
                      <HStack>
                        <Icon as={FiUser} color={mutedText} />
                        <Text fontSize="sm" color={mutedText}>
                          {version.author}
                        </Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiPackage} color={mutedText} />
                        <Text fontSize="sm" color={mutedText}>
                          {(version.size! / 1000000000).toFixed(2)} GB
                        </Text>
                      </HStack>
                    </HStack>
                  </Stack>
                  <VStack spacing={2} align="flex-end">
                    <HStack>
                      <Tooltip label="완전성">
                        <HStack>
                          <Icon
                            as={getQualityIcon(version.quality!.completeness)}
                            color={getQualityColor(version.quality!.completeness)}
                          />
                          <Text fontSize="sm">
                            {version.quality!.completeness}%
                          </Text>
                        </HStack>
                      </Tooltip>
                      <Tooltip label="일관성">
                        <HStack>
                          <Icon
                            as={getQualityIcon(version.quality!.consistency)}
                            color={getQualityColor(version.quality!.consistency)}
                          />
                          <Text fontSize="sm">
                            {version.quality!.consistency}%
                          </Text>
                        </HStack>
                      </Tooltip>
                      <Tooltip label="균형성">
                        <HStack>
                          <Icon
                            as={getQualityIcon(version.quality!.balance)}
                            color={getQualityColor(version.quality!.balance)}
                          />
                          <Text fontSize="sm">{version.quality!.balance}%</Text>
                        </HStack>
                      </Tooltip>
                    </HStack>
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="orange"
                      leftIcon={<Icon as={FiDownload} />}
                    >
                      다운로드
                    </Button>
                  </VStack>
                </Grid>
              </CardBody>
            </Card>
          ))}
        </VStack>

        {/* 버전 상세 정보 모달 */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <Icon as={FiGitBranch} color={brandColor} />
                <Text>버전 {selectedVersion?.version}</Text>
                {selectedVersion && (
                  <Badge colorScheme={getStatusColor(selectedVersion.status)}>
                    {selectedVersion.status}
                  </Badge>
                )}
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedVersion && (
                <Stack spacing={6}>
                  <Stack spacing={4}>
                    <HStack>
                      <Icon as={FiClock} color={mutedText} />
                      <Text color={mutedText}>{selectedVersion.date}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiUser} color={mutedText} />
                      <Text color={mutedText}>{selectedVersion.author}</Text>
                    </HStack>
                    <Divider />
                    <Text fontWeight="medium">변경사항</Text>
                    <Text>{selectedVersion.changes}</Text>
                  </Stack>

                  <Accordion allowMultiple>
                    <AccordionItem>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <HStack>
                              <Icon as={FiInfo} />
                              <Text fontWeight="medium">메타데이터</Text>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          <HStack justify="space-between">
                            <Text color={mutedText}>행 수</Text>
                            <Text>
                              {selectedVersion.metadata?.rows.toLocaleString()}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color={mutedText}>열 수</Text>
                            <Text>{selectedVersion.metadata?.columns}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color={mutedText}>크기</Text>
                            <Text>
                              {(selectedVersion.size! / 1000000000).toFixed(2)} GB
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color={mutedText}>포맷</Text>
                            <Text>{selectedVersion.metadata?.format}</Text>
                          </HStack>
                        </Grid>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <HStack>
                              <Icon as={FiCheckCircle} />
                              <Text fontWeight="medium">품질 지표</Text>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <Stack spacing={4}>
                          <Box>
                            <HStack justify="space-between" mb={2}>
                              <Text color={mutedText}>완전성</Text>
                              <Text>
                                {selectedVersion.quality?.completeness.toFixed(1)}%
                              </Text>
                            </HStack>
                            <Progress
                              value={selectedVersion.quality?.completeness}
                              colorScheme={
                                selectedVersion.quality?.completeness !== undefined && selectedVersion.quality?.completeness >= 95
                                  ? 'green'
                                  : selectedVersion.quality?.completeness !== undefined && selectedVersion.quality?.completeness >= 80
                                  ? 'orange'
                                  : 'red'
                              }
                            />
                          </Box>
                          <Box>
                            <HStack justify="space-between" mb={2}>
                              <Text color={mutedText}>일관성</Text>
                              <Text>
                                {selectedVersion.quality?.consistency.toFixed(1)}%
                              </Text>
                            </HStack>
                            <Progress
                              value={selectedVersion.quality?.consistency}
                              colorScheme={
                                selectedVersion.quality?.consistency !== undefined && selectedVersion.quality?.consistency >= 95
                                  ? 'green'
                                  : selectedVersion.quality?.consistency !== undefined && selectedVersion.quality?.consistency >= 80
                                  ? 'orange'
                                  : 'red'
                              }
                            />
                          </Box>
                          <Box>
                            <HStack justify="space-between" mb={2}>
                              <Text color={mutedText}>균형성</Text>
                              <Text>
                                {selectedVersion.quality?.balance.toFixed(1)}%
                              </Text>
                            </HStack>
                            <Progress
                              value={selectedVersion.quality?.balance}
                              colorScheme={
                                selectedVersion.quality?.balance !== undefined && selectedVersion.quality?.balance >= 95
                                  ? 'green'
                                  : selectedVersion.quality?.balance !== undefined && selectedVersion.quality?.balance >= 80
                                  ? 'orange'
                                  : 'red'
                              }
                            />
                          </Box>
                        </Stack>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>

                  <HStack justify="flex-end" spacing={4}>
                    <Button
                      leftIcon={<Icon as={FiDownload} />}
                      colorScheme="orange"
                      variant="outline"
                    >
                      이 버전 다운로드
                    </Button>
                    <Button
                      leftIcon={<Icon as={FiGitMerge} />}
                      colorScheme="orange"
                    >
                      이 버전으로 복원
                    </Button>
                  </HStack>
                </Stack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Stack>
    </Box>
  )
}
