'use client'

import { Box, Heading, Text, useColorModeValue } from '@chakra-ui/react'

interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const subtitleColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Box>
      <Heading size="lg" mb={2}>
        {title}
      </Heading>
      {subtitle && (
        <Text color={subtitleColor}>
          {subtitle}
        </Text>
      )}
    </Box>
  )
}
