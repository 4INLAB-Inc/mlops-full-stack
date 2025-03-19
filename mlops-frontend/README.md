# MLOps Frontend

## 개발 환경 설정

1. 의존성 설치
```bash
npm install
```

2. 개발 서버 실행
```bash
npm run dev
```

## 주요 컴포넌트 구조

### 모델 관련 (/components/models)
- `ModelCard.tsx`: 모델 카드 컴포넌트
- `ModelDeployment.tsx`: 모델 배포 관리
- `ModelVersions.tsx`: 버전 관리
- `PerformanceTab.tsx`: 성능 메트릭스 시각화

### 데이터셋 관련 (/components/datasets)
- `DatasetDetail.tsx`: 데이터셋 상세 정보
- `DatasetList.tsx`: 데이터셋 목록
- `DatasetUpload.tsx`: 데이터셋 업로드

### 실험 관련 (/components/experiments)
- `ExperimentDetail.tsx`: 실험 상세 정보
- `ExperimentList.tsx`: 실험 목록
- `ExperimentMetrics.tsx`: 실험 메트릭스

## API 연동

### 엔드포인트
- 모델: `/api/models`
- 데이터셋: `/api/datasets`
- 실험: `/api/experiments`
- 파이프라인: `/api/pipelines`

### 환경 변수
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## 상태 관리

### Zustand 스토어
- `useModelStore`: 모델 관련 상태
- `useDatasetStore`: 데이터셋 관련 상태
- `useExperimentStore`: 실험 관련 상태

## 스타일 가이드

### 컬러 팔레트
```typescript
export const colors = {
  primary: '#ED8936',
  secondary: '#4A5568',
  success: '#48BB78',
  error: '#E53E3E',
  warning: '#ECC94B'
}
```

### 컴포넌트 스타일링
- Chakra UI 테마 커스터마이징
- 반응형 디자인 브레이크포인트
- 다크모드 지원

## 자주 발생하는 이슈

1. WebSocket 연결 오류
   - 백엔드 서버 실행 확인
   - 환경변수 WS_URL 확인

2. 차트 렌더링 이슈
   - 데이터 포맷 확인
   - 브라우저 콘솔 에러 확인

3. 배포 관련 이슈
   - 환경변수 설정 확인
   - 빌드 로그 확인

## 유용한 명령어

```bash
# 린트 체크
npm run lint

# 타입 체크
npm run type-check

# 테스트 실행
npm run test

# 빌드
npm run build

# 린트 + 타입체크 + 빌드
npm run verify
```

## 1. 개발 환경 설정

### 1.1 필수 요구사항
- Node.js 18.0.0 이상
- npm 9.0.0 이상
- Git
- VS Code (권장)
- npm install axios express multer cors

### 1.2 VS Code 추천 확장
- ESLint
- Prettier
- GitLens
- Error Lens
- Chakra UI Docs

### 1.3 초기 설정

1. 저장소 클론
```bash
git clone https://github.com/4INLAB-Inc/mlops-frontend.git
cd mlops-frontend
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
# .env.local 파일 생성
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
```

4. 개발 서버 실행
```bash
npm run dev
```

## 2. 프로젝트 구조

### 2.1 디렉토리 구조
```
src/
├── app/                # Next.js 페이지 및 라우팅
│   ├── (auth)/        # 인증 관련 페이지
│   ├── dashboard/     # 대시보드 페이지
│   └── api/          # API 라우트
├── components/         # 재사용 가능한 컴포넌트
│   ├── auth/         # 인증 관련 컴포넌트
│   ├── charts/       # 차트 컴포넌트
│   ├── common/       # 공통 컴포넌트
│   ├── dashboard/    # 대시보드 관련 컴포넌트
│   ├── datasets/     # 데이터셋 관련 컴포넌트
│   ├── experiments/  # 실험 관련 컴포넌트
│   ├── layout/       # 레이아웃 컴포넌트
│   ├── models/       # 모델 관련 컴포넌트
│   └── ui/          # UI 기본 컴포넌트
└── lib/              # 유틸리티 및 설정
    ├── api/          # API 클라이언트
    ├── hooks/        # 커스텀 훅
    ├── store/        # 상태 관리
    └── utils/        # 유틸리티 함수
```

### 2.2 주요 컴포넌트 상세

#### 모델 관련 (/components/models)
- `ModelCard.tsx`: 모델 카드 컴포넌트
  - 모델 기본 정보 표시
  - 성능 메트릭스 요약
  - 배포 상태 표시
  - 버전 정보

