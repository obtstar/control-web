import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { TabView, TabPanel } from 'primereact/tabview'
import { Card } from 'primereact/card'
import { Message } from 'primereact/message'
import { DSHIntegrationPanel, DSHSettingsPanel } from '@/components/DSHIntegrationPanel'
import { TaskContextPanel, type Task } from '@/components/TaskContextPanel'

/**
 * AIPage - AI 助手页面（真正的 DSH 集成版）
 * 
 * 核心变化：
 * 1. 使用 iframe 嵌入完整的 DSH Web 界面 (127.0.0.1:3080)
 * 2. 复用 DSH 的所有 UI 组件（对话、工具调用、设置等）
 * 3. 通过 postMessage 双向通信
 * 4. 无需重新实现 DSH 的功能
 */

export function AIPage() {
  const location = useLocation()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [activeTab, setActiveTab] = useState(0)

  // 从导航状态中获取初始任务 ID
  const initialTaskId = (location.state as { selectedTaskId?: string } | null)?.selectedTaskId

  const taskContext = selectedTask
    ? {
        taskId: selectedTask.task_id,
        stage: selectedTask.stage || '无阶段',
        status: selectedTask.status
      }
    : null

  return (
    <div className="h-full flex flex-column">
      <div className="flex align-items-center justify-content-between mb-3">
        <h2 className="text-xl m-0">
          <i className="pi pi-sparkles mr-2 text-primary" />
          AI 助手
          <span className="text-sm text-color-secondary ml-2">
            (DSH 集成)
          </span>
        </h2>
      </div>

      {/* DSH 服务状态提示 */}
      <Message 
        severity="info" 
        text="DSH 服务需要单独启动: dsh web (默认端口 3080)"
        className="mb-3"
      />

      <div className="flex-1 flex gap-3" style={{ minHeight: '600px' }}>
        {/* 左侧：任务上下文 */}
        <div className="w-3">
          <Card className="h-full">
            <TaskContextPanel
              selectedTask={selectedTask}
              onSelectTask={setSelectedTask}
              initialTaskId={initialTaskId}
            />
          </Card>
        </div>

        {/* 右侧：Tab 面板 */}
        <div className="flex-1">
          <TabView
            activeIndex={activeTab}
            onTabChange={(e) => setActiveTab(e.index)}
            className="h-full"
          >
            {/* Tab 1: DSH 对话（iframe 嵌入） */}
            <TabPanel
              header="DSH 对话"
              leftIcon="pi pi-comments mr-2"
            >
              <div className="h-full">
                <DSHIntegrationPanel 
                  taskContext={taskContext}
                />
              </div>
            </TabPanel>

            {/* Tab 2: DSH 设置 */}
            <TabPanel
              header="DSH 设置"
              leftIcon="pi pi-cog mr-2"
            >
              <DSHSettingsPanel />
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>
  )
}
