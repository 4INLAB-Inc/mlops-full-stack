'use client'

import { useState, useCallback, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  NodeChange,
  applyNodeChanges,
  applyEdgeChanges,
  EdgeChange,
  Connection,
  addEdge,
} from 'reactflow'
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
  Heading,
  Card,
  CardBody,
  useColorModeValue,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { 
  FiPlay, 
  FiSave, 
  FiZoomIn, 
  FiZoomOut,
  FiMaximize2,
  FiMoreVertical,
  FiDownload,
  FiUpload,
  FiTrash2,
} from 'react-icons/fi'
import 'reactflow/dist/style.css'

import WorkflowNode from '@/components/workflows/WorkflowNode'
import WorkflowSidebar from '@/components/workflows/WorkflowSidebar'

const nodeTypes = {
  workflow: WorkflowNode,
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'workflow',
    position: { x: 250, y: 100 },
    data: { label: 'MNIST Dataset', type: 'dataset', status: 'completed' },
  },
  {
    id: '2',
    type: 'workflow',
    position: { x: 500, y: 100 },
    data: { label: '데이터 정규화', type: 'preprocess', status: 'completed' },
  },
  {
    id: '3',
    type: 'workflow',
    position: { x: 750, y: 100 },
    data: { label: 'CNN 모델 학습', type: 'train', status: 'running' },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
]

export default function WorkflowsPage() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const headingColor = useColorModeValue('gray.800', 'white')
  const accentColor = '#EB6100'

  const onNodeAction = (action: 'run' | 'stop' | 'delete', nodeId: string) => {
    // Xử lý các hành động cho node
    console.log(action, nodeId);
  };


  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowWrapper.current) return

      const type = event.dataTransfer.getData('application/reactflow')
      
      if (typeof type === 'undefined' || !type) return

      const position = reactFlowWrapper.current.getBoundingClientRect()
      const clientX = event.clientX - position.left
      const clientY = event.clientY - position.top

      const newNode: Node = {
        id: `${nodes.length + 1}`,
        type: 'workflow',
        position: { x: clientX, y: clientY },
        data: { label: '새 노드', type },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [nodes]
  )

  return (
    <Box minH="100vh" bg={bgColor} py={6}>
      <Container maxW="container.xl" py={0}>
        <Stack spacing={6}>
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Stack spacing={1}>
                <Heading size="md" color={headingColor}>
                  워크플로우
                </Heading>
                <Text color={textColor} fontSize="sm">
                  모델 학습 파이프라인을 생성하고 관리하세요
                </Text>
              </Stack>
              <HStack spacing={2}>
                <Button
                  leftIcon={<Icon as={FiPlay} />}
                  bg={accentColor}
                  color="white"
                  _hover={{ bg: 'orange.500' }}
                >
                  실행
                </Button>
                <Button
                  leftIcon={<Icon as={FiSave} />}
                  variant="outline"
                >
                  저장
                </Button>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<Icon as={FiMoreVertical} />}
                    variant="outline"
                  />
                  <MenuList>
                    <MenuItem icon={<Icon as={FiUpload} />}>
                      워크플로우 가져오기
                    </MenuItem>
                    <MenuItem icon={<Icon as={FiDownload} />}>
                      워크플로우 내보내기
                    </MenuItem>
                    <MenuItem icon={<Icon as={FiTrash2} />} color="red.500">
                      워크플로우 삭제
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </Flex>
          </Box>

          <Card bg={cardBg} borderRadius="lg" boxShadow="sm" overflow="hidden">
            <CardBody p={0}>
              <Flex h="800px">
                <WorkflowSidebar />
                <Box flex={1} ref={reactFlowWrapper}>
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    // nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-right"
                  >
                    <Background />
                    <Controls>
                      <Tooltip label="확대" placement="right">
                        <IconButton
                          aria-label="Zoom In"
                          icon={<Icon as={FiZoomIn} />}
                          size="sm"
                          variant="ghost"
                          onClick={() => {}}
                        />
                      </Tooltip>
                      <Tooltip label="축소" placement="right">
                        <IconButton
                          aria-label="Zoom Out"
                          icon={<Icon as={FiZoomOut} />}
                          size="sm"
                          variant="ghost"
                          onClick={() => {}}
                        />
                      </Tooltip>
                      <Tooltip label="화면 맞춤" placement="right">
                        <IconButton
                          aria-label="Fit View"
                          icon={<Icon as={FiMaximize2} />}
                          size="sm"
                          variant="ghost"
                          onClick={() => {}}
                        />
                      </Tooltip>
                    </Controls>
                  </ReactFlow>
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}
