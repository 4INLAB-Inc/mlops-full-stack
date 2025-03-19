import React, { useState, useMemo } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import {
  FiGitCommit,
  FiClock,
  FiArrowUp,
  FiArrowDown,
  FiRotateCcw,
  FiCheck,
  FiInfo,
  FiActivity,
  FiBarChart2,
  FiTrendingUp,
} from 'react-icons/fi'

interface ModelVersion {
  version: string
  commitHash: string
  createdAt: string
  createdBy: string
  description: string
  metrics: {
    accuracy: number
    precision: number
    recall: number
    f1Score: number
    auc: number
    latency: number
    throughput: number
  }
  status: 'active' | 'inactive' | 'deprecated'
  dependencies: {
    name: string
    version: string
  }[]
  artifacts: {
    name: string
    size: number
    path: string
  }[]
  trainingData: {
    datasetId: string
    datasetVersion: string
    numSamples: number
  }
}

interface ModelVersionsProps {
  modelId: string
  versions: ModelVersion[]
  currentVersion: string
}

export const ModelVersions: React.FC<ModelVersionsProps> = ({
  modelId,
  versions,
  currentVersion,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<ModelVersion | null>(null)
  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // 메모이제이션된 색상 값들
  const colors = useMemo(() => ({
    bg: useColorModeValue('white', 'gray.800'),
    borderColor: useColorModeValue('gray.100', 'gray.700'),
    textColor: useColorModeValue('gray.600', 'gray.400'),
    headingColor: useColorModeValue('gray.700', 'white'),
    orange: '#EB6100'
  }), [])

  // 메모이제이션된 스타일
  const styles = useMemo(() => ({
    cardTransition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    cardHoverStyle: {
      transform: 'translateY(-2px)',
      boxShadow: 'lg',
      borderColor: colors.orange
    }
  }), [colors.orange])

  const handleRollback = async () => {
    if (!selectedVersion) return

    setIsLoading(true)
    try {
      // TODO: API 호출 구현
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: '롤백 완료',
        description: `버전 ${selectedVersion.version}으로 롤백되었습니다.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      setIsRollbackDialogOpen(false)
    } catch (error) {
      toast({
        title: '롤백 실패',
        description: '버전 롤백 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green'
      case 'inactive':
        return 'gray'
      case 'deprecated':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '활성'
      case 'inactive':
        return '비활성'
      case 'deprecated':
        return '폐기됨'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Byte'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString())
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Card 
      bg={colors.bg}
      borderColor={colors.borderColor}
      transition={styles.cardTransition}
      _hover={{ boxShadow: 'md' }}
    >
      <CardHeader>
        <VStack align="start" spacing={1}>
          <Heading size="md" color={colors.headingColor}>버전 관리</Heading>
          <Text fontSize="sm" color={colors.textColor}>
            모델의 버전 기록과 성능 지표를 확인하세요
          </Text>
        </VStack>
      </CardHeader>
      <Divider borderColor={colors.borderColor} />
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>버전</Th>
                <Th>상태</Th>
                <Th>생성일</Th>
                <Th>생성자</Th>
                <Th>성능</Th>
                <Th>작업</Th>
              </Tr>
            </Thead>
            <Tbody>
              {versions.map((version) => (
                <Tr 
                  key={version.version}
                  _hover={{ bg: colors.borderColor }}
                  cursor="pointer"
                  onClick={() => {
                    setSelectedVersion(version)
                    onOpen()
                  }}
                >
                  <Td>
                    <HStack>
                      <Icon as={FiGitCommit} color={colors.orange} />
                      <Text fontWeight={version.version === currentVersion ? "bold" : "normal"}>
                        {version.version}
                      </Text>
                      {version.version === currentVersion && (
                        <Badge colorScheme="orange" fontSize="xs">현재</Badge>
                      )}
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(version.status)}>
                      {getStatusText(version.status)}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack>
                      <Icon as={FiClock} color={colors.textColor} />
                      <Text color={colors.textColor}>{formatDate(version.createdAt)}</Text>
                    </HStack>
                  </Td>
                  <Td>{version.createdBy}</Td>
                  <Td>
                    <HStack>
                      <Icon 
                        as={version.metrics.accuracy >= 0.9 ? FiArrowUp : FiArrowDown}
                        color={version.metrics.accuracy >= 0.9 ? "green.500" : "red.500"}
                      />
                      <Text>{(version.metrics.accuracy * 100).toFixed(1)}%</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Button
                      leftIcon={<Icon as={FiRotateCcw} />}
                      size="sm"
                      variant="ghost"
                      colorScheme="orange"
                      isDisabled={version.version === currentVersion}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedVersion(version)
                        setIsRollbackDialogOpen(true)
                      }}
                    >
                      롤백
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </VStack>
      </CardBody>

      {/* 버전 상세 정보 모달 */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent bg={colors.bg}>
          <ModalHeader color={colors.headingColor}>
            <HStack>
              <Text>버전 {selectedVersion?.version} 상세 정보</Text>
              <Badge colorScheme={selectedVersion?.version === currentVersion ? "orange" : getStatusColor(selectedVersion?.status || '')}>
                {selectedVersion?.version === currentVersion ? "현재" : getStatusText(selectedVersion?.status || '')}
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedVersion && (
              <VStack spacing={6} align="stretch">
                {/* 기본 정보 */}
                <Box>
                  <Heading size="sm" mb={4} color={colors.headingColor}>기본 정보</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <HStack>
                      <Icon as={FiGitCommit} color={colors.orange} />
                      <Text color={colors.textColor}>커밋 해시: </Text>
                      <Text>{selectedVersion.commitHash}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiClock} color={colors.orange} />
                      <Text color={colors.textColor}>생성일: </Text>
                      <Text>{formatDate(selectedVersion.createdAt)}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiInfo} color={colors.orange} />
                      <Text color={colors.textColor}>설명: </Text>
                      <Text>{selectedVersion.description}</Text>
                    </HStack>
                  </SimpleGrid>
                </Box>

                {/* 성능 지표 */}
                <Box>
                  <Heading size="sm" mb={4} color={colors.headingColor}>성능 지표</Heading>
                  <SimpleGrid columns={4} spacing={4}>
                    <Stat>
                      <StatLabel>
                        <HStack>
                          <Icon as={FiCheck} color={colors.orange} />
                          <Text>정확도</Text>
                        </HStack>
                      </StatLabel>
                      <StatNumber>{(selectedVersion.metrics.accuracy * 100).toFixed(1)}%</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>
                        <HStack>
                          <Icon as={FiBarChart2} color={colors.orange} />
                          <Text>정밀도</Text>
                        </HStack>
                      </StatLabel>
                      <StatNumber>{(selectedVersion.metrics.precision * 100).toFixed(1)}%</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>
                        <HStack>
                          <Icon as={FiActivity} color={colors.orange} />
                          <Text>재현율</Text>
                        </HStack>
                      </StatLabel>
                      <StatNumber>{(selectedVersion.metrics.recall * 100).toFixed(1)}%</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>
                        <HStack>
                          <Icon as={FiTrendingUp} color={colors.orange} />
                          <Text>F1 점수</Text>
                        </HStack>
                      </StatLabel>
                      <StatNumber>{(selectedVersion.metrics.f1Score * 100).toFixed(1)}%</StatNumber>
                    </Stat>
                  </SimpleGrid>
                </Box>

                {/* 의존성 */}
                <Box>
                  <Heading size="sm" mb={4} color={colors.headingColor}>의존성</Heading>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>패키지</Th>
                        <Th>버전</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedVersion.dependencies.map((dep) => (
                        <Tr key={dep.name}>
                          <Td>{dep.name}</Td>
                          <Td>{dep.version}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>

                {/* 아티팩트 */}
                <Box>
                  <Heading size="sm" mb={4} color={colors.headingColor}>아티팩트</Heading>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>파일</Th>
                        <Th>크기</Th>
                        <Th>경로</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedVersion.artifacts.map((artifact) => (
                        <Tr key={artifact.name}>
                          <Td>{artifact.name}</Td>
                          <Td>{formatSize(artifact.size)}</Td>
                          <Td>{artifact.path}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>

                {/* 학습 데이터 */}
                <Box>
                  <Heading size="sm" mb={4} color={colors.headingColor}>학습 데이터</Heading>
                  <SimpleGrid columns={3} spacing={4}>
                    <HStack>
                      <Text color={colors.textColor}>데이터셋 ID: </Text>
                      <Text>{selectedVersion.trainingData.datasetId}</Text>
                    </HStack>
                    <HStack>
                      <Text color={colors.textColor}>데이터셋 버전: </Text>
                      <Text>{selectedVersion.trainingData.datasetVersion}</Text>
                    </HStack>
                    <HStack>
                      <Text color={colors.textColor}>샘플 수: </Text>
                      <Text>{selectedVersion.trainingData.numSamples.toLocaleString()}</Text>
                    </HStack>
                  </SimpleGrid>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>닫기</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 롤백 확인 다이얼로그 */}
      <AlertDialog
        isOpen={isRollbackDialogOpen}
        leastDestructiveRef={null}
        onClose={() => setIsRollbackDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={colors.bg}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color={colors.headingColor}>
              버전 롤백
            </AlertDialogHeader>

            <AlertDialogBody color={colors.textColor}>
              버전 {selectedVersion?.version}으로 롤백하시겠습니까? 이 작업은 현재 버전의 모든 변경사항을 되돌립니다.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={() => setIsRollbackDialogOpen(false)}>
                취소
              </Button>
              <Button 
                colorScheme="orange" 
                onClick={handleRollback} 
                ml={3}
                isLoading={isLoading}
              >
                롤백
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Card>
  )
}
