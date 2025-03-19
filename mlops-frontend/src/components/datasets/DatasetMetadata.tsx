'use client'

import {
  Box,
  Card,
  CardBody,
  Stack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  HStack,
  Icon,
  Badge,
  Button,
} from '@chakra-ui/react'
import { FiDownload, FiClock, FiTag, FiLayers } from 'react-icons/fi'

interface DatasetMetadataProps {
  dataset: any
}

export function DatasetMetadata({ dataset }: DatasetMetadataProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const bgCard = useColorModeValue('white', 'gray.800')
  const brandColor = '#EB6100'

  return (
    <Stack spacing={6}>
      {/* 기본 정보 */}
      <Card bg={bgCard} borderColor={borderColor}>
        <CardBody>
          <Stack spacing={4}>
            <Text fontWeight="medium">기본 정보</Text>
            <Table variant="simple" size="sm">
              <Tbody>
                <Tr>
                  <Td width="200px" color="gray.500">
                    데이터셋 ID
                  </Td>
                  <Td>{dataset.id}</Td>
                </Tr>
                <Tr>
                  <Td color="gray.500">데이터셋 이름</Td>
                  <Td>{dataset.name}</Td>
                </Tr>
                <Tr>
                  <Td color="gray.500">설명</Td>
                  <Td>{dataset.description}</Td>
                </Tr>
                <Tr>
                  <Td color="gray.500">데이터 유형</Td>
                  <Td>
                    <Badge colorScheme="orange">{dataset.type}</Badge>
                  </Td>
                </Tr>
                <Tr>
                  <Td color="gray.500">태그</Td>
                  <Td>
                    <HStack spacing={2}>
                      {dataset.tags.map((tag: string) => (
                        <Badge key={tag} colorScheme="orange" variant="subtle">
                          {tag}
                        </Badge>
                      ))}
                    </HStack>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Stack>
        </CardBody>
      </Card>

      {/* 버전 정보 */}
      <Card bg={bgCard} borderColor={borderColor}>
        <CardBody>
          <Stack spacing={4}>
            <Text fontWeight="medium">버전 정보</Text>
            <Table variant="simple" size="sm">
              <Tbody>
                <Tr>
                  <Td width="200px" color="gray.500">
                    현재 버전
                  </Td>
                  <Td>
                    <HStack>
                      <Badge colorScheme="green">v{dataset.version}</Badge>
                      <Text fontSize="sm" color="gray.500">
                        (최신)
                      </Text>
                    </HStack>
                  </Td>
                </Tr>
                <Tr>
                  <Td color="gray.500">이전 버전</Td>
                  <Td>
                    <Badge colorScheme="gray">v{dataset.previousVersion}</Badge>
                  </Td>
                </Tr>
                <Tr>
                  <Td color="gray.500">생성일</Td>
                  <Td>
                    <HStack>
                      <Icon as={FiClock} color="gray.500" />
                      <Text>{dataset.createdAt}</Text>
                    </HStack>
                  </Td>
                </Tr>
                <Tr>
                  <Td color="gray.500">마지막 수정일</Td>
                  <Td>
                    <HStack>
                      <Icon as={FiClock} color="gray.500" />
                      <Text>{dataset.lastModified}</Text>
                    </HStack>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Stack>
        </CardBody>
      </Card>

      {/* 데이터 구조 */}
      <Card bg={bgCard} borderColor={borderColor}>
        <CardBody>
          <Stack spacing={4}>
            <HStack justify="space-between">
              <Text fontWeight="medium">데이터 구조</Text>
              <Button
                leftIcon={<Icon as={FiDownload} />}
                variant="outline"
                size="sm"
                borderColor={brandColor}
                color={brandColor}
                _hover={{ bg: '#FFF5ED' }}
              >
                스키마 다운로드
              </Button>
            </HStack>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>특성명</Th>
                  <Th>데이터 타입</Th>
                  <Th>설명</Th>
                  <Th>결측치</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dataset.features.map((feature: any) => (
                  <Tr key={feature.name}>
                    <Td>{feature.name}</Td>
                    <Td>
                      <Badge>{feature.type}</Badge>
                    </Td>
                    <Td>
                      {feature.name === 'timestamp'
                        ? '데이터 수집 시간'
                        : `${feature.name} 센서 측정값`}
                    </Td>
                    <Td>{feature.missing}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  )
}
