'use client'

import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Icon,
  Flex,
  Text,
  Progress,
} from '@chakra-ui/react'
import {
  FiUsers,
  FiServer,
  FiCpu,
  FiCheckCircle,
} from 'react-icons/fi'

interface StatCardProps {
  title: string
  stat: string | number
  icon: any
  helpText?: string
  change?: number
  accentColor?: string
  progress?: number
}

function StatCard({
  title,
  stat,
  icon,
  helpText,
  change,
  accentColor = 'blue.500',
  progress,
}: StatCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')
  const subTextColor = useColorModeValue('gray.600', 'gray.400')
  const borderColor = useColorModeValue('gray.100', 'gray.700')

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'md',
        borderColor: accentColor,
      }}
      position="relative"
      overflow="hidden"
    >
      <Flex justify="space-between" align="center" mb={2}>
        <Box flex="1">
          <Text
            fontSize="sm"
            color={subTextColor}
            fontWeight="medium"
            mb={1}
            fontFamily="Pretendard"
          >
            {title}
          </Text>
          <Stat>
            <StatNumber
              fontSize="2xl"
              fontWeight="bold"
              color={textColor}
              fontFamily="Pretendard"
            >
              {stat}
            </StatNumber>
            {helpText && (
              <StatHelpText mb={0} color={subTextColor} fontFamily="Pretendard">
                {change && (
                  <StatArrow
                    type={change > 0 ? 'increase' : 'decrease'}
                    color={change > 0 ? 'green.500' : 'red.500'}
                  />
                )}
                {helpText}
              </StatHelpText>
            )}
          </Stat>
        </Box>
        <Box
          p={2}
          borderRadius="lg"
          bg={`${accentColor}15`}
          color={accentColor}
        >
          <Icon as={icon} w={6} h={6} />
        </Box>
      </Flex>
      {progress !== undefined && (
        <Progress
          value={progress}
          size="xs"
          colorScheme={accentColor.split('.')[0]}
          borderRadius="full"
          mt={2}
          hasStripe
          isAnimated
        />
      )}
    </Box>
  )
}

export default function DashboardSummary() {
  const stats = [
    {
      title: '활성 모델',
      stat: '12',
      icon: FiServer,
      helpText: '지난 달 대비 +4',
      change: 8.2,
      accentColor: 'blue.500',
    },
    {
      title: '파이프라인',
      stat: '25',
      icon: FiCpu,
      helpText: '지난 달 대비 +7',
      change: 12.5,
      accentColor: 'purple.500',
    },
    {
      title: '성능 모니터링',
      stat: '89',
      icon: FiCheckCircle,
      helpText: '4% 시간 당 대비',
      change: 6.1,
      accentColor: 'green.500',
      progress: 89,
    },
    {
      title: 'GPU 사용량',
      stat: '85%',
      icon: FiCpu,
      helpText: '4개 GPU 사용 중',
      change: 5.2,
      accentColor: 'orange.500',
      progress: 85,
    },
  ]

  return (
    <Box mx="auto" pt={5} px={8} fontFamily="Pretendard">
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 4 }}
        spacing={{ base: 5, lg: 8 }}
      >
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </SimpleGrid>
    </Box>
  )
}
