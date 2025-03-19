'use client'

import React from 'react'
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FiActivity,
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiPlay,
  FiStopCircle,
} from 'react-icons/fi'

const activities = [
  {
    id: 1,
    type: 'success',
    icon: FiCheck,
    title: '모델 배포 완료',
    description: '이미지 분류 모델 v1.2.0이 성공적으로 배포되었습니다.',
    time: '5분 전',
  },
  {
    id: 2,
    type: 'warning',
    icon: FiAlertCircle,
    title: '성능 저하 감지',
    description: '객체 감지 모델의 정확도가 5% 감소했습니다.',
    time: '15분 전',
  },
  {
    id: 3,
    type: 'info',
    icon: FiPlay,
    title: '파이프라인 실행',
    description: '데이터 전처리 파이프라인이 시작되었습니다.',
    time: '30분 전',
  },
  {
    id: 4,
    type: 'error',
    icon: FiStopCircle,
    title: '모델 학습 중단',
    description: 'GPU 메모리 부족으로 학습이 중단되었습니다.',
    time: '1시간 전',
  },
]

export default function ActivityLog() {
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'green.500'
      case 'warning':
        return 'orange.500'
      case 'error':
        return 'red.500'
      default:
        return 'blue.500'
    }
  }

  return (
    <Card
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      shadow="sm"
    >
      <CardHeader>
        <Flex align="center" gap={2}>
          <Icon as={FiActivity} />
          <Heading size="md">활동 로그</Heading>
        </Flex>
      </CardHeader>

      <CardBody>
        <Stack spacing={4}>
          {activities.map((activity) => (
            <Flex key={activity.id} gap={3} align="start">
              <Box
                p={2}
                borderRadius="full"
                bg={`${getActivityColor(activity.type)}20`}
                color={getActivityColor(activity.type)}
              >
                <Icon as={activity.icon} />
              </Box>
              <Box flex={1}>
                <Text fontWeight="medium">{activity.title}</Text>
                <Text fontSize="sm" color={textColor}>
                  {activity.description}
                </Text>
                <Flex align="center" gap={1} mt={1}>
                  <Icon as={FiClock} fontSize="xs" color={textColor} />
                  <Text fontSize="xs" color={textColor}>
                    {activity.time}
                  </Text>
                </Flex>
              </Box>
            </Flex>
          ))}
        </Stack>
      </CardBody>
    </Card>
  )
}