- `ModelDeployment.tsx`: 모델 배포 관리
  - 배포 상태 관리
  - 롤백 기능
  - 배포 이력 관리
  - 리소스 사용량 모니터링

- `ModelVersions.tsx`: 버전 관리
  - 버전 비교 기능
  - 버전 메타데이터
  - 변경 이력 추적
  - 성능 비교

- `PerformanceTab.tsx`: 성능 메트릭스 시각화
  - 학습 곡선
  - 혼동 행렬
  - ROC 커브
  - 성능 지표 대시보드

#### 데이터셋 관련 (/components/datasets)
- `DatasetDetail.tsx`: 데이터셋 상세 정보
  - 데이터 통계
  - 품질 메트릭스
  - 스키마 정보
  - 버전 관리

- `DatasetList.tsx`: 데이터셋 목록
  - 필터링 및 정렬
  - 페이지네이션
  - 검색 기능
  - 상태 표시

#### 실험 관련 (/components/experiments)
- `ExperimentDetail.tsx`: 실험 상세 정보
  - 실험 설정
  - 학습 과정
  - 결과 분석
  - 리소스 사용량

## 3. API 연동

### 3.1 엔드포인트
```typescript
const API_ENDPOINTS = {
  // 모델 관련
  MODELS: {
    BASE: '/api/models',
    DETAIL: (id: string) => `/api/models/${id}`,
    VERSIONS: (id: string) => `/api/models/${id}/versions`,
    DEPLOY: (id: string) => `/api/models/${id}/deploy`,
    ROLLBACK: (id: string) => `/api/models/${id}/rollback`,
  },
  
  // 데이터셋 관련
  DATASETS: {
    BASE: '/api/datasets',
    DETAIL: (id: string) => `/api/datasets/${id}`,
    VERSIONS: (id: string) => `/api/datasets/${id}/versions`,
    UPLOAD: '/api/datasets/upload',
  },
  
  // 실험 관련
  EXPERIMENTS: {
    BASE: '/api/experiments',
    DETAIL: (id: string) => `/api/experiments/${id}`,
    METRICS: (id: string) => `/api/experiments/${id}/metrics`,
    LOGS: (id: string) => `/api/experiments/${id}/logs`,
  }
}
```

### 3.2 API 클라이언트 사용
```typescript
import { api } from '@/lib/api'

// GET 요청
const getModel = async (id: string) => {
  const response = await api.get(API_ENDPOINTS.MODELS.DETAIL(id))
  return response.data
}

// POST 요청
const deployModel = async (id: string, version: string) => {
  const response = await api.post(API_ENDPOINTS.MODELS.DEPLOY(id), { version })
  return response.data
}
```

## 4. 상태 관리

### 4.1 Zustand 스토어
```typescript
// 모델 스토어
interface ModelStore {
  models: Model[]
  selectedModel: Model | null
  loading: boolean
  error: Error | null
  fetchModels: () => Promise<void>
  selectModel: (id: string) => void
  deployModel: (id: string, version: string) => Promise<void>
}

// 데이터셋 스토어
interface DatasetStore {
  datasets: Dataset[]
  selectedDataset: Dataset | null
  loading: boolean
  error: Error | null
  fetchDatasets: () => Promise<void>
  selectDataset: (id: string) => void
  uploadDataset: (file: File) => Promise<void>
}
```

### 4.2 React Query 사용
```typescript
// 쿼리 키 상수
export const QUERY_KEYS = {
  MODELS: 'models',
  DATASETS: 'datasets',
  EXPERIMENTS: 'experiments',
}

// 쿼리 훅 예시
export const useModel = (id: string) => {
  return useQuery([QUERY_KEYS.MODELS, id], () => getModel(id))
}
```

## 5. 스타일 가이드

### 5.1 컬러 팔레트
```typescript
export const colors = {
  primary: {
    50: '#FFF5F5',
    100: '#FED7D7',
    500: '#ED8936',
    600: '#DD6B20',
    700: '#C05621',
  },
  secondary: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    500: '#4A5568',
    600: '#2D3748',
    700: '#1A202C',
  },
  success: {
    500: '#48BB78',
    600: '#38A169',
  },
  error: {
    500: '#E53E3E',
    600: '#C53030',
  },
  warning: {
    500: '#ECC94B',
    600: '#D69E2E',
  }
}
```

### 5.2 반응형 디자인
```typescript
export const breakpoints = {
  sm: '30em',    // 480px
  md: '48em',    // 768px
  lg: '62em',    // 992px
  xl: '80em',    // 1280px
  '2xl': '96em', // 1536px
}
```

