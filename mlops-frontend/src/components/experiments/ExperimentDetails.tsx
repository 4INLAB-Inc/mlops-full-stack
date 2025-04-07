'use client'

import {
  Box,
  Card,
  CardBody,
  Grid,
  GridItem,
  Heading,
  Text,
  Stack,
  HStack,
  Badge,
  Icon,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Code,
  VStack,
} from '@chakra-ui/react'
import { FiCpu, FiDatabase, FiClock, FiCalendar } from 'react-icons/fi'
import { LiveLogs } from './LiveLogs'
import dynamic from 'next/dynamic'

const LineChart = dynamic(() => import('@/components/charts/LineChart'), { ssr: false })

interface ExperimentDetailsProps {
  experiment: any
}

export function ExperimentDetails({ experiment }: ExperimentDetailsProps) {
  const bgCard = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Stack spacing={6}>
      {/* 실험 개요 */}
      <Card bg={bgCard} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <Stack spacing={6}>
            <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={6}>
              <GridItem>
                <Stack spacing={4}>
                  <HStack justify="space-between">
                    <Heading size="lg">{experiment.name}</Heading>
                    <Badge
                      colorScheme={
                        experiment.status === 'running'
                          ? 'blue'
                          : experiment.status === 'completed'
                          ? 'green'
                          : 'red'
                      }
                      px={3}
                      py={1}
                      rounded="full"
                      fontSize="md"
                    >
                      {experiment.status === 'running'
                        ? '실행 중'
                        : experiment.status === 'completed'
                        ? '완료'
                        : '실패'}
                    </Badge>
                  </HStack>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <HStack>
                      <Icon as={FiCpu} color="purple.500" />
                      <Text color="gray.600">모델:</Text>
                      <Text fontWeight="medium">{experiment.model}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiDatabase} color="green.500" />
                      <Text color="gray.600">데이터셋:</Text>
                      <Text fontWeight="medium">{experiment.dataset}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiClock} color="blue.500" />
                      <Text color="gray.600">실행 시간:</Text>
                      <Text fontWeight="medium">{experiment.runtime}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FiCalendar} color="orange.500" />
                      <Text color="gray.600">생성일:</Text>
                      <Text fontWeight="medium">{experiment.created}</Text>
                    </HStack>
                  </Grid>
                </Stack>
              </GridItem>
              <GridItem>
                <Card variant="outline">
                  <CardBody>
                    <Stack spacing={3}>
                      <Heading size="sm">성능 메트릭스</Heading>
                      <HStack justify="space-between">
                        <Text color="gray.600">정확도</Text>
                        <Text fontWeight="bold" fontSize="lg">
                          {(experiment.accuracy).toFixed(1)}%
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">F1 Score</Text>
                        <Text fontWeight="bold" fontSize="lg">
                          {(experiment.f1Score * 100).toFixed(1)}%
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">손실</Text>
                        <Text fontWeight="bold" fontSize="lg">
                          {experiment.loss.toFixed(3)}
                        </Text>
                      </HStack>
                    </Stack>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </Stack>
        </CardBody>
      </Card>

      {/* 상세 정보 탭 */}
      <Card bg={bgCard} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <Tabs colorScheme="orange">
            <TabList>
              <Tab>학습 곡선</Tab>
              <Tab>하이퍼파라미터</Tab>
              <Tab>실시간 로그</Tab>
            </TabList>

            <TabPanels>
              {/* 학습 곡선 */}
              <TabPanel>
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <GridItem>
                    <Card variant="outline">
                      <CardBody>
                        <Stack spacing={4}>
                          <Heading size="sm">정확도 곡선</Heading>
                          <Box h="300px">
                            <LineChart
                              data={[
                                {
                                  id: '학습',
                                  data: experiment.metrics.trainAcc.map((value: number, index: number) => ({
                                    x: index + 1,
                                    y: value * 100
                                  }))
                                },
                                {
                                  id: '검증',
                                  data: experiment.metrics.valAcc.map((value: number, index: number) => ({
                                    x: index + 1,
                                    y: value * 100
                                  }))
                                }
                              ]}
                              xLabel="Epoch"
                              yLabel="Accuracy (%)"
                            />
                          </Box>
                        </Stack>
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem>
                    <Card variant="outline">
                      <CardBody>
                        <Stack spacing={4}>
                          <Heading size="sm">손실 곡선</Heading>
                          <Box h="300px">
                            <LineChart
                              data={[
                                {
                                  id: '학습',
                                  data: experiment.metrics.trainLoss.map((value: number, index: number) => ({
                                    x: index + 1,
                                    y: value
                                  }))
                                },
                                {
                                  id: '검증',
                                  data: experiment.metrics.valLoss.map((value: number, index: number) => ({
                                    x: index + 1,
                                    y: value
                                  }))
                                }
                              ]}
                              xLabel="Epoch"
                              yLabel="Loss"
                            />
                          </Box>
                        </Stack>
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>
              </TabPanel>

              {/* 하이퍼파라미터 */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Card variant="outline">
                    <CardBody>
                      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
                        <Stack spacing={3}>
                          <Text color="gray.600">Learning Rate</Text>
                          <Code p={2} borderRadius="md" fontSize="lg">
                            {experiment.hyperparameters.learningRate}
                          </Code>
                        </Stack>
                        <Stack spacing={3}>
                          <Text color="gray.600">Batch Size</Text>
                          <Code p={2} borderRadius="md" fontSize="lg">
                            {experiment.hyperparameters.batchSize}
                          </Code>
                        </Stack>
                        <Stack spacing={3}>
                          <Text color="gray.600">Epochs</Text>
                          <Code p={2} borderRadius="md" fontSize="lg">
                            {experiment.hyperparameters.epochs}
                          </Code>
                        </Stack>
                      </Grid>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* 실시간 로그 */}
              <TabPanel p={0}>
                <LiveLogs experimentId={experiment.id} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Stack>
  )
}
