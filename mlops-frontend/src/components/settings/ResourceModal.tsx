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

interface ResourceModalProps {
  isOpen: boolean
  onClose: () => void
  resource?: {
    id: number
    name: string
    type: string
    status: string
    capacity: string
    usage: string
  }
}

export default function ResourceModal({ isOpen, onClose, resource }: ResourceModalProps) {
  const { addResource, updateResource } = useSettingsStore()
  const [formData, setFormData] = useState({
    name: resource?.name || '',
    type: resource?.type || 'GPU',
    status: resource?.status || 'Active',
    capacity: resource?.capacity || '',
    usage: resource?.usage || '0%',
  })

  const handleSubmit = () => {
    if (resource) {
      updateResource({ ...resource, ...formData })
    } else {
      addResource(formData)
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{resource ? '리소스 수정' : '리소스 추가'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>이름</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="리소스 이름"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>유형</FormLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="GPU">GPU</option>
                <option value="CPU">CPU</option>
                <option value="Memory">Memory</option>
                <option value="TPU">TPU</option>
              </Select>
            </FormControl>

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

            <FormControl isRequired>
              <FormLabel>용량</FormLabel>
              <Input
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="예: NVIDIA RTX 4090, 16 cores"
              />
            </FormControl>

            {resource && (
              <FormControl>
                <FormLabel>사용량</FormLabel>
                <Input
                  value={formData.usage}
                  onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                  placeholder="0%"
                />
              </FormControl>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            취소
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            {resource ? '수정' : '추가'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
