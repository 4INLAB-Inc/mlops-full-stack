'use client'

import React from 'react'
import {
  Flex,
  IconButton,
  useColorMode,
  useColorModeValue,
  Text,
} from '@chakra-ui/react'
import { FiMenu } from 'react-icons/fi'
import { FiMoon } from 'react-icons/fi'
import { FiSun } from 'react-icons/fi'

interface MobileNavProps {
  onOpen: () => void
}

export function MobileNav({ onOpen }: MobileNavProps) {
  const { toggleColorMode, colorMode } = useColorMode()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={bgColor}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        MLOps
      </Text>

      <IconButton
        aria-label="Toggle dark mode"
        icon={colorMode === 'dark' ? <FiSun /> : <FiMoon />}
        onClick={toggleColorMode}
        variant="ghost"
      />
    </Flex>
  )
}

export default MobileNav
