'use client'

import React from 'react'
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Icon,
  Select,
  Stack,
  StackDivider,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiTrendingUp } from 'react-icons/fi'

const data = [
  {
    name: '1월',
    accuracy: 0.92,
    f1Score: 0.91,
    precision: 0.90,
    recall: 0.93,
  },
  {
    name: '2월',
    accuracy: 0.93,
    f1Score: 0.92,
    precision: 0.91,
    recall: 0.94,
  },
  {
    name: '3월',
    accuracy: 0.94,
    f1Score: 0.93,
    precision: 0.92,
    recall: 0.95,
  },
  {
    name: '4월',
    accuracy: 0.95,
    f1Score: 0.94,
    precision: 0.93,
    recall: 0.96,
  },
]

export function ModelMonitoring() {
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const chartLineColors = useColorModeValue(
    ['#3182CE', '#38A169', '#DD6B20', '#805AD5'],
    ['#63B3ED', '#68D391', '#F6AD55', '#B794F4']
  )

  return (
    <Card
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      shadow="sm"
    >
      <CardHeader>
        <Flex justify="space-between" align="center">
          <Flex align="center">
            <Icon as={FiTrendingUp} mr={2} boxSize={5} />
            <Heading size="md">모델 성능 모니터링</Heading>
          </Flex>
          <Select
            maxW="200px"
            size="sm"
            defaultValue="image_classification"
            borderColor={borderColor}
          >
            <option value="image_classification">이미지 분류 모델</option>
            <option value="object_detection">객체 감지 모델</option>
            <option value="segmentation">세그멘테이션 모델</option>
          </Select>
        </Flex>
        <Text color={textColor} fontSize="sm">
          시간에 따른 모델 성능 메트릭 변화를 모니터링합니다
        </Text>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={4}>
              성능 메트릭스
            </Text>
            <StatGroup>
              <Stat>
                <StatLabel>정확도</StatLabel>
                <StatNumber>95.4%</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  2.3%
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>처리량</StatLabel>
                <StatNumber>345</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  9.05%
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>지연시간</StatLabel>
                <StatNumber>123ms</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  14.2%
                </StatHelpText>
              </Stat>
            </StatGroup>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={4}>
              리소스 사용량
            </Text>
            <StatGroup>
              <Stat>
                <StatLabel>CPU 사용률</StatLabel>
                <StatNumber>45%</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  12.5%
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>메모리 사용률</StatLabel>
                <StatNumber>2.1GB</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  3.2%
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>GPU 사용률</StatLabel>
                <StatNumber>78%</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  8.7%
                </StatHelpText>
              </Stat>
            </StatGroup>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={4}>
              데이터 드리프트
            </Text>
            <StatGroup>
              <Stat>
                <StatLabel>특성 드리프트</StatLabel>
                <StatNumber>0.12</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  0.03
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>예측 드리프트</StatLabel>
                <StatNumber>0.08</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  0.02
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>데이터 품질</StatLabel>
                <StatNumber>98%</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  1.2%
                </StatHelpText>
              </Stat>
            </StatGroup>
          </Box>

          <Box h="400px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                <XAxis
                  dataKey="name"
                  stroke={textColor}
                  tick={{ fill: textColor }}
                />
                <YAxis
                  stroke={textColor}
                  tick={{ fill: textColor }}
                  domain={[0.8, 1]}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                  }}
                  formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  name="정확도"
                  stroke={chartLineColors[0]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="f1Score"
                  name="F1 Score"
                  stroke={chartLineColors[1]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="precision"
                  name="정밀도"
                  stroke={chartLineColors[2]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="recall"
                  name="재현율"
                  stroke={chartLineColors[3]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  )
}

export default ModelMonitoring
