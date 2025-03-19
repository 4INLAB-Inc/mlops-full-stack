'use client'

import React from 'react'
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Progress,
  SimpleGrid,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'

export default function SystemMetrics() {
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

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
        <Heading size="md">시스템 메트릭스</Heading>
      </CardHeader>

      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              CPU 사용률
            </Text>
            <Progress value={65} size="sm" colorScheme="blue" mb={2} />
            <StatGroup>
              <Stat>
                <StatNumber fontSize="lg">65%</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  12%
                </StatHelpText>
              </Stat>
            </StatGroup>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              메모리 사용률
            </Text>
            <Progress value={45} size="sm" colorScheme="green" mb={2} />
            <StatGroup>
              <Stat>
                <StatNumber fontSize="lg">45%</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  8%
                </StatHelpText>
              </Stat>
            </StatGroup>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              GPU 사용률
            </Text>
            <Progress value={80} size="sm" colorScheme="purple" mb={2} />
            <StatGroup>
              <Stat>
                <StatNumber fontSize="lg">80%</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  15%
                </StatHelpText>
              </Stat>
            </StatGroup>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              디스크 사용률
            </Text>
            <Progress value={35} size="sm" colorScheme="orange" mb={2} />
            <StatGroup>
              <Stat>
                <StatNumber fontSize="lg">35%</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  5%
                </StatHelpText>
              </Stat>
            </StatGroup>
          </Box>
        </SimpleGrid>
      </CardBody>
    </Card>
  )
}
