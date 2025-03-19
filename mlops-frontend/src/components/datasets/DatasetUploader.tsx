import { useCallback, useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Box,
  Icon,
  useColorModeValue,
  Progress,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useDropzone } from 'react-dropzone'
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi'

interface DatasetUploaderProps {
  isOpen: boolean
  onClose: () => void
}

export default function DatasetUploader({ isOpen, onClose }: DatasetUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')

  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const accentColor = useColorModeValue('#EB6100', 'orange.300')
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400')
  const bgHover = useColorModeValue('orange.50', 'rgba(235, 97, 0, 0.1)')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/parquet': ['.parquet'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault()
      setTags(prev => [...new Set([...prev, currentTag.trim()])])
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const handleUpload = async () => {
    setUploading(true)
    // 업로드 시뮬레이션
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setProgress(i)
    }
    setUploading(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>새 데이터셋 업로드</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            {/* 드래그 앤 드롭 영역 */}
            <Box
              {...getRootProps()}
              w="full"
              borderWidth={2}
              borderStyle="dashed"
              borderColor={isDragActive ? accentColor : borderColor}
              borderRadius="lg"
              p={10}
              textAlign="center"
              bg={isDragActive ? bgHover : 'transparent'}
              transition="all 0.2s"
              _hover={{ borderColor: accentColor, bg: bgHover }}
              cursor="pointer"
            >
              <input {...getInputProps()} />
              <VStack spacing={4}>
                <Icon as={FiUploadCloud} boxSize={12} color={accentColor} />
                <Box>
                  <Text fontWeight="medium">
                    {isDragActive
                      ? '파일을 여기에 놓으세요'
                      : '파일을 드래그하거나 클릭하여 업로드'}
                  </Text>
                  <Text fontSize="sm" color={mutedTextColor} mt={1}>
                    CSV, JSON, Parquet, 이미지 파일 지원
                  </Text>
                </Box>
              </VStack>
            </Box>

            {/* 선택된 파일 목록 */}
            {files.length > 0 && (
              <VStack w="full" align="stretch" spacing={2}>
                <Text fontSize="sm" fontWeight="medium">선택된 파일</Text>
                {files.map((file, index) => (
                  <HStack
                    key={index}
                    p={2}
                    bg="gray.50"
                    borderRadius="md"
                    justify="space-between"
                  >
                    <HStack>
                      <Icon as={FiFile} color={accentColor} />
                      <Text fontSize="sm">{file.name}</Text>
                      <Text fontSize="xs" color={mutedTextColor}>
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </Text>
                    </HStack>
                    <Icon
                      as={FiX}
                      cursor="pointer"
                      onClick={() => removeFile(index)}
                      _hover={{ color: 'red.500' }}
                    />
                  </HStack>
                ))}
              </VStack>
            )}

            {/* 업로드 설정 */}
            <VStack w="full" align="stretch" spacing={4}>
              <FormControl>
                <FormLabel>데이터셋 이름</FormLabel>
                <Input placeholder="데이터셋 이름을 입력하세요" />
              </FormControl>

              <FormControl>
                <FormLabel>설명</FormLabel>
                <Textarea placeholder="데이터셋에 대한 설명을 입력하세요" />
              </FormControl>

              <FormControl>
                <FormLabel>태그</FormLabel>
                <VStack align="stretch" spacing={2}>
                  <Input
                    placeholder="Enter를 눌러 태그 추가"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                  {tags.length > 0 && (
                    <Wrap spacing={2}>
                      {tags.map((tag) => (
                        <WrapItem key={tag}>
                          <Tag
                            size="md"
                            borderRadius="full"
                            variant="solid"
                            bg={accentColor}
                          >
                            <TagLabel>{tag}</TagLabel>
                            <TagCloseButton onClick={() => removeTag(tag)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </VStack>
              </FormControl>
            </VStack>

            {/* 업로드 진행바 */}
            {uploading && (
              <Box w="full">
                <Progress
                  value={progress}
                  size="sm"
                  colorScheme="orange"
                  borderRadius="full"
                />
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            취소
          </Button>
          <Button
            colorScheme="orange"
            onClick={handleUpload}
            isLoading={uploading}
            loadingText="업로드 중..."
          >
            업로드
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
