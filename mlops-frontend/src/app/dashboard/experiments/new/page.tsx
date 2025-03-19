'use client';

import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewExperimentPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // State of data from form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dataset: '',
    model: '',
    learningRate: '0.001',
    batchSize: '32',
    epochs: '10',
  });

  // State of list dataset & model from API
  const [datasets, setDatasets] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  // Call API to get list of dataset & model
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('http://192.168.219.52:8686/api/create/options');
        if (!response.ok) throw new Error('Failed to fetch options');

        const data = await response.json();
        setDatasets(data.dataset || []);
        setModels(data.model || []);
      } catch (error) {
        console.error('Error fetching options:', error);
        toast({
          title: '옵션 로딩 실패',
          description: '옵션 데이터를 불러오지 못했습니다. 다시 시도해 주세요.',
          status: 'error',
          duration: 3000,
        });
      }
    };

    fetchOptions();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    // Check data before sending
    if (!formData.name || !formData.dataset || !formData.model) {
      toast({
        title: '입력 오류',
        description: '실험 이름, 데이터셋, 모델을 선택해야 합니다.',
        status: 'warning',
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }
  
    // Convert data format to form-urlencoded
    const formBody = new URLSearchParams();
    formBody.append('name', formData.name);
    formBody.append('description', formData.description);
    formBody.append('dataset', formData.dataset);
    formBody.append('model', formData.model);
    formBody.append('learningRate', String(formData.learningRate));
    formBody.append('batchSize', String(formData.batchSize));
    formBody.append('epochs', String(formData.epochs));
  
    console.log('📤 Form Body trước khi gửi:', formBody.toString());
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/create/experiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });
  
      const responseData = await response.json();
      console.log('📥 API Response:', responseData);
  
      if (!response.ok) {
        console.error('🚨 API Error:', responseData);
        throw new Error('실험 생성 실패');
      }
  
      toast({
        title: '실험이 성공적으로 생성되었습니다.',
        status: 'success',
        duration: 3000,
      });
  
      router.push('/dashboard/experiments');
    } catch (error) {
      console.error('Error creating experiment:', error);
      toast({
        title: '실험 생성 실패',
        description: '서버 오류가 발생했습니다. 다시 시도해 주세요.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <Box pt="80px" px="4">
      <Card>
        <CardBody>
          <Stack spacing={8} as="form" onSubmit={handleSubmit}>
            <Stack>
              <Heading size="lg">새 실험 생성</Heading>
              <Text color="gray.500">새로운 머신러닝 실험을 설정하고 시작하세요</Text>
            </Stack>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <FormControl isRequired>
                  <FormLabel>실험 이름</FormLabel>
                  <Input
                    placeholder="실험 이름을 입력하세요"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </FormControl>
              </GridItem>

              <GridItem colSpan={{ base: 1, md: 2 }}>
                <FormControl>
                  <FormLabel>설명</FormLabel>
                  <Input
                    placeholder="실험에 대한 설명을 입력하세요"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired>
                  <FormLabel>데이터셋</FormLabel>
                  <Select
                    placeholder="데이터셋 선택"
                    value={formData.dataset}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dataset: e.target.value }))}
                  >
                    {datasets.map((dataset) => (
                      <option key={dataset} value={dataset}>
                        {dataset}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired>
                  <FormLabel>모델</FormLabel>
                  <Select
                    placeholder="모델 선택"
                    value={formData.model}
                    onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                  >
                    {models.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Learning Rate</FormLabel>
                  <Input
                    type="number"
                    step="0.0001"
                    value={formData.learningRate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, learningRate: e.target.value }))}
                  />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Batch Size</FormLabel>
                  <Input
                    type="number"
                    value={formData.batchSize}
                    onChange={(e) => setFormData((prev) => ({ ...prev, batchSize: e.target.value }))}
                  />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Epochs</FormLabel>
                  <Input
                    type="number"
                    value={formData.epochs}
                    onChange={(e) => setFormData((prev) => ({ ...prev, epochs: e.target.value }))}
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <Stack direction="row" spacing={4} justify="flex-end">
              <Button variant="ghost" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" colorScheme="brand" isLoading={isLoading}>
                실험 생성
              </Button>
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
}
