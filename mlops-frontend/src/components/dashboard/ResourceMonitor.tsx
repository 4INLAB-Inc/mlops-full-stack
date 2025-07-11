'use client'

import {
  Box,
  SimpleGrid,
  Text,
  useColorModeValue,
  Progress,
  Flex,
  Icon,
  Tooltip,
  chakra,
  shouldForwardProp,
} from '@chakra-ui/react'
import { motion, isValidMotionProp } from 'framer-motion'
import { FiCpu, FiHardDrive, FiDatabase } from 'react-icons/fi'

const ChakraBox = chakra(motion.div, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
})

const ResourceItem = ({ icon, label, value, color }: any) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      p={4}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <Flex align="center" mb={2}>
        <Icon as={icon} mr={2} color={`${color}.500`} />
        <Text fontSize="sm" fontWeight="medium">
          {label}
        </Text>
      </Flex>
      <Tooltip label={`${value}% 사용 중`}>
        <Progress
          value={value}
          size="sm"
          colorScheme={color}
          borderRadius="full"
          hasStripe
          isAnimated
        />
      </Tooltip>
      <Text mt={2} fontSize="xs" color="gray.500" textAlign="right">
        {value}% 사용 중
      </Text>
    </Box>
  )
}

export default function ResourceMonitor() {
  const resources = [
    { icon: FiCpu, label: 'CPU 사용량', value: 45, color: 'blue' },
    { icon: FiHardDrive, label: 'GPU 사용량', value: 78, color: 'green' },
    { icon: FiDatabase, label: 'Memory 사용량', value: 62, color: 'purple' },
  ]

  return (
    <ChakraBox
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition="all 0.5s ease-in-out 0.2s"
    >
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        시스템 리소스 모니터링
      </Text>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        {resources.map((resource, index) => (
          <ResourceItem key={index} {...resource} />
        ))}
      </SimpleGrid>
    </ChakraBox>
  )
}
