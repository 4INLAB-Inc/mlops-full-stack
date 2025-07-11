'use client'

import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Icon,
  useColorMode,
  useColorModeValue,
  Container,
  VStack,
  Flex,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  HStack,
  Text,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Badge,
  Avatar,
  AvatarBadge,
  List,
  ListItem,
  Divider,
  useToast,
} from '@chakra-ui/react'
import {
  FiSearch,
  FiPlusCircle,
  FiUploadCloud,
  FiPlay,
  FiServer,
  FiDatabase,
  FiSettings,
  FiGitBranch,
  FiMonitor,
  FiPackage,
  FiAlertCircle,
  FiBook,
  FiHelpCircle,
  FiBell,
  FiUser,
  FiSun,
  FiMoon,
  FiGrid,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
} from 'react-icons/fi'
import NextLink from 'next/link'
import { useState } from 'react'
import { SimpleGrid } from '@chakra-ui/react';

// 알림 데이터 타입 정의
interface Notification {
  id: string
  type: 'success' | 'warning' | 'info'
  title: string
  message: string
  time: string
  read: boolean
}

const quickActions = [
  {
    label: '새 실험',
    icon: FiPlusCircle,
    tooltip: '새로운 ML 실험 시작',
    href: '/dashboard/experiments/new',
  },
  {
    label: '데이터셋 업로드',
    icon: FiUploadCloud,
    tooltip: '새로운 데이터셋 업로드',
    href: '/dashboard/datasets/upload',
  },
  {
    label: '파이프라인 실행',
    icon: FiPlay,
    tooltip: 'ML 파이프라인 실행',
    href: '/dashboard/pipelines/new',
  },
  {
    label: '모델 배포',
    icon: FiServer,
    tooltip: '학습된 모델 배포',
    href: '/dashboard/models/deploy',
  },
  {
    label: '데이터 관리',
    icon: FiDatabase,
    tooltip: '데이터셋 및 리소스 관리',
    href: '/dashboard/datasets',
  },
  {
    label: '버전 관리',
    icon: FiGitBranch,
    tooltip: '모델 및 데이터 버전 관리',
    href: '/dashboard/versions',
  },
  {
    label: '모니터링',
    icon: FiMonitor,
    tooltip: '모델 성능 모니터링',
    href: '/dashboard/monitoring',
  },
  {
    label: '배포 관리',
    icon: FiPackage,
    tooltip: '배포된 모델 관리',
    href: '/dashboard/deployments',
  },
]

// 모의 알림 데이터
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: '모델 학습 완료',
    message: 'image-classification-v2 모델 학습이 성공적으로 완료되었습니다.',
    time: '5분 전',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'GPU 사용량 경고',
    message: 'GPU-01 리소스의 사용량이 90%를 초과했습니다.',
    time: '10분 전',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: '새 데이터셋 동기화',
    message: '상품 이미지 데이터셋이 성공적으로 동기화되었습니다.',
    time: '30분 전',
    read: true,
  },
]

function NotificationIcon({ type }: { type: Notification['type'] }) {
  switch (type) {
    case 'success':
      return <Icon as={FiCheckCircle} color="green.500" />
    case 'warning':
      return <Icon as={FiAlertTriangle} color="orange.500" />
    case 'info':
      return <Icon as={FiClock} color="blue.500" />
  }
}

function HelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>도움말</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontWeight="bold" mb={2}>
                시작하기
              </Text>
              <Text>
                4inlab MLOps 플랫폼에 오신 것을 환영합니다. 이 플랫폼은 머신러닝
                모델의 개발, 배포, 관리를 위한 통합 솔루션입니다.
              </Text>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={2}>
                주요 기능
              </Text>
              <VStack align="stretch" spacing={2}>
                <Text>• 실험 관리: 모델 실험을 생성하고 관리합니다.</Text>
                <Text>• 데이터셋: 데이터를 업로드하고 버전을 관리합니다.</Text>
                <Text>• 파이프라인: ML 파이프라인을 구성하고 실행합니다.</Text>
                <Text>• 모델 배포: 학습된 모델을 프로덕션에 배포합니다.</Text>
              </VStack>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={2}>
                추가 리소스
              </Text>
              <Link color="brand.500" href="/docs" isExternal>
                상세 문서 보기
              </Link>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

