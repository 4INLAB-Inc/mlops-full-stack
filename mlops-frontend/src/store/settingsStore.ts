import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 타입 정의
interface Resource {
  id: number
  name: string
  type: string
  status: string
  capacity: string
  usage: string
}

interface Storage {
  id: number
  name: string
  type: string
  path: string
  capacity: string
  used: string
  status: string
}

interface MonitoringConfig {
  id: number
  name: string
  type: string
  threshold: string
  status: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
}

interface Project {
  id: number
  name: string
  users: string[]
}

interface ActivityLog {
  id: number
  timestamp: string
  user: string
  action: string
  target: string
}

interface SettingsState {
  // 일반 설정
  language: string
  timezone: string
  logPath: string
  sessionTimeout: string
  autoBackup: boolean
  backupPath: string

  // 데이터
  users: User[]
  projects: Project[]
  resources: Resource[]
  storages: Storage[]
  monitoringConfigs: MonitoringConfig[]
  activityLogs: ActivityLog[]

  // 일반 설정 Actions
  setLanguage: (language: string) => void
  setTimezone: (timezone: string) => void
  setLogPath: (logPath: string) => void
  setSessionTimeout: (sessionTimeout: string) => void
  setAutoBackup: (autoBackup: boolean) => void
  setBackupPath: (backupPath: string) => void

  // 리소스 관리 Actions
  addResource: (resource: Omit<Resource, 'id'>) => void
  updateResource: (resource: Resource) => void
  deleteResource: (id: number) => void

  // 스토리지 관리 Actions
  addStorage: (storage: Omit<Storage, 'id'>) => void
  updateStorage: (storage: Storage) => void
  deleteStorage: (id: number) => void

  // 모니터링 설정 Actions
  addMonitoringConfig: (config: Omit<MonitoringConfig, 'id'>) => void
  updateMonitoringConfig: (config: MonitoringConfig) => void
  deleteMonitoringConfig: (id: number) => void

  // 사용자 관리 Actions
  addUser: (user: Omit<User, 'id'>) => void
  updateUser: (user: User) => void
  deleteUser: (id: number) => void

  // 프로젝트 관리 Actions
  addProject: (project: Omit<Project, 'id'>) => void
  updateProject: (project: Project) => void
  deleteProject: (id: number) => void

  // 활동 로그 Actions
  clearActivityLogs: () => void
  addActivityLog: (log: Omit<ActivityLog, 'id'>) => void
}

// 초기 데이터
const initialUsers: User[] = [
  {
    id: 1,
    name: '관리자',
    email: 'admin@mlops.com',
    role: 'Admin',
    status: 'Active'
  },
  {
    id: 2,
    name: '개발자',
    email: 'developer@mlops.com',
    role: 'Developer',
    status: 'Active'
  }
]

const initialProjects: Project[] = [
  {
    id: 1,
    name: '이미지 분류 프로젝트',
    users: ['관리자', '개발자']
  },
  {
    id: 2,
    name: '자연어 처리 프로젝트',
    users: ['개발자']
  }
]

const initialResources: Resource[] = [
  {
    id: 1,
    name: 'GPU 서버 1',
    type: 'GPU',
    status: 'Running',
    capacity: 'NVIDIA A100 40GB',
    usage: '75%'
  },
  {
    id: 2,
    name: 'CPU 서버 1',
    type: 'CPU',
    status: 'Running',
    capacity: '128 cores',
    usage: '45%'
  }
]

const initialStorages: Storage[] = [
  {
    id: 1,
    name: '로컬 스토리지',
    type: 'Local',
    path: 'C:/mlops/data',
    capacity: '1TB',
    used: '650GB',
    status: 'Active'
  },
  {
    id: 2,
    name: 'S3 스토리지',
    type: 'AWS S3',
    path: 's3://mlops-bucket',
    capacity: '5TB',
    used: '2.1TB',
    status: 'Active'
  }
]

const initialMonitoringConfigs: MonitoringConfig[] = [
  {
    id: 1,
    name: '모델 정확도 모니터링',
    type: 'Accuracy',
    threshold: '0.95',
    status: 'Active'
  },
  {
    id: 2,
    name: '데이터 드리프트 모니터링',
    type: 'Drift',
    threshold: '0.1',
    status: 'Active'
  }
]

