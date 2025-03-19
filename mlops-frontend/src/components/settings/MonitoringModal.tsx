'use client'

import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  VStack,
} from '@chakra-ui/react'
import { useSettingsStore } from '@/store/settingsStore'
import { useState } from 'react'

interface MonitoringModalProps {
  isOpen: boolean
  onClose: () => void
  config?: {
    id: number
    name: string
    type: string
    threshold: string
    status: string
  }
}

export default function MonitoringModal({ isOpen, onClose, config }: MonitoringModalProps) {
  const { addMonitoringConfig, updateMonitoringConfig } = useSettingsStore()
  const [formData, setFormData] = useState({
    name: config?.name || '',
    type: config?.type || 'Drift',
    threshold: config?.threshold || '',
    status: config?.status || 'Active',
  })

  const handleSubmit = () => {
    if (config) {
      updateMonitoringConfig({ ...config, ...formData })
    } else {
      addMonitoringConfig(formData)
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{config ? '모니터링 수정' : '모니터링 추가'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>이름</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="모니터링 이름"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>유형</FormLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Drift">모델 드리프트</option>
                <option value="Accuracy">정확도</option>
                <option value="Latency">지연 시간</option>
                <option value="Memory">메모리 사용량</option>
                <option value="CPU">CPU 사용량</option>
                <option value="GPU">GPU 사용량</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>임계값</FormLabel>
              <Input
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                placeholder="예: 0.1, 95%, 100ms"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>상태</FormLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            취소
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            {config ? '수정' : '추가'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
