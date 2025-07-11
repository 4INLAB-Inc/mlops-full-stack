// 'use client'

// import {
//   Box,
//   Button,
//   Card,
//   CardBody,
//   CardHeader,
//   Divider,
//   Flex,
//   FormControl,
//   FormLabel,
//   Heading,
//   HStack,
//   Icon,
//   Input,
//   Modal,
//   ModalBody,
//   ModalCloseButton,
//   ModalContent,
//   ModalFooter,
//   ModalHeader,
//   ModalOverlay,
//   Select,
//   Stack,
//   Switch,
//   Tag,
//   Text,
//   useColorModeValue,
//   useDisclosure,
//   useToast,
//   VStack,
//   Badge,
//   SimpleGrid,
//   Stat,
//   StatLabel,
//   StatNumber,
//   Table,
//   Tbody,
//   Td,
//   Th,
//   Thead,
//   Tr,
//   Wrap,
//   NumberInput,
//   NumberInputField,
//   NumberInputStepper,
//   NumberIncrementStepper,
//   NumberDecrementStepper,
//   Grid,
//   GridItem,
//   IconButton,
//   TagLabel,
//   TagCloseButton,
//   FormHelperText,
//   AlertDialog,
//   AlertDialogBody,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogContent,
//   AlertDialogOverlay,
//   Menu,
//   MenuButton,
//   MenuList,
//   MenuItem,
//   MenuDivider,
// } from '@chakra-ui/react'
// import {
//   AddIcon,
//   ChevronDownIcon,
//   DeleteIcon,
// } from '@chakra-ui/icons'
// import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
// import {
//   FiActivity,
//   FiAlertCircle,
//   FiCheckCircle,
//   FiCloud,
//   FiCpu,
//   FiDatabase,
//   FiGlobe,
//   FiHardDrive,
//   FiLayers,
//   FiMoreVertical,
//   FiPlay,
//   FiPower,
//   FiSettings,
//   FiSlash,
//   FiTerminal,
//   FiTrendingUp,
//   FiTrendingDown,
//   FiZap,
// } from 'react-icons/fi'
// import {
//   ResponsiveContainer,
//   RadarChart,
//   Radar,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   LineChart,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip as RechartsTooltip,
//   Legend,
//   Line,
// } from 'recharts'

// interface DeploymentEndpoint {
//   id: string
//   name: string
//   status: 'running' | 'stopped' | 'failed'
//   url: string
//   version: string
//   resources: {
//     cpu: string
//     memory: string
//     gpu: string
//   }
//   metrics: {
//     requestsPerMinute: number
//     averageLatency: number
//     errorRate: number
//     successRate: number
//     p95Latency: number
//     p99Latency: number
//   }
//   lastUpdated: string
//   autoScaling?: {
//     enabled: boolean
//     minReplicas: number
//     maxReplicas: number
//     targetCPUUtilization: number
//     targetMemoryUtilization: number
//   }
//   healthCheck?: {
//     enabled: boolean
//     path: string
//     interval: number
//     timeout: number
//     successThreshold: number
//     failureThreshold: number
//   }
//   currentVersion: {
//     version: string
//     metrics: {
//       accuracy: number
//       precision: number
//       recall: number
//       f1Score: number
//       auc: number
//       latency: number
//       throughput: number
//     }
//     trainingHistory: {
//       epoch: number
//       trainAccuracy: number
//       valAccuracy: number
//       trainLoss: number
//       valLoss: number
//     }[]
//   }
//   previousVersion?: {
//     version: string
//     metrics: {
//       accuracy: number
//       precision: number
//       recall: number
//       f1Score: number
//       auc: number
//       latency: number
//       throughput: number
//     }
//     trainingHistory: {
//       epoch: number
//       trainAccuracy: number
//       valAccuracy: number
//       trainLoss: number
//       valLoss: number
//     }[]
//   }
// }

// interface EndpointConfig {
//   name: string
//   instanceType: string
//   autoScaling: boolean
//   minInstances: number
//   maxInstances: number
//   memoryLimit: number
//   timeout: number
// }

// interface Endpoint {
//   id: string
//   name: string
//   status: 'running' | 'stopped' | 'failed'
//   url: string
//   version: string
//   createdAt: string
//   resources: {
//     instanceType: string
//     autoScaling: boolean
//     minInstances: number
//     maxInstances: number
//     memoryLimit: number
//     timeout: number
//   }
//   metrics?: {
//     requestsPerMinute: number
//     averageLatency: number
//     errorRate: number
//     successRate: number
//   }
// }

// interface ModelDeploymentProps {
//   model: {
//     id: string
//     name: string
//     currentVersion: string
//     versions: string[]
//   }
// }

