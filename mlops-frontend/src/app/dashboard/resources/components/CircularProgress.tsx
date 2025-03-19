'use client'

import { Box, Text, useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'

interface CircularProgressProps {
  value: number
  size?: string
  thickness?: string
  color?: string
  label?: string
  sublabel?: string
  animate?: boolean
}

export function CircularProgress({
  value,
  size = '120px',
  thickness = '8px',
  color = 'blue.400',
  label,
  sublabel,
  animate = true,
}: CircularProgressProps) {
  const trackColor = useColorModeValue('gray.100', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const subTextColor = useColorModeValue('gray.600', 'gray.400')

  const rotation = value * 3.6 // 360 degrees / 100

  return (
    <Box position="relative" width={size} height={size}>
      {/* Track Circle */}
      <Box
        as="svg"
        width="100%"
        height="100%"
        position="absolute"
        top="0"
        left="0"
      >
        <circle
          cx="50%"
          cy="50%"
          r={`calc(${parseInt(size) / 2 - parseInt(thickness) / 2}px)`}
          fill="none"
          stroke={trackColor}
          strokeWidth={thickness}
        />
      </Box>

      {/* Progress Circle */}
      <Box
        as={motion.svg}
        width="100%"
        height="100%"
        position="absolute"
        top="0"
        left="0"
        style={{
          transform: 'rotate(-90deg)',
        }}
        initial={{ rotate: -90 }}
        animate={{
          rotate: -90,
          strokeDashoffset: `calc(${parseInt(size) * Math.PI - parseInt(thickness)}px * ${
            (100 - value) / 100
          })`,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <circle
          cx="50%"
          cy="50%"
          r={`calc(${parseInt(size) / 2 - parseInt(thickness) / 2}px)`}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={`calc(${parseInt(size) * Math.PI - parseInt(thickness)}px)`}
          strokeLinecap="round"
        />
      </Box>

      {/* Value Indicator */}
      <Box
        as={motion.div}
        position="absolute"
        width="8px"
        height="8px"
        borderRadius="full"
        bg={color}
        top="0"
        left="50%"
        marginLeft="-4px"
        transformOrigin="center center"
        initial={{ scale: 0 }}
        animate={{ 
          scale: [0, 1],
          rotate: rotation,
        }}
        transition={{ 
          duration: 0.8,
          ease: "easeOut"
        }}
      />

      {/* Center Text */}
      <Box
        as={motion.div}
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        textAlign="center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Text
          fontSize={`calc(${size} * 0.25)`}
          fontWeight="bold"
          color={textColor}
          mb="-2"
        >
          {value}%
        </Text>
        {label && (
          <Text fontSize={`calc(${size} * 0.12)`} color={subTextColor} mt="1">
            {label}
          </Text>
        )}
        {sublabel && (
          <Text fontSize={`calc(${size} * 0.1)`} color={subTextColor} mt="0">
            {sublabel}
          </Text>
        )}
      </Box>
    </Box>
  )
}
