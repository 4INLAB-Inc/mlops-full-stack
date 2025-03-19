'use client'

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Box,
  useColorModeValue,
} from '@chakra-ui/react'
import { ResourceGroup } from '../types'

interface ResourceTableProps {
  data: ResourceGroup[]
}

export function ResourceTable({ data }: ResourceTableProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>이름</Th>
            <Th isNumeric>워커 수</Th>
            <Th isNumeric>평균 GPU 사용률 (%)</Th>
            <Th isNumeric>평균 CPU 부하 (%)</Th>
            <Th isNumeric>총 메모리 (GB)</Th>
            <Th isNumeric>가용 메모리 (GB)</Th>
            <Th isNumeric>가용 저장 공간 (GB)</Th>
            <Th>네트워크 상태</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((group, index) => (
            <Tr
              key={group.name}
              _hover={{ bg: hoverBg }}
              transition="background-color 0.2s"
              cursor="pointer"
            >
              <Td fontWeight="medium">{group.name}</Td>
              <Td isNumeric>{group.workerCount}</Td>
              <Td isNumeric>
                <Box>
                  {group.avgGpuUtil.toFixed(2)}
                  <Progress
                    value={group.avgGpuUtil}
                    size="xs"
                    colorScheme={group.avgGpuUtil > 80 ? 'red' : 'green'}
                    mt={1}
                  />
                </Box>
              </Td>
              <Td isNumeric>
                <Box>
                  {group.avgCpuLoad.toFixed(2)}
                  <Progress
                    value={group.avgCpuLoad}
                    size="xs"
                    colorScheme={group.avgCpuLoad > 80 ? 'red' : 'orange'}
                    mt={1}
                  />
                </Box>
              </Td>
              <Td isNumeric>{(group.ramTotal / 1024).toFixed(2)}</Td>
              <Td isNumeric>{(group.ramFree / 1024).toFixed(2)}</Td>
              <Td isNumeric>{group.freeHomeSpace.toFixed(2)}</Td>
              <Td>{group.networkTwin}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}
