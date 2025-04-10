// 'use client'

// import {
//   Box,
//   Card,
//   CardBody,
//   Grid,
//   GridItem,
//   Heading,
//   Text,
//   Stack,
//   Select,
//   HStack,
//   useColorModeValue,
//   IconButton,
//   Divider,
//   Badge,
//   Flex,
// } from '@chakra-ui/react'
// import { FiX } from 'react-icons/fi'
// import { Line } from 'react-chartjs-2'
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js'

// // Chart.js 컴포넌트 등록
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// )

// interface Experiment {
//   id: string
//   name: string
//   status: string
//   dataset: string
//   model: string
//   metrics?: {
//     accuracy: number
//     loss: number
//   }
// }

// interface ExperimentComparisonProps {
//   experiments: Experiment[]
//   onClose: () => void
// }

// export function ExperimentComparison({ experiments, onClose }: ExperimentComparisonProps) {
//   const bgCard = useColorModeValue('white', 'gray.800')
//   const borderColor = useColorModeValue('gray.200', 'gray.700')
//   const accentBg = useColorModeValue('brand.50', 'brand.900')
//   const accentText = useColorModeValue('brand.600', 'brand.200')

//   // 차트 색상 배열
//   const chartColors = [
//     'rgb(235, 97, 0)',    // 브랜드 컬러
//     'rgb(0, 116, 217)',   // 파란색
//     'rgb(0, 170, 85)',    // 초록색
//     'rgb(240, 65, 85)',   // 빨간색
//     'rgb(155, 81, 224)',  // 보라색
//   ]

//   // 실험 목록에서 차트 데이터를 생성하는 함수
//   const createChartData = (experiments: Experiment[]) => {
//     // 가장 긴 trainAcc 길이에 맞춰 에폭 라벨 생성
//     const maxEpoch = Math.max(...experiments.map(exp => exp.metrics_history?.trainAcc?.length || 0))
//     const labels = Array.from({ length: maxEpoch }, (_, i) => i + 1) // 에폭 라벨: [1, 2, ..., N]

//     return {
//       labels,
//       datasets: experiments.map((exp, index) => ({
//         label: exp.name, // 실험 이름
//         data: exp.metrics_history?.trainAcc?.slice(0, maxEpoch) || Array(maxEpoch).fill(0), // train 정확도 데이터
//         borderColor: chartColors[index % chartColors.length], // 선 색상
//         backgroundColor: chartColors[index % chartColors.length], // 배경 색상
//         tension: 0.4, // 곡선 부드러움
//         pointRadius: 4, // 점 크기
//         pointHoverRadius: 6, // 마우스 오버 시 점 크기
//       })),
//     }
//   }

//   const chartData = createChartData(experiments)

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'top' as const,
//         align: 'start' as const,
//         labels: {
//           font: {
//             family: 'Pretendard Variable',
//             size: 12,
//           },
//           padding: 20,
//           boxWidth: 15,
//           boxHeight: 15,
//           usePointStyle: true,
//           pointStyle: 'circle',
//         },
//       },
//       tooltip: {
//         bodyFont: {
//           family: 'Pretendard Variable',
//         },
//         titleFont: {
//           family: 'Pretendard Variable',
//         },
//       },
//     },
//     scales: {
//       x: {
//         grid: {
//           display: false,
//         },
//         ticks: {
//           font: {
//             family: 'Pretendard Variable',
//           },
//           padding: 10,
//         },
//         title: {
//           display: true,
//           text: 'Epoch',
//           font: {
//             family: 'Pretendard Variable',
//             size: 14,
//           },
//           padding: { top: 20 },
//         },
//       },
//       y: {
//         grid: {
//           color: 'rgba(0, 0, 0, 0.1)',
//         },
//         ticks: {
//           font: {
//             family: 'Pretendard Variable',
//           },
//         },
//         title: {
//           display: true,
//           text: 'Accuracy (%)',
//           font: {
//             family: 'Pretendard Variable',
//             size: 14,
//           },
//         },
//       },
//     },
//   }

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'running':
//         return 'blue'
//       case 'completed':
//         return 'green'
//       case 'failed':
//         return 'red'
//       default:
//         return 'gray'
//     }
//   }

