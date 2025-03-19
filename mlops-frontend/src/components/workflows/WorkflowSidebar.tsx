import React from 'react'
import {
  Box,
  VStack,
  Text,
  useColorModeValue,
  Heading,
  Divider,
  Icon,
  HStack,
} from '@chakra-ui/react'
import {
  FiDatabase,
  FiCpu,
  FiBarChart2,
  FiBox,
  FiLayers,
  FiGitBranch,
  FiTrendingUp,
} from 'react-icons/fi'

export const nodeCategories = [
  {
    type: 'dataset',
    label: '데이터셋',
    icon: FiDatabase,
    description: '데이터셋 로드 및 준비'
  },
  {
    type: 'preprocess',
    label: '전처리',
    icon: FiLayers,
    description: '데이터 전처리 및 변환'
  },
  {
    type: 'split',
    label: '데이터 분할',
    icon: FiGitBranch,
    description: '학습/검증 데이터 분할'
  },
  {
    type: 'train',
    label: '모델 학습',
    icon: FiCpu,
    description: '모델 학습'
  },
  {
    type: 'evaluate',
    label: '모델 평가',
    icon: FiBarChart2,
    description: '모델 평가'
  },
  {
    type: 'deploy',
    label: '모델 배포',
    icon: FiTrendingUp,
    description: '모델 배포'
  }
]

const WorkflowSidebar = () => {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const headingColor = useColorModeValue('gray.800', 'white')
  const iconBg = useColorModeValue('orange.50', 'orange.900')
  const iconColor = useColorModeValue('orange.500', 'orange.200')

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <Box
      w="300px"
      bg={bg}
      borderRight="1px"
      borderColor={borderColor}
      p={4}
      overflowY="auto"
    >
      <VStack spacing={4} align="stretch">
        <Heading size="md" color={headingColor}>
          노드 유형
        </Heading>
        <Text fontSize="sm" color="gray.500">
          드래그하여 노드 추가
        </Text>
        <Divider />
        <VStack spacing={3} align="stretch">
          {nodeCategories.map((category) => (
            <Box
              key={category.type}
              p={3}
              bg={bg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              cursor="grab"
              _hover={{
                borderColor: 'orange.200',
                transform: 'translateY(-2px)',
                boxShadow: 'sm',
                transition: 'all 0.2s'
              }}
              draggable
              onDragStart={(e) => onDragStart(e, category.type)}
            >
              <HStack spacing={3}>
                <Box
                  p={2}
                  bg={iconBg}
                  color={iconColor}
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={category.icon} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">{category.label}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {category.description}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  )
}

export default WorkflowSidebar
