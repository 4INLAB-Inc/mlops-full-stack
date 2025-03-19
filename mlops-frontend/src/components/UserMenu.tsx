'use client'

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Avatar,
  Text,
  HStack,
  VStack,
  Divider,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FiUser, FiSettings, FiLogOut } from 'react-icons/fi'
import { useSession } from 'next-auth/react'

export default function UserMenu() {
  const router = useRouter()
  const { logout } = useAuth()
  const { data: session } = useSession()
  const menuBg = useColorModeValue('white', 'gray.800')
  const menuBorder = useColorModeValue('gray.200', 'gray.700')

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleProfile = () => {
    router.push('/dashboard/profile')
  }

  const handleSettings = () => {
    router.push('/dashboard/settings')
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        rounded="full"
        px={2}
        py={1}
        _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
      >
        <HStack spacing={2}>
          <Avatar 
            size="sm" 
            name={session?.user?.name || '4INLAB Admin'} 
            src="/profile-placeholder.png"
          />
          <VStack
            display={{ base: 'none', md: 'flex' }}
            alignItems="flex-start"
            spacing="1px"
            ml="2"
          >
            <Text fontSize="sm" fontWeight="medium">
              {session?.user?.name || '4INLAB Admin'}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {session?.user?.email || '4inlab@4inlab.kr'}
            </Text>
          </VStack>
        </HStack>
      </MenuButton>
      <MenuList
        bg={menuBg}
        borderColor={menuBorder}
        boxShadow="lg"
        rounded="md"
        p={2}
      >
        <MenuItem
          icon={<Icon as={FiUser} />}
          onClick={handleProfile}
          rounded="md"
          _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
        >
          프로필
        </MenuItem>
        <MenuItem
          icon={<Icon as={FiSettings} />}
          onClick={handleSettings}
          rounded="md"
          _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
        >
          설정
        </MenuItem>
        <Divider my={2} />
        <MenuItem
          icon={<Icon as={FiLogOut} />}
          onClick={handleLogout}
          rounded="md"
          color="red.500"
          _hover={{ bg: useColorModeValue('red.50', 'red.900') }}
        >
          로그아웃
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
