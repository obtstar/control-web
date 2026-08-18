import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { BoardPage } from '@/pages/BoardPage'

const mockGet = vi.fn()
const mockPost = vi.fn()
vi.mock('@/api/client', () => ({
  default: {
    GET: (...args: unknown[]) => mockGet(...args),
    POST: (...args: unknown[]) => mockPost(...args)
  },
  setAuthToken: vi.fn()
}))

const sampleTasks = [
  { task_id: 'TASK-001', title: 'A', repo_key: 'repo-a', stage: 'coding', status: 'awaiting_approval', authority: 'L3', updated_by: 'agent', updated_at: '2024-01-01T00:00:00Z' }
]

describe('BoardPage', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  function renderPage() {
    return render(
      <MemoryRouter>
        <BoardPage />
      </MemoryRouter>
    )
  }

  it('renders task list with status tag', async () => {
    mockGet.mockResolvedValueOnce({ data: sampleTasks, error: undefined })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('TASK-001')).toBeInTheDocument()
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('agent')).toBeInTheDocument()
    })
  })

  it('shows error on load failure', async () => {
    mockGet.mockResolvedValueOnce({ data: undefined, error: { error: '服务异常' } })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('服务异常')).toBeInTheDocument()
    })
  })

  it('reloads tasks when refresh button clicked', async () => {
    const updated = [{ ...sampleTasks[0], title: 'B' }]
    mockGet.mockResolvedValueOnce({ data: sampleTasks, error: undefined })
    mockGet.mockResolvedValueOnce({ data: updated, error: undefined })
    renderPage()
    await waitFor(() => screen.getByText('A'))
    await userEvent.click(screen.getByRole('button', { name: '刷新' }))
    await waitFor(() => {
      expect(screen.getByText('B')).toBeInTheDocument()
    })
    expect(mockGet).toHaveBeenCalledTimes(2)
  })

  it('disables refresh button while loading', async () => {
    let resolveSecond!: (value: unknown) => void
    mockGet.mockResolvedValueOnce({ data: sampleTasks, error: undefined })
    mockGet.mockImplementationOnce(
      () => new Promise((resolve) => { resolveSecond = resolve })
    )
    renderPage()
    await waitFor(() => screen.getByText('A'))
    const btn = screen.getByRole('button', { name: '刷新' })
    await userEvent.click(btn)
    expect(btn).toBeDisabled()
    resolveSecond({ data: sampleTasks, error: undefined })
    await waitFor(() => expect(btn).not.toBeDisabled())
  })

  // FINDING-029：merged（已合并待交付）行显示交付按钮，确认后调 action=deliver 并重载
  it('merged row shows deliver button and delivers on confirm', async () => {
    const merged = [{ ...sampleTasks[0], stage: 'merge', status: 'merged' }]
    mockGet.mockResolvedValue({ data: merged, error: undefined })
    mockPost.mockResolvedValueOnce({ data: { task_id: 'TASK-001', stage: 'deliver', status: 'running' }, error: undefined })
    renderPage()
    const deliverBtn = await screen.findByRole('button', { name: '交付' })
    await userEvent.click(deliverBtn)
    // 确认对话框：确认后才真正调用
    await userEvent.click(await screen.findByRole('button', { name: '确认交付' }))
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/tasks/{id}/action', {
        params: { path: { id: 'TASK-001' } },
        body: { action: 'deliver' }
      })
    })
  })

  // FINDING-029：非 merged 行不显示交付按钮
  it('non-merged rows hide deliver button', async () => {
    mockGet.mockResolvedValueOnce({ data: sampleTasks, error: undefined })
    renderPage()
    await waitFor(() => screen.getByText('TASK-001'))
    expect(screen.queryByRole('button', { name: '交付' })).not.toBeInTheDocument()
  })
})
