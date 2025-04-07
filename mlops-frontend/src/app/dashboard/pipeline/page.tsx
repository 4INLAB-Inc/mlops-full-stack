'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useToast,
  VStack,
  useColorModeValue,
  useDisclosure,
  Code,
} from '@chakra-ui/react'
import {
  FiPlay,
  FiSave,
  FiZoomIn,
  FiZoomOut,
  FiList,
  FiMoreVertical,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiHelpCircle,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiInfo,
  FiMaximize2,
  FiPlusCircle,
  FiLink2,
  FiClock,
  FiGitBranch,
} from 'react-icons/fi'
import 'reactflow/dist/style.css'

// 컴포넌트 import
import WorkflowNode from '../../../components/workflows/WorkflowNode'
import WorkflowSidebar from '../../../components/workflows/WorkflowSidebar'
import NodeSidebar from '../../../components/workflows/NodeSidebar'
import { nodeCategories } from '../../../components/workflows/WorkflowSidebar'

interface NodeData {
  label: string
  type: string
  status: 'idle' | 'queued' | 'running' | 'completed' | 'failed' | 'stopped' | 'paused'
  progress: number
  details?: {
    description?: string
    parameters?: Record<string, any>
    metrics?: Record<string, any>
    connections?: string[]
  }
  version: string
  actions?: {
    onRun?: () => void
    onPause?: () => void
    onDelete?: () => void
  }
  handleNodeAction?: (nodeId: string, action: 'run' | 'stop' | 'delete') => void
  onDelete?: (nodeId: string) => void
  error?: string
}

// const initialNodes: Node[] = [
//   {
//     id: '1',
//     type: 'workflowNode',
//     position: { x: 100, y: 100 },
//     data: {
//       label: '데이터 수집',
//       type: 'data_collection',
//       status: 'idle',
//       progress: 0,
//       parameters: {
//         source: 'Local',
//         format: 'Csv',
//         version: 'latest'
//       },
//       metrics: {
//         '데이터 크기': '2.3GB',
//         '레코드 수': '1.2M'
//       }
//     }
//   },
//   {
//     id: '2',
//     type: 'workflowNode',
//     position: { x: 500, y: 100 },
//     data: {
//       label: '데이터 검증',
//       type: 'data_validation',
//       status: 'idle',
//       progress: 0,
//       parameters: {
//         checks: ['missing_values', 'duplicates', 'data_type'],
//         threshold: 0.8
//       },
//       metrics: {
//         '유효성': '98.5%',
//         '누락률': '0.2%'
//       }
//     }
//   },
//   {
//     id: '3',
//     type: 'workflowNode',
//     position: { x: 900, y: 100 },
//     data: {
//       label: '특성 엔지니어링',
//       type: 'feature_engineering',
//       status: 'idle',
//       progress: 0,
//       parameters: {
//         methods: ['scaling', 'encoding', 'selection'],
//         feature_selection: 'correlation'
//       },
//       metrics: {
//         '선택된 특성': '42개',
//         '처리 시간': '45s'
//       }
//     }
//   },
//   {
//     id: '4',
//     type: 'workflowNode',
//     position: { x: 1300, y: 100 },
//     data: {
//       label: '데이터 분할',
//       type: 'data_split',
//       status: 'idle',
//       progress: 0,
//       parameters: {
//         train: 0.7,
//         validation: 0.15,
//         test: 0.15,
//         random_state: 42
//       }
//     }
//   },
//   {
//     id: '5',
//     type: 'workflowNode',
//     position: { x: 1700, y: 100 },
//     data: {
//       label: '모델 학습',
//       type: 'model_training',
//       status: 'idle',
//       progress: 0,
//       parameters: {
//         model: 'xgboost',
//         epochs: 100,
//         batch_size: 32,
//         learning_rate: 0.001
//       },
//       metrics: {
//         'Train Loss': '0.234',
//         'Val Loss': '0.245',
//         'Train Acc': '0.892',
//         'Val Acc': '0.885'
//       }
//     }
//   },
//   {
//     id: '6',
//     type: 'workflowNode',
//     position: { x: 2100, y: 100 },
//     data: {
//       label: '모델 평가',
//       type: 'model_evaluation',
//       status: 'idle',
//       progress: 0,
//       parameters: {
//         metrics: ['accuracy', 'precision', 'recall', 'f1'],
//         cross_validation: 5
//       },
//       metrics: {
//         'Test Acc': '0.883',
//         'F1 Score': '0.875',
//         'AUC': '0.912'
//       }
//     }
//   },
//   {
//     id: '7',
//     type: 'workflowNode',
//     position: { x: 2500, y: 100 },
//     data: {
//       label: '모델 분석',
//       type: 'model_analysis',
//       status: 'idle',
//       progress: 0,
//       parameters: {
//         analysis_type: ['feature_importance', 'shap_values'],
//         visualization: true
//       },
//       metrics: {
//         'Top Feature': 'age',
//         'Impact Score': '0.324'
//       }
//     }
//   },
//   {
//     id: '8',
//     type: 'workflowNode',
//     position: { x: 2900, y: 100 },
//     data: {
//       label: '모델 버전 관리',
//       type: 'model_versioning',
//       status: 'idle',
//       progress: 0,
//       parameters: {
//         storage: 'mlflow',
//         tags: ['production', 'latest']
//       }
//     }
//   },
//   {
//     id: '9',
//     type: 'workflowNode',
//     position: { x: 3300, y: 100 },
//     data: {
//       label: '모델 배포',
//       type: 'model_deployment',
//       status: 'idle',
//       progress: 0,
//       parameters: {
//         target: 'production',
//         version: '1.0',
//         platform: 'kubernetes'
//       },
//       metrics: {
//         '응답 시간': '120ms',
//         'TPS': '1000'
//       }
//     }
//   },
//   {
//     id: '10',
//     type: 'workflowNode',
//     position: { x: 3700, y: 100 },
//     data: {
//       label: '모니터링',
//       type: 'monitoring',
//       status: 'idle',
//       progress: 0,
//       parameters: {
//         metrics: ['performance', 'drift'],
//         interval: '1h'
//       },
//       metrics: {
//         '정확도 드리프트': '0.015',
//         '평균 지연 시간': '85ms'
//       }
//     }
//   }
// ];
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'workflowNode',
    position: { x: 100, y: 100 },
    data: {
      label: 'Data Collection',
      type: 'data_collection',
      status: 'idle',
      progress: 0,
      parameters: {
        source: 'Local',
        format: 'Csv',
        version: 'latest'
      },
      metrics: {
        'Data Size': '2.3GB',
        'Record Count': '1.2M'
      }
    }
  },
  {
    id: '2',
    type: 'workflowNode',
    position: { x: 500, y: 100 },
    data: {
      label: 'Data Validation',
      type: 'data_validation',
      status: 'idle',
      progress: 0,
      parameters: {
        checks: ['missing_values', 'duplicates', 'data_type'],
        threshold: 0.8
      },
      metrics: {
        'Validity': '98.5%',
        'Missing Rate': '0.2%'
      }
    }
  },
  {
    id: '3',
    type: 'workflowNode',
    position: { x: 900, y: 100 },
    data: {
      label: 'Feature Engineering',
      type: 'feature_engineering',
      status: 'idle',
      progress: 0,
      parameters: {
        methods: ['scaling', 'encoding', 'selection'],
        feature_selection: 'correlation'
      },
      metrics: {
        'Selected Features': '42',
        'Processing Time': '45s'
      }
    }
  },
  {
    id: '4',
    type: 'workflowNode',
    position: { x: 1300, y: 100 },
    data: {
      label: 'Data Splitting',
      type: 'data_split',
      status: 'idle',
      progress: 0,
      parameters: {
        train: 0.7,
        validation: 0.15,
        test: 0.15,
        random_state: 42
      }
    }
  },
  {
    id: '5',
    type: 'workflowNode',
    position: { x: 1700, y: 100 },
    data: {
      label: 'Model Training',
      type: 'model_training',
      status: 'idle',
      progress: 0,
      parameters: {
        model: 'xgboost',
        epochs: 100,
        batch_size: 32,
        learning_rate: 0.001
      },
      metrics: {
        'Train Loss': '0.234',
        'Val Loss': '0.245',
        'Train Acc': '0.892',
        'Val Acc': '0.885'
      }
    }
  },
  {
    id: '6',
    type: 'workflowNode',
    position: { x: 2100, y: 100 },
    data: {
      label: 'Model Evaluation',
      type: 'model_evaluation',
      status: 'idle',
      progress: 0,
      parameters: {
        metrics: ['accuracy', 'precision', 'recall', 'f1'],
        cross_validation: 5
      },
      metrics: {
        'Test Acc': '0.883',
        'F1 Score': '0.875',
        'AUC': '0.912'
      }
    }
  },
  {
    id: '7',
    type: 'workflowNode',
    position: { x: 2500, y: 100 },
    data: {
      label: 'Model Analysis',
      type: 'model_analysis',
      status: 'idle',
      progress: 0,
      parameters: {
        analysis_type: ['feature_importance', 'shap_values'],
        visualization: true
      },
      metrics: {
        'Top Feature': 'age',
        'Impact Score': '0.324'
      }
    }
  },
  {
    id: '8',
    type: 'workflowNode',
    position: { x: 2900, y: 100 },
    data: {
      label: 'Model Versioning',
      type: 'model_versioning',
      status: 'idle',
      progress: 0,
      parameters: {
        storage: 'mlflow',
        tags: ['production', 'latest']
      }
    }
  },
  {
    id: '9',
    type: 'workflowNode',
    position: { x: 3300, y: 100 },
    data: {
      label: 'Model Deployment',
      type: 'model_deployment',
      status: 'idle',
      progress: 0,
      parameters: {
        target: 'production',
        version: '1.0',
        platform: 'kubernetes'
      },
      metrics: {
        'Response Time': '120ms',
        'TPS': '1000'
      }
    }
  },
  {
    id: '10',
    type: 'workflowNode',
    position: { x: 3700, y: 100 },
    data: {
      label: 'Monitoring',
      type: 'monitoring',
      status: 'idle',
      progress: 0,
      parameters: {
        metrics: ['performance', 'drift'],
        interval: '1h'
      },
      metrics: {
        'Accuracy Drift': '0.015',
        'Average Latency': '85ms'
      }
    }
  }
];


