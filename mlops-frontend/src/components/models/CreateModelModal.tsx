// 'use client'

// import {
//   Button,
//   FormControl,
//   FormLabel,
//   Input,
//   Modal,
//   ModalBody,
//   ModalCloseButton,
//   ModalContent,
//   ModalFooter,
//   ModalHeader,
//   ModalOverlay,
//   Select,
//   Stack,
//   Textarea,
//   useToast,
// } from '@chakra-ui/react'
// import { useState, useEffect } from 'react'
// import { FileUpload } from '../common/FileUpload'

// interface CreateModelModalProps {
//   isOpen: boolean
//   onClose: () => void
// }

// export function CreateModelModal({ isOpen, onClose }: CreateModelModalProps) {
//   const toast = useToast()
//   const [isLoading, setIsLoading] = useState(false)
//   const [modelFile, setModelFile] = useState<File | null>(null)
//   const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

//   // State to store framework and dataset options
//   const [frameworks, setFrameworks] = useState<string[]>([])
//   const [datasets, setDatasets] = useState<string[]>([])

//   // Fetch data for frameworks and datasets
//   useEffect(() => {
//     const fetchItems = async () => {
//       try {
//         const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/models/create/items`)
//         const data = await response.json()

//         setFrameworks(data.framework || [])
//         setDatasets(data.dataset || [])
//       } catch (error) {
//         toast({
//           title: '옵션 로딩 실패',
//           description: '프레임워크 및 데이터셋을 불러오지 못했습니다.',
//           status: 'error',
//           duration: 3000,
//         })
//       }
//     }

//     fetchItems()
//   }, [toast])

//   const uploadThumbnail = async (file: File) => {
//     const formData = new FormData();
//     formData.append("image_file", file);
  
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_NODE_API}/api/upload-thumbnail`, {
//         method: "POST",
//         body: formData,
//       });
  
//       if (!response.ok) {
//         throw new Error("Thumbnail upload failed");
//       }
  
//       const data = await response.json();
//       return data.filePath; // 원래 파일 이름으로 반환된 경로
//     } catch (error) {
//       console.error("Thumbnail upload error:", error);
//       return null;
//     }
//   };
  
//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsLoading(true);
  
//     try {
//       let thumbnailPath = "";
  
//       // 🟢 이미지 파일이 있으면 먼저 업로드
//       if (thumbnailFile) {
//         const uploadedData = await uploadThumbnail(thumbnailFile);
//         if (!uploadedData) throw new Error("Thumbnail upload failed");
//         thumbnailPath = uploadedData;
//       }
  
//       // 🟢 모델 데이터를 API에 전송
//       const formData = new FormData();
//       const target = e.target as HTMLFormElement;
  
//       const modelName = (target.model_name as HTMLInputElement)?.value || "";
//       const modelDescription = (target.model_description as HTMLTextAreaElement)?.value || "";
//       const framework = (target.framework as HTMLSelectElement)?.value || "";
//       const dataset = (target.dataset as HTMLSelectElement)?.value || "";
//       const author = (target.author as HTMLInputElement)?.value || "";
  
//       if (modelName) formData.append("model_name", modelName);
//       if (modelDescription) formData.append("model_description", modelDescription);
//       if (framework) formData.append("framework", framework);
//       if (dataset) formData.append("dataset", dataset);
//       if (author) formData.append("author", author);
//       if (thumbnailFile) formData.append("image_file", thumbnailFile);
//       if (modelFile) formData.append("model_file", modelFile);
  
//       console.log("📤 Payload 보내는 데이터:", Object.fromEntries(formData.entries())); // 디버그
  
//       const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/create/model`, {
//         method: "POST",
//         body: formData,
//       });
  
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("🚨 API 오류:", errorText);
//         throw new Error(errorText);
//       }
  
//       toast({
//         title: "모델이 생성되었습니다.",
//         status: "success",
//         duration: 3000,
//       });
  
//       onClose();
//     } catch (error) {
//       toast({
//         title: "모델 생성 실패",
//         description: "잠시 후 다시 시도해주세요.",
//         status: "error",
//         duration: 3000,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };
  

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} size="xl">
//       <ModalOverlay />
//       <ModalContent as="form" onSubmit={handleSubmit}>
//         <ModalHeader>새 모델 생성</ModalHeader>
//         <ModalCloseButton />
//         <ModalBody>
//           <Stack spacing={6}>
//             <FormControl isRequired>
//               <FormLabel>모델명</FormLabel>
//               <Input name="model_name" placeholder="예: MNIST Classifier v1.0" />
//             </FormControl>

//             <FormControl isRequired>
//               <FormLabel>설명</FormLabel>
//               <Textarea
//                 name="model_description"
//                 placeholder="모델에 대한 간단한 설명을 입력하세요."
//                 rows={3}
//               />
//             </FormControl>

//             <FormControl isRequired>
//               <FormLabel>프레임워크</FormLabel>
//               <Select name="framework" placeholder="프레임워크 선택">
//                 {frameworks.map((framework) => (
//                   <option key={framework} value={framework}>
//                     {framework}
//                   </option>
//                 ))}
//               </Select>
//             </FormControl>

//             <FormControl isRequired>
//               <FormLabel>데이터셋</FormLabel>
//               <Select name="dataset" placeholder="데이터셋 선택">
//                 {datasets.map((dataset) => (
//                   <option key={dataset} value={dataset}>
//                     {dataset}
//                   </option>
//                 ))}
//               </Select>
//             </FormControl>

