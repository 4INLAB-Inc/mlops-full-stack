'use client'

import {
  Box,
  Flex,
  Icon,
  Text,
  VStack,
  useColorModeValue,
  IconButton,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  InputGroup,
  InputLeftElement,
  Input,
  InputRightElement,
  Button,
  Tooltip,
  Circle,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  CircularProgress,
  Collapse,
  Link,
  Divider,
} from '@chakra-ui/react'
import {
  FiHome,
  FiDatabase,
  FiServer,
  FiActivity,
  FiLayers,
  FiSettings,
  FiMenu,
  FiUser,
  FiBell,
  FiLogOut,
  FiSearch,
  FiHelpCircle,
  FiChevronDown,
  FiPlus,
  FiMoon,
  FiSun,
  FiTrendingUp,
  FiChevronRight,
  FiChevronLeft,
  FiGitBranch,
  FiMonitor,
  FiAlertCircle,
  FiPackage,
  FiCpu,
} from 'react-icons/fi'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { useColorMode } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useAuth } from '@/contexts/AuthContext'
import UserMenu from '@/components/UserMenu'
import Image from 'next/image'
import NextLink from 'next/link'

interface NavItemProps {
  icon: any
  children: string
  href: string
  isActive?: boolean
  isCollapsed?: boolean
}

const NavItem = ({ icon, children, href, isActive, isCollapsed }: NavItemProps) => {
  const activeBg = useColorModeValue('orange.50', 'gray.700')
  const inactiveBg = useColorModeValue('transparent', 'transparent')
  const activeColor = useColorModeValue('orange.500', 'orange.200')
  const inactiveColor = useColorModeValue('gray.600', 'gray.400')
  const pathname = usePathname()

  // 정확한 경로 매칭을 위한 로직
  const isCurrentPath = pathname === href || 
    (href !== '/dashboard' && pathname?.startsWith(href))

  const NavContent = (
    <Flex
      align="center"
      p="3"
      mx="3"
      borderRadius="md"
      role="group"
      cursor="pointer"
      bg={isCurrentPath ? activeBg : inactiveBg}
      color={isCurrentPath ? activeColor : inactiveColor}
      _hover={{
        bg: isCurrentPath ? activeBg : useColorModeValue('gray.50', 'gray.700'),
        color: activeColor,
      }}
      justifyContent={isCollapsed ? "center" : "flex-start"}
      transition="all 0.2s"
    >
      <Icon
        mr={isCollapsed ? "0" : "3"}
        fontSize="20"
        as={icon}
      />
      {!isCollapsed && (
        <Text fontSize="14px" fontWeight="medium">{children}</Text>
      )}
    </Flex>
  )

  return (
    <NextLink
      href={href}
      style={{ textDecoration: 'none' }}
      passHref
    >
      {isCollapsed ? (
        <Tooltip 
          label={children} 
          placement="right" 
          bg={useColorModeValue('white', 'gray.800')}
          color={useColorModeValue('gray.800', 'white')}
          fontSize="13px"
          px="2.5"
          py="1.5"
          borderRadius="md"
          boxShadow="sm"
          hasArrow
        >
          {NavContent}
        </Tooltip>
      ) : NavContent}
    </NextLink>
  )
}

