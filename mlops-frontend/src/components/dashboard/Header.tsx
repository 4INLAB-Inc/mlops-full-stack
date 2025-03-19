'use client'

import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import { 
  FiSearch, 
  FiMoon, 
  FiSun, 
  FiBell, 
  FiCpu, 
  FiHardDrive,
  FiDatabase,
  FiPlus,
  FiUploadCloud,
  FiPlay,
  FiServer
} from 'react-icons/fi'
import { useState } from 'react'

const QuickActions = [
  {
    name: '새 실험',
    icon: FiPlus,
    description: '새로운 ML 실험을 시작합니다',
    shortcut: '⌘N',
    color: 'blue.500',
  },
  {
    name: '데이터셋 업로드',
    icon: FiUploadCloud,
    description: '새로운 데이터셋을 업로드합니다',
    shortcut: '⌘U',
    color: 'green.500',
  },
  {
    name: '파이프라인 실행',
    icon: FiPlay,
    description: 'ML 파이프라인을 실행합니다',
    shortcut: '⌘R',
    color: 'purple.500',
  },
  {
    name: '모델 배포',
    icon: FiServer,
    description: '학습된 모델을 배포합니다',
    shortcut: '⌘D',
    color: 'orange.500',
  },
]

const ResourceMetrics = [
  {
    name: 'CPU 사용량',
    icon: FiCpu,
    value: '75%',
    color: 'red.500',
  },
  {
    name: '메모리',
    icon: FiHardDrive,
    value: '60%',
    color: 'blue.500',
  },
  {
    name: 'GPU 사용량',
    icon: FiDatabase,
    value: '90%',
    color: 'green.500',
  },
]

export default function Header() {
  const { colorMode, toggleColorMode } = useColorMode()
  const [searchQuery, setSearchQuery] = useState('')
  
  // Mock resource usage data (실제로는 API에서 가져와야 함)
  const resourceUsage = {
    cpu: '45%',
    memory: '60%',
    storage: '35%',
    gpu: '25%'
  }

  const bgColor = useColorModeValue('white', 'dark.card')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={1000}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      px={6}
      py={4}
    >
      <Flex justify="space-between" align="center">
        {/* Search Bar */}
        <Box flex={1} maxW="600px">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="프로젝트, 모델, 데이터셋 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="filled"
              _focus={{
                borderColor: 'brand.primary',
                boxShadow: '0 0 0 1px var(--chakra-colors-brand-primary)',
              }}
            />
          </InputGroup>
        </Box>

        {/* Quick Actions */}
        <HStack spacing={4} ml={8}>
          <Tooltip label="새 프로젝트 생성" placement="bottom">
            <Button
              leftIcon={<FiPlus />}
              variant="primary"
              size="sm"
            >
              새 프로젝트
            </Button>
          </Tooltip>

          <HStack spacing={2}>
            {QuickActions.map((action) => (
              <Tooltip key={action.name} label={action.description} placement="bottom">
                <IconButton
                  aria-label={action.name}
                  icon={<Icon as={action.icon} />}
                  variant="ghost"
                  size="sm"
                  color={action.color}
                />
              </Tooltip>
            ))}
          </HStack>

          {/* Resource Monitoring */}
          <Menu>
            <Tooltip label="리소스 모니터링" placement="bottom">
              <MenuButton
                as={IconButton}
                aria-label="리소스 모니터링"
                icon={<FiCpu />}
                variant="ghost"
                size="sm"
              />
            </Tooltip>
            <MenuList>
              {ResourceMetrics.map((metric) => (
                <MenuItem key={metric.name} closeOnSelect={false}>
                  <HStack spacing={3}>
                    <Icon as={metric.icon} />
                    <Text>{metric.name}</Text>
                    <Text color={metric.color} fontWeight="bold">{metric.value}</Text>
                  </HStack>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* Notifications */}
          <Tooltip label="알림" placement="bottom">
            <IconButton
              aria-label="알림"
              icon={<FiBell />}
              variant="ghost"
              size="sm"
            />
          </Tooltip>

          {/* Dark Mode Toggle */}
          <Tooltip label={colorMode === 'light' ? '다크 모드' : '라이트 모드'} placement="bottom">
            <IconButton
              aria-label="다크 모드 전환"
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
            />
          </Tooltip>
        </HStack>
      </Flex>
    </Box>
  )
}
