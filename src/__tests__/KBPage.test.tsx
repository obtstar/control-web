import { describe, it, expect, vi, afterEach, type Mock } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KBPage } from '@/pages/KBPage'
import api from '@/api/client'

vi.mock('@/api/client', () => ({
  default: { GET: vi.fn() },
  setAuthToken: vi.fn()
}))

const sampleHits = [
  { id: 'p1', path: 'wiki/a.md', title: '架构原则', layer: 'raw', kind: 'page', snippet: 'AI 驱动执行' },
  { id: 'p2', path: 'wiki/b.md', title: '权柄分级', layer: 'wiki', kind: 'concept', snippet: 'L1 需求' }
]

describe('KBPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  async function typeAndSearch(q: string) {
    await userEvent.type(screen.getByTestId('kb-search-input'), q)
    await userEvent.click(screen.getByText('检索'))
  }

  it('renders hit rows after search', async () => {
    ;(api.GET as Mock).mockResolvedValueOnce({ data: sampleHits, error: undefined })
    render(<KBPage />)
    await typeAndSearch('架构')
    await waitFor(() => {
      expect(screen.getByText('架构原则')).toBeInTheDocument()
      expect(screen.getByText('权柄分级')).toBeInTheDocument()
      expect(screen.getByText('AI 驱动执行')).toBeInTheDocument()
      expect(screen.getByText('wiki/b.md')).toBeInTheDocument()
    })
    expect(api.GET).toHaveBeenCalledWith('/kb/search', { params: { query: { q: '架构', limit: 20 } } })
  })

  it('triggers search on Enter key', async () => {
    ;(api.GET as Mock).mockResolvedValueOnce({ data: sampleHits, error: undefined })
    render(<KBPage />)
    await userEvent.type(screen.getByTestId('kb-search-input'), '架构{Enter}')
    await waitFor(() => expect(screen.getByText('架构原则')).toBeInTheDocument())
    expect(api.GET).toHaveBeenCalledTimes(1)
  })

  it('shows honest empty state when no hits', async () => {
    ;(api.GET as Mock).mockResolvedValueOnce({ data: [], error: undefined })
    render(<KBPage />)
    await typeAndSearch('无命中词')
    await waitFor(() => {
      expect(screen.getByText('未命中或 KB 为空')).toBeInTheDocument()
    })
  })

  it('shows error toast when search fails', async () => {
    ;(api.GET as Mock).mockResolvedValueOnce({
      data: undefined,
      error: { error: 'kb.endpoint 未配置，KB 检索不可用' }
    })
    render(<KBPage />)
    await typeAndSearch('架构')
    await waitFor(() => {
      expect(screen.getByText('kb.endpoint 未配置，KB 检索不可用')).toBeInTheDocument()
    })
  })
})