const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    type: 'bezier',
    animated: true,
    style: { 
      stroke: '#ED8936', 
      strokeWidth: 2,
      opacity: 0.8
    }
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3', 
    type: 'bezier',
    animated: true,
    style: { 
      stroke: '#ED8936', 
      strokeWidth: 2,
      opacity: 0.8
    }
  },
  { 
    id: 'e3-4', 
    source: '3', 
    target: '4', 
    type: 'bezier',
    animated: true,
    style: { 
      stroke: '#ED8936', 
      strokeWidth: 2,
      opacity: 0.8
    }
  },
  { 
    id: 'e4-5', 
    source: '4', 
    target: '5', 
    type: 'bezier',
    animated: true,
    style: { 
      stroke: '#ED8936', 
      strokeWidth: 2,
      opacity: 0.8
    }
  },
  { 
    id: 'e5-6', 
    source: '5', 
    target: '6', 
    type: 'bezier',
    animated: true,
    style: { 
      stroke: '#ED8936', 
      strokeWidth: 2,
      opacity: 0.8
    }
  },
  { 
    id: 'e6-7', 
    source: '6', 
    target: '7', 
    type: 'bezier',
    animated: true,
    style: { 
      stroke: '#ED8936', 
      strokeWidth: 2,
      opacity: 0.8
    }
  },
  { 
    id: 'e7-8', 
    source: '7', 
    target: '8', 
    type: 'bezier',
    animated: true,
    style: { 
      stroke: '#ED8936', 
      strokeWidth: 2,
      opacity: 0.8
    }
  },
  { 
    id: 'e8-9', 
    source: '8', 
    target: '9', 
    type: 'bezier',
    animated: true,
    style: { 
      stroke: '#ED8936', 
      strokeWidth: 2,
      opacity: 0.8
    }
  },
  { 
    id: 'e9-10', 
    source: '9', 
    target: '10', 
    type: 'bezier',
    animated: true,
    style: { 
      stroke: '#ED8936', 
      strokeWidth: 2,
      opacity: 0.8
    }
  }
];

interface LogEntry {
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
}

import axios from 'axios';

// export const edgeTypes = {
//   bezier: ({ id, sourceX, sourceY, targetX, targetY, style }: EdgeProps) => (
//     <path
//       id={id}
//       d={`M ${sourceX},${sourceY} C ${sourceX + 100},${sourceY} ${targetX - 100},${targetY} ${targetX},${targetY}`}
//       fill="none"
//       stroke={style?.stroke || '#ED8936'}
//       strokeWidth={style?.strokeWidth || 2}
//       opacity={style?.opacity || 0.8}
//     />
//   ),
// };

