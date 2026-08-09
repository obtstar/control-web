import { describe, it, expect, vi, afterEach, type Mock } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuditPage } from '@/pages/AuditPage'
import api from '@/api/client'

vi.mock('@/api/client', () => ({
  default: { GET: vi.fn() },
  setAuthToken: vi.fn()
}))

const sampleLogs = [
  {
    id: 1,
    task_id: 'TASK-001',
    stage: 'coding',
    action: 'run',
    operator: 'agent',
    model: 'gpt-4',
    detail: '',
    entry_hash: 'abc123def',
    created_at: '2024-01-01T00:00:00Z'
  }
]

describe('AuditPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  function renderPage() {
    return render(
      <MemoryRouter>
        <AuditPage />
      </MemoryRouter>
    )
  }

  it('renders audit logs with hash', async () => {
    ;(api.GET as Mock).mockResolvedValueOnce({ data: sampleLogs, error: undefined })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('TASK-001')).toBeInTheDocument()
      expect(screen.getByText('abc123def')).toBeInTheDocument()
    })
  })
})
