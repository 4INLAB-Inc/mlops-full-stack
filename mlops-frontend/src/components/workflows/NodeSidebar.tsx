import React, { useState, useMemo } from 'react'
import {
  Box,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Button,
  useColorModeValue,
  Tooltip,
  Tag,
  HStack,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Textarea,
  Heading,
  IconButton,
  Flex
} from '@chakra-ui/react'
import { FiSearch, FiPlus, FiDatabase, FiLayers, FiGitBranch, FiCpu, FiBarChart2, FiActivity, FiCloud, FiCheckCircle, FiPieChart, FiGitCommit, FiX } from 'react-icons/fi'
import { Node } from 'reactflow'

interface NodeTemplate {
  type: string
  label: string
  icon: any
  description: string
  category: string
  parameters?: { [key: string]: any }
  metrics?: { [key: string]: any }
}

interface CustomNode {
  type: string;
  label: string;
  description: string;
  category: string;
  inputs?: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  outputs?: {
    name: string;
    type: string;
    description: string;
  }[];
  parameters?: {
    name: string;
    type: string;
    description: string;
    default?: any;
    required: boolean;
  }[];
}

const defaultNodeTemplates: NodeTemplate[] = [
  // 데이터 관리
  {
    type: 'data_collection',
    label: '데이터 수집',
    icon: FiDatabase,
    description: '다양한 소스에서 데이터를 수집',
    category: 'data',
    parameters: {
      source: 'S3',
      format: 'parquet',
      version: 'latest'
    }
  },
  {
    type: 'data_validation',
    label: '데이터 검증',
    icon: FiDatabase,
    description: '데이터 품질 및 스키마 검증',
    category: 'data',
    parameters: {
      schema_check: true,
      null_check: true
    }
  },
  // 전처리
  {
    type: 'feature_engineering',
    label: '특성 엔지니어링',
    icon: FiLayers,
    description: '데이터 전처리 및 특성 생성',
    category: 'preprocessing',
    parameters: {
      scaling: 'standard',
      encoding: 'label'
    }
  },
  {
    type: 'data_split',
    label: '데이터 분할',
    icon: FiGitBranch,
    description: '학습/검증/테스트 데이터 분할',
    category: 'preprocessing',
    parameters: {
      train_ratio: 0.7,
      val_ratio: 0.15
    }
  },
  // 모델링
  {
    type: 'model_training',
    label: '모델 학습',
    icon: FiCpu,
    description: '머신러닝 모델 학습',
    category: 'modeling',
    parameters: {
      model: 'XGBoost',
      epochs: 100
    }
  },
  {
    type: 'model_evaluation',
    label: '모델 평가',
    icon: FiBarChart2,
    description: '모델 성능 평가',
    category: 'modeling',
    parameters: {
      metrics: ['accuracy', 'f1']
    }
  },
  // 배포
  {
    type: 'model_versioning',
    label: '모델 버전 관리',
    icon: FiCloud,
    description: '모델 버전 관리',
    category: 'deployment',
    parameters: {
      platform: 'Kubernetes',
      replicas: 3
    }
  },
  {
    type: 'model_deployment',
    label: '모델 배포',
    icon: FiCloud,
    description: '모델을 프로덕션 환경에 배포',
    category: 'deployment',
    parameters: {
      platform: 'Kubernetes',
      replicas: 3
    }
  },
  {
    type: 'monitoring',
    label: '모니터링',
    icon: FiActivity,
    description: '배포된 모델의 성능 모니터링',
    category: 'deployment',
    parameters: {
      metrics: ['latency', 'accuracy']
    }
  },
]

interface NodeSidebarProps {
  onDragStart?: (event: React.DragEvent, nodeType: string) => void
  onAddNode: (node: Node) => void
}