// // 목업 데이터
// const mockEndpoints: Endpoint[] = [
//   {
//     id: 'endpoint-1',
//     name: '프로덕션 엔드포인트',
//     status: 'running',
//     url: 'https://api.4inlab.kr/models/endpoint-1',
//     version: '1.0.0',
//     createdAt: new Date().toISOString(),
//     resources: {
//       instanceType: 'cpu.medium',
//       autoScaling: true,
//       minInstances: 1,
//       maxInstances: 3,
//       memoryLimit: 4096,
//       timeout: 30
//     },
//     metrics: {
//       requestsPerMinute: 250,
//       averageLatency: 45,
//       errorRate: 0.2,
//       successRate: 99.8
//     }
//   }
// ]

// // API 호출 함수들 (목업)
// const createEndpoint = async (modelId: string, config: EndpointConfig): Promise<Endpoint> => {
//   // 2초 딜레이로 비동기 시뮬레이션
//   await new Promise(resolve => setTimeout(resolve, 2000))

//   const newEndpoint: Endpoint = {
//     id: `endpoint-${Date.now()}`,
//     name: config.name,
//     status: 'running',
//     url: `https://api.4inlab.kr/models/${modelId}/${config.name}`,
//     version: '1.0.0',
//     createdAt: new Date().toISOString(),
//     resources: {
//       instanceType: config.instanceType,
//       autoScaling: config.autoScaling,
//       minInstances: config.minInstances,
//       maxInstances: config.maxInstances,
//       memoryLimit: config.memoryLimit,
//       timeout: config.timeout
//     },
//     metrics: {
//       requestsPerMinute: 0,
//       averageLatency: 0,
//       errorRate: 0,
//       successRate: 100
//     }
//   }

//   mockEndpoints.push(newEndpoint)
//   return newEndpoint
// }

// const deleteEndpoint = async (modelId: string, endpointId: string): Promise<void> => {
//   await new Promise(resolve => setTimeout(resolve, 1000))
//   const index = mockEndpoints.findIndex(e => e.id === endpointId)
//   if (index !== -1) {
//     mockEndpoints.splice(index, 1)
//   }
// }

// const updateEndpointStatus = async (
//   modelId: string,
//   endpointId: string,
//   action: 'start' | 'stop'
// ): Promise<Endpoint> => {
//   await new Promise(resolve => setTimeout(resolve, 1000))
//   const endpoint = mockEndpoints.find(e => e.id === endpointId)
//   if (!endpoint) {
//     throw new Error('엔드포인트를 찾을 수 없습니다.')
//   }
//   endpoint.status = action === 'start' ? 'running' : 'stopped'
//   return endpoint
// }

// const getEndpoints = async (modelId: string): Promise<Endpoint[]> => {
//   await new Promise(resolve => setTimeout(resolve, 1000))
//   return mockEndpoints
// }

// export const ModelDeployment: React.FC<ModelDeploymentProps> = ({
//   modelId,
//   modelName,
//   currentVersion,
// }) => {
//   const { isOpen, onOpen, onClose } = useDisclosure()
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
//   const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null)
//   const [endpoints, setEndpoints] = useState<Endpoint[]>(mockEndpoints)
//   const [isLoading, setIsLoading] = useState(false)
//   const [isActionLoading, setIsActionLoading] = useState(false)
//   const toast = useToast()
  
//   const [config, setConfig] = useState<EndpointConfig>({
//     name: '',
//     instanceType: 'cpu.small',
//     autoScaling: true,
//     minInstances: 1,
//     maxInstances: 3,
//     memoryLimit: 4096,
//     timeout: 30,
//   })

//   const [currentTime, setCurrentTime] = useState<string>('')

//   useEffect(() => {
//     // 클라이언트 사이드에서만 시간을 설정
//     setCurrentTime(new Date().toLocaleString())
    
//     // 1초마다 시간 업데이트
//     const timer = setInterval(() => {
//       setCurrentTime(new Date().toLocaleString())
//     }, 1000)

//     return () => clearInterval(timer)
//   }, [])

//   // 메모이제이션된 색상 값들
//   const colors = useMemo(() => ({
//     bg: useColorModeValue('white', 'gray.800'),
//     borderColor: useColorModeValue('gray.100', 'gray.700'),
//     textColor: useColorModeValue('gray.600', 'gray.400'),
//     headingColor: useColorModeValue('gray.700', 'white'),
//     cardHoverBg: useColorModeValue('orange.50', 'gray.700'),
//     orange: '#EB6100'
//   }), [])

//   // 메모이제이션된 스타일
//   const styles = useMemo(() => ({
//     cardTransition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
//     cardHoverStyle: {
//       transform: 'translateY(-2px)',
//       boxShadow: 'lg',
//       borderColor: colors.orange,
//       transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
//     },
//     iconStyle: {
//       color: colors.orange
//     }
//   }), [colors.orange])

//   // 엔드포인트 생성
//   const handleCreateEndpoint = async () => {
//     setIsLoading(true)
//     try {
//       const newEndpoint = await createEndpoint(modelId, config)
//       setEndpoints(prev => [...prev, newEndpoint])
      
