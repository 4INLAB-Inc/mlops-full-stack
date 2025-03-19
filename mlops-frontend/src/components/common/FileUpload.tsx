'use client'

import {
  Box,
  Icon,
  Input,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUploadCloud } from 'react-icons/fi'

interface FileUploadProps {
  accept?: Record<string, string[]>
  maxSize?: number
  onFileSelect: (file: File) => void
  placeholder?: string
}

export function FileUpload({
  accept,
  maxSize = 10 * 1024 * 1024, // 기본 10MB
  onFileSelect,
  placeholder = '파일을 드래그하여 업로드하거나 클릭하여 선택하세요',
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string>('')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const activeBg = useColorModeValue('gray.100', 'gray.600')

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setFileName(file.name)
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  })

  return (
    <Box
      {...getRootProps()}
      borderWidth={2}
      borderStyle="dashed"
      borderColor={isDragActive ? 'brand.500' : borderColor}
      borderRadius="lg"
      bg={isDragActive ? hoverBg : 'transparent'}
      _hover={{ bg: hoverBg }}
      _active={{ bg: activeBg }}
      transition="all 0.2s"
      cursor="pointer"
      p={6}
    >
      <Input {...getInputProps()} />
      <VStack spacing={2} color={isDragActive ? 'brand.500' : 'gray.500'}>
        <Icon as={FiUploadCloud} boxSize={8} />
        <Text textAlign="center" fontSize="sm">
          {fileName || placeholder}
        </Text>
        {fileName && (
          <Text color="brand.500" fontSize="sm" fontWeight="medium">
            {fileName}
          </Text>
        )}
      </VStack>
    </Box>
  )
}
