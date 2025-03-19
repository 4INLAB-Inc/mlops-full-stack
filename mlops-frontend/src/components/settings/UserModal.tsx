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

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  user?: {
    id: number
    name: string
    email: string
    role: string
    status: string
  }
}

export default function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const { addUser, updateUser } = useSettingsStore()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Viewer',
    status: user?.status || 'Active',
  })

  const handleSubmit = () => {
    if (user) {
      updateUser({ ...user, ...formData })
    } else {
      addUser(formData)
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{user ? '사용자 수정' : '사용자 추가'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>이름</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="사용자 이름"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>이메일</FormLabel>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>역할</FormLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Admin">Admin</option>
                <option value="Developer">Developer</option>
                <option value="Viewer">Viewer</option>
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
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            취소
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            {user ? '수정' : '추가'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
