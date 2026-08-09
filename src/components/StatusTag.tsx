import { Tag } from 'primereact/tag'

const STATUS_MAP: Record<string, { severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined; label: string }> = {
  pending: { severity: 'secondary', label: '待处理' },
  running: { severity: 'info', label: '进行中' },
  awaiting_approval: { severity: 'warning', label: '待审批' },
  paused: { severity: 'danger', label: '已暂停' },
  merged: { severity: 'success', label: '已合并' },
  delivered: { severity: 'success', label: '已交付' }
}

export function StatusTag({ status }: { status: string }) {
  const mapped = STATUS_MAP[status] ?? { severity: 'secondary', label: status }
  return <Tag severity={mapped.severity} value={mapped.label} />
}