## 6. 자주 발생하는 이슈

### 6.1 WebSocket 연결 오류
1. 증상
   - 실시간 업데이트 안됨
   - 콘솔에 WebSocket 연결 오류

2. 해결방법
   ```typescript
   // WebSocket 재연결 로직
   const ws = new WebSocket(WS_URL)
   ws.onclose = () => {
     setTimeout(() => {
       connectWebSocket()
     }, 1000)
   }
   ```

### 6.2 차트 렌더링 이슈
1. 증상
   - 차트 데이터 업데이트 안됨
   - 차트 크기 잘못됨

2. 해결방법
   ```typescript
   // 차트 컨테이너에 명시적 크기 지정
   <Box h="400px" w="100%">
     <ResponsiveContainer>
       <LineChart data={data}>
         {/* ... */}
       </LineChart>
     </ResponsiveContainer>
   </Box>
   ```

## 7. 유용한 개발 명령어

### 7.1 기본 명령어
```bash
# 개발 서버
npm run dev

# 린트 체크
npm run lint

# 타입 체크
npm run type-check

# 테스트
npm run test
npm run test:watch    # 감시 모드
npm run test:coverage # 커버리지 리포트

# 빌드
npm run build
npm run start        # 프로덕션 서버

# 전체 검증
npm run verify       # lint + type-check + build
```

### 7.2 Git 관련 명령어
```bash
# 브랜치 생성
git checkout -b feature/new-feature

# 변경사항 스테이징
git add .

# 커밋
git commit -m "feat: 새로운 기능 추가"

# 원격 저장소 푸시
git push origin feature/new-feature
```

## 8. 성능 최적화

### 8.1 메모이제이션
```typescript
// 컴포넌트 메모이제이션
const MemoizedChart = React.memo(({ data }) => {
  return <LineChart data={data} />
})

// 값 메모이제이션
const memoizedValue = useMemo(() => {
  return heavyComputation(data)
}, [data])

// 콜백 메모이제이션
const memoizedCallback = useCallback(() => {
  handleData(data)
}, [data])
```

### 8.2 이미지 최적화
```typescript
// Next.js Image 컴포넌트 사용
import Image from 'next/image'

const OptimizedImage = () => {
  return (
    <Image
      src="/images/chart.png"
      alt="Performance Chart"
      width={600}
      height={400}
      placeholder="blur"
      priority
    />
  )
}
```

## 9. 배포

### 9.1 환경별 설정
```bash
# 개발 환경
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# 스테이징 환경
NEXT_PUBLIC_API_URL=https://staging-api.4inlab.com
NEXT_PUBLIC_WS_URL=wss://staging-api.4inlab.com

# 프로덕션 환경
NEXT_PUBLIC_API_URL=https://api.4inlab.com
NEXT_PUBLIC_WS_URL=wss://api.4inlab.com


NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_SERVER_NODE_API=http://localhost:4000
NEXT_PUBLIC_MLOPS_BACKEND_API_URL=http://192.168.219.52:8686
NEXTAUTH_URL=http://localhost:3000

NEXTAUTH_SECRET=Zf3k2oXx9P0rBp1p9Hq3A8MkxA2v7HtM
NEXTAUTH_JWT_SECRET=Q5jvhvJ8Np0aD9xDt59d5h2Jv14lKQOp
```

### 9.2 배포 체크리스트
1. 환경 변수 확인
2. 빌드 테스트
3. 타입 체크
4. 린트 체크
5. 테스트 실행
6. 성능 테스트
7. 접근성 검사

## 10. 문제 해결 가이드

### 10.1 빌드 오류
1. 의존성 충돌
   ```bash
   # node_modules 삭제 후 재설치
   rm -rf node_modules
   npm install
   ```

2. 타입 오류
   ```bash
   # 타입 정의 파일 재생성
   npm run type-check
   ```

### 10.2 런타임 오류
1. API 오류 처리
   ```typescript
   try {
     const response = await api.get('/api/data')
   } catch (error) {
     if (error.response?.status === 404) {
       // 리소스 없음 처리
     } else if (error.response?.status === 401) {
       // 인증 오류 처리
     } else {
       // 기타 오류 처리
     }
   }
   ```

2. 상태 관리 오류
   ```typescript
   // 디버깅을 위한 미들웨어 추가
   const store = create(
     devtools(
       persist(
         (set) => ({
           // store implementation
         }),
         { name: 'app-storage' }
       )
     )
   )
   ```
