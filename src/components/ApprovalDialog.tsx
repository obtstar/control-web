import { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputTextarea } from 'primereact/inputtextarea'
import type { components } from '@/generated/api'

type PendingApproval = components['schemas']['PendingApproval']

interface ApprovalDialogProps {
  visible: boolean
  item: PendingApproval | null
  onHide: () => void
  onSubmit: (action: 'approve' | 'reject', comment: string) => void
  submitting?: boolean
}

export function ApprovalDialog({ visible, item, onHide, onSubmit, submitting }: ApprovalDialogProps) {
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)

  // 每次打开对话框时重置批注与错误：父组件提交成功后会编程式关闭
  // （setVisible(false)），不触发 onHide，若不在打开时重置会残留上一条批注
  useEffect(() => {
    if (visible) {
      setComment('')
      setError(null)
    }
  }, [visible, item])

  if (!item) return null

  const handleSubmit = (action: 'approve' | 'reject') => {
    setError(null)
    if (action === 'reject' && !comment.trim()) {
      setError('驳回必须附批注')
      return
    }
    onSubmit(action, comment.trim())
  }

  const aiSuggestion = (
    <div className="mb-3 flex align-items-center gap-2 p-2 surface-100 border-round">
      <i className="pi pi-sparkles text-primary" />
      <span className="text-sm text-color-secondary">
        AI 建议：点击
        <a
          className="mx-1 text-primary cursor-pointer"
          onClick={() => window.open(`/ai#task=${item.task_id}`, '_blank')}
        >
          查看任务上下文
        </a>
        获取 AI 协助（/ai AI 助手面板）
      </span>
    </div>
  )

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button label="取消" icon="pi pi-times" outlined onClick={onHide} disabled={submitting} />
      <Button
        label="驳回"
        icon="pi pi-times-circle"
        severity="danger"
        onClick={() => handleSubmit('reject')}
        loading={submitting}
      />
      <Button
        label="通过"
        icon="pi pi-check"
        severity="success"
        onClick={() => handleSubmit('approve')}
        loading={submitting}
      />
    </div>
  )

  return (
    <Dialog
      header={`审批 ${item.task_id}`}
      visible={visible}
      style={{ width: '40rem' }}
      onHide={() => {
        setComment('')
        setError(null)
        onHide()
      }}
      footer={footer}
    >
      <div className="flex flex-column gap-3">
        <div>
          <strong>标题：</strong>{item.title}
        </div>
        <div>
          <strong>阶段：</strong>{item.stage}
        </div>
        <div>
          <strong>所需角色：</strong>{item.role}
        </div>
        {item.artifact && (
          <div>
            <strong>产物：</strong>{item.artifact}
          </div>
        )}
        {aiSuggestion}
        <div className="flex flex-column gap-2">
          <label htmlFor="comment">批注</label>
          <InputTextarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="驳回时必填"
          />
          {error && <small className="p-error">{error}</small>}
        </div>
      </div>
    </Dialog>
  )
}