//   return (
//     <Card
//       bg={bgCard}
//       borderWidth="1px"
//       borderColor={borderColor}
//       shadow="xl"
//       overflow="hidden"
//       borderRadius="xl"
//     >
//       <CardBody>
//         <Stack spacing={6}>
//           <HStack justify="space-between" align="center">
//             <Stack>
//               <Heading size="md" fontFamily="Pretendard Variable">실험 비교</Heading>
//               <Text fontSize="sm" color="gray.500">
//                 {experiments.length}개의 실험 비교 중
//               </Text>
//             </Stack>
//             <HStack spacing={4}>
//               <Select
//                 placeholder="메트릭 선택"
//                 maxW="200px"
//                 size="sm"
//                 variant="filled"
//                 bg={accentBg}
//                 _hover={{ bg: useColorModeValue('blue.100', 'blue.800') }}
//               >
//                 <option value="accuracy">정확도</option>
//                 <option value="loss">손실</option>
//                 <option value="f1">F1 Score</option>
//               </Select>
//               <IconButton
//                 aria-label="Close comparison"
//                 icon={<FiX />}
//                 variant="ghost"
//                 onClick={onClose}
//                 size="sm"
//               />
//             </HStack>
//           </HStack>

//           <Box 
//             p={6} 
//             borderRadius="lg"
//             height="400px"
//             mb={4}
//           >
//             <Line data={chartData} options={chartOptions} />
//           </Box>

//           <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={4}>
//             {experiments.map(exp => (
//               <GridItem key={exp.id}>
//                 <Card 
//                   variant="outline" 
//                   size="sm"
//                   borderWidth="1px"
//                   borderColor={useColorModeValue('gray.200', 'gray.700')}
//                   _hover={{
//                     borderColor: 'brand.500',
//                     transform: 'translateY(-2px)',
//                     transition: 'all 0.2s',
//                     shadow: 'lg',
//                   }}
//                 >
//                   <CardBody>
//                     <Stack spacing={4}>
//                       <Stack>
//                         <Flex justify="space-between" align="center">
//                           <Heading size="sm" fontFamily="Pretendard Variable">
//                             {exp.name}
//                           </Heading>
//                           <Badge 
//                             colorScheme={getStatusColor(exp.status)}
//                             px={2}
//                             py={1}
//                             borderRadius="full"
//                           >
//                             {exp.status}
//                           </Badge>
//                         </Flex>
//                         <Text fontSize="sm" color="gray.500">
//                           {exp.model} / {exp.dataset}
//                         </Text>
//                       </Stack>

//                       <Divider />

//                       <Grid templateColumns="repeat(2, 1fr)" gap={4}>
//                         <Stack>
//                           <Text fontSize="sm" color="gray.500">
//                             정확도
//                           </Text>
//                           <Text
//                             fontSize="lg"
//                             fontWeight="bold"
//                             color={accentText}
//                           >
//                             {(exp.metrics?.accuracy).toFixed(1)}%
//                           </Text>
//                         </Stack>
//                         <Stack>
//                           <Text fontSize="sm" color="gray.500">
//                             손실
//                           </Text>
//                           <Text
//                             fontSize="lg"
//                             fontWeight="bold"
//                             color={useColorModeValue('red.600', 'red.200')}
//                           >
//                             {exp.metrics?.loss.toFixed(4)}
//                           </Text>
//                         </Stack>
//                       </Grid>
//                     </Stack>
//                   </CardBody>
//                 </Card>
//               </GridItem>
//             ))}
//           </Grid>
//         </Stack>
//       </CardBody>
//     </Card>
//   )
// }
'use client'

import {
  Box,
  Card,
  CardBody,
  Grid,
  GridItem,
  Heading,
  Text,
  Stack,
  Select,
  HStack,
  useColorModeValue,
  IconButton,
  Divider,
  Badge,
  Flex,
} from '@chakra-ui/react'
import { FiX } from 'react-icons/fi'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useState } from 'react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface Experiment {
  id: string
  name: string
  status: string
  dataset: string
  model: string
  metrics?: {
    accuracy: number
    loss: number
  }
  metrics_history?: {
    trainAcc?: number[]
    trainLoss?: number[]
    [key: string]: number[] | undefined
  }
}

interface ExperimentComparisonProps {
  experiments: Experiment[]
  onClose: () => void
}

