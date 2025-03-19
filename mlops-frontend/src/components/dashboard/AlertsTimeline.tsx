'use client'

import {
  VStack,
  HStack,
  Text,
  Icon,
  Box,
  useColorModeValue,
  Circle,
  Divider,
} from '@chakra-ui/react'
import {
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
} from 'react-icons/fi'

const alerts = [
  {
    type: 'error',
    title: '모델 성능 저하 감지',
    description: 'BERT 모델의 정확도가 5% 감소했습니다.',
    time: '10분 전',
  },
  {
    type: 'warning',
    title: '리소스 사용량 경고',
    description: 'GPU 메모리 사용량이 85%를 초과했습니다.',
    time: '30분 전',
  },
  {
    type: 'success',
    title: '새 모델 배포 완료',
    description: 'ResNet-50 v2.1이 프로덕션에 배포되었습니다.',
    time: '1시간 전',
  },
  {
    type: 'info',
    title: '데이터셋 업데이트',
    description: '학습 데이터셋이 성공적으로 업데이트되었습니다.',
    time: '2시간 전',
  },
]

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'error':
      return FiAlertCircle
    case 'warning':
      return FiAlertTriangle
    case 'success':
      return FiCheckCircle
    case 'info':
      return FiInfo
    default:
      return FiInfo
  }
}

const getAlertColor = (type: string) => {
  switch (type) {
    case 'error':
      return 'red'
    case 'warning':
      return 'orange'
    case 'success':
      return 'green'
    case 'info':
      return 'blue'
    default:
      return 'gray'
  }
}

export default function AlertsTimeline() {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <VStack spacing={4} align="stretch">
      {alerts.map((alert, index) => (
        <Box key={index}>
          <HStack spacing={4} align="flex-start">
            <Circle
              size="40px"
              bg={`${getAlertColor(alert.type)}.100`}
              color={`${getAlertColor(alert.type)}.500`}
            >
              <Icon as={getAlertIcon(alert.type)} boxSize={5} />
            </Circle>
            <VStack align="start" flex={1} spacing={1}>
              <HStack justify="space-between" width="100%">
                <Text fontWeight="bold">{alert.title}</Text>
                <Text fontSize="sm" color={textColor}>
                  {alert.time}
                </Text>
              </HStack>
              <Text fontSize="sm" color={textColor}>
                {alert.description}
              </Text>
            </VStack>
          </HStack>
          {index < alerts.length - 1 && (
            <Divider my={4} borderColor={borderColor} />
          )}
        </Box>
      ))}
    </VStack>
  )
}
