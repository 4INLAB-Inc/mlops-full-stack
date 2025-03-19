import {
  IconButton,
  Flex,
  useColorModeValue,
  Text,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  chakra,
  Box,
} from '@chakra-ui/react'
import { FiMenu, FiX } from 'react-icons/fi'
import { IconType } from 'react-icons'
import Link from 'next/link'

interface MobileNavProps {
  onOpen: () => void
  isOpen: boolean
  links: Array<{
    name: string
    icon: IconType
    href: string
  }>
  currentPath: string
}

export default function MobileNav({ onOpen, isOpen, links, currentPath }: MobileNavProps) {
  const bgColor = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.100', 'gray.800')

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      bg={bgColor}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      justifyContent="space-between"
      display={{ base: 'flex', md: 'none' }}
    >
      <IconButton
        variant="ghost"
        onClick={onOpen}
        aria-label="open menu"
        icon={isOpen ? <FiX /> : <FiMenu />}
      />

      <HStack spacing={3}>
        <Image
          src="/4inlab_logo.png"
          alt="4inlab Logo"
          boxSize="32px"
          fallbackSrc="https://via.placeholder.com/32"
        />
        <chakra.span
          fontSize="lg"
          fontWeight="bold"
          bgGradient="linear(to-r, orange.400, orange.600)"
          bgClip="text"
        >
          4inLab
        </chakra.span>
      </HStack>

      <Menu>
        <MenuButton
          as={IconButton}
          variant="ghost"
          aria-label="navigation menu"
          icon={<FiMenu />}
        />
        <MenuList>
          {links.map((link) => (
            <Link key={link.name} href={link.href} passHref>
              <MenuItem
                as="a"
                icon={<link.icon />}
                bg={currentPath === link.href ? 'orange.50' : undefined}
                color={currentPath === link.href ? 'orange.500' : undefined}
              >
                {link.name}
              </MenuItem>
            </Link>
          ))}
        </MenuList>
      </Menu>
    </Flex>
  )
}
