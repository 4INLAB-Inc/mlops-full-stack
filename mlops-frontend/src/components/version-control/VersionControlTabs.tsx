'use client'

import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { ModelVersions } from './ModelVersions'
import { DatasetVersions } from './DatasetVersions'
import { ExperimentVersions } from './ExperimentVersions'
import { GitIntegration } from './GitIntegration'

export function VersionControlTabs() {
  return (
    <Tabs isLazy>
      <TabList px={4}>
        <Tab>모델</Tab>
        <Tab>데이터셋</Tab>
        <Tab>실험 구성</Tab>
        <Tab>Git 연동</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <ModelVersions />
        </TabPanel>
        <TabPanel>
          <DatasetVersions />
        </TabPanel>
        <TabPanel>
          <ExperimentVersions />
        </TabPanel>
        <TabPanel>
          <GitIntegration />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
