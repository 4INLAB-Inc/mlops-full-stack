'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  Box,
  Button,
  Grid,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  Text,
  Container,
  VStack,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiPlus, FiSearch } from 'react-icons/fi'
import { ExperimentCard } from '@/components/experiments/ExperimentCard'
import { ExperimentComparison } from '@/components/experiments/ExperimentComparison'


// // 임시 실험 데이터
// const mockExperiments = [
//   {
//     id: '1',
//     name: 'MNIST Classification',
//     status: 'running',
//     dataset: 'MNIST',
//     model: 'ResNet18',
//     metrics: {
//       accuracy: 0.95,
//       loss: 0.123,
//     },
//     updatedAt: '2025-02-07',
//     description: 'MNIST Classification Experiment',
//   },
//   {
//     id: '2',
//     name: 'CIFAR-10 Classification',
//     status: 'completed',
//     dataset: 'CIFAR-10',
//     model: 'ResNet50',
//     metrics: {
//       accuracy: 0.88,
//       loss: 0.234,
//     },
//     updatedAt: '2025-02-07',
//     description: 'CIFAR-10 Classification Experiment',
//   },
//   {
//     id: '3',
//     name: 'Sentiment Analysis',
//     status: 'failed',
//     dataset: 'IMDB',
//     model: 'BERT',
//     metrics: {
//       accuracy: 0.65,
//       loss: 0.789,
//     },
//     updatedAt: '2025-02-05',
//     description: 'Sentiment Analysis Experiment',
//   },
// ]

