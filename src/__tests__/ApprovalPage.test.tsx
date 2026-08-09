import { describe, it, expect, vi, afterEach, type Mock } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ApprovalPage } from '@/pages/ApprovalPage'
import api from '@/api/client'

vi.mock('@/api/client', () => ({
  default: { GET: vi.fn(), POST: vi.fn() },
  setAuthToken: vi.fn()
}))

const sampleItems = [
  {
    task_id: 'TASK-001',
    title: 'MVP',
    stage: 'design',
    role: 'designer',
    artifact: 'design.md',
    created_at: '2024-01-01T00:00:00Z'
  }
]

describe('ApprovalPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  function renderPage() {
    return render(
      <MemoryRouter>
        <ApprovalPage />
      </MemoryRouter>
    )
  }

  it('renders pending approvals and opens dialog', async () => {
    ;(api.GET as Mock).mockResolvedValueOnce({ data: sampleItems, error: undefined })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('TASK-001')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('button', { name: '审批' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '通过' })).toBeInTheDocument()
    })
  })

  it('requires comment for reject', async () => {
    ;(api.GET as Mock).mockResolvedValueOnce({ data: sampleItems, error: undefined })
    renderPage()
    await waitFor(() => screen.getByRole('button', { name: '审批' }))
    await userEvent.click(screen.getByRole('button', { name: '审批' }))
    await userEvent.click(screen.getByRole('button', { name: '驳回' }))
    await waitFor(() => {
      expect(screen.getByText('驳回必须附批注')).toBeInTheDocument()
    })
  })

  it('approves and refreshes list', async () => {
    ;(api.GET as Mock).mockResolvedValueOnce({ data: sampleItems, error: undefined })
    ;(api.GET as Mock).mockResolvedValueOnce({ data: [], error: undefined })
    ;(api.POST as Mock).mockResolvedValueOnce({
      data: { task_id: 'TASK-001', stage: 'coding', status: 'pending' },
      error: undefined
    })
    renderPage()
    await waitFor(() => screen.getByRole('button', { name: '审批' }))
    await userEvent.click(screen.getByRole('button', { name: '审批' }))
    await userEvent.type(screen.getByLabelText('批注'), 'LGTM')
    await userEvent.click(screen.getByRole('button', { name: '通过' }))
    await waitFor(() => {
      expect(api.POST).toHaveBeenCalledWith(
        '/tasks/{id}/action',
        expect.objectContaining({
          params: { path: { id: 'TASK-001' } },
          body: { action: 'approve', comment: 'LGTM' }
        })
      )
    })
  })
})
