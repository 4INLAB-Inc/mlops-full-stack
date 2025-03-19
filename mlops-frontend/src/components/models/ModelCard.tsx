import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  HStack,
  Icon,
  Image,
  Progress,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiCpu, FiGitBranch, FiZap } from 'react-icons/fi'

interface Model {
  id: string
  name: string
  description: string
  framework: string
  version: string
  status: string
  accuracy: number
  trainTime: string
  servingStatus: {
    isDeployed: boolean
    health: string
  }
  thumbnail: string
}

interface ModelCardProps {
  model: Model
  isSelected?: boolean
  onSelect?: () => void
  onViewDetails: () => void
  viewMode?: 'grid' | 'list'
}

export function ModelCard({ model, isSelected = false, onSelect, onViewDetails, viewMode = 'grid' }: ModelCardProps) {
  const bgCard = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const selectedBg = useColorModeValue('brand.50', 'brand.900')
  const selectedBorder = useColorModeValue('brand.500', 'brand.200')
  const accentText = useColorModeValue('brand.600', 'brand.200')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'green'
      case 'training':
        return 'blue'
      case 'failed':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'deployed':
        return '배포됨'
      case 'training':
        return '학습 중'
      case 'failed':
        return '실패'
      default:
        return '대기 중'
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'green'
      case 'warning':
        return 'yellow'
      case 'error':
        return 'red'
      default:
        return 'gray'
    }
  }

  const GridView = () => (
    <Stack spacing={4} height="100%">
      {/* 썸네일 이미지 */}
      <Box
        borderRadius="md"
        overflow="hidden"
        borderWidth="1px"
        borderColor={borderColor}
        height="150px"
      >
        <Image
          src={model.thumbnail}
          alt={model.name}
          width="100%"
          height="100%"
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/300x150?text=No+Thumbnail"
        />
      </Box>

      {/* 모델 정보 */}
      <Stack spacing={3} flex={1} justify="space-between">
        <Stack spacing={3}>
          <HStack justify="space-between" align="start">
            <Stack spacing={1}>
              <Text fontSize="lg" fontWeight="bold" noOfLines={1}>
                {model.name}
              </Text>
              <Text fontSize="sm" color="gray.500" noOfLines={2}>
                {model.description}
              </Text>
            </Stack>
            <Badge colorScheme={getStatusColor(model.status)}>
              {getStatusText(model.status)}
            </Badge>
          </HStack>

          {/* 메타데이터 */}
          <Stack spacing={2}>
            <HStack fontSize="sm" color="gray.500">
              <Icon as={FiCpu} />
              <Text>{model.framework}</Text>
              <Icon as={FiGitBranch} />
              <Text>v{model.version}</Text>
            </HStack>

            {/* 성능 지표 */}
            <Stack spacing={1}>
              <HStack justify="space-between">
                <Text color="gray.500">정확도</Text>
                <Text fontWeight="bold" color={accentText}>
                  {(model.accuracy * 100).toFixed(1)}%
                </Text>
              </HStack>
              <Progress
                value={model.accuracy * 100}
                colorScheme="brand"
                size="sm"
                borderRadius="full"
              />
            </Stack>

            {/* 서빙 상태 */}
            <HStack>
              <Icon
                as={FiZap}
                color={getHealthColor(model.servingStatus.health)}
              />
              <Text fontSize="sm" color="gray.500">
                {model.servingStatus.isDeployed
                  ? '서빙 중'
                  : '미배포'}
              </Text>
            </HStack>
          </Stack>
        </Stack>

        {/* 일단 상세 보기 버튼은 뺐음. */}
        {/* <Button
          size="sm"
          variant="outline"
          colorScheme="brand"
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails()
          }}
          mb={4}
        >
          상세 보기

        </Button> */}
      </Stack>
    </Stack>
  )

  const ListView = () => (
    <Flex align="center" gap={4} width="100%">
      {/* 썸네일 이미지 */}
      <Box
        borderRadius="md"
        overflow="hidden"
        borderWidth="1px"
        borderColor={borderColor}
        width="120px"
        height="80px"
        flexShrink={0}
      >
        <Image
          src={model.thumbnail}
          alt={model.name}
          width="100%"
          height="100%"
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/120x80?text=No+Thumbnail"
        />
      </Box>

      {/* 모델 정보 */}
      <Stack spacing={2} flex={1}>
        <HStack justify="space-between" align="center" width="100%">
          <Stack spacing={0}>
            <Text fontSize="lg" fontWeight="bold">
              {model.name}
            </Text>
            <Text fontSize="sm" color="gray.500" noOfLines={1}>
              {model.description}
            </Text>
          </Stack>
          <HStack spacing={4}>
            <Stack spacing={1} align="end">
              <HStack>
                <Icon as={FiCpu} color="gray.500" />
                <Text color="gray.500">{model.framework} v{model.version}</Text>
              </HStack>
              <HStack>
                <Text color="gray.500">정확도:</Text>
                <Text fontWeight="bold" color={accentText}>
                  {(model.accuracy * 100).toFixed(1)}%
                </Text>
              </HStack>
            </Stack>
            <Stack spacing={2} align="end" minW="100px">
              <Badge colorScheme={getStatusColor(model.status)}>
                {getStatusText(model.status)}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                colorScheme="brand"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetails()
                }}
                mb={16}
              >
                상세 보기
              </Button>
            </Stack>
          </HStack>
        </HStack>
      </Stack>
    </Flex>
  )

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
      onClick={onSelect}
      height={viewMode === 'grid' ? '400px' : 'auto'}
    >
      <CardBody>
        {viewMode === 'grid' ? <GridView /> : <ListView />}
      </CardBody>
    </Card>
  )
}
