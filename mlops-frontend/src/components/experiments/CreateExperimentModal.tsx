import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useColorModeValue,
  FormHelperText,
  Divider,
  Box,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { useState } from 'react'

interface CreateExperimentModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (experimentData: any) => void
}

export default function CreateExperimentModal({
  isOpen,
  onClose,
  onCreate,
}: CreateExperimentModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('')
  const [dataset, setDataset] = useState('')
  const [tag, setTag] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isAutoML, setIsAutoML] = useState(false)

  // 하이퍼파라미터 상태
  const [hyperparameters, setHyperparameters] = useState({
    learningRate: 0.001,
    batchSize: 32,
    epochs: 10,
    optimizer: 'adam',
    dropout: 0.5,
  })

  // AutoML 설정 상태
  const [autoMLSettings, setAutoMLSettings] = useState({
    maxTrials: 10,
    searchSpace: {
      learningRate: { min: 0.0001, max: 0.01 },
      batchSize: { min: 16, max: 128 },
      dropout: { min: 0.2, max: 0.8 },
    },
    optimizeMetric: 'accuracy',
  })

  const handleAddTag = () => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleSubmit = () => {
    const experimentData = {
      name,
      description,
      model,
      dataset,
      tags,
      isAutoML,
      hyperparameters: isAutoML ? autoMLSettings : hyperparameters,
    }
    onCreate(experimentData)
    onClose()
  }

  const handleHyperparameterChange = (
    param: keyof typeof hyperparameters,
    value: any
  ) => {
    setHyperparameters((prev) => ({
      ...prev,
      [param]: value,
    }))
  }

  const handleAutoMLSettingChange = (
    setting: string,
    value: any,
    isRange = false,
    rangeType?: 'min' | 'max'
  ) => {
    if (isRange && rangeType) {
      setAutoMLSettings((prev) => ({
        ...prev,
        searchSpace: {
          ...prev.searchSpace,
          [setting]: {
            ...prev.searchSpace[setting as keyof typeof prev.searchSpace],
            [rangeType]: value,
          },
        },
      }))
    } else {
      setAutoMLSettings((prev) => ({
        ...prev,
        [setting]: value,
      }))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>새 실험 생성</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>실험명</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="실험명을 입력하세요"
              />
            </FormControl>

            <FormControl>
              <FormLabel>설명</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="실험에 대한 설명을 입력하세요"
              />
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={6} width="100%">
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>모델</FormLabel>
                  <Select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="모델 선택"
                  >
                    <option value="cnn">CNN</option>
                    <option value="resnet">ResNet</option>
                    <option value="efficientnet">EfficientNet</option>
                    <option value="transformer">Transformer</option>
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired>
                  <FormLabel>데이터셋</FormLabel>
                  <Select
                    value={dataset}
                    onChange={(e) => setDataset(e.target.value)}
                    placeholder="데이터셋 선택"
                  >
                    <option value="mnist">MNIST</option>
                    <option value="cifar10">CIFAR-10</option>
                    <option value="imagenet">ImageNet</option>
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl>
              <FormLabel>태그</FormLabel>
              <HStack>
                <Input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="태그를 입력하세요"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button onClick={handleAddTag}>추가</Button>
              </HStack>
              <Box mt={2}>
                {tags.map((t) => (
                  <Tag
                    key={t}
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="brand"
                    m={1}
                  >
                    <TagLabel>{t}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveTag(t)} />
                  </Tag>
                ))}
              </Box>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">AutoML 사용</FormLabel>
              <Switch
                colorScheme="brand"
                isChecked={isAutoML}
                onChange={(e) => setIsAutoML(e.target.checked)}
              />
            </FormControl>

            <Divider />

            {isAutoML ? (
              <VStack spacing={4} width="100%">
                <Text fontWeight="semibold">AutoML 설정</Text>
                <FormControl>
                  <FormLabel>최대 시도 횟수</FormLabel>
                  <NumberInput
                    value={autoMLSettings.maxTrials}
                    onChange={(value) =>
                      handleAutoMLSettingChange('maxTrials', parseInt(value))
                    }
                    min={1}
                    max={100}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>최적화 메트릭</FormLabel>
                  <Select
                    value={autoMLSettings.optimizeMetric}
                    onChange={(e) =>
                      handleAutoMLSettingChange('optimizeMetric', e.target.value)
                    }
                  >
                    <option value="accuracy">정확도</option>
                    <option value="loss">손실</option>
                    <option value="f1">F1 Score</option>
                  </Select>
                </FormControl>

                <Text fontWeight="semibold" alignSelf="flex-start">
                  탐색 범위 설정
                </Text>

                {Object.entries(autoMLSettings.searchSpace).map(
                  ([param, range]) => (
                    <Grid
                      key={param}
                      templateColumns="1fr 2fr 2fr"
                      gap={4}
                      width="100%"
                      alignItems="center"
                    >
                      <Text>{param}</Text>
                      <FormControl>
                        <FormLabel fontSize="sm">최소값</FormLabel>
                        <NumberInput
                          value={range.min}
                          onChange={(value) =>
                            handleAutoMLSettingChange(
                              param,
                              parseFloat(value),
                              true,
                              'min'
                            )
                          }
                          step={0.0001}
                          precision={4}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">최대값</FormLabel>
                        <NumberInput
                          value={range.max}
                          onChange={(value) =>
                            handleAutoMLSettingChange(
                              param,
                              parseFloat(value),
                              true,
                              'max'
                            )
                          }
                          step={0.0001}
                          precision={4}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </Grid>
                  )
                )}
              </VStack>
            ) : (
              <VStack spacing={4} width="100%">
                <Text fontWeight="semibold">하이퍼파라미터 설정</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={6} width="100%">
                  <FormControl>
                    <FormLabel>Learning Rate</FormLabel>
                    <NumberInput
                      value={hyperparameters.learningRate}
                      onChange={(value) =>
                        handleHyperparameterChange(
                          'learningRate',
                          parseFloat(value)
                        )
                      }
                      step={0.0001}
                      precision={4}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Batch Size</FormLabel>
                    <NumberInput
                      value={hyperparameters.batchSize}
                      onChange={(value) =>
                        handleHyperparameterChange('batchSize', parseInt(value))
                      }
                      min={1}
                      step={1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Epochs</FormLabel>
                    <NumberInput
                      value={hyperparameters.epochs}
                      onChange={(value) =>
                        handleHyperparameterChange('epochs', parseInt(value))
                      }
                      min={1}
                      step={1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Optimizer</FormLabel>
                    <Select
                      value={hyperparameters.optimizer}
                      onChange={(e) =>
                        handleHyperparameterChange('optimizer', e.target.value)
                      }
                    >
                      <option value="adam">Adam</option>
                      <option value="sgd">SGD</option>
                      <option value="rmsprop">RMSprop</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Dropout Rate</FormLabel>
                    <NumberInput
                      value={hyperparameters.dropout}
                      onChange={(value) =>
                        handleHyperparameterChange('dropout', parseFloat(value))
                      }
                      step={0.1}
                      min={0}
                      max={1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </Grid>
              </VStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            취소
          </Button>
          <Button colorScheme="brand" onClick={handleSubmit}>
            생성
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
