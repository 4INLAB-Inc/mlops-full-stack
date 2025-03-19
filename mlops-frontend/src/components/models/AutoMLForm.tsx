'use client'

import React from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  StackDivider,
  Switch,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'

interface AutoMLFormProps {
  onSubmit: () => void
}

export function AutoMLForm({ onSubmit }: AutoMLFormProps) {
  const [formData, setFormData] = React.useState({
    datasetPath: '',
    targetColumn: '',
    modelType: 'classification',
    optimizationMetric: 'accuracy',
    maxTrials: '10',
    maxTime: '3600',
    useGPU: false,
  })

  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.datasetPath || !formData.targetColumn) {
      toast({
        title: '필수 필드를 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    toast({
      title: 'AutoML 작업이 시작되었습니다.',
      description: '모델 학습이 완료되면 알림을 보내드리겠습니다.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    })

    console.log('AutoML Form Data:', formData)
    onSubmit()
  }

  return (
    <Card
      as="form"
      onSubmit={handleSubmit}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      shadow="sm"
    >
      <CardHeader>
        <Heading size="md">AutoML 설정</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <FormControl isRequired>
              <FormLabel>데이터셋 경로</FormLabel>
              <Input
                placeholder="데이터셋 파일 경로를 입력하세요"
                value={formData.datasetPath}
                onChange={(e) =>
                  setFormData({ ...formData, datasetPath: e.target.value })
                }
              />
            </FormControl>
          </Box>

          <Box>
            <FormControl isRequired>
              <FormLabel>목표 변수</FormLabel>
              <Input
                placeholder="예측하고자 하는 열 이름을 입력하세요"
                value={formData.targetColumn}
                onChange={(e) =>
                  setFormData({ ...formData, targetColumn: e.target.value })
                }
              />
            </FormControl>
          </Box>

          <Box>
            <FormControl>
              <FormLabel>모델 유형</FormLabel>
              <Select
                value={formData.modelType}
                onChange={(e) =>
                  setFormData({ ...formData, modelType: e.target.value })
                }
              >
                <option value="classification">분류</option>
                <option value="regression">회귀</option>
                <option value="timeseries">시계열</option>
              </Select>
            </FormControl>
          </Box>

          <Box>
            <FormControl>
              <FormLabel>최적화 지표</FormLabel>
              <Select
                value={formData.optimizationMetric}
                onChange={(e) =>
                  setFormData({ ...formData, optimizationMetric: e.target.value })
                }
              >
                <option value="accuracy">정확도</option>
                <option value="f1">F1 Score</option>
                <option value="auc">AUC-ROC</option>
                <option value="rmse">RMSE</option>
                <option value="mae">MAE</option>
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>최대 시도 횟수</FormLabel>
                <Input
                  type="number"
                  value={formData.maxTrials}
                  onChange={(e) =>
                    setFormData({ ...formData, maxTrials: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>최대 실행 시간 (초)</FormLabel>
                <Input
                  type="number"
                  value={formData.maxTime}
                  onChange={(e) =>
                    setFormData({ ...formData, maxTime: e.target.value })
                  }
                />
              </FormControl>
            </Stack>
          </Box>

          <Box>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">GPU 사용</FormLabel>
              <Switch
                isChecked={formData.useGPU}
                onChange={(e) =>
                  setFormData({ ...formData, useGPU: e.target.checked })
                }
              />
            </FormControl>
          </Box>

          <Box>
            <Button type="submit" colorScheme="blue" width="full">
              AutoML 시작
            </Button>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

export default AutoMLForm
