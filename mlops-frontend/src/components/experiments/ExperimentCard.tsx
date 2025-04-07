import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  Stack,
  Badge,
  Progress,
  HStack,
  Icon,
  Button,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react'
import { FiPlay, FiPause, FiBarChart2 } from 'react-icons/fi'
import { BsGpuCard } from 'react-icons/bs'
import { TbBrain } from 'react-icons/tb'

interface ExperimentCardProps {
  experiment: {
    id: string
    name: string
    dataset: string
    model: string
    status: string
    progress?: number
    metrics?: {
      accuracy: number
      loss: number
    }
    created: string
    updated: string
  }
  isSelected?: boolean
  onClick: () => void
  onDoubleClick: () => void
}

export function ExperimentCard({ experiment, isSelected, onClick, onDoubleClick }: ExperimentCardProps) {
  const bgCard = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const selectedBg = useColorModeValue('brand.50', 'brand.900')
  const selectedBorder = useColorModeValue('brand.500', 'brand.200')
  const accentText = useColorModeValue('brand.600', 'brand.200')

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
    <Card
      bg={isSelected ? selectedBg : bgCard}
      borderWidth="1px"
      borderColor={isSelected ? selectedBorder : borderColor}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'lg',
        borderColor: isSelected ? selectedBorder : 'brand.500',
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <CardBody>
        <Stack spacing={4}>
          <HStack justify="space-between" align="flex-start">
            <Stack spacing={2}>
              <Heading size="md" noOfLines={2}>
                {experiment.name}
              </Heading>
              <Badge
                colorScheme={getStatusColor(experiment.status)}
                alignSelf="flex-start"
              >
                {experiment.status}
              </Badge>
            </Stack>
            <Tooltip label="모델 성능 차트">
              <Button size="sm" variant="ghost">
                <Icon as={FiBarChart2} />
              </Button>
            </Tooltip>
          </HStack>

          {experiment.status === 'running' && experiment.progress && (
            <Progress
              value={experiment.progress}
              size="sm"
              colorScheme={getStatusColor(experiment.status)}
              borderRadius="full"
            />
          )}

          <Stack spacing={3}>
            <HStack>
              <Icon as={TbBrain} color="purple.500" />
              <Text fontSize="sm" color="gray.600" noOfLines={1}>
                {experiment.model}
              </Text>
            </HStack>
            <HStack>
              <Icon as={BsGpuCard} color="green.500" />
              <Text fontSize="sm" color="gray.600" noOfLines={1}>
                {experiment.dataset}
              </Text>
            </HStack>
          </Stack>

          {experiment.metrics && (
            <Stack
              direction="row"
              spacing={4}
              p={3}
              bg={useColorModeValue('gray.50', 'gray.700')}
              borderRadius="md"
            >
              <Stack flex={1}>
                <Text fontSize="xs" color="gray.500">
                  정확도
                </Text>
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color={accentText}
                >
                  {(experiment.metrics.accuracy).toFixed(1)}%
                </Text>
              </Stack>
              <Stack flex={1}>
                <Text fontSize="xs" color="gray.500">
                  손실
                </Text>
                <Text fontWeight="bold" color={useColorModeValue('red.600', 'red.200')}>
                  {experiment.metrics.loss.toFixed(4)}
                </Text>
              </Stack>
            </Stack>
          )}

          <Text fontSize="xs" color="gray.500">
            마지막 수정: {new Date(experiment.updated).toLocaleDateString()}
          </Text>
        </Stack>
      </CardBody>
    </Card>
  )
}