//             <FormControl isRequired>
//               <FormLabel>모델 파일</FormLabel>
//               <FileUpload
//                 accept={{
//                   'application/x-python-pickle': ['.pkl'],
//                   'application/octet-stream': ['.pth', '.h5', '.joblib', '.pt', '.onnx'],
//                 }}
//                 onFileSelect={setModelFile}
//                 placeholder="모델 파일을 드래그하여 업로드하거나 클릭하여 선택하세요"
//               />
//             </FormControl>

//             <FormControl>
//               <FormLabel>썸네일 이미지</FormLabel>
//               <FileUpload
//                 accept={{
//                   'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
//                 }}
//                 onFileSelect={setThumbnailFile}
//                 placeholder="이미지 파일을 드래그하여 업로드하거나 클릭하여 선택하세요"
//               />
//             </FormControl>
//           </Stack>
//         </ModalBody>

//         <ModalFooter>
//           <Button mr={3} onClick={onClose} variant="ghost">
//             취소
//           </Button>
//           <Button colorScheme="orange" isLoading={isLoading} type="submit">
//             생성
//           </Button>
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   )
// }

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
  Stack,
  Textarea,
  useToast,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FileUpload } from '../common/FileUpload'

interface CreateModelModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateModelModal({ isOpen, onClose }: CreateModelModalProps) {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  // State to store framework and dataset options
  const [frameworks, setFrameworks] = useState<string[]>([])
  const [datasets, setDatasets] = useState<string[]>([])

  // Fetch data for frameworks and datasets
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/models/create/items`)
        const data = await response.json()

        setFrameworks(data.framework || [])
        setDatasets(data.dataset || [])
      } catch (error) {
        toast({
          title: '옵션 로딩 실패',
          description: '프레임워크 및 데이터셋을 불러오지 못했습니다.',
          status: 'error',
          duration: 3000,
        })
      }
    }

    fetchItems()
  }, [toast])

  const uploadThumbnail = async (file: File, modelName: string) => {
    const formData = new FormData();
    formData.append("image_file", file);
    formData.append("model_name", modelName); // 🟢 gửi kèm model_name để server đổi tên
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_NODE_API}/api/upload-thumbnail`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Thumbnail upload failed");
      }
  
      const data = await response.json();
      return data.filePath; // Ex: /model-thumbnails/your_model_thum.png
    } catch (error) {
      console.error("Thumbnail upload error:", error);
      return null;
    }
  };
  
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const target = e.target as HTMLFormElement;
    const modelName = (target.model_name as HTMLInputElement)?.value || "";
  
    try {
      let thumbnailPath = "";
  
      if (thumbnailFile) {
        const uploadedData = await uploadThumbnail(thumbnailFile, modelName); // ✅ OK
        if (!uploadedData) throw new Error("Thumbnail upload failed");
        thumbnailPath = uploadedData;
      }
  
      // 🟢 모델 데이터를 API에 전송
      const formData = new FormData();
      const modelDescription = (target.model_description as HTMLTextAreaElement)?.value || "";
      const framework = (target.framework as HTMLSelectElement)?.value || "";
      // const dataset = (target.dataset as HTMLSelectElement)?.value || "";
      const dataset = (target.elements.namedItem("dataset") as HTMLSelectElement)?.value || "";
      const author = (target.author as HTMLInputElement)?.value || "";
  
      if (modelName) formData.append("model_name", modelName);
      if (modelDescription) formData.append("model_description", modelDescription);
      if (framework) formData.append("framework", framework);
      if (dataset) formData.append("dataset", dataset);
      if (author) formData.append("author", author);
      if (thumbnailFile) formData.append("image_file", thumbnailFile);
      if (modelFile) formData.append("model_file", modelFile);
  
      console.log("📤 Payload 보내는 데이터:", Object.fromEntries(formData.entries())); // 디버그
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/create/model`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("🚨 API 오류:", errorText);
        throw new Error(errorText);
      }
  
      toast({
        title: "모델이 생성되었습니다.",
        status: "success",
        duration: 3000,
      });
  
      onClose();
    } catch (error) {
      toast({
        title: "모델 생성 실패",
        description: "잠시 후 다시 시도해주세요.",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>새 모델 생성</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={6}>
            <FormControl isRequired>
              <FormLabel>모델명</FormLabel>
              <Input name="model_name" placeholder="예: MNIST Classifier v1.0" />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>설명</FormLabel>
              <Textarea
                name="model_description"
                placeholder="모델에 대한 간단한 설명을 입력하세요."
                rows={3}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>프레임워크</FormLabel>
              <Select name="framework" placeholder="프레임워크 선택">
                {frameworks.map((framework) => (
                  <option key={framework} value={framework}>
                    {framework}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>데이터셋</FormLabel>
              <Select name="dataset" placeholder="데이터셋 선택">
                {datasets.map((dataset) => (
                  <option key={dataset} value={dataset}>
                    {dataset}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>모델 파일</FormLabel>
              <FileUpload
                accept={{
                  'application/x-python-pickle': ['.pkl'],
                  'application/octet-stream': ['.pth', '.h5', '.joblib', '.pt', '.onnx'],
                }}
                onFileSelect={(files: File[]) => setModelFile(files[0] || null)}
                placeholder="모델 파일을 드래그하여 업로드하거나 클릭하여 선택하세요"
              />
            </FormControl>

            <FormControl>
              <FormLabel>썸네일 이미지</FormLabel>
              <FileUpload
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                }}
                onFileSelect={(files: File[]) => setThumbnailFile(files[0] || null)} 
                placeholder="이미지 파일을 드래그하여 업로드하거나 클릭하여 선택하세요"
              />
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose} variant="ghost">
            취소
          </Button>
          <Button colorScheme="orange" isLoading={isLoading} type="submit">
            생성
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}