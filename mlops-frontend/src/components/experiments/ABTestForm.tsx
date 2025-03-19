'use client'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Heading,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useDropzone } from 'react-dropzone'

export function ABTestForm() {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      console.log(acceptedFiles)
    },
  })

  const dropzoneStyle = {
    border: '2px dashed',
    borderColor: useColorModeValue('gray.200', 'gray.700'),
    borderRadius: 'md',
    p: 6,
    textAlign: 'center' as const,
    bg: isDragActive
      ? useColorModeValue('gray.50', 'gray.700')
      : 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }

  return (
    <Card>
      <CardHeader>
        <Stack spacing={2}>
          <Heading size="md">A/B 테스트 생성</Heading>
          <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="sm">
            새로운 A/B 테스트를 설정하고 실행하세요
          </Text>
        </Stack>
      </CardHeader>
      <CardBody>
        <Stack spacing={6}>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
            <FormControl isRequired>
              <FormLabel>실험 이름</FormLabel>
              <Input placeholder="예: 이미지 분류 모델 비교" />
              <FormHelperText>실험을 구분할 수 있는 이름</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>실험 기간</FormLabel>
              <NumberInput defaultValue={7} min={1} max={30}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>실험 진행 기간 (일)</FormHelperText>
            </FormControl>
          </Grid>

          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
            <FormControl isRequired>
              <FormLabel>모델 A (기존)</FormLabel>
              <Select placeholder="모델 선택">
                <option value="1">이미지 분류 모델 v1.0.0</option>
                <option value="2">객체 감지 모델 v2.1.0</option>
                <option value="3">세그멘테이션 모델 v0.9.0</option>
              </Select>
              <FormHelperText>비교할 기존 모델</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>모델 B (신규)</FormLabel>
              <Select placeholder="모델 선택">
                <option value="4">이미지 분류 모델 v1.1.0</option>
                <option value="5">객체 감지 모델 v2.2.0</option>
                <option value="6">세그멘테이션 모델 v1.0.0</option>
              </Select>
              <FormHelperText>비교할 신규 모델</FormHelperText>
            </FormControl>
          </Grid>

          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
            <FormControl isRequired>
              <FormLabel>트래픽 분배 비율 (A:B)</FormLabel>
              <Grid templateColumns="1fr auto 1fr" gap={2} alignItems="center">
                <NumberInput defaultValue={50} min={1} max={99}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text>:</Text>
                <NumberInput defaultValue={50} min={1} max={99}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Grid>
              <FormHelperText>각 모델에 할당할 트래픽 비율</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>평가 지표</FormLabel>
              <Select placeholder="지표 선택">
                <option value="accuracy">정확도</option>
                <option value="f1">F1 Score</option>
                <option value="precision">정밀도</option>
                <option value="recall">재현율</option>
                <option value="latency">지연 시간</option>
              </Select>
              <FormHelperText>모델 성능을 비교할 주요 지표</FormHelperText>
            </FormControl>
          </Grid>

          <FormControl>
            <FormLabel>테스트 데이터셋</FormLabel>
            <Box {...getRootProps()} sx={dropzoneStyle}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <Text>파일을 여기에 놓으세요</Text>
              ) : (
                <Text>
                  테스트에 사용할 데이터셋을 드래그하거나 클릭하여 업로드하세요
                  <br />
                  <Text as="span" fontSize="sm" color="gray.500">
                    (JSON 또는 CSV 파일)
                  </Text>
                </Text>
              )}
            </Box>
            <FormHelperText>
              모델 성능을 평가할 테스트 데이터셋
            </FormHelperText>
          </FormControl>

          <Button size="lg" colorScheme="brand">
            실험 시작
          </Button>
        </Stack>
      </CardBody>
    </Card>
  )
}
