import { describe, it, expect, vi, afterEach, type Mock } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { FindingsPage } from '@/pages/FindingsPage'
import api from '@/api/client'

vi.mock('@/api/client', () => ({
  default: { GET: vi.fn() },
  setAuthToken: vi.fn()
}))

const sampleFindings = [
  {
    id: 'FINDING-001',
    date: '2026-08-09',
    source: '架构评审',
    phenomenon: '现象甲',
    evidence: 'control-api/internal/api/tasks.go:102',
    impact: '影响甲',
    status: 'open',
    target: ''
  },
  {
    id: 'FINDING-002',
    date: '2026-08-09',
    source: 'web 核查',
    phenomenon: '现象乙',
    evidence: '',
    impact: '影响乙',
    status: 'fixed',
    target: 'control-web abc1234'
  }
]

describe('FindingsPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  function renderPage() {
    return render(
      <MemoryRouter>
        <FindingsPage />
      </MemoryRouter>
    )
  }

  it('renders finding rows with status tag', async () => {
    ;(api.GET as Mock).mockResolvedValueOnce({ data: sampleFindings, error: undefined })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('FINDING-001')).toBeInTheDocument()
      expect(screen.getByText('现象乙')).toBeInTheDocument()
      expect(screen.getByText('control-web abc1234')).toBeInTheDocument()
    })
  })

  it('filters rows by selected status', async () => {
    ;(api.GET as Mock).mockResolvedValueOnce({ data: sampleFindings, error: undefined })
    renderPage()
    await waitFor(() => expect(screen.getByText('FINDING-001')).toBeInTheDocument())

    await userEvent.click(within(screen.getByTestId('status-filter')).getByText('fixed'))
    expect(screen.queryByText('FINDING-001')).not.toBeInTheDocument()
    expect(screen.getByText('FINDING-002')).toBeInTheDocument()

    await userEvent.click(within(screen.getByTestId('status-filter')).getByText('全部'))
    expect(screen.getByText('FINDING-001')).toBeInTheDocument()
    expect(screen.getByText('FINDING-002')).toBeInTheDocument()
  })

  it('shows error toast when load fails', async () => {
    ;(api.GET as Mock).mockResolvedValueOnce({ data: undefined, error: { error: '读取 FINDINGS.md 失败' } })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('读取 FINDINGS.md 失败')).toBeInTheDocument()
    })
  })
})
