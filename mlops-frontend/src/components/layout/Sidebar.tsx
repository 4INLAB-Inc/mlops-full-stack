'use client'

import {
  Box,
  VStack,
  Icon,
  Text,
  Tooltip,
  useColorModeValue,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  useBreakpointValue,
  Image,
} from '@chakra-ui/react'
import {
  FiHome,
  FiDatabase,
  FiActivity,
  FiPlay,
  FiBarChart2,
  FiSettings,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiGitBranch,
} from 'react-icons/fi'
import { useRouter, usePathname } from 'next/navigation'

interface NavItem {
  icon: any
  label: string
  path: string
}

const navItems: NavItem[] = [
  { icon: FiHome, label: '대시보드', path: '/dashboard' },
  { icon: FiDatabase, label: '데이터셋', path: '/datasets' },
  { icon: FiActivity, label: '실험', path: '/experiments' },
  { icon: FiGitBranch, label: '파이프라인', path: '/dashboard/pipeline' },
  { icon: FiBarChart2, label: '모델', path: '/models' },
  { icon: FiSettings, label: '설정', path: '/settings' },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const isMobile = useBreakpointValue({ base: true, lg: false })
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('point.50', 'point.900')
  const activeColor = useColorModeValue('point.500', 'point.200')

  const SidebarContent = () => (
    <VStack
      w={isCollapsed ? '16' : '64'}
      h="full"
      py={6}
      px={isCollapsed ? 2 : 4}
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      transition="width 0.2s"
      spacing={6}
    >
      {/* 로고 */}
      <Box mb={2} px={2}>
        {isCollapsed ? (
          <Image
            src="/4inlab_icon.png"
            alt="4INLAB"
            h="40px"
            fallback={
              <Text fontSize="2xl" fontWeight="bold" color="point.500">
                4
              </Text>
            }
          />
        ) : (
          <Image
            src="/4inlab_logo.png"
            alt="4INLAB"
            h="40px"
            fallback={
              <Text fontSize="2xl" fontWeight="bold" color="point.500">
                4INLAB
              </Text>
            }
          />
        )}
      </Box>

      {/* 토글 버튼 */}
      {!isMobile && (
        <IconButton
          aria-label="Toggle sidebar"
          icon={<Icon as={isCollapsed ? FiChevronRight : FiChevronLeft} />}
          onClick={onToggle}
          alignSelf={isCollapsed ? 'center' : 'flex-end'}
          variant="ghost"
          color="point.500"
          _hover={{ bg: hoverBg }}
          size="sm"
        />
      )}

      {/* 네비게이션 아이템 */}
      {navItems.map((item) => {
        const isActive = pathname?.startsWith(item.path)
        return isCollapsed ? (
          <Tooltip key={item.path} label={item.label} placement="right">
            <Box
              p={3}
              rounded="lg"
              cursor="pointer"
              onClick={() => {
                router.push(item.path)
                if (isMobile) onClose()
              }}
              bg={isActive ? hoverBg : 'transparent'}
              color={isActive ? activeColor : undefined}
              _hover={{ bg: hoverBg, color: activeColor }}
              transition="all 0.2s"
            >
              <Icon as={item.icon} boxSize={5} />
            </Box>
          </Tooltip>
        ) : (
          <Box
            key={item.path}
            w="full"
            p={3}
            rounded="lg"
            cursor="pointer"
            onClick={() => {
              router.push(item.path)
              if (isMobile) onClose()
            }}
            bg={isActive ? hoverBg : 'transparent'}
            color={isActive ? activeColor : undefined}
            _hover={{ bg: hoverBg, color: activeColor }}
            transition="all 0.2s"
            display="flex"
            alignItems="center"
            gap={4}
          >
            <Icon as={item.icon} boxSize={5} />
            <Text fontWeight={isActive ? 'bold' : 'medium'}>{item.label}</Text>
          </Box>
        )
      })}
    </VStack>
  )

  if (isMobile) {
    return (
      <>
        <IconButton
          aria-label="Open menu"
          icon={<Icon as={FiMenu} />}
          onClick={onOpen}
          position="fixed"
          top={4}
          left={4}
          zIndex={20}
          color="point.500"
          variant="ghost"
          bg={bgColor}
          _hover={{ bg: hoverBg }}
        />
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <SidebarContent />
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return <SidebarContent />
}