//       toast({
//         title: '엔드포인트 생성 완료',
//         description: `${config.name} 엔드포인트가 성공적으로 생성되었습니다.`,
//         status: 'success',
//         duration: 5000,
//         isClosable: true,
//       })
//       onClose()
//     } catch (error) {
//       toast({
//         title: '엔드포인트 생성 실패',
//         description: error instanceof Error ? error.message : '엔드포인트 생성 중 오류가 발생했습니다.',
//         status: 'error',
//         duration: 5000,
//         isClosable: true,
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // 엔드포인트 삭제
//   const handleDeleteEndpoint = async () => {
//     if (!selectedEndpoint) return

//     setIsActionLoading(true)
//     try {
//       await deleteEndpoint(modelId, selectedEndpoint.id)
//       setEndpoints(prev => prev.filter(e => e.id !== selectedEndpoint.id))
      
//       toast({
//         title: '엔드포인트 삭제 완료',
//         description: `${selectedEndpoint.name} 엔드포인트가 삭제되었습니다.`,
//         status: 'success',
//         duration: 5000,
//         isClosable: true,
//       })
//       setIsDeleteDialogOpen(false)
//     } catch (error) {
//       toast({
//         title: '엔드포인트 삭제 실패',
//         description: error instanceof Error ? error.message : '엔드포인트 삭제 중 오류가 발생했습니다.',
//         status: 'error',
//         duration: 5000,
//         isClosable: true,
//       })
//     } finally {
//       setIsActionLoading(false)
//       setSelectedEndpoint(null)
//     }
//   }

//   // 엔드포인트 상태 변경 (시작/중지)
//   const handleEndpointAction = async (endpoint: Endpoint, action: 'start' | 'stop') => {
//     setIsActionLoading(true)
//     try {
//       const updatedEndpoint = await updateEndpointStatus(modelId, endpoint.id, action)
//       setEndpoints(prev => prev.map(e => e.id === endpoint.id ? updatedEndpoint : e))
      
//       toast({
//         title: `엔드포인트 ${action === 'start' ? '시작' : '중지'} 완료`,
//         description: `${endpoint.name} 엔드포인트가 ${action === 'start' ? '시작' : '중지'}되었습니다.`,
//         status: 'success',
//         duration: 5000,
//         isClosable: true,
//       })
//     } catch (error) {
//       toast({
//         title: `엔드포인트 ${action === 'start' ? '시작' : '중지'} 실패`,
//         description: error instanceof Error ? error.message : `엔드포인트 ${action === 'start' ? '시작' : '중지'} 중 오류가 발생했습니다.`,
//         status: 'error',
//         duration: 5000,
//         isClosable: true,
//       })
//     } finally {
//       setIsActionLoading(false)
//     }
//   }

//   return (
//     <>
//       <Stack spacing={6}>
//         {/* Actions Bar */}
//         <HStack justify="flex-end">
//           <Button
//             leftIcon={<Icon as={FiCloud} />}
//             bg={colors.orange}
//             color="white"
//             _hover={{ bg: '#D45500', transform: 'translateY(-2px)' }}
//             _active={{ bg: '#C04800' }}
//             onClick={onOpen}
//             transition={styles.cardTransition}
//           >
//             새 엔드포인트 생성
//           </Button>
//         </HStack>

//         {/* Endpoints List */}
//         {endpoints.map(endpoint => (
//           <Card 
//             key={endpoint.id} 
//             bg={colors.bg}
//             borderColor={colors.borderColor}
//             transition={styles.cardTransition}
//             _hover={{
//               transform: 'translateY(-2px)',
//               boxShadow: 'lg',
//               borderColor: colors.orange
//             }}
//           >
//             <CardBody>
//               <Stack spacing={6}>
//                 {/* Header */}
//                 <HStack justify="space-between">
//                   <VStack align="start" spacing={1}>
//                     <Heading size="md" color={colors.headingColor}>{endpoint.name}</Heading>
//                     <Text color={colors.textColor} fontSize="sm">
//                       {endpoint.url}
//                     </Text>
//                   </VStack>
//                   <HStack>
//                     <Badge
//                       colorScheme={endpoint.status === 'running' ? 'green' : 'gray'}
//                       fontSize="sm"
//                       px={3}
//                       py={1}
//                       borderRadius="full"
//                     >
//                       {endpoint.status}
//                     </Badge>
//                     <Menu>
//                       <MenuButton
//                         as={IconButton}
//                         aria-label="Options"
//                         icon={<FiMoreVertical />}
//                         variant="ghost"
//                         size="sm"
//                         _hover={{ bg: colors.cardHoverBg }}
//                       />
//                       <MenuList>
//                         <MenuItem
//                           icon={<Icon as={FiPlay} style={styles.iconStyle} />}
//                           onClick={() => handleEndpointAction(endpoint, 'start')}
//                           isDisabled={endpoint.status === 'running' || isActionLoading}
//                         >
//                           시작
//                         </MenuItem>
//                         <MenuItem
//                           icon={<Icon as={FiSlash} style={styles.iconStyle} />}
//                           onClick={() => handleEndpointAction(endpoint, 'stop')}
//                           isDisabled={endpoint.status === 'stopped' || isActionLoading}
//                         >
//                           중지
//                         </MenuItem>
//                         <MenuDivider />
//                         <MenuItem
//                           icon={<Icon as={FiPower} color="red.500" />}
//                           onClick={() => {
//                             setSelectedEndpoint(endpoint)
//                             setIsDeleteDialogOpen(true)
//                           }}
//                           color="red.500"
//                           isDisabled={isActionLoading}
//                         >
//                           삭제
//                         </MenuItem>
//                       </MenuList>
//                     </Menu>
//                   </HStack>
//                 </HStack>

