import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { programmingEphemeris } from '@/lib/ephemeris-data'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface EphemerisRequest {
  day: number
  month: number
  year?: number
}

interface EphemerisResponse {
  day: number
  month: number
  year: number
  event: string
  source: 'chatgpt' | 'local'
}

// Function to get random event from local data
function getRandomLocalEvent(): string {
  const events = Object.values(programmingEphemeris)
  const randomIndex = Math.floor(Math.random() * events.length)
  return events[randomIndex]
}

// Function to call ChatGPT API
async function generateWithChatGPT(day: number, month: number): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not found')
  }

  const prompt = `Generate a historical programming or technology event that occurred on ${month}/${day} (any year). 
  The response should be in Spanish and include:
  - The year it happened
  - A brief description of the event
  - Why it's significant in programming/technology history
  
  Format: "DD/MM/YYYY - Description of the event and its significance."
  
  Make it factual and historically accurate.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides historical programming and technology events.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No se pudo generar la efeméride.'
  } catch (error) {
    console.error('Error calling ChatGPT:', error)
    throw new Error('Failed to generate with ChatGPT')
  }
}

// Function to save to Supabase
async function saveToSupabase(ephemeris: EphemerisResponse) {
  const { error } = await supabase
    .from('ephemerides')
    .insert([{
      day: ephemeris.day,
      month: ephemeris.month,
      year: ephemeris.year,
      event: ephemeris.event,
      display_date: `${ephemeris.year}-${String(ephemeris.month).padStart(2, '0')}-${String(ephemeris.day).padStart(2, '0')}`
    }])

  if (error) {
    console.error('Error saving to Supabase:', error)
    throw new Error('Failed to save to database')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EphemerisRequest = await request.json()
    const { day, month, year = new Date().getFullYear() } = body

    // Validate input
    if (!day || !month || day < 1 || day > 31 || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid day or month' },
        { status: 400 }
      )
    }

    let event: string
    let source: 'chatgpt' | 'local'

    // Check if we're in production or development
    if (process.env.NODE_ENV === 'production') {
      // Production: Use ChatGPT
      try {
        event = await generateWithChatGPT(day, month)
        source = 'chatgpt'
      } catch (error) {
        console.error('ChatGPT failed, falling back to local data:', error)
        event = getRandomLocalEvent()
        source = 'local'
      }
    } else {
      // Development: Use local data
      event = getRandomLocalEvent()
      source = 'local'
    }

    const ephemerisResponse: EphemerisResponse = {
      day,
      month,
      year,
      event,
      source
    }

    // Save to Supabase
    await saveToSupabase(ephemerisResponse)

    return NextResponse.json({
      success: true,
      ephemeris: ephemerisResponse,
      message: `Efeméride generada usando ${source === 'chatgpt' ? 'ChatGPT' : 'datos locales'} y guardada en Supabase`
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve existing ephemeris for a date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const day = parseInt(searchParams.get('day') || '0')
    const month = parseInt(searchParams.get('month') || '0')

    console.log(day, month)

    if (!day || !month) {
      return NextResponse.json(
        // { error: 'Day and month parameters are required' },
        { message: 'Day and month parameters are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('ephemerides')
      .select('*')
      .eq('day', day)
      .eq('month', month)
      .order('year', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      ephemerides: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('GET API Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve ephemerides' },
      { status: 500 }
    )
  }
} 