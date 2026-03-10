import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// --- Mock Supabase ---
const mockInsert = vi.fn().mockResolvedValue({ error: null })
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: mockInsert,
      select: vi.fn(() => ({
        eq: mockEq,
      })),
    })),
  })),
}))

// --- Mock OpenAI fetch call ---
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// --- Mock local ephemeris data (keep tests self-contained) ---
vi.mock('@/lib/ephemeris-data', () => ({
  programmingEphemeris: {
    '01-01': '🎉 1970 - Nace la Era Unix',
    '03-12': '🌐 1989 - Tim Berners-Lee propone la World Wide Web',
  },
}))

describe('POST /api/generate-ephemeris', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default NODE_ENV to 'test' (non-production) so local data is used
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
  })

  it('returns 400 for invalid day', async () => {
    const { POST } = await import('@/app/api/generate-ephemeris/route')
    const request = new NextRequest('http://localhost/api/generate-ephemeris', {
      method: 'POST',
      body: JSON.stringify({ day: 0, month: 5 }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 400 for invalid month', async () => {
    const { POST } = await import('@/app/api/generate-ephemeris/route')
    const request = new NextRequest('http://localhost/api/generate-ephemeris', {
      method: 'POST',
      body: JSON.stringify({ day: 15, month: 13 }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  it('returns 200 with success and saves to Supabase in dev mode', async () => {
    const { POST } = await import('@/app/api/generate-ephemeris/route')
    const request = new NextRequest('http://localhost/api/generate-ephemeris', {
      method: 'POST',
      body: JSON.stringify({ day: 10, month: 3, year: 2026 }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.ephemeris).toMatchObject({ day: 10, month: 3, year: 2026 })
    expect(body.ephemeris.source).toBe('local')
    expect(mockInsert).toHaveBeenCalledOnce()
  })

  it('calls OpenAI and saves to Supabase in production mode', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('OPENAI_API_KEY', 'test-openai-key')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '10/03/1989 - Fake OpenAI event.' } }],
      }),
    })

    const { POST } = await import('@/app/api/generate-ephemeris/route')
    const request = new NextRequest('http://localhost/api/generate-ephemeris', {
      method: 'POST',
      body: JSON.stringify({ day: 10, month: 3, year: 2026 }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.ephemeris.source).toBe('chatgpt')
    expect(body.ephemeris.event).toBe('10/03/1989 - Fake OpenAI event.')
    expect(mockInsert).toHaveBeenCalledOnce()
  })
})

describe('GET /api/generate-ephemeris', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')

    // Chain mock: .from().select().eq().eq().order()
    mockOrder.mockResolvedValue({ data: [], error: null })
    mockEq.mockReturnValue({ eq: mockEq, order: mockOrder })
    mockSelect.mockReturnValue({ eq: mockEq })
  })

  it('returns 400 when day or month are missing', async () => {
    const { GET } = await import('@/app/api/generate-ephemeris/route')
    const request = new NextRequest(
      'http://localhost/api/generate-ephemeris?day=10'
    )
    const response = await GET(request)
    expect(response.status).toBe(400)
  })

  it('returns 200 with ephemerides array', async () => {
    const fakeData = [{ id: 1, day: 10, month: 3, year: 2026, event: 'Test' }]
    mockOrder.mockResolvedValue({ data: fakeData, error: null })

    const { GET } = await import('@/app/api/generate-ephemeris/route')
    const request = new NextRequest(
      'http://localhost/api/generate-ephemeris?day=10&month=3'
    )
    const response = await GET(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.count).toBe(1)
  })
})