const NodeSidebar: React.FC<NodeSidebarProps> = ({ onDragStart = () => {}, onAddNode }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [newNode, setNewNode] = useState<CustomNode>({
    type: '',
    label: '',
    description: '',
    category: 'custom',
    inputs: [],
    outputs: [],
    parameters: []
  })
  const [customNodes, setCustomNodes] = useState<CustomNode[]>([])

  const onOpen = () => setIsOpen(true)
  const onClose = () => {
    setIsOpen(false)
    setNewNode({
      type: '',
      label: '',
      description: '',
      category: 'custom',
      inputs: [],
      outputs: [],
      parameters: []
    })
  }

  const handleCreateCustomNode = () => {
    if (newNode.type && newNode.label) {
      setCustomNodes([...customNodes, newNode])
      onClose()
    }
  }

  const handleAddInput = () => {
    setNewNode({
      ...newNode,
      inputs: [
        ...(newNode.inputs || []),
        { name: '', type: '', description: '', required: false }
      ]
    })
  }

  const handleAddOutput = () => {
    setNewNode({
      ...newNode,
      outputs: [
        ...(newNode.outputs || []),
        { name: '', type: '', description: '' }
      ]
    })
  }

  const handleAddParameter = () => {
    setNewNode({
      ...newNode,
      parameters: [
        ...(newNode.parameters || []),
        { name: '', type: '', description: '', required: false }
      ]
    })
  }

  const handleRemoveInput = (index: number) => {
    setNewNode({
      ...newNode,
      inputs: newNode.inputs?.filter((_, i) => i !== index)
    })
  }

  const handleRemoveOutput = (index: number) => {
    setNewNode({
      ...newNode,
      outputs: newNode.outputs?.filter((_, i) => i !== index)
    })
  }

  const handleRemoveParameter = (index: number) => {
    setNewNode({
      ...newNode,
      parameters: newNode.parameters?.filter((_, i) => i !== index)
    })
  }

  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const nodeBg = useColorModeValue('gray.100', 'gray.700')

  const allNodes = [...defaultNodeTemplates, ...customNodes]

  const filteredNodes = useMemo(() => {
    if (!searchQuery) return null;
    const query = searchQuery.toLowerCase();
    const results = [];
    
    const nodeTypes = [
      { type: 'data_collection', label: '데이터 수집', category: '데이터 처리', icon: FiDatabase, desc: '데이터 소스에서 데이터를 수집합니다' },
      { type: 'data_validation', label: '데이터 검증', category: '데이터 처리', icon: FiCheckCircle, desc: '데이터 품질을 검증합니다' },
      { type: 'feature_engineering', label: '특성 엔지니어링', category: '데이터 처리', icon: FiLayers, desc: '특성을 생성하고 변환합니다' },
      { type: 'data_split', label: '데이터 분할', category: '데이터 처리', icon: FiGitBranch, desc: '학습/검증/테스트 세트로 분할' },
      { type: 'model_training', label: '모델 학습', category: '모델 관리', icon: FiCpu, desc: '머신러닝 모델을 학습합니다' },
      { type: 'model_evaluation', label: '모델 평가', category: '모델 관리', icon: FiBarChart2, desc: '모델 성능을 평가합니다' },
      { type: 'model_analysis', label: '모델 분석', category: '모델 관리', icon: FiPieChart, desc: '모델의 동작을 분석합니다' },
      { type: 'model_versioning', label: '모델 버전 관리', category: '배포 및 모니터링', icon: FiGitCommit, desc: '모델 버전을 관리합니다' },
      { type: 'model_deployment', label: '모델 배포', category: '배포 및 모니터링', icon: FiCloud, desc: '모델을 서비스에 배포합니다' },
      { type: 'monitoring', label: '모니터링', category: '배포 및 모니터링', icon: FiActivity, desc: '모델 성능을 모니터링합니다' },
    ];

    nodeTypes.forEach(node => {
      if (
        node.label.toLowerCase().includes(query) ||
        node.desc.toLowerCase().includes(query) ||
        node.category.toLowerCase().includes(query)
      ) {
        results.push(node);
      }
    });

    return results;
  }, [searchQuery]);

  return (
    <VStack
      w="300px"
      h="full"
      bg={bg}
      borderRight="1px"
      borderColor={borderColor}
      spacing={0}
      align="stretch"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#EB6100',
          borderRadius: '24px',
        },
      }}
    >
      <Box 
        py={3}
        px={4}
        borderBottom="1px" 
        borderColor={borderColor} 
        bg={bg}
        position="sticky"
        top={0}
        zIndex={1}
      >
        <VStack spacing={4}>
          <Flex w="full" justify="space-between" align="center">
            <HStack spacing={3}>
              <Text fontSize="sm" color="gray.500" fontWeight="normal">드래그하여 노드를 추가하세요</Text>
            </HStack>
            <Button
              size="sm"
              bg="#EB6100"
              color="white"
              leftIcon={<Icon as={FiPlus} boxSize={4} />}
              onClick={onOpen}
              _hover={{ bg: '#FF7B2C' }}
              h="32px"
              minW="auto"
              px={3}
            >
              커스텀
            </Button>
          </Flex>
          
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="노드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg={bg}
              borderColor="gray.200"
              _hover={{ borderColor: '#EB6100' }}
              _focus={{ borderColor: '#EB6100', boxShadow: '0 0 0 1px #EB6100' }}
              fontSize="sm"
            />
            {searchQuery && (
              <InputRightElement>
                <IconButton
                  size="xs"
                  variant="ghost"
                  icon={<Icon as={FiX} />}
                  aria-label="Clear search"
                  onClick={() => setSearchQuery('')}
                />
              </InputRightElement>
            )}
          </InputGroup>
        </VStack>
      </Box>

      <Box 
        overflow="auto" 
        flex={1}
        bg={bg}
        _dark={{ bg: 'gray.800' }}
        p={4}
      >
        {searchQuery ? (
          <VStack spacing={2}>
            {filteredNodes?.map((node) => (
              <Box
                key={node.type}
                p={3}
                bg={nodeBg}
                _dark={{ bg: 'gray.700' }}
                borderRadius="md"
                cursor="grab"
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'sm',
                  borderColor: '#EB6100',
                  _dark: {
                    borderColor: '#EB6100',
                    bg: 'gray.600'
                  }
                }}
                border="1px dashed"
                borderColor="gray.200"
                _dark={{ borderColor: 'gray.600' }}
                w="full"
              >
                <HStack spacing={3}>
                  <Icon as={node.icon} color="#EB6100" boxSize={5} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium" _dark={{ color: 'white' }}>{node.label}</Text>
                    <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>{node.desc}</Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
            {filteredNodes?.length === 0 && (
              <Text color="gray.500" py={4} fontSize="sm">검색 결과가 없습니다.</Text>
            )}
          </VStack>
        ) : (
          <Accordion 
            allowMultiple 
            defaultIndex={[0, 1, 2]} 
            width="100%"
          >
            <AccordionItem border="none" mb={3}>
              <AccordionButton
                py={2}
                px={3}
                mx={-3}
                _hover={{ bg: 'orange.50' }}
                borderRadius="md"
                bg={bg}
              >
                <HStack flex={1} spacing={3}>
                  <Icon as={FiDatabase} color="#EB6100" boxSize={4} />
                  <Text fontSize="sm" fontWeight="medium">데이터 처리</Text>
                </HStack>
                <AccordionIcon color="#EB6100" />
              </AccordionButton>
              <AccordionPanel pt={2} px={0}>
                <VStack align="stretch" spacing={2}>
                  <Box
                    p={3}
                    bg={nodeBg}
                    _dark={{ bg: 'gray.700' }}
                    borderRadius="md"
                    cursor="grab"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'data_collection')}
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'sm',
                      borderColor: '#EB6100',
                      _dark: {
                        borderColor: '#EB6100',
                        bg: 'gray.600'
                      }
                    }}
                    border="1px dashed"
                    borderColor="gray.200"
                    _dark={{ borderColor: 'gray.600' }}
                    w="full"
                  >
                    <HStack spacing={3}>
                      <Icon as={FiDatabase} color="#EB6100" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" _dark={{ color: 'white' }}>데이터 수집</Text>
                        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>데이터 소스에서 데이터를 수집합니다</Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box
                    p={3}
                    bg={nodeBg}
                    _dark={{ bg: 'gray.700' }}
                    borderRadius="md"
                    cursor="grab"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'data_validation')}
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'sm',
                      borderColor: '#EB6100',
                      _dark: {
                        borderColor: '#EB6100',
                        bg: 'gray.600'
                      }
                    }}
                    border="1px dashed"
                    borderColor="gray.200"
                    _dark={{ borderColor: 'gray.600' }}
                    w="full"
                  >
                    <HStack spacing={3}>
                      <Icon as={FiCheckCircle} color="#EB6100" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" _dark={{ color: 'white' }}>데이터 검증</Text>
                        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>데이터 품질을 검증합니다</Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box
                    p={3}
                    bg={nodeBg}
                    _dark={{ bg: 'gray.700' }}
                    borderRadius="md"
                    cursor="grab"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'feature_engineering')}
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'sm',
                      borderColor: '#EB6100',
                      _dark: {
                        borderColor: '#EB6100',
                        bg: 'gray.600'
                      }
                    }}
                    border="1px dashed"
                    borderColor="gray.200"
                    _dark={{ borderColor: 'gray.600' }}
                    w="full"
                  >
                    <HStack spacing={3}>
                      <Icon as={FiLayers} color="#EB6100" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" _dark={{ color: 'white' }}>특성 엔지니어링</Text>
                        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>특성을 생성하고 변환합니다</Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box
                    p={3}
                    bg={nodeBg}
                    _dark={{ bg: 'gray.700' }}
                    borderRadius="md"
                    cursor="grab"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'data_split')}
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'sm',
                      borderColor: '#EB6100',
                      _dark: {
                        borderColor: '#EB6100',
                        bg: 'gray.600'
                      }
                    }}
                    border="1px dashed"
                    borderColor="gray.200"
                    _dark={{ borderColor: 'gray.600' }}
                    w="full"
                  >
                    <HStack spacing={3}>
                      <Icon as={FiGitBranch} color="#EB6100" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" _dark={{ color: 'white' }}>데이터 분할</Text>
                        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>학습/검증/테스트 세트로 분할</Text>
                      </VStack>
                    </HStack>
                  </Box>
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem border="none" mb={3}>
              <AccordionButton
                py={2}
                px={3}
                mx={-3}
                _hover={{ bg: 'orange.50' }}
                borderRadius="md"
                bg={bg}
              >
                <HStack flex={1} spacing={3}>
                  <Icon as={FiCpu} color="#EB6100" boxSize={4} />
                  <Text fontSize="sm" fontWeight="medium">모델 관리</Text>
                </HStack>
                <AccordionIcon color="#EB6100" />
              </AccordionButton>
              <AccordionPanel pt={2} px={0}>
                <VStack align="stretch" spacing={2}>
                  <Box
                    p={3}
                    bg={nodeBg}
                    _dark={{ bg: 'gray.700' }}
                    borderRadius="md"
                    cursor="grab"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'model_training')}
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'sm',
                      borderColor: '#EB6100',
                      _dark: {
                        borderColor: '#EB6100',
                        bg: 'gray.600'
                      }
                    }}
                    border="1px dashed"
                    borderColor="gray.200"
                    _dark={{ borderColor: 'gray.600' }}
                    w="full"
                  >
                    <HStack spacing={3}>
                      <Icon as={FiCpu} color="#EB6100" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" _dark={{ color: 'white' }}>모델 학습</Text>
                        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>머신러닝 모델을 학습합니다</Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box
                    p={3}
                    bg={nodeBg}
                    _dark={{ bg: 'gray.700' }}
                    borderRadius="md"
                    cursor="grab"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'model_evaluation')}
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'sm',
                      borderColor: '#EB6100',
                      _dark: {
                        borderColor: '#EB6100',
                        bg: 'gray.600'
                      }
                    }}
                    border="1px dashed"
                    borderColor="gray.200"
                    _dark={{ borderColor: 'gray.600' }}
                    w="full"
                  >
                    <HStack spacing={3}>
                      <Icon as={FiBarChart2} color="#EB6100" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" _dark={{ color: 'white' }}>모델 평가</Text>
                        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>모델 성능을 평가합니다</Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box
                    p={3}
                    bg={nodeBg}
                    _dark={{ bg: 'gray.700' }}
                    borderRadius="md"
                    cursor="grab"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'model_analysis')}
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'sm',
                      borderColor: '#EB6100',
                      _dark: {
                        borderColor: '#EB6100',
                        bg: 'gray.600'
                      }
                    }}
                    border="1px dashed"
                    borderColor="gray.200"
                    _dark={{ borderColor: 'gray.600' }}
                    w="full"
                  >
                    <HStack spacing={3}>
                      <Icon as={FiPieChart} color="#EB6100" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" _dark={{ color: 'white' }}>모델 분석</Text>
                        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>모델의 동작을 분석합니다</Text>
                      </VStack>
                    </HStack>
                  </Box>
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem border="none">
              <AccordionButton
                py={2}
                px={3}
                mx={-3}
                _hover={{ bg: 'orange.50' }}
                borderRadius="md"
                bg={bg}
              >
                <HStack flex={1} spacing={3}>
                  <Icon as={FiCloud} color="#EB6100" boxSize={4} />
                  <Text fontSize="sm" fontWeight="medium">배포 및 모니터링</Text>
                </HStack>
                <AccordionIcon color="#EB6100" />
              </AccordionButton>
              <AccordionPanel pt={2} px={0}>
                <VStack align="stretch" spacing={2}>
                  <Box
                    p={3}
                    bg={nodeBg}
                    _dark={{ bg: 'gray.700' }}
                    borderRadius="md"
                    cursor="grab"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'model_versioning')}
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'sm',
                      borderColor: '#EB6100',
                      _dark: {
                        borderColor: '#EB6100',
                        bg: 'gray.600'
                      }
                    }}
                    border="1px dashed"
                    borderColor="gray.200"
                    _dark={{ borderColor: 'gray.600' }}
                    w="full"
                  >
                    <HStack spacing={3}>
                      <Icon as={FiGitCommit} color="#EB6100" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" _dark={{ color: 'white' }}>모델 버전 관리</Text>
                        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>모델 버전을 관리합니다</Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box
                    p={3}
                    bg={nodeBg}
                    _dark={{ bg: 'gray.700' }}
                    borderRadius="md"
                    cursor="grab"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'model_deployment')}
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'sm',
                      borderColor: '#EB6100',
                      _dark: {
                        borderColor: '#EB6100',
                        bg: 'gray.600'
                      }
                    }}
                    border="1px dashed"
                    borderColor="gray.200"
                    _dark={{ borderColor: 'gray.600' }}
                    w="full"
                  >
                    <HStack spacing={3}>
                      <Icon as={FiCloud} color="#EB6100" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" _dark={{ color: 'white' }}>모델 배포</Text>
                        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>모델을 서비스에 배포합니다</Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box
                    p={3}
                    bg={nodeBg}
                    _dark={{ bg: 'gray.700' }}
                    borderRadius="md"
                    cursor="grab"
                    draggable
                    onDragStart={(e) => onDragStart(e, 'monitoring')}
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'sm',
                      borderColor: '#EB6100',
                      _dark: {
                        borderColor: '#EB6100',
                        bg: 'gray.600'
                      }
                    }}
                    border="1px dashed"
                    borderColor="gray.200"
                    _dark={{ borderColor: 'gray.600' }}
                    w="full"
                  >
                    <HStack spacing={3}>
                      <Icon as={FiActivity} color="#EB6100" boxSize={5} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" _dark={{ color: 'white' }}>모니터링</Text>
                        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>모델 성능을 모니터링합니다</Text>
                      </VStack>
                    </HStack>
                  </Box>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent _dark={{ bg: 'gray.800', color: 'white' }}>
          <ModalHeader color="#EB6100">커스텀 노드 생성</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>노드 타입</FormLabel>
                <Select
                  placeholder="노드 타입을 선택하세요"
                  value={newNode.type}
                  onChange={(e) => setNewNode({ ...newNode, type: e.target.value })}
                >
                  <option value="data">Data Processing</option>
                  <option value="model">Model Training</option>
                  <option value="eval">Evaluation</option>
                  <option value="deploy">Deployment</option>
                </Select>
                <FormHelperText>노드의 주요 기능에 맞는 타입을 선택하세요</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>노드 이름</FormLabel>
                <Input
                  placeholder="예: text_preprocessing"
                  value={newNode.label}
                  onChange={(e) => setNewNode({ ...newNode, label: e.target.value })}
                />
                <FormHelperText>영문 소문자와 언더스코어만 사용 가능</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>설명</FormLabel>
                <Textarea
                  placeholder="노드의 주요 기능과 사용 방법을 설명하세요"
                  value={newNode.description}
                  onChange={(e) => setNewNode({ ...newNode, description: e.target.value })}
                />
                <FormHelperText>다른 사용자들이 이해하기 쉽도록 자세히 작성해주세요</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>입력</FormLabel>
                <VStack align="stretch" spacing={3}>
                  {newNode.inputs?.map((input, index) => (
                    <Box key={index} mb={2}>
                      <Flex gap={2}>
                        <Input
                          placeholder="입력 이름 (예: input_data)"
                          value={input.name}
                          onChange={(e) => {
                            const newInputs = [...(newNode.inputs || [])]
                            newInputs[index] = { ...input, name: e.target.value }
                            setNewNode({ ...newNode, inputs: newInputs })
                          }}
                          _dark={{ 
                            bg: 'gray.700',
                            borderColor: 'gray.600',
                            _hover: { borderColor: '#EB6100' }
                          }}
                        />
                        <Select
                          value={input.type}
                          onChange={(e) => {
                            const newInputs = [...(newNode.inputs || [])]
                            newInputs[index] = { ...input, type: e.target.value }
                            setNewNode({ ...newNode, inputs: newInputs })
                          }}
                        >
                          <option value="str">문자열</option>
                          <option value="int">정수</option>
                          <option value="float">실수</option>
                          <option value="bool">불리언</option>
                          <option value="list">리스트</option>
                          <option value="dict">딕셔너리</option>
                        </Select>
                        <IconButton
                          aria-label="Remove input"
                          icon={<Icon as={FiX} />}
                          onClick={() => handleRemoveInput(index)}
                          variant="ghost"
                          colorScheme="red"
                        />
                      </Flex>
                    </Box>
                  ))}
                  <Button
                    leftIcon={<Icon as={FiPlus} />}
                    onClick={handleAddInput}
                    variant="ghost"
                    size="sm"
                    _dark={{ color: 'gray.300' }}
                  >
                    입력 추가
                  </Button>
                  <FormHelperText>노드가 처리할 입력 데이터의 형식을 지정하세요</FormHelperText>
                </VStack>
              </FormControl>

              <FormControl>
                <FormLabel>출력</FormLabel>
                <VStack align="stretch" spacing={3}>
                  {newNode.outputs?.map((output, index) => (
                    <Box key={index} mb={2}>
                      <Flex gap={2}>
                        <Input
                          placeholder="출력 이름 (예: processed_data)"
                          value={output.name}
                          onChange={(e) => {
                            const newOutputs = [...(newNode.outputs || [])]
                            newOutputs[index] = { ...output, name: e.target.value }
                            setNewNode({ ...newNode, outputs: newOutputs })
                          }}
                          _dark={{ 
                            bg: 'gray.700',
                            borderColor: 'gray.600',
                            _hover: { borderColor: '#EB6100' }
                          }}
                        />
                        <Select
                          value={output.type}
                          onChange={(e) => {
                            const newOutputs = [...(newNode.outputs || [])]
                            newOutputs[index] = { ...output, type: e.target.value }
                            setNewNode({ ...newNode, outputs: newOutputs })
                          }}
                        >
                          <option value="str">문자열</option>
                          <option value="int">정수</option>
                          <option value="float">실수</option>
                          <option value="bool">불리언</option>
                          <option value="list">리스트</option>
                          <option value="dict">딕셔너리</option>
                        </Select>
                        <IconButton
                          aria-label="Remove output"
                          icon={<Icon as={FiX} />}
                          onClick={() => handleRemoveOutput(index)}
                          variant="ghost"
                          colorScheme="red"
                        />
                      </Flex>
                    </Box>
                  ))}
                  <Button
                    leftIcon={<Icon as={FiPlus} />}
                    onClick={handleAddOutput}
                    variant="ghost"
                    size="sm"
                    _dark={{ color: 'gray.300' }}
                  >
                    출력 추가
                  </Button>
                  <FormHelperText>노드가 생성할 출력 데이터의 형식을 지정하세요</FormHelperText>
                </VStack>
              </FormControl>

              <FormControl>
                <FormLabel>파라미터</FormLabel>
                <VStack align="stretch" spacing={3}>
                  {newNode.parameters?.map((param, index) => (
                    <Box key={index} mb={2}>
                      <Flex gap={2}>
                        <Input
                          placeholder="파라미터 이름 (예: learning_rate)"
                          value={param.name}
                          onChange={(e) => {
                            const newParams = [...(newNode.parameters || [])]
                            newParams[index] = { ...param, name: e.target.value }
                            setNewNode({ ...newNode, parameters: newParams })
                          }}
                          _dark={{ 
                            bg: 'gray.700',
                            borderColor: 'gray.600',
                            _hover: { borderColor: '#EB6100' }
                          }}
                        />
                        <Select
                          value={param.type}
                          onChange={(e) => {
                            const newParams = [...(newNode.parameters || [])]
                            newParams[index] = { ...param, type: e.target.value }
                            setNewNode({ ...newNode, parameters: newParams })
                          }}
                        >
                          <option value="str">문자열</option>
                          <option value="int">정수</option>
                          <option value="float">실수</option>
                          <option value="bool">불리언</option>
                          <option value="list">리스트</option>
                          <option value="dict">딕셔너리</option>
                        </Select>
                        <IconButton
                          aria-label="Remove parameter"
                          icon={<Icon as={FiX} />}
                          onClick={() => handleRemoveParameter(index)}
                          variant="ghost"
                          colorScheme="red"
                        />
                      </Flex>
                    </Box>
                  ))}
                  <Button
                    leftIcon={<Icon as={FiPlus} />}
                    onClick={handleAddParameter}
                    variant="ghost"
                    size="sm"
                    _dark={{ color: 'gray.300' }}
                  >
                    파라미터 추가
                  </Button>
                </VStack>
              </FormControl>

              <Button
                bg="#EB6100"
                color="white"
                width="full"
                onClick={handleCreateCustomNode}
                _hover={{ bg: '#FF7B2C' }}
                isDisabled={!newNode.type || !newNode.label}
              >
                생성
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default NodeSidebar