//                 {/* Resources */}
//                 <Box>
//                   <Text fontSize="sm" fontWeight="medium" mb={2} color={colors.headingColor}>
//                     리소스
//                   </Text>
//                   <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
//                     <HStack>
//                       <Icon as={FiCpu} style={styles.iconStyle} />
//                       <Text color={colors.textColor}>CPU: {endpoint.resources.instanceType}</Text>
//                     </HStack>
//                     <HStack>
//                       <Icon as={FiDatabase} style={styles.iconStyle} />
//                       <Text color={colors.textColor}>메모리: {endpoint.resources.memoryLimit}MB</Text>
//                     </HStack>
//                     <HStack>
//                       <Icon as={FiHardDrive} style={styles.iconStyle} />
//                       <Text color={colors.textColor}>GPU: {endpoint.resources.instanceType.includes('gpu') ? '있음' : '없음'}</Text>
//                     </HStack>
//                   </SimpleGrid>
//                 </Box>

//                 {/* Metrics */}
//                 <Box>
//                   <Text fontSize="sm" fontWeight="medium" mb={2} color={colors.headingColor}>
//                     성능 지표
//                   </Text>
//                   <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
//                     <Stat size="sm">
//                       <StatLabel color={colors.textColor}>요청/분</StatLabel>
//                       <StatNumber color={colors.headingColor}>{endpoint.metrics?.requestsPerMinute}</StatNumber>
//                     </Stat>
//                     <Stat size="sm">
//                       <StatLabel color={colors.textColor}>평균 지연시간</StatLabel>
//                       <StatNumber color={colors.headingColor}>{endpoint.metrics?.averageLatency}ms</StatNumber>
//                     </Stat>
//                     <Stat size="sm">
//                       <StatLabel color={colors.textColor}>에러율</StatLabel>
//                       <StatNumber color={colors.headingColor}>{endpoint.metrics?.errorRate}%</StatNumber>
//                     </Stat>
//                     <Stat size="sm">
//                       <StatLabel color={colors.textColor}>성공률</StatLabel>
//                       <StatNumber color={colors.headingColor}>{endpoint.metrics?.successRate}%</StatNumber>
//                     </Stat>
//                   </SimpleGrid>
//                 </Box>

//                 {/* Last Updated */}
//                 <Text color={colors.textColor}>
//                   마지막 업데이트: {currentTime || '시간 로딩 중...'}
//                 </Text>
//               </Stack>
//             </CardBody>
//           </Card>
//         ))}
//       </Stack>

//       {/* Create Endpoint Modal */}
//       <Modal isOpen={isOpen} onClose={onClose} size="xl">
//         <ModalOverlay />
//         <ModalContent bg={colors.bg}>
//           <ModalHeader color={colors.headingColor}>새 엔드포인트 생성</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <Stack spacing={6}>
//               <FormControl>
//                 <FormLabel color={colors.textColor}>엔드포인트 이름</FormLabel>
//                 <Input
//                   placeholder="production-endpoint"
//                   value={config.name}
//                   onChange={(e) => setConfig({ ...config, name: e.target.value })}
//                   bg={colors.bg}
//                   borderColor={colors.borderColor}
//                   _hover={{ borderColor: colors.orange }}
//                   _focus={{ borderColor: colors.orange, boxShadow: `0 0 0 1px ${colors.orange}` }}
//                 />
//               </FormControl>

//               <FormControl>
//                 <FormLabel color={colors.textColor}>인스턴스 타입</FormLabel>
//                 <Select
//                   value={config.instanceType}
//                   onChange={(e) => setConfig({ ...config, instanceType: e.target.value })}
//                   bg={colors.bg}
//                   borderColor={colors.borderColor}
//                   _hover={{ borderColor: colors.orange }}
//                   _focus={{ borderColor: colors.orange, boxShadow: `0 0 0 1px ${colors.orange}` }}
//                 >
//                   {[
//                     { value: 'cpu.small', label: 'CPU Small (2 vCPU, 4GB RAM)', icon: FiCpu },
//                     { value: 'cpu.medium', label: 'CPU Medium (4 vCPU, 8GB RAM)', icon: FiCpu },
//                     { value: 'cpu.large', label: 'CPU Large (8 vCPU, 16GB RAM)', icon: FiCpu },
//                     { value: 'gpu.small', label: 'GPU Small (1 GPU, 8GB RAM)', icon: FiZap },
//                     { value: 'gpu.medium', label: 'GPU Medium (2 GPU, 16GB RAM)', icon: FiZap },
//                     { value: 'gpu.large', label: 'GPU Large (4 GPU, 32GB RAM)', icon: FiZap },
//                   ].map((type) => (
//                     <option key={type.value} value={type.value}>
//                       {type.label}
//                     </option>
//                   ))}
//                 </Select>
//               </FormControl>