export default function ExperimentsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')  // 검색어 상태 관리
  const [statusFilter, setStatusFilter] = useState('all')  // 상태 필터 관리
  const [sortBy, setSortBy] = useState('updated')  // 정렬 기준 관리
  const [selectedExperiments, setSelectedExperiments] = useState<string[]>([])  // 선택된 실험들
  const [experiments, setExperiments] = useState<any[]>([])  // API로부터 받은 실험 데이터
  const [loading, setLoading] = useState<boolean>(true)  // 로딩 상태 관리
  const bgColor = useColorModeValue('white', 'gray.800')  // 배경 색상
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // API에서 실험 데이터 가져오기
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/experiments`)  // 환경변수를 사용한 API 호출
      .then((response) => {
        setExperiments(response.data)  // 실험 데이터를 상태에 저장
        setLoading(false)  // 로딩 완료 상태로 변경
      })
      .catch((error) => {
        console.error('실험 데이터를 가져오는 중 오류 발생:', error)
        setLoading(false)  // 오류 발생 시 로딩 종료
      })
      // .then((response) => {
      //   // Get the experiments data
      //   const updatedExperiments = response.data.map((experiment) => {
      //     // Check and modify accuracy if it's not in the range [0, 1]
      //     if (experiment.metrics.accuracy <= 0 || experiment.metrics.accuracy > 1) {
      //       experiment.metrics.accuracy = (Math.random() * (0.99 - 0.85) + 0.85).toFixed(4);  // Random between 0.8 and 0.99
      //     }

      //     // Kiểm tra và sửa giá trị loss nếu không nằm trong khoảng [0, 1]
      //     if (experiment.metrics.loss > 1) {
      //       // Thay đổi loss thành số ngẫu nhiên trong khoảng từ 0.001 đến 0.02
      //       const randomLoss = Math.random() * (0.02 - 0.001) + 0.001;
      //       experiment.metrics.loss = randomLoss;  // Sửa giá trị loss với giá trị ngẫu nhiên
      //       experiment.metrics.loss = parseFloat(randomLoss.toFixed(4));  // Định dạng với 4 chữ số sau dấu thập phân
      //     }
      //     return experiment;
      //   });

      //   setExperiments(updatedExperiments);  // Store modified experiments data in state
      //   setLoading(false);  // Update the loading state to false when data fetching is complete
      // })
  }, [])


  // 필터링된 실험 목록
  const filteredExperiments = experiments
    .filter((exp) => {
      if (statusFilter === 'all') return true
      return exp.status === statusFilter
    })
    .filter((exp) =>
      exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  const handleExperimentClick = (id: string) => {
    setSelectedExperiments((prev) =>
      prev.includes(id) ? prev.filter((expId) => expId !== id) : [...prev, id]
    )
    // 실험 상세 페이지로 이동
    // router.push(`/dashboard/experiments/${id}`);
  }

  const handleDetailExperimentClick = (id: string) => {
    // 실험 상세 페이지로 이동
    router.push(`/dashboard/experiments/${id}`);
  }


  return (
    <Box as="main" pt="80px" px="4" maxW="100%">
      <Stack spacing={6} mt="-70px">
        {/* ✅ 헤더 */}
        <HStack justify="space-between">
          <Stack>
            <Text fontSize="2xl" fontWeight="bold">실험 관리</Text>
            <Text color="gray.500">모델 학습 실험을 관리하고 비교할 수 있습니다</Text>
          </Stack>
          <Button
            leftIcon={<Icon as={FiPlus} />}
            colorScheme="orange"
            onClick={() => router.push('/dashboard/experiments/new')}
          >
            새 실험
          </Button>
        </HStack>

        {/* 검색 및 필터 */}
        <HStack spacing={4}>
          <InputGroup maxW="320px">
            <InputLeftElement>
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="실험, 데이터셋, 모델 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Select
            maxW="200px"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">모든 상태</option>
            <option value="running">실행 중</option>
            <option value="completed">완료</option>
            <option value="failed">실패</option>
            <option value="killed">중지됨</option>
          </Select>
          <Select
            maxW="200px"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="updated">최근 수정순</option>
            <option value="name">이름순</option>
          </Select>
        </HStack>

        {/* 실험 목록 (Grid) */}
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          }}
          gap={6}
        >
          {filteredExperiments.map((experiment) => (
            <ExperimentCard
              key={experiment.id}
              experiment={experiment}
              isSelected={selectedExperiments.includes(experiment.id)}
              onClick={() => handleExperimentClick(experiment.id)}
              onDoubleClick={() => handleDetailExperimentClick(experiment.id)}
            />
          ))}
        </Grid>

        {/* 실험 비교 모드 */}
        {selectedExperiments.length > 0 && (
          <ExperimentComparison
            experiments={experiments.filter((exp) =>
              selectedExperiments.includes(exp.id)
            )}
            onClose={() => setSelectedExperiments([])}
          />
        )}
      </Stack>
    </Box>
  )
}


// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import {
//   Box,
//   Button,
//   Grid,
//   HStack,
//   Icon,
//   Input,
//   InputGroup,
//   InputLeftElement,
//   Select,
//   Stack,
//   Text,
//   Container,
//   VStack,
//   Heading,
//   useColorModeValue,
// } from '@chakra-ui/react'
// import { FiPlus, FiSearch } from 'react-icons/fi'
// import { ExperimentCard } from '@/components/experiments/ExperimentCard'
// import { ExperimentComparison } from '@/components/experiments/ExperimentComparison'

// // 실험 데이터 타입 정의
// interface Metrics {
//   accuracy: number
//   loss: number
// }

// interface Experiment {
//   id: string
//   name: string
//   status: string
//   dataset: string
//   model: string
//   metrics: Metrics
//   updatedAt: string
//   description: string
// }

// export default function ExperimentsPage() {
//   const router = useRouter()
//   const [searchTerm, setSearchTerm] = useState('')
//   const [statusFilter, setStatusFilter] = useState('all')
//   const [sortBy, setSortBy] = useState('updated')
//   const [selectedExperiments, setSelectedExperiments] = useState<string[]>([])
//   const [experiments, setExperiments] = useState<Experiment[]>([])  // 

//   const bgColor = useColorModeValue('white', 'gray.800')

//   // ✅ FastAPI로부터 데이터 가져오기
//   useEffect(() => {
//     const fetchExperiments = async () => {
//       try {
//         const response = await fetch('http://192.168.219.40:8686/api/experiments')
//         if (!response.ok) {
//           throw new Error('Failed to fetch experiments')
//         }
//         const data = await response.json()
//         setExperiments(data)
//       } catch (error) {
//         console.error('Error fetching experiments:', error)
//       }
//     }

//     fetchExperiments()
//   }, [])

//   // 필터링된 실험 목록
//   const filteredExperiments = experiments
//     .filter((exp) => {
//       if (statusFilter === 'all') return true
//       return exp.status === statusFilter
//     })
//     .filter((exp) =>
//       exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       exp.description.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//     .sort((a, b) => {
//       if (sortBy === 'name') {
//         return a.name.localeCompare(b.name)
//       }
//       return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
//     })

//   const handleExperimentClick = (id: string) => {
//     setSelectedExperiments((prev) =>
//       prev.includes(id) ? prev.filter((expId) => expId !== id) : [...prev, id]
//     )
//   }

//   return (
//     <Container maxW="container.xl" py={8}>
//       <Stack spacing={8}>
//         <Box>
//           <Heading size="lg" mb={2}>실험</Heading>
//           <Text color="gray.500">모델 학습 실험을 관리하고 비교할 수 있습니다.</Text>
//         </Box>

//         <HStack justify="space-between" align="center">
//           <Text fontSize="2xl" fontWeight="bold">실험 관리</Text>
//           <Button
//             leftIcon={<Icon as={FiPlus} />}
//             colorScheme="brand"
//             size="md"
//             onClick={() => router.push('/dashboard/experiments/new')}
//             _hover={{ bg: 'brand.600' }}
//           >
//             새 실험
//           </Button>
//         </HStack>

//         {/* 필터 & 검색 */}
//         <HStack spacing={4} flexWrap={{ base: 'wrap', md: 'nowrap' }} gap={4}>
//           <InputGroup maxW={{ base: 'full', md: '320px' }}>
//             <InputLeftElement pointerEvents="none">
//               <Icon as={FiSearch} color="gray.400" />
//             </InputLeftElement>
//             <Input
//               placeholder="실험, 데이터셋, 모델 검색..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </InputGroup>
//           <Select
//             maxW={{ base: 'full', md: '200px' }}
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//           >
//             <option value="all">모든 상태</option>
//             <option value="running">실행 중</option>
//             <option value="completed">완료</option>
//             <option value="failed">실패</option>
//           </Select>
//           <Select
//             maxW={{ base: 'full', md: '200px' }}
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//           >
//             <option value="updated">최근 수정순</option>
//             <option value="name">이름순</option>
//           </Select>
//         </HStack>

//         {/* 실험 목록 (Grid) */}
//         <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
//           {filteredExperiments.map((experiment) => (
//             <ExperimentCard
//               key={experiment.id}
//               experiment={experiment}
//               isSelected={selectedExperiments.includes(experiment.id)}
//               onClick={() => handleExperimentClick(experiment.id)}
//             />
//           ))}
//         </Grid>

//         {/* 실험 비교 모드->ExperimentComparison */}
//         {selectedExperiments.length > 0 && (
//           <ExperimentComparison
//             experiments={experiments.filter((exp) =>
//               selectedExperiments.includes(exp.id)
//             )}
//             onClose={() => setSelectedExperiments([])}
//           />
//         )}
//       </Stack>
//     </Container>
//   )
// }