export function ExperimentComparison({ experiments, onClose }: ExperimentComparisonProps) {
  const bgCard = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const accentBg = useColorModeValue('brand.50', 'brand.900')
  const accentText = useColorModeValue('brand.600', 'brand.200')
  const [selectedMetric, setSelectedMetric] = useState('trainAcc')

  const chartColors = [
    'rgb(235, 97, 0)',
    'rgb(0, 116, 217)',
    'rgb(0, 170, 85)',
    'rgb(240, 65, 85)',
    'rgb(155, 81, 224)',
  ]

  // 선택된 지표를 기준으로 차트 데이터를 생성
  const createChartData = (experiments: Experiment[]) => {
    const maxEpoch = Math.max(
      ...experiments.map(exp => exp.metrics_history?.[selectedMetric]?.length || 0)
    )
    const labels = Array.from({ length: maxEpoch }, (_, i) => i + 1)

    return {
      labels,
      datasets: experiments.map((exp, index) => ({
        label: exp.name,
        data: exp.metrics_history?.[selectedMetric]?.slice(0, maxEpoch) || Array(maxEpoch).fill(0),
        borderColor: chartColors[index % chartColors.length],
        backgroundColor: chartColors[index % chartColors.length],
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      })),
    }
  }

  const chartData = createChartData(experiments)

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'start' as const,
        labels: {
          font: {
            family: 'Pretendard Variable',
            size: 12,
          },
          padding: 20,
          boxWidth: 15,
          boxHeight: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        bodyFont: {
          family: 'Pretendard Variable',
        },
        titleFont: {
          family: 'Pretendard Variable',
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Pretendard Variable',
          },
          padding: 10,
        },
        title: {
          display: true,
          text: 'Epoch',
          font: {
            family: 'Pretendard Variable',
            size: 14,
          },
          padding: { top: 20 },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            family: 'Pretendard Variable',
          },
        },
        title: {
          display: true,
          text: selectedMetric === 'trainLoss' ? 'Loss' : 'Accuracy (%)',
          font: {
            family: 'Pretendard Variable',
            size: 14,
          },
        },
      },
    },
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'blue'
      case 'completed':
        return 'green'
      case 'failed':
        return 'red'
      default:
        return 'gray'
    }
  }

  return (
    <Card bg={bgCard} borderWidth="1px" borderColor={borderColor} shadow="xl" overflow="hidden" borderRadius="xl">
      <CardBody>
        <Stack spacing={6}>
          <HStack justify="space-between" align="center">
            <Stack>
              <Heading size="md" fontFamily="Pretendard Variable">실험 비교</Heading>
              <Text fontSize="sm" color="gray.500">{experiments.length}개의 실험 비교 중</Text>
            </Stack>
            <HStack spacing={4}>
              <Select
                placeholder="지표 선택"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                maxW="200px"
                size="sm"
                variant="filled"
                bg={accentBg}
                _hover={{ bg: useColorModeValue('blue.100', 'blue.800') }}
              >
                <option value="trainAcc">정확도</option>
                <option value="trainLoss">손실</option>
              </Select>
              <IconButton
                aria-label="Close comparison"
                icon={<FiX />}
                variant="ghost"
                onClick={onClose}
                size="sm"
              />
            </HStack>
          </HStack>

          <Box p={6} borderRadius="lg" height="400px" mb={4}>
            <Line data={chartData} options={chartOptions} />
          </Box>

          <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={4}>
            {experiments.map(exp => (
              <GridItem key={exp.id}>
                <Card
                  variant="outline"
                  size="sm"
                  borderWidth="1px"
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                  _hover={{
                    borderColor: 'brand.500',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s',
                    shadow: 'lg',
                  }}
                >
                  <CardBody>
                    <Stack spacing={4}>
                      <Stack>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm" fontFamily="Pretendard Variable">
                            {exp.name}
                          </Heading>
                          <Badge colorScheme={getStatusColor(exp.status)} px={2} py={1} borderRadius="full">
                            {exp.status}
                          </Badge>
                        </Flex>
                        <Text fontSize="sm" color="gray.500">
                          {exp.model} / {exp.dataset}
                        </Text>
                      </Stack>

                      <Divider />

                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <Stack>
                          <Text fontSize="sm" color="gray.500">정확도</Text>
                          <Text fontSize="lg" fontWeight="bold" color={accentText}>
                            {(exp.metrics?.accuracy ?? 0).toFixed(1)}%
                          </Text>
                        </Stack>
                        <Stack>
                          <Text fontSize="sm" color="gray.500">손실</Text>
                          <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('red.600', 'red.200')}>
                            {(exp.metrics?.loss ?? 0).toFixed(4)}
                          </Text>
                        </Stack>
                      </Grid>
                    </Stack>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </Stack>
      </CardBody>
    </Card>
  )
}