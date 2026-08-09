import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BoardPage } from '@/pages/BoardPage'

const mockGet = vi.fn()
vi.mock('@/api/client', () => ({
  default: { GET: (...args: any[]) => mockGet(...args) },
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
})
