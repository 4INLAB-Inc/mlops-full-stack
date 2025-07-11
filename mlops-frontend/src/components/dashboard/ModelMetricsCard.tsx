import {
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Box,
  useColorModeValue,
  Flex,
  Icon,
  Text,
  chakra,
  shouldForwardProp,
} from '@chakra-ui/react'
import { motion, isValidMotionProp } from 'framer-motion'
import { IconType } from 'react-icons'

const ChakraCard = chakra(motion.div, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
})

interface ModelMetricsCardProps {
  title: string
  value: string
  change?: number
  icon: IconType
  color: string
  metric?: string
}

export default function ModelMetricsCard({
  title,
  value,
  change,
  icon,
  color,
  metric,
}: ModelMetricsCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const iconBg = useColorModeValue(`${color}.100`, `${color}.900`)
  const iconColor = useColorModeValue(`${color}.500`, `${color}.200`)
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <ChakraCard
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition="all 0.3s ease-in-out"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      p={6}
      _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
    >
      <Flex align="center" justify="space-between">
        <Stat>
          <StatLabel fontSize="sm" color={textColor}>
            {title}
          </StatLabel>
          <Flex align="baseline" mt={2}>
            <StatNumber fontSize="2xl" fontWeight="bold">
              {value}
            </StatNumber>
            {metric && (
              <Text ml={1} fontSize="sm" color={textColor}>
                {metric}
              </Text>
            )}
          </Flex>
          {change && (
            <StatHelpText mb={0}>
              <StatArrow type={change > 0 ? 'increase' : 'decrease'} />
              {Math.abs(change)}%
            </StatHelpText>
          )}
        </Stat>
        <Box
          p={3}
          bg={iconBg}
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={icon} boxSize={5} color={iconColor} />
        </Box>
      </Flex>
    </ChakraCard>
  )
}
