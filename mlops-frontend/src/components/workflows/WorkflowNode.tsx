import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Icon,
  Badge,
  useColorModeValue,
  Tooltip,
  IconButton,
} from '@chakra-ui/react'
import { FiPlay, FiCheck, FiX, FiLoader, FiClock, FiTrash2, FiPause } from 'react-icons/fi'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const WorkflowNode = ({ data, id, isConnectable, onNodeAction, selected }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.4)')

  // 상태에 따른 색상 및 아이콘 설정
  const getStatusConfig = (status) => {
    switch (status) {
      case 'running':
        return {
          color: 'orange.400',
          icon: FiLoader,
          text: '실행 중',
          animation: true
        }
      case 'completed':
        return {
          color: 'green.400',
          icon: FiCheck,
          text: '완료',
          animation: false
        }
      case 'error':
        return {
          color: 'red.400',
          icon: FiX,
          text: '오류',
          animation: false
        }
      default:
        return {
          color: 'gray.400',
          icon: FiClock,
          text: '대기 중',
          animation: false
        }
    }
  }

  const statusConfig = getStatusConfig(data.status)

  const getBadgeColor = (status) => {
    switch (status) {
      case 'running':
        return 'orange'
      case 'completed':
        return 'green'
      case 'failed':
        return 'red'
      case 'paused':
        return 'yellow'
      case 'stopped':
        return 'red'
      default:
        return 'gray'
    }
  }

  return (
    <MotionBox
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      bg={bgColor}
      border="1px solid"
      borderColor={selected ? statusConfig.color : borderColor}
      borderRadius="xl"
      boxShadow={`0 4px 12px ${shadowColor}`}
      p={4}
      width="280px"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: statusConfig.color,
        borderTopRadius: 'xl',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: statusConfig.color,
          border: `2px solid ${bgColor}`,
          width: '12px',
          height: '12px',
        }}
        isConnectable={isConnectable}
      />

      <VStack spacing={3} align="stretch">
        {/* 헤더 */}
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Icon
              as={statusConfig.icon}
              color={statusConfig.color}
              boxSize={5}
              animation={statusConfig.animation ? 'spin 2s linear infinite' : undefined}
            />
            <Text fontWeight="bold" fontSize="md">
              {data.label}
            </Text>
          </HStack>
          <Badge
            colorScheme={getBadgeColor(data.status)}
            variant="subtle"
            px={2}
            py={1}
            borderRadius="full"
          >
            {statusConfig.text}
          </Badge>
        </HStack>

        {/* 타입 */}
        <Text fontSize="sm" color="gray.500">
          {data.type}
        </Text>

        {/* 진행률 */}
        {data.status !== 'idle' && (
          <Box>
            <Progress
              value={data.progress || 0}
              size="sm"
              colorScheme={
                data.status === 'running' ? 'orange' :
                data.status === 'completed' ? 'green' :
                data.status === 'error' ? 'red' : 'gray'
              }
              borderRadius="full"
              hasStripe={data.status === 'running'}
              isAnimated={data.status === 'running'}
            />
            <Text fontSize="xs" color="gray.500" mt={1} textAlign="right">
              {data.progress || 0}%
            </Text>
          </Box>
        )}

        {/* 파라미터 */}
        {data.parameters && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              파라미터
            </Text>
            <VStack align="stretch" spacing={1}>
              {Object.entries(data.parameters).map(([key, value]) => (
                <HStack key={key} fontSize="xs" justify="space-between">
                  <Text color="gray.500">{key}</Text>
                  <Text fontWeight="medium">{String(value)}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}

        {/* 실행 시간 */}
        {data.duration && (
          <Text fontSize="xs" color="gray.500" textAlign="right">
            실행 시간: {data.duration}
          </Text>
        )}
      </VStack>

      <HStack justify="flex-end" spacing={1} mt={2}>
        {data.status === 'running' ? (
          <Tooltip label="일시 정지" placement="top">
            <IconButton
              aria-label="Pause node"
              icon={<FiPause />}
              size="xs"
              colorScheme="yellow"
              onClick={() => onNodeAction('stop', id)}
            />
          </Tooltip>
        ) : data.status !== 'completed' && (
          <Tooltip label="실행" placement="top">
            <IconButton
              aria-label="Run node"
              icon={<FiPlay />}
              size="xs"
              colorScheme="green"
              onClick={() => onNodeAction('run', id)}
            />
          </Tooltip>
        )}
        
        {data.status !== 'running' && (
          <Tooltip label="삭제" placement="top">
            <IconButton
              aria-label="Delete node"
              icon={<FiTrash2 />}
              size="xs"
              colorScheme="red"
              variant="ghost"
              onClick={() => onNodeAction('delete', id)}
            />
          </Tooltip>
        )}
      </HStack>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: statusConfig.color,
          border: `2px solid ${bgColor}`,
          width: '12px',
          height: '12px',
        }}
        isConnectable={isConnectable}
      />
    </MotionBox>
  )
}

export default memo(WorkflowNode)
