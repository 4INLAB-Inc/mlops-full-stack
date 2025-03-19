'use client'

import { Box, Heading, Text, HStack, Button, Icon, useColorModeValue } from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    icon?: any
    onClick?: () => void
  }
}

const PageHeader = ({ title, description, action }: PageHeaderProps) => {
  const buttonBg = useColorModeValue('orange.500', 'orange.400')
  const buttonHoverBg = useColorModeValue('orange.600', 'orange.500')

  return (
    <Box mb={6}>
      <HStack justify="space-between" align="flex-start" mb={description ? 2 : 0}>
        <Heading size="lg">{title}</Heading>
        {action && (
          <Button
            leftIcon={action.icon && <Icon as={action.icon} />}
            bg={buttonBg}
            color="white"
            _hover={{ bg: buttonHoverBg }}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </HStack>
      {description && (
        <Text color="gray.600">{description}</Text>
      )}
    </Box>
  )
}

export default PageHeader
