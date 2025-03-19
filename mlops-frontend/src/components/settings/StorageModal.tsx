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

interface StorageModalProps {
  isOpen: boolean
  onClose: () => void
  storage?: {
    id: number
    name: string
    type: string
    path: string
    capacity: string
    used: string
    status: string
  }
}

export default function StorageModal({ isOpen, onClose, storage }: StorageModalProps) {
  const { addStorage, updateStorage } = useSettingsStore()
  const [formData, setFormData] = useState({
    name: storage?.name || '',
    type: storage?.type || 'Local',
    path: storage?.path || '',
    capacity: storage?.capacity || '',
    used: storage?.used || '0GB',
    status: storage?.status || 'Active',
  })

  const handleSubmit = () => {
    if (storage) {
      updateStorage({ ...storage, ...formData })
    } else {
      addStorage(formData)
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{storage ? '스토리지 수정' : '스토리지 추가'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>이름</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="스토리지 이름"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>유형</FormLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Local">Local</option>
                <option value="S3">AWS S3</option>
                <option value="GCS">Google Cloud Storage</option>
                <option value="Azure">Azure Blob Storage</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>경로</FormLabel>
              <Input
                value={formData.path}
                onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                placeholder="예: C:/mlops/models"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>용량</FormLabel>
              <Input
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="예: 500GB, 1TB"
              />
            </FormControl>

            {storage && (
              <FormControl>
                <FormLabel>사용량</FormLabel>
                <Input
                  value={formData.used}
                  onChange={(e) => setFormData({ ...formData, used: e.target.value })}
                  placeholder="0GB"
                />
              </FormControl>
            )}

            <FormControl isRequired>
              <FormLabel>상태</FormLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            취소
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            {storage ? '수정' : '추가'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
