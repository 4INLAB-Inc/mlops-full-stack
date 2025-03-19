'use client'

import { PageContainer } from '@/components/layout/PageContainer'
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  HStack,
  Input,
  Select,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'

export default function SettingsPage() {
  const textColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <PageContainer title="설정" subtitle="시스템 설정을 관리하세요">
      <Card>
        <CardBody>
          <Tabs>
            <TabList>
              <Tab>일반</Tab>
              <Tab>GPU</Tab>
              <Tab>스토리지</Tab>
              <Tab>알림</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Stack spacing={6}>
                  <Box>
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color={useColorModeValue('gray.700', 'white')}
                      mb={4}
                    >
                      일반 설정
                    </Text>
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                      <FormControl>
                        <FormLabel>언어</FormLabel>
                        <Select defaultValue="ko">
                          <option value="ko">한국어</option>
                          <option value="en">English</option>
                          <option value="ja">日本語</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>시간대</FormLabel>
                        <Select defaultValue="Asia/Seoul">
                          <option value="Asia/Seoul">서울 (UTC+9)</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">뉴욕 (UTC-5)</option>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Box>

                  <Box>
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color={useColorModeValue('gray.700', 'white')}
                      mb={4}
                    >
                      보안
                    </Text>
                    <Stack spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">2단계 인증 사용</FormLabel>
                        <Switch colorScheme="brand" />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">자동 로그아웃</FormLabel>
                        <Switch colorScheme="brand" defaultChecked />
                      </FormControl>
                    </Stack>
                  </Box>
                </Stack>
              </TabPanel>

              <TabPanel>
                <Stack spacing={6}>
                  <Box>
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color={useColorModeValue('gray.700', 'white')}
                      mb={4}
                    >
                      GPU 설정
                    </Text>
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                      <FormControl>
                        <FormLabel>CUDA 버전</FormLabel>
                        <Select defaultValue="11.8">
                          <option value="11.8">CUDA 11.8</option>
                          <option value="11.7">CUDA 11.7</option>
                          <option value="11.6">CUDA 11.6</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>메모리 제한 (GB)</FormLabel>
                        <Input type="number" defaultValue={16} />
                        <FormHelperText>
                          GPU당 최대 사용 가능한 메모리
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                  </Box>

                  <Box>
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color={useColorModeValue('gray.700', 'white')}
                      mb={4}
                    >
                      자동 스케일링
                    </Text>
                    <Stack spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">자동 스케일링 활성화</FormLabel>
                        <Switch colorScheme="brand" defaultChecked />
                      </FormControl>
                      <FormControl>
                        <FormLabel>최소 GPU 수</FormLabel>
                        <Input type="number" defaultValue={1} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>최대 GPU 수</FormLabel>
                        <Input type="number" defaultValue={4} />
                      </FormControl>
                    </Stack>
                  </Box>
                </Stack>
              </TabPanel>

              <TabPanel>
                <Stack spacing={6}>
                  <Box>
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color={useColorModeValue('gray.700', 'white')}
                      mb={4}
                    >
                      스토리지 설정
                    </Text>
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                      <FormControl>
                        <FormLabel>저장소 유형</FormLabel>
                        <Select defaultValue="local">
                          <option value="local">로컬 스토리지</option>
                          <option value="s3">Amazon S3</option>
                          <option value="gcs">Google Cloud Storage</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>캐시 크기 (GB)</FormLabel>
                        <Input type="number" defaultValue={32} />
                      </FormControl>
                    </Grid>
                  </Box>

                  <Box>
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color={useColorModeValue('gray.700', 'white')}
                      mb={4}
                    >
                      백업 설정
                    </Text>
                    <Stack spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">자동 백업 활성화</FormLabel>
                        <Switch colorScheme="brand" defaultChecked />
                      </FormControl>
                      <FormControl>
                        <FormLabel>백업 주기</FormLabel>
                        <Select defaultValue="daily">
                          <option value="hourly">매시간</option>
                          <option value="daily">매일</option>
                          <option value="weekly">매주</option>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Box>
                </Stack>
              </TabPanel>

              <TabPanel>
                <Stack spacing={6}>
                  <Box>
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color={useColorModeValue('gray.700', 'white')}
                      mb={4}
                    >
                      알림 설정
                    </Text>
                    <Stack spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">이메일 알림</FormLabel>
                        <Switch colorScheme="brand" defaultChecked />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">슬랙 알림</FormLabel>
                        <Switch colorScheme="brand" />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">브라우저 알림</FormLabel>
                        <Switch colorScheme="brand" defaultChecked />
                      </FormControl>
                    </Stack>
                  </Box>

                  <Box>
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color={useColorModeValue('gray.700', 'white')}
                      mb={4}
                    >
                      알림 이벤트
                    </Text>
                    <Stack spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">모델 학습 완료</FormLabel>
                        <Switch colorScheme="brand" defaultChecked />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">에러 발생</FormLabel>
                        <Switch colorScheme="brand" defaultChecked />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">리소스 사용량 경고</FormLabel>
                        <Switch colorScheme="brand" defaultChecked />
                      </FormControl>
                    </Stack>
                  </Box>
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <HStack justify="flex-end" mt={6}>
            <Button variant="outline">취소</Button>
            <Button colorScheme="brand">저장</Button>
          </HStack>
        </CardBody>
      </Card>
    </PageContainer>
  )
}