//               <FormControl display="flex" alignItems="center">
//                 <FormLabel mb="0" color={colors.textColor}>자동 스케일링 활성화</FormLabel>
//                 <Switch
//                   colorScheme="orange"
//                   isChecked={config.autoScaling}
//                   onChange={(e) => setConfig({ ...config, autoScaling: e.target.checked })}
//                 />
//               </FormControl>

//               {config.autoScaling && (
//                 <Flex gap={4}>
//                   <FormControl>
//                     <FormLabel color={colors.textColor}>최소 인스턴스</FormLabel>
//                     <Input
//                       type="number"
//                       value={config.minInstances}
//                       onChange={(e) => setConfig({ ...config, minInstances: parseInt(e.target.value) })}
//                       bg={colors.bg}
//                       borderColor={colors.borderColor}
//                       _hover={{ borderColor: colors.orange }}
//                       _focus={{ borderColor: colors.orange, boxShadow: `0 0 0 1px ${colors.orange}` }}
//                     />
//                   </FormControl>
//                   <FormControl>
//                     <FormLabel color={colors.textColor}>최대 인스턴스</FormLabel>
//                     <Input
//                       type="number"
//                       value={config.maxInstances}
//                       onChange={(e) => setConfig({ ...config, maxInstances: parseInt(e.target.value) })}
//                       bg={colors.bg}
//                       borderColor={colors.borderColor}
//                       _hover={{ borderColor: colors.orange }}
//                       _focus={{ borderColor: colors.orange, boxShadow: `0 0 0 1px ${colors.orange}` }}
//                     />
//                   </FormControl>
//                 </Flex>
//               )}

//               <FormControl>
//                 <FormLabel color={colors.textColor}>메모리 제한 (MB)</FormLabel>
//                 <Input
//                   type="number"
//                   value={config.memoryLimit}
//                   onChange={(e) => setConfig({ ...config, memoryLimit: parseInt(e.target.value) })}
//                   bg={colors.bg}
//                   borderColor={colors.borderColor}
//                   _hover={{ borderColor: colors.orange }}
//                   _focus={{ borderColor: colors.orange, boxShadow: `0 0 0 1px ${colors.orange}` }}
//                 />
//               </FormControl>

//               <FormControl>
//                 <FormLabel color={colors.textColor}>타임아웃 (초)</FormLabel>
//                 <Input
//                   type="number"
//                   value={config.timeout}
//                   onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })}
//                   bg={colors.bg}
//                   borderColor={colors.borderColor}
//                   _hover={{ borderColor: colors.orange }}
//                   _focus={{ borderColor: colors.orange, boxShadow: `0 0 0 1px ${colors.orange}` }}
//                 />
//               </FormControl>
//             </Stack>
//           </ModalBody>

//           <ModalFooter>
//             <Button variant="ghost" mr={3} onClick={onClose}>
//               취소
//             </Button>
//             <Button
//               bg={colors.orange}
//               color="white"
//               leftIcon={<Icon as={FiCloud} />}
//               onClick={handleCreateEndpoint}
//               isLoading={isLoading}
//               _hover={{ bg: '#D45500' }}
//               _active={{ bg: '#C04800' }}
//             >
//               엔드포인트 생성
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog
//         isOpen={isDeleteDialogOpen}
//         leastDestructiveRef={null}
//         onClose={() => setIsDeleteDialogOpen(false)}
//       >
//         <AlertDialogOverlay>
//           <AlertDialogContent bg={colors.bg}>
//             <AlertDialogHeader fontSize="lg" fontWeight="bold" color={colors.headingColor}>
//               엔드포인트 삭제
//             </AlertDialogHeader>

//             <AlertDialogBody color={colors.textColor}>
//               {selectedEndpoint?.name} 엔드포인트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
//             </AlertDialogBody>

//             <AlertDialogFooter>
//               <Button onClick={() => setIsDeleteDialogOpen(false)}>
//                 취소
//               </Button>
//               <Button 
//                 colorScheme="red" 
//                 onClick={handleDeleteEndpoint} 
//                 ml={3}
//                 isLoading={isActionLoading}
//               >
//                 삭제
//               </Button>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialogOverlay>
//       </AlertDialog>
//     </>
//   )
// }

// 1. Thay đổi chỗ mockEndpoints và các hàm liên quan
// 2. Dùng fetch để lấy dữ liệu từ API thật
// 3. Giữ nguyên toàn bộ logic UI khác

'use client'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Switch,
  Tag,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import { useRef } from 'react';
