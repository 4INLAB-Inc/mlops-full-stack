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
  FormHelperText,
} from '@chakra-ui/react'
import { useSettingsStore } from '@/store/settingsStore'
import { useState } from 'react'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project?: {
    id: number
    name: string
    users: string[]
  }
}

export default function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const { addProject, updateProject, users } = useSettingsStore()
  const [formData, setFormData] = useState({
    name: project?.name || '',
    users: project?.users || [],
  })

  const handleSubmit = () => {
    if (project) {
      updateProject({ ...project, ...formData })
    } else {
      addProject(formData)
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{project ? '프로젝트 수정' : '프로젝트 추가'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>프로젝트 이름</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="프로젝트 이름"
              />
            </FormControl>

            <FormControl>
              <FormLabel>사용자</FormLabel>
              <Select
                multiple
                value={formData.users}
                onChange={(e) => {
                  const selectedUsers = Array.from(e.target.selectedOptions).map(
                    (option) => option.value
                  )
                  setFormData({ ...formData, users: selectedUsers })
                }}
                height="100px"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.name}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </Select>
              <FormHelperText>
                Ctrl 키를 누른 상태로 여러 사용자를 선택할 수 있습니다.
              </FormHelperText>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            취소
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            {project ? '수정' : '추가'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
