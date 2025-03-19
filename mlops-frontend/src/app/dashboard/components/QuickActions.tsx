'use client'

import { SimpleGrid, IconButton, Tooltip, useColorModeValue, Wrap, WrapItem } from '@chakra-ui/react'
import { 
  FiPlus, 
  FiUploadCloud, 
  FiActivity,
  FiDatabase,
  FiTrendingUp,
  FiLayers,
  FiGitBranch,
  FiMonitor,
  FiZap
} from 'react-icons/fi'

const QuickActions = () => {
  const actions = [
    {
      title: '새 프로젝트',
      icon: FiPlus,
      color: 'orange'
    },
    {
      title: '모델 업로드',
      icon: FiUploadCloud,
      color: 'blue'
    },
    {
      title: '실험 관리',
      icon: FiActivity,
      color: 'green'
    },
    {
      title: '데이터셋',
      icon: FiDatabase,
      color: 'purple'
    },
    {
      title: '성능 분석',
      icon: FiTrendingUp,
      color: 'red'
    },
    {
      title: '모델 버전',
      icon: FiGitBranch,
      color: 'teal'
    },
    {
      title: '배포 관리',
      icon: FiZap,
      color: 'yellow'
    },
    {
      title: '모니터링',
      icon: FiMonitor,
      color: 'cyan'
    },
    {
      title: '파이프라인',
      icon: FiLayers,
      color: 'pink'
    }
  ]

  const buttonBg = useColorModeValue('white', 'gray.800')
  const buttonHoverBg = useColorModeValue('gray.50', 'gray.700')

  return (
    <Wrap spacing={2}>
      {actions.map((action, index) => (
        <WrapItem key={index}>
          <Tooltip label={action.title} hasArrow>
            <IconButton
              aria-label={action.title}
              icon={<action.icon />}
              size="lg"
              variant="outline"
              bg={buttonBg}
              color={`${action.color}.500`}
              borderColor={`${action.color}.200`}
              _hover={{
                bg: `${action.color}.50`,
                borderColor: `${action.color}.300`,
                transform: 'translateY(-2px)',
                shadow: 'md'
              }}
              _active={{
                bg: `${action.color}.100`,
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
            />
          </Tooltip>
        </WrapItem>
      ))}
    </Wrap>
  )
}

export default QuickActions
