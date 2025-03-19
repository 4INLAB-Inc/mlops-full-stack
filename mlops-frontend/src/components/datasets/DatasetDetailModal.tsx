'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Text,
  SimpleGrid,
  HStack,
  Icon,
  VStack,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FiInfo,
  FiBarChart2,
  FiGitBranch,
  FiTag,
  FiGrid,
  FiColumns,
  FiClock,
  FiHardDrive,
} from 'react-icons/fi'

interface Dataset {
  id: string
  name: string
  type: string
  size: number
  lastModified: string
  rows?: number
  columns?: number
  status?: string
  progress?: number
  tags?: string[]
}

interface DatasetDetailModalProps {
  isOpen: boolean
  onClose: () => void
  dataset: Dataset
}

export function DatasetDetailModal({ isOpen, onClose, dataset }: DatasetDetailModalProps) {
  const accentColor = '#EB6100'
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400')
  const cardBg = useColorModeValue('white', 'gray.800')

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Text>{dataset.name}</Text>
            <Badge colorScheme={dataset.status === 'completed' ? 'green' : 'orange'}>
              {dataset.status}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Tabs colorScheme="orange" isLazy>
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FiInfo} />
                  <Text>개요</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FiBarChart2} />
                  <Text>통계</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FiGitBranch} />
                  <Text>버전</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FiTag} />
                  <Text>라벨링</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* 개요 탭 */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {dataset.progress !== undefined && dataset.status === 'processing' && (
                    <Box>
                      <Text mb={2} fontSize="sm" color={mutedTextColor}>
                        업로드 진행률
                      </Text>
                      <Progress
                        value={dataset.progress}
                        size="sm"
                        colorScheme="orange"
                        borderRadius="full"
                      />
                      <Text mt={1} fontSize="sm" color={mutedTextColor} textAlign="right">
                        {dataset.progress}%
                      </Text>
                    </Box>
                  )}

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Box p={4} bg={cardBg} borderRadius="xl" boxShadow="sm">
                      <Stat>
                        <StatLabel color={mutedTextColor}>
                          <HStack spacing={2}>
                            <Icon as={FiHardDrive} />
                            <Text>파일 크기</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber>{formatFileSize(dataset.size)}</StatNumber>
                      </Stat>
                    </Box>

                    <Box p={4} bg={cardBg} borderRadius="xl" boxShadow="sm">
                      <Stat>
                        <StatLabel color={mutedTextColor}>
                          <HStack spacing={2}>
                            <Icon as={FiGrid} />
                            <Text>행</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber>{dataset.rows?.toLocaleString()}</StatNumber>
                      </Stat>
                    </Box>

                    <Box p={4} bg={cardBg} borderRadius="xl" boxShadow="sm">
                      <Stat>
                        <StatLabel color={mutedTextColor}>
                          <HStack spacing={2}>
                            <Icon as={FiColumns} />
                            <Text>열</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber>{dataset.columns?.toLocaleString()}</StatNumber>
                      </Stat>
                    </Box>
                  </SimpleGrid>

                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      태그
                    </Text>
                    <HStack spacing={2}>
                      {dataset.tags?.map((tag) => (
                        <Badge key={tag} colorScheme="orange">
                          {tag}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      마지막 수정일
                    </Text>
                    <HStack spacing={2} color={mutedTextColor}>
                      <Icon as={FiClock} />
                      <Text>{new Date(dataset.lastModified).toLocaleDateString()}</Text>
                    </HStack>
                  </Box>
                </VStack>
              </TabPanel>

              {/* 통계 탭 */}
              <TabPanel>
                <Text color={mutedTextColor}>데이터 통계 정보가 여기에 표시됩니다.</Text>
              </TabPanel>

              {/* 버전 탭 */}
              <TabPanel>
                <Text color={mutedTextColor}>버전 히스토리가 여기에 표시됩니다.</Text>
              </TabPanel>

              {/* 라벨링 탭 */}
              <TabPanel>
                <Text color={mutedTextColor}>데이터 라벨링 정보가 여기에 표시됩니다.</Text>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            닫기
          </Button>
          <Button
            bg={accentColor}
            color="white"
            _hover={{ bg: 'orange.500' }}
            leftIcon={<Icon as={FiBarChart2} />}
          >
            분석 시작
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