import {
  FiCpu,
  FiDatabase,
  FiHardDrive,
  FiPlay,
  FiSlash,
  FiPower,
  FiMoreVertical,
  FiCloud,
  FiZap
} from 'react-icons/fi'
import { useEffect, useMemo, useState } from 'react'

interface Endpoint {
  id: string
  name: string
  status: 'running' | 'stopped' | 'failed'
  url: string
  version: string
  createdAt: string
  resources: {
    instanceType: string
    autoScaling: boolean
    minInstances: number
    maxInstances: number
    memoryLimit: number
    timeout: number
  }
  metrics?: {
    requestsPerMinute: number
    averageLatency: number
    errorRate: number
    successRate: number
  }
}

interface EndpointConfig {
  name: string
  instanceType: string
  autoScaling: boolean
  minInstances: number
  maxInstances: number
  memoryLimit: number
  timeout: number
}

interface ModelDeploymentProps {
  model: {
    id: string
    name: string
    currentVersion: string
    versions: string[]
  }
}

const mockEndpoints: Endpoint[] = [];

// API 호출 함수들 (목업)
const createEndpoint = async (modelId: string, config: EndpointConfig): Promise<Endpoint> => {
  // 2초 딜레이로 비동기 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 2000))

  const newEndpoint: Endpoint = {
    id: `endpoint-${Date.now()}`,
    name: config.name,
    status: 'running',
    url: `https://api.4inlab.kr/models/${modelId}/${config.name}`,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    resources: {
      instanceType: config.instanceType,
      autoScaling: config.autoScaling,
      minInstances: config.minInstances,
      maxInstances: config.maxInstances,
      memoryLimit: config.memoryLimit,
      timeout: config.timeout
    },
    metrics: {
      requestsPerMinute: 0,
      averageLatency: 0,
      errorRate: 0,
      successRate: 100
    }
  }

  mockEndpoints.push(newEndpoint)
  return newEndpoint
}

const deleteEndpoint = async (modelId: string, endpointId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const index = mockEndpoints.findIndex(e => e.id === endpointId)
  if (index !== -1) {
    mockEndpoints.splice(index, 1)
  }
}

const updateEndpointStatus = async (
  modelId: string,
  endpointId: string,
  action: 'start' | 'stop'
): Promise<Endpoint> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const endpoint = mockEndpoints.find(e => e.id === endpointId)
  if (!endpoint) {
    throw new Error('엔드포인트를 찾을 수 없습니다.')
  }
  endpoint.status = action === 'start' ? 'running' : 'stopped'
  return endpoint
}

const getEndpoints = async (modelId: string): Promise<Endpoint[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return mockEndpoints
}

