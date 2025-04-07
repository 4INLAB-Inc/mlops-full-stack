'use client'

import { useState, useEffect, useRef } from 'react'

import {
  Box,
  Code,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'

interface LiveLogsProps {
  experimentId: string
}

// export function LiveLogs({ experimentId }: LiveLogsProps) {
//   const logsRef = useRef<HTMLDivElement>(null)
//   const bgCode = useColorModeValue('gray.50', 'gray.900')

//   // 로그 자동 스크롤
//   useEffect(() => {
//     if (logsRef.current) {
//       logsRef.current.scrollTop = logsRef.current.scrollHeight
//     }
//   }, [])

  // // 예시 로그 데이터
  // const logs = [
  //   { timestamp: '2024-01-10 10:15:23', level: 'INFO', message: 'Starting experiment...' },
  //   { timestamp: '2024-01-10 10:15:24', level: 'INFO', message: 'Loading dataset...' },
  //   { timestamp: '2024-01-10 10:15:25', level: 'INFO', message: 'Dataset loaded successfully' },
  //   { timestamp: '2024-01-10 10:15:26', level: 'INFO', message: 'Initializing model...' },
  //   { timestamp: '2024-01-10 10:15:27', level: 'INFO', message: 'Model initialized' },
  //   { timestamp: '2024-01-10 10:15:28', level: 'INFO', message: 'Starting training...' },
  //   { timestamp: '2024-01-10 10:15:29', level: 'INFO', message: 'Epoch 1/10' },
  //   { timestamp: '2024-01-10 10:15:30', level: 'INFO', message: 'Loss: 0.6932, Accuracy: 0.5123' },
  //   { timestamp: '2024-01-10 10:15:31', level: 'WARNING', message: 'Learning rate might be too high' },
  //   { timestamp: '2024-01-10 10:15:32', level: 'INFO', message: 'Epoch 2/10' },
  // ]
  export function LiveLogs({ experimentId }: LiveLogsProps) {
    const [logs, setLogs] = useState<
      { timestamp: string; level: string; message: string }[]
    >([]) // State to store logs
  
    const logsRef = useRef<HTMLDivElement>(null)
    const bgCode = useColorModeValue('gray.50', 'gray.900')
  
    // Fetch logs from API when the component mounts or experimentId changes
    useEffect(() => {
      const fetchLogs = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/logs/experiments/${experimentId}`
          )
          const data = await response.json()
          setLogs(data) // Update the logs state with the fetched data
        } catch (error) {
          console.error('Error fetching logs:', error)
        }
      }
  
      fetchLogs()
  
      // Optional: Set an interval to fetch new logs periodically (e.g., every 5 seconds)
      const intervalId = setInterval(fetchLogs, 5000)
  
      return () => {
        clearInterval(intervalId) // Clear the interval on cleanup
      }
    }, [experimentId]) // Re-run the effect whenever the experimentId changes
  
    // Logs auto-scroll functionality
    useEffect(() => {
      if (logsRef.current) {
        logsRef.current.scrollTop = logsRef.current.scrollHeight
      }
    }, [logs]) // Re-run when logs state updates

  return (
    <Box
      ref={logsRef}
      bg={bgCode}
      p={4}
      borderRadius="md"
      height="500px"
      overflowY="auto"
      fontFamily="mono"
      fontSize="sm"
    >
      <Stack spacing={2}>
        {Array.isArray(logs) && logs.map((log, index) => (
          <Code
            key={index}
            p={2}
            borderRadius="md"
            variant="subtle"
            colorScheme={log.level === 'WARNING' ? 'yellow' : 'gray'}
          >
            <Text as="span" color="gray.500">[{log.timestamp}]</Text>{' '}
            <Text
              as="span"
              color={log.level === 'WARNING' ? 'yellow.500' : 'blue.500'}
              fontWeight="bold"
            >
              {log.level}
            </Text>{' '}
            {log.message}
          </Code>
        ))}
      </Stack>
    </Box>
  )
}