const initialActivityLogs: ActivityLog[] = [
  {
    id: 1,
    timestamp: '2025-02-20 15:20:31',
    user: '관리자',
    action: '리소스 추가',
    target: 'GPU 서버 1'
  },
  {
    id: 2,
    timestamp: '2025-02-20 15:19:30',
    user: '개발자',
    action: '프로젝트 생성',
    target: '이미지 분류 프로젝트'
  },
  {
    id: 3,
    timestamp: '2025-02-20 15:18:45',
    user: '관리자',
    action: '스토리지 연결',
    target: 'S3 스토리지'
  },
  {
    id: 4,
    timestamp: '2025-02-20 15:17:20',
    user: '개발자',
    action: '모니터링 설정',
    target: '모델 정확도 모니터링'
  },
  {
    id: 5,
    timestamp: '2025-02-20 15:16:10',
    user: '관리자',
    action: '사용자 추가',
    target: '개발자'
  },
  {
    id: 6,
    timestamp: '2025-02-20 15:15:00',
    user: '개발자',
    action: '프로젝트 수정',
    target: '자연어 처리 프로젝트'
  },
  {
    id: 7,
    timestamp: '2025-02-20 15:14:30',
    user: '관리자',
    action: '리소스 수정',
    target: 'CPU 서버 1'
  },
  {
    id: 8,
    timestamp: '2025-02-20 15:13:20',
    user: '개발자',
    action: '모니터링 추가',
    target: '데이터 드리프트 모니터링'
  },
  {
    id: 9,
    timestamp: '2025-02-20 15:12:10',
    user: '관리자',
    action: '백업 설정 변경',
    target: '자동 백업 활성화'
  },
  {
    id: 10,
    timestamp: '2025-02-20 15:11:00',
    user: '개발자',
    action: '언어 설정 변경',
    target: '한국어'
  }
]

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // 초기 상태
      language: 'ko',
      timezone: 'Asia/Seoul',
      logPath: 'C:/mlops/logs',
      sessionTimeout: '30',
      autoBackup: true,
      backupPath: 'C:/mlops/backup',
      users: initialUsers,
      projects: initialProjects,
      resources: initialResources,
      storages: initialStorages,
      monitoringConfigs: initialMonitoringConfigs,
      activityLogs: initialActivityLogs,

      // 일반 설정 Actions
      setLanguage: (language) => set({ language }),
      setTimezone: (timezone) => set({ timezone }),
      setLogPath: (logPath) => set({ logPath }),
      setSessionTimeout: (sessionTimeout) => set({ sessionTimeout }),
      setAutoBackup: (autoBackup) => set({ autoBackup }),
      setBackupPath: (backupPath) => set({ backupPath }),

      // 리소스 관리 Actions
      addResource: (resource) => set((state) => ({
        resources: [...state.resources, { ...resource, id: state.resources.length + 1 }]
      })),
      updateResource: (resource) => set((state) => ({
        resources: state.resources.map((r) => (r.id === resource.id ? resource : r))
      })),
      deleteResource: (id) => set((state) => ({
        resources: state.resources.filter((r) => r.id !== id)
      })),

      // 스토리지 관리 Actions
      addStorage: (storage) => set((state) => ({
        storages: [...state.storages, { ...storage, id: state.storages.length + 1 }]
      })),
      updateStorage: (storage) => set((state) => ({
        storages: state.storages.map((s) => (s.id === storage.id ? storage : s))
      })),
      deleteStorage: (id) => set((state) => ({
        storages: state.storages.filter((s) => s.id !== id)
      })),

      // 모니터링 설정 Actions
      addMonitoringConfig: (config) => set((state) => ({
        monitoringConfigs: [...state.monitoringConfigs, { ...config, id: state.monitoringConfigs.length + 1 }]
      })),
      updateMonitoringConfig: (config) => set((state) => ({
        monitoringConfigs: state.monitoringConfigs.map((c) => (c.id === config.id ? config : c))
      })),
      deleteMonitoringConfig: (id) => set((state) => ({
        monitoringConfigs: state.monitoringConfigs.filter((c) => c.id !== id)
      })),

      // 사용자 관리 Actions
      addUser: (user) => set((state) => ({
        users: [...state.users, { ...user, id: state.users.length + 1 }]
      })),
      updateUser: (user) => set((state) => ({
        users: state.users.map((u) => (u.id === user.id ? user : u))
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter((u) => u.id !== id)
      })),

      // 프로젝트 관리 Actions
      addProject: (project) => set((state) => ({
        projects: [...state.projects, { ...project, id: state.projects.length + 1 }]
      })),
      updateProject: (project) => set((state) => ({
        projects: state.projects.map((p) => (p.id === project.id ? project : p))
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id)
      })),

      // 활동 로그 Actions
      clearActivityLogs: () => set({ activityLogs: [] }),
      addActivityLog: (log) => set((state) => ({
        activityLogs: [...state.activityLogs, { ...log, id: state.activityLogs.length + 1 }]
      })),
    }),
    {
      name: 'settings-storage',
    }
  )
)
