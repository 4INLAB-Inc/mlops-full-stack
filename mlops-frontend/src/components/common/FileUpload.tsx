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
  onFileSelect: (files: File[]) => void // 여러 파일을 허용
  placeholder?: string
}

export function FileUpload({
  accept,
  maxSize = 10 * 1024 * 1024, // 기본 크기: 10MB
  onFileSelect,
  placeholder = '파일을 드래그하거나 클릭하여 선택하세요',
}: FileUploadProps) {
  const [fileNames, setFileNames] = useState<string[]>([]) // 선택된 파일 이름들을 저장
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const activeBg = useColorModeValue('gray.100', 'gray.600')

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const fileNames = acceptedFiles.map(file => file.name) // 선택된 파일들의 이름을 가져옴
        setFileNames(fileNames) // 파일 이름들을 상태에 저장
        onFileSelect(acceptedFiles) // 선택된 모든 파일을 onFileSelect 함수로 전달
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true, // 여러 파일을 선택할 수 있도록 허용
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
      <Input {...getInputProps()} size="sm" />
      <VStack spacing={2} color={isDragActive ? 'brand.500' : 'gray.500'}>
        <Icon as={FiUploadCloud} boxSize={8} />
        <Text textAlign="center" fontSize="sm">
          {fileNames.length > 0 ? fileNames.join(', ') : placeholder} {/* 선택된 파일 이름들을 표시 */}
        </Text>
        {fileNames.length > 0 && (
          <Text color="brand.500" fontSize="sm" fontWeight="medium">
            {fileNames.join(', ')} {/* 선택된 모든 파일 이름을 표시 */}
          </Text>
        )}
      </VStack>
    </Box>
  )
}
