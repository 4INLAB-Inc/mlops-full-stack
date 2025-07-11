'use client'

import { ReactNode } from 'react'
import {
  Box,
  Heading,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'

interface PageContainerProps {
  title?: string
  subtitle?: string
  children: ReactNode
}

export const PageContainer = ({ title, subtitle, children }: PageContainerProps) => {
  const textColor = useColorModeValue('gray.700', 'whiteAlpha.900')
  const subColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 4, md: 8 }} py={8}>
      {(title || subtitle) && (
        <Stack spacing={1} mb={6}>
          {title && (
            <Heading as="h1" fontSize="2xl" color={textColor}>
              {title}
            </Heading>
          )}
          {subtitle && (
            <Text fontSize="md" color={subColor}>
              {subtitle}
            </Text>
          )}
        </Stack>
      )}
      {children}
    </Box>
  )
}