export const ModelDeployment: React.FC<ModelDeploymentProps> = ({
  model
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null)
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>('')
  const leastDestructiveRef = useRef<HTMLElement | null>(null);


  const toast = useToast()

  const [config, setConfig] = useState<EndpointConfig>({
    name: '',
    instanceType: 'cpu.small',
    autoScaling: true,
    minInstances: 1,
    maxInstances: 3,
    memoryLimit: 4096,
    timeout: 30,
  })

  const colors = useMemo(() => ({
    bg: useColorModeValue('white', 'gray.800'),
    borderColor: useColorModeValue('gray.100', 'gray.700'),
    textColor: useColorModeValue('gray.600', 'gray.400'),
    headingColor: useColorModeValue('gray.700', 'white'),
    cardHoverBg: useColorModeValue('orange.50', 'gray.700'),
    orange: '#EB6100'
  }), [])

  const styles = useMemo(() => ({
    cardTransition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    cardHoverStyle: {
      transform: 'translateY(-2px)',
      boxShadow: 'lg',
      borderColor: colors.orange,
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
    },
    iconStyle: {
      color: colors.orange
    }
  }), [colors.orange])

  const fetchEndpoints = async () => {
    try {
      const res = await fetch(`http://192.168.219.52:8686/api/models/deploy/${model.id}`)
      const data: Endpoint[] = await res.json()
      setEndpoints(data)
    } catch (error) {
      toast({
        title: '엔드포인트 불러오기 실패',
        description: 'API 요청 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  useEffect(() => {
    fetchEndpoints()
  }, [model.id])

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString())
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

    // 엔드포인트 생성
  const handleCreateEndpoint = async () => {
    setIsLoading(true)
    try {
      const newEndpoint = await createEndpoint(model.id, config)
      setEndpoints(prev => [...prev, newEndpoint])
      
      toast({
        title: '엔드포인트 생성 완료',
        description: `${config.name} 엔드포인트가 성공적으로 생성되었습니다.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      onClose()
    } catch (error) {
      toast({
        title: '엔드포인트 생성 실패',
        description: error instanceof Error ? error.message : '엔드포인트 생성 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 엔드포인트 삭제
  const handleDeleteEndpoint = async () => {
    if (!selectedEndpoint) return

    setIsActionLoading(true)
    try {
      await deleteEndpoint(model.id, selectedEndpoint.id)
      setEndpoints(prev => prev.filter(e => e.id !== selectedEndpoint.id))
      
      toast({
        title: '엔드포인트 삭제 완료',
        description: `${selectedEndpoint.name} 엔드포인트가 삭제되었습니다.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: '엔드포인트 삭제 실패',
        description: error instanceof Error ? error.message : '엔드포인트 삭제 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsActionLoading(false)
      setSelectedEndpoint(null)
    }
  }

  // 엔드포인트 상태 변경 (시작/중지)
  const handleEndpointAction = async (endpoint: Endpoint, action: 'start' | 'stop') => {
    setIsActionLoading(true)
    try {
      const updatedEndpoint = await updateEndpointStatus(model.id, endpoint.id, action)
      setEndpoints(prev => prev.map(e => e.id === endpoint.id ? updatedEndpoint : e))
      
      toast({
        title: `엔드포인트 ${action === 'start' ? '시작' : '중지'} 완료`,
        description: `${endpoint.name} 엔드포인트가 ${action === 'start' ? '시작' : '중지'}되었습니다.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: `엔드포인트 ${action === 'start' ? '시작' : '중지'} 실패`,
        description: error instanceof Error ? error.message : `엔드포인트 ${action === 'start' ? '시작' : '중지'} 중 오류가 발생했습니다.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  return (
    <Stack spacing={6}>
      <HStack justify="flex-end">
        <Button
          leftIcon={<Icon as={FiCloud} />}
          bg={colors.orange}
          color="white"
          _hover={{ bg: '#D45500', transform: 'translateY(-2px)' }}
          _active={{ bg: '#C04800' }}
          onClick={onOpen}
          transition={styles.cardTransition}
        >
          새 엔드포인트 생성
        </Button>
      </HStack>

      {endpoints.map(endpoint => (
        <Card key={endpoint.id} bg={colors.bg} borderColor={colors.borderColor} transition={styles.cardTransition} _hover={styles.cardHoverStyle}>
          <CardBody>
            <Stack spacing={6}>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Heading size="md" color={colors.headingColor}>{endpoint.name}</Heading>
                  <Text color={colors.textColor} fontSize="sm">{endpoint.url}</Text>
                </VStack>
                <HStack>
                  <Badge
                    colorScheme={endpoint.status === 'running' ? 'green' : 'gray'}
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {endpoint.status}
                  </Badge>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Options"
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="sm"
                      _hover={{ bg: colors.cardHoverBg }}
                    />
                    <MenuList>
                      <MenuItem
                        icon={<Icon as={FiPlay} style={styles.iconStyle} />}
                        onClick={() => handleEndpointAction(endpoint, 'start')}
                        isDisabled={endpoint.status === 'running' || isActionLoading}
                      >
                        시작
                      </MenuItem>
                      <MenuItem
                        icon={<Icon as={FiSlash} style={styles.iconStyle} />}
                        onClick={() => handleEndpointAction(endpoint, 'stop')}
                        isDisabled={endpoint.status === 'stopped' || isActionLoading}
                      >
                        중지
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem
                        icon={<Icon as={FiPower} color="red.500" />}
                        onClick={() => {
                          setSelectedEndpoint(endpoint)
                          setIsDeleteDialogOpen(true)
                        }}
                        color="red.500"
                        isDisabled={isActionLoading}
                      >
                        삭제
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
              </HStack>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2} color={colors.headingColor}>리소스</Text>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <HStack><Icon as={FiCpu} style={styles.iconStyle} /><Text color={colors.textColor}>CPU: {endpoint.resources.instanceType}</Text></HStack>
                  <HStack><Icon as={FiDatabase} style={styles.iconStyle} /><Text color={colors.textColor}>메모리: {endpoint.resources.memoryLimit}MB</Text></HStack>
                  <HStack><Icon as={FiHardDrive} style={styles.iconStyle} /><Text color={colors.textColor}>GPU: {endpoint.resources.instanceType.includes('gpu') ? '있음' : '없음'}</Text></HStack>
                </SimpleGrid>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2} color={colors.headingColor}>성능 지표</Text>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Stat><StatLabel color={colors.textColor}>요청/분</StatLabel><StatNumber color={colors.headingColor}>{endpoint.metrics?.requestsPerMinute}</StatNumber></Stat>
                  <Stat><StatLabel color={colors.textColor}>평균 지연시간</StatLabel><StatNumber color={colors.headingColor}>{endpoint.metrics?.averageLatency}ms</StatNumber></Stat>
                  <Stat><StatLabel color={colors.textColor}>에러율</StatLabel><StatNumber color={colors.headingColor}>{endpoint.metrics?.errorRate}%</StatNumber></Stat>
                  <Stat><StatLabel color={colors.textColor}>성공률</StatLabel><StatNumber color={colors.headingColor}>{endpoint.metrics?.successRate}%</StatNumber></Stat>
                </SimpleGrid>
              </Box>

              <Text color={colors.textColor}>마지막 업데이트: {currentTime}</Text>
            </Stack>
          </CardBody>
        </Card>
      ))}

       {/* Create Endpoint Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
         <ModalOverlay />
         <ModalContent bg={colors.bg}>
           <ModalHeader color={colors.headingColor}>새 엔드포인트 생성</ModalHeader>
           <ModalCloseButton />
           <ModalBody>
             <Stack spacing={6}>
               <FormControl>
                 <FormLabel color={colors.textColor}>엔드포인트 이름</FormLabel>
                <Input
                  placeholder="production-endpoint"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  bg={colors.bg}
                  borderColor={colors.borderColor}
                  _hover={{ borderColor: colors.orange }}
                  _focus={{ borderColor: colors.orange, boxShadow: `0 0 0 1px ${colors.orange}` }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={colors.textColor}>인스턴스 타입</FormLabel>
                <Select
                  value={config.instanceType}
                  onChange={(e) => setConfig({ ...config, instanceType: e.target.value })}
                  bg={colors.bg}
                  borderColor={colors.borderColor}
                  _hover={{ borderColor: colors.orange }}
                  _focus={{ borderColor: colors.orange, boxShadow: `0 0 0 1px ${colors.orange}` }}
                >
                  {[
                    { value: 'cpu.small', label: 'CPU Small (2 vCPU, 4GB RAM)', icon: FiCpu },
                    { value: 'cpu.medium', label: 'CPU Medium (4 vCPU, 8GB RAM)', icon: FiCpu },
                    { value: 'cpu.large', label: 'CPU Large (8 vCPU, 16GB RAM)', icon: FiCpu },
                    { value: 'gpu.small', label: 'GPU Small (1 GPU, 8GB RAM)', icon: FiZap },
                    { value: 'gpu.medium', label: 'GPU Medium (2 GPU, 16GB RAM)', icon: FiZap },
                    { value: 'gpu.large', label: 'GPU Large (4 GPU, 32GB RAM)', icon: FiZap },
                  ].map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0" color={colors.textColor}>자동 스케일링 활성화</FormLabel>
                <Switch
                  colorScheme="orange"
                  isChecked={config.autoScaling}
                  onChange={(e) => setConfig({ ...config, autoScaling: e.target.checked })}
                />
              </FormControl>

              {config.autoScaling && (
                <Flex gap={4}>
                  <FormControl>
                    <FormLabel color={colors.textColor}>최소 인스턴스</FormLabel>
                    <Input
                      type="number"
                      value={config.minInstances}
                      onChange={(e) => setConfig({ ...config, minInstances: parseInt(e.target.value) })}
                      bg={colors.bg}
                      borderColor={colors.borderColor}
                      _hover={{ borderColor: colors.orange }}
                      _focus={{ borderColor: colors.orange, boxShadow: `0 0 0 1px ${colors.orange}` }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color={colors.textColor}>최대 인스턴스</FormLabel>
                    <Input
                      type="number"
                      value={config.maxInstances}
                      onChange={(e) => setConfig({ ...config, maxInstances: parseInt(e.target.value) })}
                      bg={colors.bg}
                      borderColor={colors.borderColor}
                      _hover={{ borderColor: colors.orange }}
                      _focus={{ borderColor: colors.orange, boxShadow: `0 0 0 1px ${colors.orange}` }}
                    />
                  </FormControl>
                </Flex>
              )}

              <FormControl>
                <FormLabel color={colors.textColor}>메모리 제한 (MB)</FormLabel>
                <Input
                  type="number"
                  value={config.memoryLimit}
                  onChange={(e) => setConfig({ ...config, memoryLimit: parseInt(e.target.value) })}
                  bg={colors.bg}
                  borderColor={colors.borderColor}
                  _hover={{ borderColor: colors.orange }}
                  _focus={{ borderColor: colors.orange, boxShadow: `0 0 0 1px ${colors.orange}` }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={colors.textColor}>타임아웃 (초)</FormLabel>
                <Input
                  type="number"
                  value={config.timeout}
                  onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })}
                  bg={colors.bg}
                  borderColor={colors.borderColor}
                  _hover={{ borderColor: colors.orange }}
                  _focus={{ borderColor: colors.orange, boxShadow: `0 0 0 1px ${colors.orange}` }}
                />
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              취소
            </Button>
            <Button
              bg={colors.orange}
              color="white"
              leftIcon={<Icon as={FiCloud} />}
              onClick={handleCreateEndpoint}
              isLoading={isLoading}
              _hover={{ bg: '#D45500' }}
              _active={{ bg: '#C04800' }}
            >
              엔드포인트 생성
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 삭제 다이얼로그 */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={leastDestructiveRef}  // Sử dụng ref đã khởi tạo
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={colors.bg}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color={colors.headingColor}>엔드포인트 삭제</AlertDialogHeader>
            <AlertDialogBody color={colors.textColor}>
              {selectedEndpoint?.name} 엔드포인트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={() => setIsDeleteDialogOpen(false)}>취소</Button>
              <Button colorScheme="red" onClick={handleDeleteEndpoint} ml={3} isLoading={isActionLoading}>삭제</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Stack>
  )
}

