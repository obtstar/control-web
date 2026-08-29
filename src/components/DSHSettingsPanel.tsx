import { useState } from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'

/**
 * DSH 设置面板
 * 在 control-web 中直接配置 DSH 设置，无需启动 3080
 * （TASK-008 半成品，自 DSHIntegrationPanel 拆分以合规 ≤300 行红线）
 */
export function DSHSettingsPanel() {
  const [settings] = useState({
    model: 'kimi-for-coding',
    temperature: 0.7,
    toolsMode: 'native',
    autoApprove: false
  })

  return (
    <div className="p-3">
      <h3 className="text-lg m-0 mb-3">DSH 设置</h3>

      <Card className="mb-3">
        <div className="flex flex-column gap-3">
          <div className="flex align-items-center justify-content-between">
            <label>默认模型</label>
            <span className="text-sm text-color-secondary">{settings.model}</span>
          </div>

          <div className="flex align-items-center justify-content-between">
            <label>温度 (Temperature)</label>
            <span className="text-sm text-color-secondary">{settings.temperature}</span>
          </div>

          <div className="flex align-items-center justify-content-between">
            <label>工具模式</label>
            <span className="text-sm text-color-secondary">{settings.toolsMode}</span>
          </div>

          <div className="flex align-items-center justify-content-between">
            <label>自动审批</label>
            <span className={`text-sm ${settings.autoApprove ? 'text-green-500' : 'text-red-500'}`}>
              {settings.autoApprove ? '开启' : '关闭'}
            </span>
          </div>
        </div>
      </Card>

      <Message
        severity="info"
        text="DSH 完整设置需要在 DSH 界面 (127.0.0.1:3080) 中配置"
        className="mb-3"
      />

      <Button
        label="打开 DSH 设置"
        icon="pi pi-external-link"
        onClick={() => window.open('http://127.0.0.1:3080', '_blank')}
      />
    </div>
  )
}