function QuickMenu() {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')

  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <IconButton
          aria-label="Quick Menu"
          icon={<Icon as={FiGrid} />}
          variant="ghost"
          size="sm"
        />
      </PopoverTrigger>
      <PopoverContent
        w="300px"
        bg={bgColor}
        borderColor={borderColor}
        shadow="lg"
      >
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontWeight="bold">빠른 메뉴</PopoverHeader>
        <PopoverBody>
          <SimpleGrid columns={2} spacing={2}>
            {quickActions.slice(0, 6).map((action) => (
              <Button
                key={action.label}
                as={NextLink}
                href={action.href}
                size="sm"
                variant="ghost"
                justifyContent="start"
                leftIcon={<Icon as={action.icon} />}
                w="full"
              >
                {action.label}
              </Button>
            ))}
          </SimpleGrid>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

function NotificationsMenu() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  const toast = useToast()

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
    toast({
      title: '모든 알림을 읽음으로 표시했습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={
          <Box position="relative">
            <Icon as={FiBell} />
            {unreadCount > 0 && (
              <Badge
                position="absolute"
                top="-2px"
                right="-2px"
                colorScheme="red"
                borderRadius="full"
                minW="4"
                h="4"
                fontSize="xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Box>
        }
        variant="ghost"
        size="sm"
      />
      <MenuList
        w="350px"
        bg={bgColor}
        borderColor={borderColor}
        shadow="lg"
        py={2}
      >
        <HStack justify="space-between" px={4} mb={2}>
          <Text fontWeight="bold">알림</Text>
          <Button size="xs" variant="ghost" onClick={markAllAsRead}>
            모두 읽음 표시
          </Button>
        </HStack>
        <MenuDivider />
        <List spacing={1}>
          {notifications.map((notification) => (
            <ListItem
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              bg={notification.read ? undefined : 'gray.50'}
              _dark={{ bg: notification.read ? undefined : 'gray.700' }}
              p={2}
              cursor="pointer"
              _hover={{ bg: 'gray.100', _dark: { bg: 'gray.600' } }}
            >
              <HStack spacing={3} px={2}>
                <NotificationIcon type={notification.type} />
                <Box flex={1}>
                  <Text fontWeight="medium" fontSize="sm">
                    {notification.title}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {notification.message}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {notification.time}
                  </Text>
                </Box>
              </HStack>
            </ListItem>
          ))}
        </List>
        <MenuDivider />
        <MenuItem as={NextLink} href="/dashboard/notifications">
          모든 알림 보기
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

export default function DashboardHeader() {
  const { colorMode, toggleColorMode } = useColorMode()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  const buttonHoverBg = useColorModeValue('gray.50', 'gray.700')
  const iconColor = useColorModeValue('brand.500', 'brand.200')
  const placeholderColor = useColorModeValue('gray.400', 'gray.500')
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box
      as="header"
      w="full"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      shadow="sm"
      position="sticky"
      top={0}
      zIndex="sticky"
    >
      <Container maxW="container.xl" py={2}>
        <VStack spacing={4}>
          {/* Top Navigation */}
          <Flex w="full" justify="space-between" align="center">
            <HStack spacing={4}>
              <NextLink href="/dashboard" passHref>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="brand.500"
                  cursor="pointer"
                >
                  4inlab MLOps
                </Text>
              </NextLink>
              <NextLink href="/docs" passHref>
                <Button
                  variant="ghost"
                  leftIcon={<Icon as={FiBook} />}
                  size="sm"
                >
                  메뉴얼
                </Button>
              </NextLink>
              <Button
                variant="ghost"
                leftIcon={<Icon as={FiHelpCircle} />}
                size="sm"
                onClick={onOpen}
              >
                도움말
              </Button>
            </HStack>

            <HStack spacing={2}>
              <InputGroup size="sm" maxW="xs">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color={placeholderColor} />
                </InputLeftElement>
                <Input
                  placeholder="빠른 검색..."
                  borderRadius="full"
                  bg={bgColor}
                />
              </InputGroup>
              
              <QuickMenu />
              
              <NotificationsMenu />

              <Tooltip label={`${colorMode === 'light' ? '다크' : '라이트'} 모드`}>
                <IconButton
                  aria-label="Toggle color mode"
                  icon={<Icon as={colorMode === 'light' ? FiMoon : FiSun} />}
                  onClick={toggleColorMode}
                  variant="ghost"
                  size="sm"
                />
              </Tooltip>

              <Menu>
                <MenuButton
                  as={Box}
                  cursor="pointer"
                >
                  <Avatar
                    size="sm"
                    name="User Name"
                    src="/images/avatar.jpg"
                  >
                    <AvatarBadge boxSize="1.25em" bg="green.500" />
                  </Avatar>
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<FiUser />}>프로필</MenuItem>
                  <MenuItem icon={<FiSettings />}>설정</MenuItem>
                  <MenuDivider />
                  <MenuItem color="red.500">로그아웃</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>

          {/* Quick Actions */}
          <Flex justify="center" wrap="wrap" gap={2}>
            {quickActions.map((action) => (
              <Tooltip
                key={action.label}
                label={action.tooltip}
                placement="bottom"
                hasArrow
              >
                <Button
                  as={NextLink}
                  href={action.href}
                  variant="ghost"
                  size="md"
                  leftIcon={<Icon as={action.icon} color={iconColor} />}
                  _hover={{
                    bg: buttonHoverBg,
                    transform: 'translateY(-1px)',
                    shadow: 'md',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                    shadow: 'sm',
                  }}
                  transition="all 0.2s"
                  fontFamily="Pretendard"
                  fontWeight="medium"
                >
                  {action.label}
                </Button>
              </Tooltip>
            ))}
          </Flex>
        </VStack>
      </Container>

      <HelpModal isOpen={isOpen} onClose={onClose} />
    </Box>
  )
}
