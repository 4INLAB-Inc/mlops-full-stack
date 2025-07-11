import {
  Box,
  Flex,
  Text,
  Progress,
  Badge,
  Icon,
  Tooltip,
  useColorModeValue,
  HStack,
  VStack,
  Circle,
  Divider,
} from '@chakra-ui/react'
import { FiClock, FiActivity, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Pipeline {
  id: number
  name: string
  description: string
  status: string
  progress: number
  startTime: string | null
  endTime: string | null
  error?: string
}

interface PipelineCardProps {
  pipeline: Pipeline
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'running':
      return {
        color: 'blue',
        icon: FiActivity,
        text: '실행 중',
        gradient: 'linear(to-r, blue.400, blue.600)',
      }
    case 'completed':
      return {
        color: 'green',
        icon: FiCheckCircle,
        text: '완료',
        gradient: 'linear(to-r, green.400, green.600)',
      }
    case 'failed':
      return {
        color: 'red',
        icon: FiAlertCircle,
        text: '실패',
        gradient: 'linear(to-r, red.400, red.600)',
      }
    default:
      return {
        color: 'gray',
        icon: FiClock,
        text: '알 수 없음',
        gradient: 'linear(to-r, gray.400, gray.600)',
      }
  }
}

export default function PipelineCard({ pipeline }: PipelineCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const subTextColor = useColorModeValue('gray.600', 'gray.300')
  const statusConfig = getStatusConfig(pipeline.status)

  return (
    <Box
      p={6}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'lg',
        borderColor: `${statusConfig.color}.400`,
      }}
      width="100%"
      position="relative"
      overflow="hidden"
      fontFamily="Pretendard"
    >
      {/* Status Indicator */}
      <Box
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="4px"
        bgGradient={statusConfig.gradient}
      />

      {/* Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <HStack spacing={3}>
          <Circle size="40px" bg={`${statusConfig.color}.50`}>
            <Icon
              as={statusConfig.icon}
              w={5}
              h={5}
              color={`${statusConfig.color}.500`}
            />
          </Circle>
          <VStack align="start" spacing={0}>
            <Text
              fontWeight="bold"
              fontSize="lg"
              color={textColor}
              letterSpacing="tight"
            >
              {pipeline.name}
            </Text>
            <Text fontSize="sm" color={subTextColor}>
              {pipeline.description}
            </Text>
          </VStack>
        </HStack>
        <Badge
          px={3}
          py={1}
          borderRadius="full"
          colorScheme={statusConfig.color}
          fontWeight="medium"
          fontSize="sm"
        >
          {statusConfig.text}
        </Badge>
      </Flex>

      {/* Progress Section */}
      <Box mb={4}>
        <Progress
          value={pipeline.progress}
          size="sm"
          borderRadius="full"
          colorScheme={statusConfig.color}
          bg={useColorModeValue('gray.100', 'gray.700')}
          hasStripe={pipeline.status === 'running'}
          isAnimated={pipeline.status === 'running'}
        />
        <Flex justify="space-between" mt={2}>
          <Text fontSize="sm" color={subTextColor} fontWeight="medium">
            진행률
          </Text>
          <Text fontSize="sm" color={textColor} fontWeight="bold">
            {pipeline.progress}%
          </Text>
        </Flex>
      </Box>

      <Divider my={4} borderColor={borderColor} />

      {/* Time Information */}
      <Flex justify="space-between" align="center">
        <HStack spacing={4}>
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" color={subTextColor}>
              시작 시간
            </Text>
            <Tooltip
              label={format(
                new Date(pipeline.startTime ?? new Date()), // Nếu pipeline.startTime là null, sử dụng ngày hiện tại
                'PPP p',
                { locale: ko }
              )}
              hasArrow
            >
              <Text fontSize="sm" color={textColor} fontWeight="medium">
                 {format(new Date(pipeline.startTime ?? new Date()), 'HH:mm')} 
              </Text>
            </Tooltip>
          </VStack>
          {pipeline.endTime && (
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color={subTextColor}>
                종료 시간
              </Text>
              <Tooltip
                label={format(new Date(pipeline.endTime), 'PPP p', {
                  locale: ko,
                })}
                hasArrow
              >
                <Text fontSize="sm" color={textColor} fontWeight="medium">
                  {format(new Date(pipeline.endTime), 'HH:mm')}
                </Text>
              </Tooltip>
            </VStack>
          )}
        </HStack>
      </Flex>

      {/* Error Message */}
      {pipeline.error && (
        <Box
          mt={4}
          p={3}
          bg="red.50"
          borderRadius="md"
          borderLeft="4px"
          borderColor="red.500"
        >
          <Text fontSize="sm" color="red.600">
            {pipeline.error}
          </Text>
        </Box>
      )}
    </Box>
  )
}