function PipelineContent() {
  // 노드 타입 정의
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes.map(node => ({
    ...node,
    type: 'workflowNode'
  })))
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [version, setVersion] = useState('1.0.0')
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'error'>('idle')
  const [runningNodeIds, setRunningNodeIds] = useState<string[]>([])
  const [pausedNodeIds, setPausedNodeIds] = useState<string[]>([])
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const executionRef = useRef<{
    currentIndex: number;
    executionOrder: string[];
    intervalIds: { [key: string]: NodeJS.Timeout };
  }>({
    currentIndex: 0,
    executionOrder: [],
    intervalIds: {},
  })

  const { fitView } = useReactFlow()
  const toast = useToast()

  // 🌟 페이지 로드 시 API에서 파이프라인을 불러오기
  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const nodesRes = await axios.get(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/workflows`);
        const edgesRes = await axios.get(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/workflows/connections`);


        setNodes(nodesRes.data);
        setEdges(edgesRes.data);
      } catch (error) {
        toast({
          title: '파이프라인 불러오기 오류',
          description: '서버에서 데이터를 불러올 수 없습니다.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

      fetchPipeline();
    }, [setNodes, setEdges, toast]);

    // 🌟 사용자 "저장" 클릭 시 처리
  const handleSavePipeline = async () => {
    try {
      // **1. 모든 노드와 엣지 삭제**
      await axios.delete(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/workflows/delete_edge`);
      
      await axios.delete(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/workflows/delete_node`);

      // **2. 새로운 노드 추가**
      for (const node of nodes) {
        await axios.post(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/workflows/add_node`, {
          type: node.type,
          position: node.position,
          data: {
            label: node.data.label,
            type: node.data.type,
            status: node.data.status,
            progress: node.data.progress,
            parameters: node.data.parameters,
            metrics: node.data.metrics,
          },
        });
      }

      // **3. 새로운 엣지 추가** - Thêm opacity vào style của edge
      for (const edge of edges) {
        await axios.post(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/workflows/add_edge`, {
          source: edge.source,
          target: edge.target,
          edge_type: edge.type,
          animated: edge.animated,
          style: {
            ...edge.style,
            opacity: edge.style.opacity || 0.8,  // Thêm opacity nếu chưa có
          },
        });
      }

        toast({
          title: '파이프라인 저장 성공',
          description: '파이프라인이 데이터베이스에 업데이트되었습니다.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // toast({
        //   title: 'Pipeline Save Successful',
        //   description: 'The pipeline has been updated in the database.',
        //   status: 'success',
        //   duration: 3000,
        //   isClosable: true,
        // });
        

        } catch (error) {
          console.error('파이프라인 저장 오류:', error);
          toast({
            title: '파이프라인 저장 오류',
            description: '서버에서 데이터를 업데이트할 수 없습니다.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
    };

  // 노드 삭제 핸들러
  const handleNodeDelete = useCallback((nodeId: string) => {
    // 실행 중인 노드는 삭제 불가
    if (runningNodeIds.includes(nodeId)) {
      toast({
        title: '삭제 불가',
        description: '실행 중인 노드는 삭제할 수 없습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // 노드 삭제
    setNodes(nds => nds.filter(node => node.id !== nodeId))
    
    // 연결된 엣지들도 함께 삭제
    setEdges(eds => 
      eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
    )

    // 로그 추가
    setLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `노드 ${nodeId}가 삭제되었습니다.`
    }])

    toast({
      title: '노드 삭제',
      description: '노드가 성공적으로 삭제되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    // toast({
    //   title: 'Node Deletion',
    //   description: 'The node has been successfully deleted.',
    //   status: 'success',
    //   duration: 3000,
    //   isClosable: true,
    // })

  }, [runningNodeIds, setNodes, setEdges, setLogs, toast])

  // 노드 실행 순서 결정 함수
  const determineExecutionOrder = useCallback(() => {
    const visited = new Set<string>()
    const order: string[] = []

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)

      // 현재 노드의 모든 입력 엣지 찾기
      const inputEdges = edges.filter(edge => edge.target === nodeId)
      
      // 모든 소스 노드를 먼저 방문
      for (const edge of inputEdges) {
        visit(edge.source)
      }

      order.push(nodeId)
    }

    // 모든 노드에 대해 DFS 실행
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        visit(node.id)
      }
    })

    return order
  }, [nodes, edges])

  // 노드 타입 정의
  const nodeTypes = useMemo(() => ({
    workflowNode: (props) => (
      <WorkflowNode 
        {...props} 
        onNodeAction={(action, nodeId) => {
          switch (action) {
            case 'run':
              // 특정 노드 실행 로직
              console.log(`노드 ${nodeId} 실행`)
              
              // 노드 상태 업데이트
              setNodes((nds) => 
                nds.map((node) => 
                  node.id === nodeId 
                    ? { 
                        ...node, 
                        data: { 
                          ...node.data, 
                          status: 'running',
                          progress: 0 
                        } 
                      } 
                    : node
                )
              )
              setRunningNodeIds(prev => [...prev, nodeId])
              break
            
            case 'stop':
              // 특정 노드 중지 로직
              console.log(`노드 ${nodeId} 중지`)
              
              // 노드 상태 업데이트
              setNodes((nds) => 
                nds.map((node) => 
                  node.id === nodeId 
                    ? { 
                        ...node, 
                        data: { 
                          ...node.data, 
                          status: 'stopped',
                          progress: 0 
                        } 
                      } 
                    : node
                )
              )
              setRunningNodeIds(prev => prev.filter(id => id !== nodeId))
              
              // 토스트 알림
              toast({
                title: '노드 실행 중지',
                description: `노드가 중지되었습니다.`,
                status: 'warning',
                duration: 2000,
                isClosable: true,
              })
              break
            
            case 'delete':
              handleNodeDelete(nodeId)
              break
          }
        }}
      />
    )
  }), [handleNodeDelete, setNodes, setRunningNodeIds])

  // 노드 실행 함수
  const executeNode = useCallback((nodeId: string) => {
    console.log('executeNode called with nodeId:', nodeId)
    
    if (!nodeId) {
      console.error('No nodeId provided')
      return
    }

    try {
      // 노드 존재 여부 확인
      const node = nodes.find(n => n.id === nodeId)
      if (!node) {
        throw new Error(`Node ${nodeId} not found`)
      }

      // 이전 노드들의 실행 상태 확인
      const previousNodes = edges
        .filter(edge => edge.target === nodeId)
        .map(edge => nodes.find(n => n.id === edge.source))
        .filter(Boolean)

      const hasFailedDependencies = previousNodes.some(node => node.data.status === 'failed')
      if (hasFailedDependencies) {
        throw new Error('이전 노드 중 실패한 노드가 있습니다')
      }

      // 노드가 일시 정지 상태인 경우 체크
      if (node.data.status === 'paused') {
        console.log(`Node ${nodeId} is paused, skipping execution`)
        return
      }

      // 노드 상태 업데이트
      setNodes(nds => 
        nds.map(node => {
          if (node.id === nodeId) {
            console.log(`Setting node ${nodeId} to running state`)
            return {
              ...node,
              data: {
                ...node.data,
                status: 'running',
                progress: 0,
                error: null,
                startTime: Date.now()
              }
            }
          }
          return node
        })
      )

      // 실행 중인 노드 목록에 추가
      setRunningNodeIds(prev => {
        const newIds = [...prev, nodeId]
        console.log('Updated running node ids:', newIds)
        return newIds
      })

      // 노드 실행 시작 로그
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `노드 ${nodeId} (${node.data.label}) 실행이 시작되었습니다.`
      }])

      // 진행 상황 업데이트를 위한 인터벌 설정
      const intervalId = setInterval(() => {
        setNodes(nds => {
          const updatedNodes = nds.map(node => {
            if (node.id === nodeId) {
              const currentProgress = node.data.progress || 0
              const newProgress = Math.min(currentProgress + 10, 100)
              
              // 실행 시간 체크 (5분 이상 실행 시 타임아웃)
              const executionTime = Date.now() - node.data.startTime
              if (executionTime > 5 * 60 * 1000) {
                clearInterval(executionRef.current.intervalIds[nodeId])
                delete executionRef.current.intervalIds[nodeId]
                
                setRunningNodeIds(prev => prev.filter(id => id !== nodeId))
                setPipelineStatus('error')
                
                setLogs(prev => [...prev, {
                  timestamp: new Date().toISOString(),
                  level: 'error',
                  message: `노드 ${nodeId} 실행이 시간 초과되었습니다.`
                }])
                
                return {
                  ...node,
                  data: {
                    ...node.data,
                    status: 'failed',
                    error: '실행 시간이 초과되었습니다.'
                  }
                }
              }

              // 노드 실행 완료
              if (newProgress === 100) {
                clearInterval(executionRef.current.intervalIds[nodeId])
                delete executionRef.current.intervalIds[nodeId]
                
                setRunningNodeIds(prev => prev.filter(id => id !== nodeId))
                
                // 다음 노드 실행 전에 현재 노드의 출력 유효성 검사
                try {
                  validateNodeOutput(node)
                  
                  // 다음 노드 실행
                  const nextIndex = executionRef.current.currentIndex + 1
                  if (nextIndex < executionRef.current.executionOrder.length) {
                    executionRef.current.currentIndex = nextIndex
                    const nextNodeId = executionRef.current.executionOrder[nextIndex]
                    setTimeout(() => {
                      executeNode(nextNodeId)
                    }, 500)
                  } else {
                    // 파이프라인 실행 완료
                    console.log('Pipeline execution completed')
                    setPipelineStatus('completed')
                    
                    // // 로그에 기록
                    setLogs(prev => [...prev, {
                      timestamp: new Date().toISOString(),
                      level: 'info',
                      message: '파이프라인 실행이 완료되었습니다.'
                    }])
                    
                    // 전체 파이프라인이 완료되었을 때만 토스트 메시지 표시
                    toast({
                      title: '파이프라인 실행 완료',
                      description: '모든 노드가 성공적으로 실행되었습니다.',
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    })
          

                    // // Record in the log
                    // setLogs(prev => [...prev, {
                    //   timestamp: new Date().toISOString(),
                    //   level: 'info',
                    //   message: 'Pipeline execution is complete.'
                    // }]);

                    // // Show toast message only when the entire pipeline is completed
                    // toast({
                    //   title: 'Pipeline Execution Complete',
                    //   description: 'All nodes have been successfully executed.',
                    //   status: 'success',
                    //   duration: 3000,
                    //   isClosable: true,
                    // })
                  }
                  
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      status: 'completed',
                      progress: newProgress,
                      completedAt: Date.now()
                    }
                  }
                } catch (error) {
                  console.error(`Node ${nodeId} output validation failed:`, error)
                  setPipelineStatus('error')
                  
                  setLogs(prev => [...prev, {
                    timestamp: new Date().toISOString(),
                    level: 'error',
                    message: `노드 ${nodeId} 출력 검증 실패: ${error.message}`
                  }])
                  
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      status: 'failed',
                      error: error.message
                    }
                  }
                }
              }
              
              return {
                ...node,
                data: {
                  ...node.data,
                  progress: newProgress
                }
              }
            }
            return node
          })
          return updatedNodes
        })
      }, 1000)

      // 인터벌 ID 저장
      executionRef.current.intervalIds[nodeId] = intervalId

    } catch (error) {
      console.error(`Error executing node ${nodeId}:`, error)
      
      // 노드 상태를 실패로 업데이트
      setNodes(nds => 
        nds.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                status: 'failed',
                error: error.message
              }
            }
          }
          return node
        })
      )
      
      // 파이프라인 상태 업데이트
      setPipelineStatus('error')
      
      // 에러 로그 추가
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `노드 ${nodeId} 실행 중 오류 발생: ${error.message}`
      }])
      
      // 파이프라인 실행 실패 시 토스트 메시지
      if (pipelineStatus === 'error') {
        toast({
          title: '파이프라인 실행 실패',
          description: `노드 ${nodeId} 실행 중 오류가 발생했습니다: ${error.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }, [nodes, edges, setNodes, setRunningNodeIds, setPipelineStatus, setLogs, toast, pipelineStatus])

  // 노드 출력 유효성 검사 함수
  const validateNodeOutput = (node: Node) => {
    // 노드 타입별 출력 검증 로직
    switch (node.data.type) {
      case 'data_loader':
        if (!node.data.output?.data) {
          throw new Error('데이터 로더 노드의 출력이 올바르지 않습니다')
        }
        break
      case 'preprocessor':
        if (!node.data.output?.processedData) {
          throw new Error('전처리 노드의 출력이 올바르지 않습니다')
        }
        break
      case 'model_trainer':
        if (!node.data.output?.model) {
          throw new Error('모델 학습 노드의 출력이 올바르지 않습니다')
        }
        break
      // 다른 노드 타입에 대한 검증 로직 추가
    }
  }

  // 파이프라인 실행 시작 함수
  const handleRunPipeline = useCallback(async () => {
    console.log('handleRunPipeline called')
    
    // 이미 실행 중이면 리턴
    if (pipelineStatus === 'running') {
      toast({
        title: '실행 불가',
        description: '이미 파이프라인이 실행 중입니다.',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      })
      return
    }

    // 먼저 파이프라인 구성 저장
    try {
      await handleSavePipeline(); // 파이프라인 구성 저장
      console.log('파이프라인 구성이 성공적으로 저장되었습니다');
    } catch (error) {
      console.error('파이프라인 구성 저장 실패:', error);
      toast({
        title: '파이프라인 저장 실패',
        description: '파이프라인 구성 저장에 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;  // 저장 실패 시 실행 중지
    }

    // 실행 전에 workflows run API 호출
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/workflows/run`);
      console.log('파이프라인 실행 시작 성공');
    } catch (error) {
      console.error('파이프라인 실행 시작 실패:', error);
      toast({
        title: '파이프라인 실행 실패',
        description: '파이프라인을 시작하는데 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // 실행 순서 가져오기
    const order = determineExecutionOrder()
    console.log('Execution order:', order)
    
    if (order.length === 0) {
      toast({
        title: '실행 불가',
        description: '실행할 노드가 없습니다.',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      })
      return
    }

    // 모든 노드 상태 초기화
    setNodes(nds => 
      nds.map(node => ({
        ...node,
        data: {
          ...node.data,
          status: 'idle',
          progress: 0
        }
      }))
    )

    // 실행 상태 초기화
    executionRef.current = {
      currentIndex: 0,
      executionOrder: order,
      intervalIds: {},
    }

    // 실행 중인 노드 목록 초기화
    setRunningNodeIds([])
    setPausedNodeIds([])

    // 파이프라인 상태 업데이트
    setPipelineStatus('running')
    
    // 첫 번째 노드 실행
    console.log('Starting execution with first node:', order[0])
    setTimeout(() => {
      executeNode(order[0])
    }, 0)
  }, [determineExecutionOrder, setNodes, setRunningNodeIds, setPausedNodeIds, setPipelineStatus, executeNode, toast, handleSavePipeline])

  // 파이프라인 중지 함수
  const handleStopPipeline = useCallback(() => {
    // 모든 실행 중인 타이머 정리
    Object.values(executionRef.current.intervalIds).forEach(intervalId => {
      clearInterval(intervalId)
    })
    executionRef.current.intervalIds = {}

    // 실행 중인 모든 노드 상태 초기화
    setNodes(nds => 
      nds.map(node => ({
        ...node,
        data: {
          ...node.data,
          status: 'idle',
          progress: 0
        }
      }))
    )

    // 실행 중인 노드 목록 초기화
    setRunningNodeIds([])
    setPausedNodeIds([])

    // 파이프라인 상태 업데이트
    setPipelineStatus('idle')

    // 실행 컨텍스트 초기화
    executionRef.current = {
      currentIndex: 0,
      executionOrder: [],
      intervalIds: {},
    }

    toast({
      title: '파이프라인 중지',
      description: '파이프라인이 중지되었습니다.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }, [setNodes, toast])

  // 파이프라인 일시 정지 함수
  const handlePausePipeline = useCallback(() => {
    console.log('Pausing pipeline')
    
    // 현재 실행 중인 모든 노드의 상태를 일시 정지로 변경
    setNodes(nds => 
      nds.map(node => {
        if (node.data.status === 'running') {
          return {
            ...node,
            data: {
              ...node.data,
              status: 'paused'
            }
          }
        }
        return node
      })
    )
    
    // 모든 실행 중인 인터벌 정지
    Object.values(executionRef.current.intervalIds).forEach(intervalId => {
      clearInterval(intervalId)
    })
    executionRef.current.intervalIds = {}
    
    // 실행 중인 노드 목록을 일시 정지된 노드 목록으로 이동
    setPausedNodeIds(prev => [...prev, ...runningNodeIds])
    setRunningNodeIds([])
    
    // 파이프라인 상태 업데이트
    setPipelineStatus('paused')
    
    toast({
      title: '파이프라인 일시 정지',
      description: '파이프라인이 일시 정지되었습니다.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }, [nodes, runningNodeIds, setNodes, setPausedNodeIds, setRunningNodeIds, setPipelineStatus, toast])

  // 파이프라인 재개 함수
  const handleResumePipeline = useCallback(() => {
    console.log('Resuming pipeline')
    
    // 일시 정지된 노드들의 실행을 재개
    const pausedNodes = nodes.filter(node => node.data.status === 'paused')
    if (pausedNodes.length > 0) {
      setPipelineStatus('running')
      
      // 첫 번째 일시 정지된 노드부터 실행 재개
      const firstPausedNode = pausedNodes[0]
      executeNode(firstPausedNode.id)
      
      // 일시 정지된 노드 목록 초기화
      setPausedNodeIds([])
      
      toast({
        title: '파이프라인 재개',
        description: '파이프라인 실행이 재개되었습니다.',
        status: 'info',
        duration: 2000,
        isClosable: true,
      })
    }
  }, [nodes, executeNode, setPausedNodeIds, setPipelineStatus, toast])

  // 노드 클릭 핸들러
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // 선택된 노드 업데이트
    setSelectedNode(node)

    // 노드 상세 정보 로깅
    console.log('선택된 노드:', {
      id: node.id,
      label: node.data.label,
      type: node.data.type,
      status: node.data.status,
      details: node.data.details
    })

    // 선택된 노드에 대한 토스트 알림
    toast({
      title: `노드 선택됨: ${node.data.label}`,
      description: `타입: ${node.data.type}, 상태: ${node.data.status}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }, [setSelectedNode, toast])

  // 모달 및 드로어 관리
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure()

  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure()

  const {
    isOpen: isHelpModalOpen,
    onOpen: onHelpModalOpen,
    onClose: onHelpModalClose,
  } = useDisclosure()

  // 테마 색상 변수 복원
  const accentColor = '#EB6100'

  // 파이프라인 도움말 단계 복원
  const pipelineHelpSteps = [
    {
      title: '파이프라인 시작하기',
      description: '머신러닝 프로젝트의 모든 단계를 한눈에 볼 수 있는 직관적인 워크플로우 디자이너입니다. 복잡한 과정을 쉽고 명확하게 만들어 드립니다.',
      tip: '첫 파이프라인을 만들어보세요! 왼쪽 사이드바의 노드들을 자유롭게 드래그해보세요.',
      icon: FiInfo,
      color: '#EB6100'
    },
    {
      title: '노드 추가하기',
      description: '데이터 로딩, 전처리, 학습, 평가, 배포 등 머신러닝의 모든 단계를 시각적으로 구성할 수 있습니다.',
      tip: '노드 위에 마우스를 올려 상세 정보를 확인하고, 드래그로 쉽게 배치하세요.',
      icon: FiPlusCircle,
      color: '#EB6100'
    },
    {
      title: '노드 연결하기',
      description: '각 노드를 연결하여 데이터와 모델의 흐름을 정의합니다. 한 노드의 출력이 다음 노드의 입력으로 자연스럽게 연결됩니다.',
      tip: '노드 사이를 클릭하고 드래그하여 쉽게 연결할 수 있어요.',
      icon: FiLink2,
      color: '#EB6100'
    },
    {
      title: '노드 실행 및 관리',
      description: '각 노드를 개별적으로 또는 전체 파이프라인을 순차적으로 실행할 수 있습니다. 실시간으로 진행 상황과 메트릭을 확인하세요.',
      tip: '노드를 클릭하면 상세 정보와 실행 옵션을 볼 수 있어요.',
      icon: FiPlay,
      color: '#EB6100'
    },
    {
      title: '로그 및 모니터링',
      description: '파이프라인 실행 중 모든 노드의 진행 상황, 메트릭, 로그를 실시간으로 추적합니다. 문제 해결과 성능 분석에 도움을 드립니다.',
      tip: '로그 버튼을 통해 전체 실행 히스토리를 확인하세요.',
      icon: FiList,
      color: '#EB6100'
    }
  ]

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const headingColor = useColorModeValue('gray.800', 'white')

  // 노드 드래그 시작 핸들러
  const onDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  // ReactFlow 초기화 핸들러
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance)
  }, [])

  // 드롭 핸들러
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowWrapper.current || !reactFlowInstance) return

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')

      // 드롭 위치 계산
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      // 노드 타입에 따른 기본 데이터 설정
      const getNodeData = (type: string) => {
        switch (type) {
          case 'data_collection':
            return {
              label: 'Data collection', //데이터 수집
              type: 'data_collection',
              status: 'idle',
              progress: 0,
              parameters: {
                source: 'Local',
                format: 'Csv',
                version: 'latest'
              },
              metrics: {
                '데이터 크기': '2.3GB',
                '레코드 수': '1.2M'
              }
            }
          case 'data_validation':
            return {
              label: 'Data validation', //데이터 검증
              type: 'data_validation',
              status: 'idle',
              progress: 0,
              parameters: {
                checks: ['missing_values', 'duplicates', 'data_type'],
                threshold: 0.8
              },
              metrics: {
                '유효성': '98.5%',
                '누락률': '0.2%'
              }
            }
          case 'feature_engineering':
            return {
              label: 'Feature engineering', //특성 엔지니어링
              type: 'feature_engineering',
              status: 'idle',
              progress: 0,
              parameters: {
                methods: ['scaling', 'encoding', 'selection'],
                feature_selection: 'correlation'
              },
              metrics: {
                '선택된 특성': '42개',
                '처리 시간': '45s'
              }
            }
          case 'data_split':
            return {
              label: 'Data split', //데이터 분할
              type: 'data_split',
              status: 'idle',
              progress: 0,
              parameters: {
                train: 0.7,
                validation: 0.15,
                test: 0.15,
                random_state: 42
              }
            }
          case 'model_training':
            return {
              label: 'Model training', //모델 학습
              type: 'model_training',
              status: 'idle',
              progress: 0,
              parameters: {
                model: 'xgboost',
                epochs: 100,
                batch_size: 32,
                learning_rate: 0.001
              },
              metrics: {
                'Train Loss': '0.234',
                'Val Loss': '0.245',
                'Train Acc': '0.892',
                'Val Acc': '0.885'
              }
            }
          case 'model_evaluation':
            return {
              label: 'Model evaluation', //모델 평가
              type: 'model_evaluation',
              status: 'idle',
              progress: 0,
              parameters: {
                metrics: ['accuracy', 'precision', 'recall', 'f1'],
                cross_validation: 5
              },
              metrics: {
                'Test Acc': '0.883',
                'F1 Score': '0.875',
                'AUC': '0.912'
              }
            }
          case 'model_analysis':
            return {
              label: 'Model analysis', //모델 분석석
              type: 'model_analysis',
              status: 'idle',
              progress: 0,
              parameters: {
                analysis_type: ['feature_importance', 'shap_values'],
                visualization: true
              },
              metrics: {
                'Top Feature': 'age',
                'Impact Score': '0.324'
              }
            }
          case 'model_versioning':
            return {
              label: 'Model versioning', //모델 버전 관리
              type: 'model_versioning',
              status: 'idle',
              progress: 0,
              parameters: {
                storage: 'mlflow',
                tags: ['production', 'latest']
              }
            }
          case 'model_deployment':
            return {
              label: 'Model deployment', //모델 배포
              type: 'model_deployment',
              status: 'idle',
              progress: 0,
              parameters: {
                target: 'production',
                version: '1.0',
                platform: 'kubernetes'
              },
              metrics: {
                '응답 시간': '120ms',
                'TPS': '1000'
              }
            }
          case 'monitoring':
            return {
              label: 'Monitoring', //모니터링
              type: 'monitoring',
              status: 'idle',
              progress: 0,
              parameters: {
                metrics: ['performance', 'drift'],
                interval: '1h'
              },
              metrics: {
                '정확도 드리프트': '0.015',
                '평균 지연 시간': '85ms'
              }
            }
          default:
            return {
              label: '새 노드',
              type: type,
              status: 'idle',
              progress: 0,
              parameters: {}
            }
        }
      }

      const newNode = {
        id: `${nodes.length + 1}`,
        type: 'workflowNode',
        position,
        data: getNodeData(type)
      }

      setNodes((nds) => nds.concat(newNode))

      // 토스트 알림
      toast({
        title: '노드 추가됨',
        description: `${newNode.data.label} 노드가 추가되었습니다.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      // toast({
      //   title: 'Node Added',
      //   description: `${newNode.data.label} node has been added.`,
      //   status: 'success',
      //   duration: 2000,
      //   isClosable: true,
      // })


    },
    [reactFlowInstance, nodes, setNodes, toast]
  )

  // 드래그 오버 핸들러
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // 로그 모달 렌더링
  const LogModal = useMemo(() => (
    <Modal isOpen={isModalOpen} onClose={onModalClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={2}>
            <Icon as={FiList} color={accentColor} />
            <Text>파이프라인 실행 로그</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack 
            spacing={3} 
            align="stretch" 
            maxHeight="500px" 
            overflowY="auto"
          >
            {logs.map((log, index) => (
              <Box 
                key={index} 
                p={3} 
                bg={log.level === 'error' ? 'red.50' : log.level === 'warning' ? 'yellow.50' : 'gray.50'}
                borderRadius="md"
                borderLeftWidth="4px"
                borderLeftColor={
                  log.level === 'error' ? 'red.500' : 
                  log.level === 'warning' ? 'yellow.500' : 
                  'gray.500'
                }
              >
                <HStack spacing={2} mb={1}>
                  <Text 
                    fontSize="xs" 
                    color="gray.500"
                  >
                    {new Date(log.timestamp).toLocaleString()}
                  </Text>
                  <Badge 
                    colorScheme={
                      log.level === 'error' ? 'red' : 
                      log.level === 'warning' ? 'yellow' : 
                      'gray'
                    }
                  >
                    {log.level.toUpperCase()}
                  </Badge>
                </HStack>
                <Text>{log.message}</Text>
              </Box>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button 
            onClick={onModalClose} 
            variant="ghost"
          >
            닫기
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ), [isModalOpen, onModalClose, logs, accentColor])

  // 커스텀 노드 타입 메모이제이션
  const memoizedNodeTypes = useMemo(() => ({
    workflowNode: (props: NodeProps) => (
      <WorkflowNode 
        {...props} 
        onNodeAction={(action) => {
          // 노드 액션 핸들러 (실행, 중지, 삭제 등)
          const nodeId = props.id
          
          switch (action) {
            case 'run':
              // 특정 노드 실행 로직
              console.log(`노드 ${nodeId} 실행`)
              
              // 노드 상태 업데이트
              setNodes(nds =>
                nds.map(node => 
                  node.id === nodeId 
                    ? { 
                        ...node, 
                        data: { 
                          ...node.data, 
                          status: 'running',
                          progress: 0 
                        } 
                      } 
                    : node
                )
              )
              setRunningNodeIds(prev => [...prev, nodeId])
              break
            
            case 'stop':
              // 특정 노드 중지 로직
              console.log(`노드 ${nodeId} 중지`)
              
              // 노드 상태 업데이트
              setNodes(nds =>
                nds.map(node => 
                  node.id === nodeId 
                    ? { 
                        ...node, 
                        data: { 
                          ...node.data, 
                          status: 'stopped',
                          progress: 0 
                        } 
                      } 
                    : node
                )
              )
              setRunningNodeIds(prev => prev.filter(id => id !== nodeId))
              
              // 토스트 알림
              toast({
                title: '노드 실행 중지',
                description: `${props.data.label} 노드가 중지되었습니다.`,
                status: 'warning',
                duration: 2000,
                isClosable: true,
              })
              break
            
            case 'delete':
              // 노드 삭제 로직
              handleNodeDelete(nodeId)
              break
          }
        }}
      />
    )
  }), [setNodes, setRunningNodeIds, toast, handleNodeDelete])

  // 엣지 연결 핸들러
  const onConnect = useCallback((params: Connection) => {
    // 소스와 타겟 노드 찾기
    const sourceNode = nodes.find(node => node.id === params.source)
    const targetNode = nodes.find(node => node.id === params.target)

    if (!sourceNode || !targetNode) return

    // 엣지 추가
    setEdges((eds) => addEdge(params, eds))

    // 연결된 노드 로깅
    console.log('노드 연결:', {
      source: sourceNode.data.label,
      target: targetNode.data.label
    })

    // 토스트 알림
    // toast({
    //   title: '노드 연결됨',
    //   description: `${sourceNode.data.label} → ${targetNode.data.label}`,
    //   status: 'info',
    //   duration: 2000,
    //   isClosable: true,
    // })
    toast({
      title: 'Node Connected',
      description: `${sourceNode.data.label} → ${targetNode.data.label}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });


  }, [nodes, setEdges, toast])

  // 엣지 삭제 핸들러
  const onEdgeDelete = useCallback((edge: Edge) => {
    // 소스와 타겟 노드 찾기
    const sourceNode = nodes.find(node => node.id === edge.source)
    const targetNode = nodes.find(node => node.id === edge.target)

    if (!sourceNode || !targetNode) return

    // 엣지 제거
    setEdges((eds) => eds.filter((e) => e.id !== edge.id))

    // 삭제된 엣지 로깅
    console.log('엣지 삭제:', {
      source: sourceNode.data.label,
      target: targetNode.data.label
    })

    // 토스트 알림
    toast({
      title: '엣지 삭제됨',
      description: `${sourceNode.data.label} → ${targetNode.data.label} 연결이 제거되었습니다.`,
      status: 'warning',
      duration: 2000,
      isClosable: true,
    })
  }, [nodes, setEdges, toast])

  // 파이프라인 내보내기 핸들러
  const handleExportPipeline = useCallback(() => {
    try {
      const pipelineData = {
        nodes,
        edges,
        version,
        exportedAt: new Date().toISOString()
      };

      // JSON 파일로 내보내기
      const blob = new Blob([JSON.stringify(pipelineData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pipeline-${version}-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: '파이프라인 내보내기 성공',
        description: '파이프라인이 JSON 파일로 저장되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // toast({
      //   title: 'Pipeline Export Successful',
      //   description: 'The pipeline has been saved as a JSON file.',
      //   status: 'success',
      //   duration: 3000,
      //   isClosable: true,
      // });


    } catch (error) {
      console.error('파이프라인 내보내기 실패:', error);
      toast({
        title: '파이프라인 내보내기 실패',
        description: '파이프라인을 내보내는 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
    }
  }, [nodes, edges, version, toast]);

  // 파이프라인 가져오기 핸들러
  const handleImportPipeline = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      try {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const pipelineData = JSON.parse(event.target?.result as string);
            
            // 데이터 유효성 검사
            if (!pipelineData.nodes || !pipelineData.edges) {
              throw new Error('유효하지 않은 파이프라인 파일입니다.');
            }

            // 노드와 엣지 복원
            setNodes(pipelineData.nodes.map((node: Node) => ({
              ...node,
              type: 'workflowNode'
            })));
            setEdges(pipelineData.edges);
            
            // 버전 정보 복원
            if (pipelineData.version) {
              setVersion(pipelineData.version);
            }

            toast({
              title: '파이프라인 가져오기 성공',
              description: '파이프라인이 성공적으로 복원되었습니다.',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });

            // toast({
            //   title: 'Pipeline Retrieval Successful',
            //   description: 'The pipeline has been successfully restored.',
            //   status: 'success',
            //   duration: 3000,
            //   isClosable: true,
            // });


          } catch (error) {
            console.error('파이프라인 파일 파싱 실패:', error);
            toast({
              title: '파이프라인 가져오기 실패',
              description: '파일 형식이 올바르지 않습니다.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          }
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('파이프라인 가져오기 실패:', error);
        toast({
          title: '파이프라인 가져오기 실패',
          description: '파일을 읽는 중 오류가 발생했습니다.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    input.click();
  }, [setNodes, setEdges, setVersion, toast]);

  // 체크포인트 생성 핸들러
  const handleCreateCheckpoint = useCallback(() => {
    try {
      const checkpointData = {
        nodes,
        edges,
        version,
        createdAt: new Date().toISOString()
      };

      // 로컬 스토리지에 체크포인트 저장
      const checkpoints = JSON.parse(localStorage.getItem('pipelineCheckpoints') || '[]');
      checkpoints.push(checkpointData);
      
      // 최대 10개의 체크포인트만 유지
      if (checkpoints.length > 10) {
        checkpoints.shift();
      }
      
      localStorage.setItem('pipelineCheckpoints', JSON.stringify(checkpoints));

      toast({
        title: '체크포인트 생성 완료',
        description: `현재 상태가 체크포인트로 저장되었습니다. (버전: ${version})`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // 로그에 체크포인트 생성 기록
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `체크포인트가 생성되었습니다. (버전: ${version})`
      }]);
    } catch (error) {
      console.error('체크포인트 생성 실패:', error);
      toast({
        title: '체크포인트 생성 실패',
        description: '체크포인트를 생성하는 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [nodes, edges, version, setLogs, toast]);

  // 파이프라인 삭제 핸들러
  const handleDeletePipeline = useCallback(() => {
    const confirmDelete = window.confirm('정말로 현재 파이프라인을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    
    if (confirmDelete) {
      try {
        // 현재 상태를 체크포인트로 자동 저장 (실수 방지)
        handleCreateCheckpoint();

        // 모든 노드와 엣지 초기화
        setNodes([]);
        setEdges([]);
        
        // 버전 초기화
        setVersion('1.0.0');
        
        // 실행 상태 초기화
        setPipelineStatus('idle');
        setRunningNodeIds([]);
        setPausedNodeIds([]);
        
        // 선택된 노드 초기화
        setSelectedNode(null);

        toast({
          title: '파이프라인 삭제 완료',
          description: '파이프라인이 성공적으로 삭제되었습니다.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        // toast({
        //   title: 'Pipeline Deletion Completed',
        //   description: 'The pipeline has been successfully deleted.',
        //   status: 'info',
        //   duration: 3000,
        //   isClosable: true,
        // });
        

        // 로그에 삭제 기록
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: '파이프라인이 삭제되었습니다.'
        }]);
      } catch (error) {
        console.error('파이프라인 삭제 실패:', error);
        toast({
          title: '파이프라인 삭제 실패',
          description: '파이프라인을 삭제하는 중 오류가 발생했습니다.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [handleCreateCheckpoint, setNodes, setEdges, setVersion, setPipelineStatus, setRunningNodeIds, setPausedNodeIds, setSelectedNode, setLogs, toast]);

  return (
    <Box as="main" pt="80px" px="4" maxW="100%">
      <Stack spacing={6} mt="-70px">
        {/* 헤더 */}
        <HStack justify="space-between">
          <Stack>
            <Text fontSize="2xl" fontWeight="bold">파이프라인</Text>
            <Text color="gray.500">모델 학습 파이프라인을 생성하고 관리하세요</Text>
          </Stack>
          <HStack spacing={2}>
            <Button
              leftIcon={<Icon as={FiPlay} />}
              bg="#EB6100"
              color="white"
              _hover={{ bg: 'orange.500' }}
              onClick={handleRunPipeline}
              isDisabled={pipelineStatus === 'running'}
            >
              실행
            </Button>
            {pipelineStatus === 'running' && (
              <Button
                leftIcon={<Icon as={FiClock} />}
                colorScheme="yellow"
                onClick={handlePausePipeline}
              >
                일시 정지
              </Button>
            )}
            {pipelineStatus === 'paused' && (
              <Button
                leftIcon={<Icon as={FiPlay} />}
                colorScheme="green"
                onClick={handleResumePipeline}
              >
                재개
              </Button>
            )}
            {(pipelineStatus === 'running' || pipelineStatus === 'paused') && (
              <Button
                leftIcon={<Icon as={FiX} />}
                colorScheme="red"
                onClick={handleStopPipeline}
              >
                중지
              </Button>
            )}
            <Button
              leftIcon={<Icon as={FiSave} />}
              variant="outline"
              onClick={() => {
                setVersion(prev => {
                  const [major, minor, patch] = prev.split('.').map(Number)
                  return `${major}.${minor}.${patch + 1}`
                })
                const pipelineState = {
                  nodes,
                  edges,
                  version,
                  timestamp: new Date().toISOString()
                }

                try {
                  localStorage.setItem('pipelineState', JSON.stringify(pipelineState))
                  
                  toast({
                    title: '파이프라인이 저장되었습니다.',
                    description: `버전 ${version}으로 저장되었습니다.`,
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  })
                  // toast({
                  //   title: 'Pipeline Saved',
                  //   description: `Saved as version ${version}.`,
                  //   status: 'success',
                  //   duration: 3000,
                  //   isClosable: true,
                  // });
                  

                } catch (error) {
                  console.error('파이프라인 저장 중 오류:', error)
                  
                  toast({
                    title: '저장 실패',
                    description: '파이프라인을 저장하는 중 문제가 발생했습니다.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                  })
                }

              try {
                  handleSavePipeline();
                } catch (error) {
                  console.error('파이프라인 서버 업데이트 오류:', error);
                  toast({
                    title: '서버 저장 실패',
                    description: '서버에 파이프라인을 업데이트하는 중 오류가 발생했습니다.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                  });
                }

              }}
            >
              저장
            </Button>
            <Button
              leftIcon={<Icon as={FiInfo} />}
              variant="ghost"
              onClick={onModalOpen}
            >
              로그
            </Button>
            <Button
              leftIcon={<Icon as={FiHelpCircle} />}
              variant="ghost"
              onClick={onHelpModalOpen}
            >
              도움말
            </Button>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<Icon as={FiMoreVertical} />}
                variant="outline"
              />
              <MenuList>
                <MenuItem icon={<Icon as={FiUpload} />} onClick={handleImportPipeline}>
                  파이프라인 가져오기
                </MenuItem>
                <MenuItem icon={<Icon as={FiDownload} />} onClick={handleExportPipeline}>
                  파이프라인 내보내기
                </MenuItem>
                <MenuItem icon={<Icon as={FiGitBranch} />} onClick={handleCreateCheckpoint}>
                  체크포인트 생성
                </MenuItem>
                <MenuItem icon={<Icon as={FiTrash2} />} color="red.500" onClick={handleDeletePipeline}>
                  파이프라인 삭제
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </HStack>

        <Card bg={cardBg} borderRadius="lg" boxShadow="sm" overflow="hidden">
          <CardBody p={0}>
            <Flex h="calc(100vh - 220px)">
              <NodeSidebar onDragStart={onDragStart} />

              <Box flex={1} ref={reactFlowWrapper}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  onInit={onInit}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  defaultEdgeOptions={{
                    type: 'bezier',
                    animated: true,
                    style: { stroke: '#ED8936', strokeWidth: 2 }
                  }}
                  fitView
                  defaultZoom={0.7}
                  minZoom={0.2}
                  maxZoom={2}
                >
                  <Controls />
                  <Background />
                  <MiniMap 
                    nodeColor={(node) => {
                      switch (node.data?.status) {
                        case 'running':
                          return '#ED8936'
                        case 'completed':
                          return '#48BB78'
                        case 'error':
                          return '#F56565'
                        case 'paused':
                          return '#CBD5E0'
                        default:
                          return '#CBD5E0'
                      }
                    }}
                  />
                </ReactFlow>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* 삭제 확인 대화상자 */}
        <AlertDialog
          isOpen={false}
          leastDestructiveRef={null}
          onClose={() => {}}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                노드 삭제 확인
              </AlertDialogHeader>

              <AlertDialogBody>
                정말로 노드를 삭제하시겠습니까?
                
                <Text mt={2} fontSize="sm" color="gray.500">
                  • 삭제된 노드는 복구할 수 없습니다.
                  • 해당 노드와 연결된 모든 연결도 함께 제거됩니다.
                </Text>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button onClick={() => {}}>
                  취소
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={() => {}}
                  ml={3}
                >
                  삭제
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* 드로어 내부의 모달 제거 */}
        <Drawer 
          isOpen={false} 
          placement="right" 
          onClose={() => {}}
          size="md"
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>노드 상세 정보</DrawerHeader>

            <DrawerBody>
              {selectedNode && (
                <VStack spacing={4} align="stretch">
                  <Button 
                    colorScheme="red" 
                    variant="outline"
                    onClick={() => {}}
                  >
                    노드 삭제
                  </Button>
                </VStack>
              )}
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* 도움말 모달 */}
        <Modal isOpen={isHelpModalOpen} onClose={onHelpModalClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={2} align="center">
                <Icon as={FiHelpCircle} color="#EB6100" boxSize={6} />
                <Text color="#EB6100" fontSize="xl" fontWeight="bold">
                  파이프라인 사용 가이드
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack align="stretch" spacing={4}>
                {pipelineHelpSteps.map((step, index) => (
                  <Box 
                    key={index} 
                    p={4} 
                    bg={bgColor} 
                    borderRadius="lg" 
                    boxShadow="sm"
                    borderLeft="4px solid #EB6100"
                    transition="all 0.3s ease"
                    _hover={{
                      transform: 'translateX(10px)',
                      boxShadow: 'md'
                    }}
                  >
                    <HStack spacing={3} mb={2} align="center">
                      <Icon 
                        as={step.icon} 
                        boxSize={6} 
                        color="#EB6100" 
                        bg="rgba(235, 97, 0, 0.1)" 
                        p={1} 
                        borderRadius="full" 
                      />
                      <Text 
                        fontSize="lg" 
                        fontWeight="semibold" 
                        color="#EB6100"
                      >
                        {step.title}
                      </Text>
                    </HStack>
                    <Text 
                      fontSize="sm" 
                      color={textColor} 
                      pl={9}
                    >
                      {step.description}
                    </Text>
                    <Text 
                      fontSize="xs" 
                      color={textColor} 
                      pl={9}
                      opacity={0.7}
                    >
                      {step.tip}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* 로그 모달 */}
        {LogModal}

      </Stack>
    </Box>
  )
}

export default function PipelinePage() {
  return (
    <ReactFlowProvider>
      <PipelineContent />
    </ReactFlowProvider>
  )
}