function SidebarContent({ currentPath, isCollapsed, onToggle }: {
  currentPath: string
  isCollapsed: boolean
  onToggle: () => void
}) {
  const MenuGroups = [
    {
      title: '개요',
      items: [
        { name: '대시보드', icon: FiHome, href: '/dashboard' },
        { name: '모니터링', icon: FiMonitor, href: '/dashboard/monitoring' },
        { name: '알림', icon: FiAlertCircle, href: '/dashboard/alerts' },
      ]
    },
    {
      title: 'MLOps',
      items: [
        { name: '실험', icon: FiActivity, href: '/dashboard/experiments' },
        { name: '모델', icon: FiServer, href: '/dashboard/models' },
        { name: '데이터셋', icon: FiDatabase, href: '/dashboard/datasets' },
        { name: '파이프라인', icon: FiLayers, href: '/dashboard/pipeline' },
        { name: '버전 관리', icon: FiGitBranch, href: '/dashboard/versions' },
      ]
    },
    {
      title: '인프라',
      items: [
        { name: '리소스', icon: FiTrendingUp, href: '/dashboard/resources' },
        { name: '컴퓨팅', icon: FiCpu, href: '/dashboard/computing' },
        { name: '패키지', icon: FiPackage, href: '/dashboard/packages' },
      ]
    },
    {
      title: '관리',
      items: [
        { name: '설정', icon: FiSettings, href: '/dashboard/settings' },
      ]
    }
  ]

  return (
    <Box
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={isCollapsed ? '60px' : { base: 'full', md: '240px' }}
      pos="fixed"
      h="full"
      bg={useColorModeValue('white', 'gray.800')}
      transition="width 0.2s"
      pb={4}
    >
      <Flex 
        h="16" 
        alignItems="center" 
        justifyContent="space-between"
        borderBottom="1px"
        borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
        px={3}
      >
        <Flex alignItems="center">
          <Box
            width={isCollapsed ? "32px" : "36px"}
            height={isCollapsed ? "32px" : "36px"}
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minWidth={isCollapsed ? "32px" : "36px"}
          >
            <Image
              src="/4inlab_favicon.png"
              alt="4inlab Logo"
              width={isCollapsed ? 30 : 32}
              height={isCollapsed ? 30 : 32}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          {!isCollapsed && (
            <Text
              ml={2.5}
              fontSize="15px"
              fontWeight="bold"
              color={useColorModeValue('gray.700', 'white')}
              letterSpacing="tight"
            >
              4INLAB MLOps
            </Text>
          )}
        </Flex>
        <IconButton
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          onClick={onToggle}
          variant="ghost"
          size="xs"
          width="20px"
          height="20px"
          minWidth="20px"
          p={0}
        />
      </Flex>

      <VStack spacing={6} align="stretch" mt={4} px={1}>
        {MenuGroups.map((group, idx) => (
          <Box key={group.title}>
            {!isCollapsed && (
              <Text
                px={3}
                fontSize="xs"
                fontWeight="semibold"
                textTransform="uppercase"
                color={useColorModeValue('gray.500', 'gray.400')}
                mb={2}
              >
                {group.title}
              </Text>
            )}
            <VStack spacing={1} align="stretch">
              {group.items.map((item) => (
                <NavItem
                  key={item.name}
                  icon={item.icon}
                  href={item.href}
                  isActive={currentPath === item.href || 
                    (item.href !== '/dashboard' && currentPath?.startsWith(item.href))}
                  isCollapsed={isCollapsed}
                >
                  {item.name}
                </NavItem>
              ))}
            </VStack>
            {idx < MenuGroups.length - 1 && !isCollapsed && (
              <Box mt={4} mx={2}>
                <Divider />
              </Box>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  )
}

const TopBar = memo(({ isCollapsed }: { isCollapsed: boolean }) => {
  const { colorMode, toggleColorMode } = useColorMode()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const textColor = useColorModeValue('gray.600', 'gray.200')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <Flex
      ml={{ base: 0, md: isCollapsed ? '64px' : '240px' }}
      px={4}
      height="20"
      alignItems="center"
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent="space-between"
      bg={useColorModeValue('white', 'gray.800')}
      transition="margin-left 0.2s"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <HStack spacing={2}>
      </HStack>

      <HStack spacing={4}>
        <Box position="relative" ref={searchRef}>
          <IconButton
            icon={<FiSearch />}
            aria-label="Search"
            variant="ghost"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          />
          <Collapse in={isSearchOpen}>
            <Box
              position="absolute"
              right="0"
              top="100%"
              w="300px"
              bg={useColorModeValue('white', 'gray.700')}
              boxShadow="lg"
              rounded="md"
              p={4}
            >
              <Input placeholder="검색..." />
            </Box>
          </Collapse>
        </Box>
        <IconButton
          icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
          aria-label="Toggle color mode"
          onClick={toggleColorMode}
          variant="ghost"
        />
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FiUser />}
            variant="ghost"
            aria-label="User menu"
          />
          <MenuList>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Settings</MenuItem>
            <MenuDivider />
            <MenuItem>Sign out</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  )
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const onToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <Box minH="100vh">
      <SidebarContent
        currentPath={pathname}
        isCollapsed={isCollapsed}
        onToggle={onToggle}
      />
      <Box>
        <TopBar isCollapsed={isCollapsed} />
        <Box
          ml={{ base: 0, md: isCollapsed ? '64px' : '240px' }}
          p="4"
          transition="margin-left 0.2s"
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
