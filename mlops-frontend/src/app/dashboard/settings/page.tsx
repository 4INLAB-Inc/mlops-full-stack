'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  HStack,
  Input,
  Select,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableContainer,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  useDisclosure,
  useToast,
  Tag,
  TagLabel,
  IconButton,
  Badge,
  Progress,
} from '@chakra-ui/react'
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi'
import { useSettingsStore } from '@/store/settingsStore'
import ResourceModal from '@/components/settings/ResourceModal'
import StorageModal from '@/components/settings/StorageModal'
import MonitoringModal from '@/components/settings/MonitoringModal'
import UserModal from '@/components/settings/UserModal'
import ProjectModal from '@/components/settings/ProjectModal'

export default function SettingsPage() {
  const toast = useToast()
  const { colorMode, toggleColorMode } = useColorMode()
  const [selectedTab, setSelectedTab] = useState(0)

  // 모달 상태 관리
  const [resourceModalOpen, setResourceModalOpen] = useState(false)
  const [storageModalOpen, setStorageModalOpen] = useState(false)
  const [monitoringModalOpen, setMonitoringModalOpen] = useState(false)
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const {
    language,
    timezone,
    logPath,
    sessionTimeout,
    autoBackup,
    backupPath,
    resources,
    storages,
    monitoringConfigs,
    activityLogs,
    users,
    projects,
    setLanguage,
    setTimezone,
    setLogPath,
    setSessionTimeout,
    setAutoBackup,
    setBackupPath,
    deleteResource,
    deleteStorage,
    deleteMonitoringConfig,
    clearActivityLogs,
    deleteUser,
    deleteProject,
  } = useSettingsStore()

  const handleSave = () => {
    toast({
      title: '설정이 저장되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleEditResource = (resource: any) => {
    setSelectedItem(resource)
    setResourceModalOpen(true)
  }

  const handleEditStorage = (storage: any) => {
    setSelectedItem(storage)
    setStorageModalOpen(true)
  }

  const handleEditMonitoring = (config: any) => {
    setSelectedItem(config)
    setMonitoringModalOpen(true)
  }

  const handleEditUser = (user: any) => {
    setSelectedItem(user)
    setUserModalOpen(true)
  }

  const handleEditProject = (project: any) => {
    setSelectedItem(project)
    setProjectModalOpen(true)
  }

  // 리소스 삭제 핸들러
  const handleDeleteResource = (id: number, name: string) => {
    if (window.confirm(`리소스 '${name}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      deleteResource(id)
      toast({
        title: '리소스 삭제',
        description: `리소스 '${name}'이(가) 삭제되었습니다.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // 스토리지 삭제 핸들러
  const handleDeleteStorage = (id: number, name: string) => {
    if (window.confirm(`스토리지 '${name}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      deleteStorage(id)
      toast({
        title: '스토리지 삭제',
        description: `스토리지 '${name}'이(가) 삭제되었습니다.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // 모니터링 설정 삭제 핸들러
  const handleDeleteMonitoringConfig = (id: number, name: string) => {
    if (window.confirm(`모니터링 설정 '${name}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      deleteMonitoringConfig(id)
      toast({
        title: '모니터링 설정 삭제',
        description: `모니터링 설정 '${name}'이(가) 삭제되었습니다.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // 사용자 삭제 핸들러
  const handleDeleteUser = (id: number, name: string) => {
    if (window.confirm(`사용자 '${name}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      deleteUser(id)
      toast({
        title: '사용자 삭제',
        description: `사용자 '${name}'이(가) 삭제되었습니다.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // 프로젝트 삭제 핸들러
  const handleDeleteProject = (id: number, name: string) => {
    if (window.confirm(`프로젝트 '${name}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      deleteProject(id)
      toast({
        title: '프로젝트 삭제',
        description: `프로젝트 '${name}'이(가) 삭제되었습니다.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // 로그 초기화 핸들러
  const handleClearLogs = () => {
    if (window.confirm('모든 활동 로그를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      clearActivityLogs()
      toast({
        title: '활동 로그 초기화',
        description: '모든 활동 로그가 삭제되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Container maxW="container.xl" py={5}>
      <Tabs variant="unstyled" colorScheme="orange">
        <TabList mb={8} borderBottom="1px solid" borderColor="gray.100">
          <Tab 
            px={4}
            py={3}
            _selected={{ 
              color: 'orange.500',
              borderBottom: '2px solid',
              borderColor: 'orange.500',
            }}
            _hover={{
              color: 'orange.400',
            }}
            _focus={{
              outline: 'none',
              boxShadow: 'none',
            }}
            fontWeight="medium"
            transition="all 0.2s"
          >일반 설정</Tab>
          <Tab 
            px={4}
            py={3}
            _selected={{ 
              color: 'orange.500',
              borderBottom: '2px solid',
              borderColor: 'orange.500',
            }}
            _hover={{
              color: 'orange.400',
            }}
            _focus={{
              outline: 'none',
              boxShadow: 'none',
            }}
            fontWeight="medium"
            transition="all 0.2s"
          >리소스</Tab>
          <Tab 
            px={4}
            py={3}
            _selected={{ 
              color: 'orange.500',
              borderBottom: '2px solid',
              borderColor: 'orange.500',
            }}
            _hover={{
              color: 'orange.400',
            }}
            _focus={{
              outline: 'none',
              boxShadow: 'none',
            }}
            fontWeight="medium"
            transition="all 0.2s"
          >스토리지</Tab>
          <Tab 
            px={4}
            py={3}
            _selected={{ 
              color: 'orange.500',
              borderBottom: '2px solid',
              borderColor: 'orange.500',
            }}
            _hover={{
              color: 'orange.400',
            }}
            _focus={{
              outline: 'none',
              boxShadow: 'none',
            }}
            fontWeight="medium"
            transition="all 0.2s"
          >모니터링</Tab>
          <Tab 
            px={4}
            py={3}
            _selected={{ 
              color: 'orange.500',
              borderBottom: '2px solid',
              borderColor: 'orange.500',
            }}
            _hover={{
              color: 'orange.400',
            }}
            _focus={{
              outline: 'none',
              boxShadow: 'none',
            }}
            fontWeight="medium"
            transition="all 0.2s"
          >사용자</Tab>
          <Tab 
            px={4}
            py={3}
            _selected={{ 
              color: 'orange.500',
              borderBottom: '2px solid',
              borderColor: 'orange.500',
            }}
            _hover={{
              color: 'orange.400',
            }}
            _focus={{
              outline: 'none',
              boxShadow: 'none',
            }}
            fontWeight="medium"
            transition="all 0.2s"
          >프로젝트</Tab>
          <Tab 
            px={4}
            py={3}
            _selected={{ 
              color: 'orange.500',
              borderBottom: '2px solid',
              borderColor: 'orange.500',
            }}
            _hover={{
              color: 'orange.400',
            }}
            _focus={{
              outline: 'none',
              boxShadow: 'none',
            }}
            fontWeight="medium"
            transition="all 0.2s"
          >활동 로그</Tab>

          <Tab 
            px={4}
            py={3}
            _selected={{ 
              color: 'orange.500',
              borderBottom: '2px solid',
              borderColor: 'orange.500',
            }}
            _hover={{
              color: 'orange.400',
            }}
            _focus={{
              outline: 'none',
              boxShadow: 'none',
            }}
            fontWeight="medium"
            transition="all 0.2s"
          >정보</Tab>

          
        </TabList>

        <TabPanels>
          {/* 일반 설정 */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md" color="orange.500">일반 설정</Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>언어</FormLabel>
                    <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>시간대</FormLabel>
                    <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                      <option value="Asia/Seoul">Asia/Seoul</option>
                      <option value="UTC">UTC</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>로그 경로</FormLabel>
                    <Input value={logPath} onChange={(e) => setLogPath(e.target.value)} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>세션 타임아웃 (분)</FormLabel>
                    <Input
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">자동 백업</FormLabel>
                    <Switch isChecked={autoBackup} onChange={(e) => setAutoBackup(e.target.checked)} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>백업 경로</FormLabel>
                    <Input value={backupPath} onChange={(e) => setBackupPath(e.target.value)} />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">다크 모드</FormLabel>
                    <Switch isChecked={colorMode === 'dark'} onChange={toggleColorMode} />
                  </FormControl>

                  <Button colorScheme="orange" onClick={handleSave}>
                    저장
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* 리소스 관리 */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="orange.500">리소스 관리</Heading>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="orange"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(null)
                      setResourceModalOpen(true)
                    }}
                  >
                    리소스 추가
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>이름</Th>
                      <Th>유형</Th>
                      <Th>상태</Th>
                      <Th>용량</Th>
                      <Th>사용량</Th>
                      <Th>작업</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {resources.map((resource) => (
                      <Tr key={resource.id}>
                        <Td>{resource.name}</Td>
                        <Td>{resource.type}</Td>
                        <Td>
                          <Badge colorScheme={resource.status === 'Active' ? 'green' : 'red'}>
                            {resource.status}
                          </Badge>
                        </Td>
                        <Td>{resource.capacity}</Td>
                        <Td>
                          <Progress
                            value={parseInt(resource.usage)}
                            size="sm"
                            colorScheme={parseInt(resource.usage) > 80 ? 'red' : 'orange'}
                          />
                        </Td>
                        <Td>
                          <HStack spacing={4}>
                            <IconButton
                              icon={<FiEdit2 />}
                              size="sm"
                              colorScheme="orange"
                              aria-label="Edit"
                              onClick={() => handleEditResource(resource)}
                            />
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              aria-label="Delete"
                              onClick={() => handleDeleteResource(resource.id, resource.name)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* 스토리지 관리 */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="orange.500">스토리지 관리</Heading>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="orange"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(null)
                      setStorageModalOpen(true)
                    }}
                  >
                    스토리지 추가
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>이름</Th>
                      <Th>유형</Th>
                      <Th>경로</Th>
                      <Th>용량</Th>
                      <Th>사용량</Th>
                      <Th>상태</Th>
                      <Th>작업</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {storages.map((storage) => (
                      <Tr key={storage.id}>
                        <Td>{storage.name}</Td>
                        <Td>{storage.type}</Td>
                        <Td>{storage.path}</Td>
                        <Td>{storage.capacity}</Td>
                        <Td>
                          <Progress
                            value={(parseInt(storage.used) / parseInt(storage.capacity)) * 100}
                            size="sm"
                            colorScheme={(parseInt(storage.used) / parseInt(storage.capacity)) > 0.8 ? 'red' : 'orange'}
                          />
                        </Td>
                        <Td>
                          <Badge colorScheme={storage.status === 'Active' ? 'green' : 'red'}>
                            {storage.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={4}>
                            <IconButton
                              icon={<FiEdit2 />}
                              size="sm"
                              colorScheme="orange"
                              aria-label="Edit"
                              onClick={() => handleEditStorage(storage)}
                            />
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              aria-label="Delete"
                              onClick={() => handleDeleteStorage(storage.id, storage.name)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* 모니터링 설정 */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="orange.500">모니터링 설정</Heading>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="orange"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(null)
                      setMonitoringModalOpen(true)
                    }}
                  >
                    모니터링 추가
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>이름</Th>
                      <Th>유형</Th>
                      <Th>임계값</Th>
                      <Th>상태</Th>
                      <Th>작업</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {monitoringConfigs.map((config) => (
                      <Tr key={config.id}>
                        <Td>{config.name}</Td>
                        <Td>{config.type}</Td>
                        <Td>{config.threshold}</Td>
                        <Td>
                          <Badge colorScheme={config.status === 'Active' ? 'green' : 'red'}>
                            {config.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={4}>
                            <IconButton
                              icon={<FiEdit2 />}
                              size="sm"
                              colorScheme="orange"
                              aria-label="Edit"
                              onClick={() => handleEditMonitoring(config)}
                            />
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              aria-label="Delete"
                              onClick={() => handleDeleteMonitoringConfig(config.id, config.name)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* 사용자 관리 */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="orange.500">사용자 관리</Heading>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="orange"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(null)
                      setUserModalOpen(true)
                    }}
                  >
                    사용자 추가
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>이름</Th>
                      <Th>이메일</Th>
                      <Th>역할</Th>
                      <Th>상태</Th>
                      <Th>작업</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user) => (
                      <Tr key={user.id}>
                        <Td>{user.name}</Td>
                        <Td>{user.email}</Td>
                        <Td>
                          <Badge colorScheme={user.role === 'Admin' ? 'red' : user.role === 'Developer' ? 'green' : 'orange'}>
                            {user.role}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={user.status === 'Active' ? 'green' : 'red'}>
                            {user.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={4}>
                            <IconButton
                              icon={<FiEdit2 />}
                              size="sm"
                              colorScheme="orange"
                              aria-label="Edit"
                              onClick={() => handleEditUser(user)}
                            />
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              aria-label="Delete"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* 프로젝트 관리 */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="orange.500">프로젝트 관리</Heading>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="orange"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(null)
                      setProjectModalOpen(true)
                    }}
                  >
                    프로젝트 추가
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>프로젝트명</Th>
                      <Th>사용자</Th>
                      <Th>작업</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {projects.map((project) => (
                      <Tr key={project.id}>
                        <Td>{project.name}</Td>
                        <Td>
                          <HStack spacing={2}>
                            {project.users.map((user, index) => (
                              <Tag key={index} size="sm" colorScheme="orange">
                                <TagLabel>{user}</TagLabel>
                              </Tag>
                            ))}
                          </HStack>
                        </Td>
                        <Td>
                          <HStack spacing={4}>
                            <IconButton
                              icon={<FiEdit2 />}
                              size="sm"
                              colorScheme="orange"
                              aria-label="Edit"
                              onClick={() => handleEditProject(project)}
                            />
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              aria-label="Delete"
                              onClick={() => handleDeleteProject(project.id, project.name)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* 활동 로그 */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="orange.500">활동 로그</Heading>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={handleClearLogs}
                  >
                    로그 초기화
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>시간</Th>
                        <Th>사용자</Th>
                        <Th>작업</Th>
                        <Th>대상</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {[...activityLogs]
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((log) => (
                        <Tr key={log.id}>
                          <Td>{log.timestamp}</Td>
                          <Td>
                            <Tag size="sm" colorScheme="orange">
                              {log.user}
                            </Tag>
                          </Td>
                          <Td>
                            <Badge colorScheme={
                              log.action.includes('삭제') ? 'red' :
                              log.action.includes('추가') || log.action.includes('생성') ? 'green' :
                              log.action.includes('수정') ? 'blue' : 'gray'
                            }>
                              {log.action}
                            </Badge>
                          </Td>
                          <Td>{log.target}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>

          {/* 정보 (About) */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Box width="100%">
                  <Flex justify="flex-start" align="center">
                    <img src="/mlops_logo.png" alt="MLOps 로고" style={{ height: "150px", width: "auto" }} />
                  </Flex>

                  <Box textAlign="right" mt={2}>
                    <Text fontSize="sm" color="black.600">
                      설치 일시: 2025.05.27 16:02:50
                    </Text>
                  </Box>
                </Box>
              </CardHeader>

              <Divider />

              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "150px 1fr" }} gap={2} fontSize="sm">
                  <Text fontWeight="bold">제품 이름</Text>
                  <Text> 4IN-MLOps Platform </Text>
                  <Text fontWeight="bold">Copyright</Text>
                  <Text> © 2025 (주)포인랩 / 4INLAB INC.</Text>
                </Grid>
              </CardBody>

              <Divider />

              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "150px 1fr" }} gap={2} fontSize="sm">
                
                  <Text fontWeight="bold">버전</Text>
                  <Text>1.0.2 (2025.04.30)</Text>

                  <Text fontWeight="bold">에디션</Text>
                  <Text>Professional</Text>

                  <Text fontWeight="bold">라이선스</Text>
                  <Text>4I-MLOPS-PRO-202505</Text>

                  <Text fontWeight="bold">라이선스 만료일</Text>
                  <Text>없음</Text>

                  <Text fontWeight="bold">시스템</Text>
                  <Text>Docker 컨테이너 (Windows 11 기반)</Text>

                  <Text fontWeight="bold">호스트</Text>
                  <Text>Local host - 10.100.39.409</Text>

                  <Text fontWeight="bold">사용자 이름</Text>
                  <Text>국립창원대학교</Text>

                  <Text fontWeight="bold">워크그룹</Text>
                  <Text>N/A</Text>
                </Grid>
              </CardBody>
            </Card>
          </TabPanel>


        </TabPanels>
      </Tabs>

      {/* 모달 컴포넌트들 */}
      <ResourceModal
        isOpen={resourceModalOpen}
        onClose={() => {
          setResourceModalOpen(false)
          setSelectedItem(null)
        }}
        resource={selectedItem}
      />

      <StorageModal
        isOpen={storageModalOpen}
        onClose={() => {
          setStorageModalOpen(false)
          setSelectedItem(null)
        }}
        storage={selectedItem}
      />

      <MonitoringModal
        isOpen={monitoringModalOpen}
        onClose={() => {
          setMonitoringModalOpen(false)
          setSelectedItem(null)
        }}
        config={selectedItem}
      />

      <UserModal
        isOpen={userModalOpen}
        onClose={() => {
          setUserModalOpen(false)
          setSelectedItem(null)
        }}
        user={selectedItem}
      />

      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false)
          setSelectedItem(null)
        }}
        project={selectedItem}
      />
    </Container>
  )
}
