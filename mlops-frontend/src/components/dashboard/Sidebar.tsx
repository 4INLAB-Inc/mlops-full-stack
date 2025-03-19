import {
  Box,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Image,
  chakra,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react'
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
  FiDatabase,
  FiLayers,
  FiCpu,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useState } from 'react'

interface LinkItemProps {
  name: string
  icon: IconType
  href: string
  description: string
}

const LinkItems: Array<LinkItemProps> = [
  { 
    name: '대시보드', 
    icon: FiHome, 
    href: '/dashboard',
    description: '전체 시스템 현황 및 주요 지표' 
  },
  { 
    name: '데이터셋', 
    icon: FiDatabase, 
    href: '/dashboard/datasets',
    description: '데이터셋 관리 및 전처리' 
  },
  { 
    name: '모델', 
    icon: FiCpu, 
    href: '/dashboard/models',
    description: '모델 저장소 및 버전 관리' 
  },
  { 
    name: '실험 관리', 
    icon: FiActivity, 
    href: '/dashboard/experiments',
    description: '모델 학습 실험 관리' 
  },
  { 
    name: '리소스', 
    icon: FiTrendingUp, 
    href: '/dashboard/resources',
    description: '시스템 리소스 모니터링' 
  },
  { 
    name: '배포', 
    icon: FiLayers, 
    href: '/dashboard/deployment',
    description: '모델 배포 및 서비스 관리' 
  },
  { 
    name: '설정', 
    icon: FiSettings, 
    href: '/dashboard/settings',
    description: '시스템 설정 및 환경 구성' 
  },
]

const Sidebar = memo(function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const bgColor = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.100', 'gray.800')

  return (
    <Box
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      w={isCollapsed ? '60px' : '240px'}
      pos="fixed"
      h="100vh"
      transition="width 0.2s"
    >
      <Flex 
        h="16" 
        alignItems="center" 
        justifyContent={isCollapsed ? "center" : "space-between"}
        borderBottom="1px"
        borderBottomColor={borderColor}
        px={isCollapsed ? "2" : "4"}
      >
        {!isCollapsed && (
          <HStack spacing={2}>
            <Image
              src="/4inlab_logo.png"
              alt="4inlab Logo"
              boxSize="32px"
              objectFit="contain"
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
        )}
        <IconButton
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="ghost"
          size="sm"
        />
      </Flex>

      <VStack spacing={1} align="stretch" mt={4}>
        {LinkItems.map((link) => (
          <NavItem
            key={link.name}
            icon={link.icon}
            href={link.href}
            isActive={pathname === link.href}
            isCollapsed={isCollapsed}
            description={link.description}
          >
            {link.name}
          </NavItem>
        ))}
      </VStack>
    </Box>
  )
})

interface NavItemProps {
  icon: IconType
  href: string
  isActive?: boolean
  isCollapsed?: boolean
  description?: string
  children: React.ReactNode
}

const NavItem = memo(function NavItem({ 
  icon, 
  href, 
  isActive, 
  isCollapsed,
  description,
  children 
}: NavItemProps) {
  const activeBg = useColorModeValue('orange.50', 'whiteAlpha.100')
  const activeColor = useColorModeValue('orange.500', 'orange.300')
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100')
  const textColor = useColorModeValue('gray.700', 'gray.300')

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Flex
        align="center"
        p="3"
        mx="2"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : textColor}
        justifyContent={isCollapsed ? "center" : "flex-start"}
        _hover={{
          bg: hoverBg,
          color: activeColor,
        }}
        transition="all 0.2s"
      >
        <Icon
          fontSize="16"
          as={icon}
          color={isActive ? activeColor : 'gray.400'}
          _groupHover={{
            color: activeColor,
          }}
          mr={isCollapsed ? "0" : "3"}
        />
        {!isCollapsed && (
          <Text fontSize="sm" fontWeight={isActive ? "600" : "500"}>
            {children}
          </Text>
        )}
        {isActive && (
          <Box
            position="absolute"
            right="0"
            width="2px"
            height="20px"
            bgGradient="linear(to-b, orange.400, orange.600)"
            borderRadius="full"
          />
        )}
      </Flex>
    </Link>
  )
})

export default Sidebar
