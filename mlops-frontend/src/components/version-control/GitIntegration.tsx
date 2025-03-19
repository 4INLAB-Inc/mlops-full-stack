'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  useToast,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { FiGitBranch, FiGitCommit, FiGitMerge, FiGitPullRequest } from 'react-icons/fi'

interface GitRepository {
  name: string
  url: string
  branch: string
  lastSync: string
  status: 'synced' | 'pending' | 'error'
}

interface GitBranch {
  name: string
  lastCommit: string
  author: string
  status: 'active' | 'merged' | 'stale'
}

const mockRepositories: GitRepository[] = [
  {
    name: 'mlops-model-repo',
    url: 'https://github.com/organization/mlops-model-repo',
    branch: 'main',
    lastSync: '2025-02-21T09:15:00',
    status: 'synced',
  },
]

const mockBranches: GitBranch[] = [
  {
    name: 'main',
    lastCommit: 'Initial model implementation',
    author: '김개발',
    status: 'active',
  },
  {
    name: 'feature/optimize-training',
    lastCommit: 'Add training optimization',
    author: '이엠엘',
    status: 'active',
  },
  {
    name: 'feature/data-preprocessing',
    lastCommit: 'Implement data preprocessing',
    author: '박데이터',
    status: 'merged',
  },
]

export function GitIntegration() {
  const [repositories] = useState<GitRepository[]>(mockRepositories)
  const [branches] = useState<GitBranch[]>(mockBranches)
  const [repoUrl, setRepoUrl] = useState('')
  const toast = useToast()

  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const bgColor = useColorModeValue('white', 'gray.800')

  const handleConnect = () => {
    toast({
      title: 'Git 저장소 연결 중...',
      description: '저장소 연결을 시도합니다.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
      case 'active':
        return 'green'
      case 'pending':
        return 'yellow'
      case 'merged':
        return 'blue'
      case 'error':
      case 'stale':
        return 'red'
      default:
        return 'gray'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Stack spacing={6} p={4}>
      <VStack align="stretch" spacing={4}>
        <Text fontSize="lg" fontWeight="bold">
          Git 저장소 연결
        </Text>
        <Box
          p={4}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          bg={bgColor}
        >
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>저장소 URL</FormLabel>
              <HStack>
                <Input
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
                <Button colorScheme="blue" onClick={handleConnect}>
                  연결
                </Button>
              </HStack>
            </FormControl>
          </Stack>
        </Box>
      </VStack>

      <Divider />

      <VStack align="stretch" spacing={4}>
        <Text fontSize="lg" fontWeight="bold">
          연결된 저장소
        </Text>
        <Table variant="simple" borderWidth="1px" borderColor={borderColor}>
          <Thead>
            <Tr>
              <Th>저장소명</Th>
              <Th>URL</Th>
              <Th>브랜치</Th>
              <Th>마지막 동기화</Th>
              <Th>상태</Th>
              <Th>작업</Th>
            </Tr>
          </Thead>
          <Tbody>
            {repositories.map((repo) => (
              <Tr key={repo.name}>
                <Td>{repo.name}</Td>
                <Td>{repo.url}</Td>
                <Td>{repo.branch}</Td>
                <Td>{formatDate(repo.lastSync)}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(repo.status)}>
                    {repo.status}
                  </Badge>
                </Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="More options"
                      icon={<ChevronDownIcon />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem icon={<FiGitPullRequest />}>Pull Request 생성</MenuItem>
                      <MenuItem icon={<FiGitCommit />}>변경사항 커밋</MenuItem>
                      <MenuItem icon={<FiGitMerge />}>브랜치 병합</MenuItem>
                      <MenuItem color="red.500">연결 해제</MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>

      <Divider />

      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            브랜치 목록
          </Text>
          <Button
            leftIcon={<FiGitBranch />}
            colorScheme="blue"
            size="sm"
          >
            새 브랜치
          </Button>
        </HStack>
        <Table variant="simple" borderWidth="1px" borderColor={borderColor}>
          <Thead>
            <Tr>
              <Th>브랜치명</Th>
              <Th>마지막 커밋</Th>
              <Th>작성자</Th>
              <Th>상태</Th>
              <Th>작업</Th>
            </Tr>
          </Thead>
          <Tbody>
            {branches.map((branch) => (
              <Tr key={branch.name}>
                <Td>{branch.name}</Td>
                <Td>{branch.lastCommit}</Td>
                <Td>{branch.author}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(branch.status)}>
                    {branch.status}
                  </Badge>
                </Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="More options"
                      icon={<ChevronDownIcon />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem icon={<FiGitCommit />}>커밋</MenuItem>
                      <MenuItem icon={<FiGitMerge />}>병합</MenuItem>
                      <MenuItem icon={<FiGitPullRequest />}>PR 생성</MenuItem>
                      <MenuItem color="red.500">삭제</MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Stack>
  )
}
