import { describe, it, expect, vi, afterEach, type Mock } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ApiDocsPage } from '@/pages/ApiDocsPage'
import api from '@/api/client'

vi.mock('@/api/client', () => ({
  default: { GET: vi.fn() },
  setAuthToken: vi.fn()
}))

// Scalar 组件mock为轻量占位：只断言页面以 content（非 url）方式把契约文本传给它
vi.mock('@scalar/api-reference-react', () => ({
  ApiReferenceReact: ({ configuration }: { configuration: { content?: string } }) => (
    <div data-testid="scalar-api-reference">{configuration.content}</div>
  )
}))

describe('ApiDocsPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('fetches spec via authed client and renders Scalar with content', async () => {
    ;(api.GET as Mock).mockResolvedValueOnce({ data: 'openapi: 3.1.0\ninfo: {}', error: undefined })
    render(<ApiDocsPage />)
    await waitFor(() => {
      expect(screen.getByTestId('scalar-api-reference')).toHaveTextContent('openapi: 3.1.0')
    })
    expect(api.GET).toHaveBeenCalledWith('/openapi.yaml', expect.objectContaining({ parseAs: 'text' }))
  })

  it('shows error toast when load fails', async () => {
    ;(api.GET as Mock).mockResolvedValueOnce({ data: undefined, error: 'boom' })
    render(<ApiDocsPage />)
    await waitFor(() => {
      expect(screen.getByText('加载 API 契约失败')).toBeInTheDocument()
    })
  })
})
