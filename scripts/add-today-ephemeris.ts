import { existsSync } from 'fs'
import { join } from 'path'

// Cargar variables desde .env.local si existe, si no, desde .env
const envLocalPath = join(process.cwd(), '.env.local')
const envPath = join(process.cwd(), '.env')

if (existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath })
} else if (existsSync(envPath)) {
  require('dotenv').config({ path: envPath })
} else {
  require('dotenv').config()
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  // Fecha fija: 29 de julio
  const day = 29
  const month = 7
  const year = new Date().getFullYear()

  // Efeméride importante para el 29 de julio
  const event = '29 de julio de 1958: Se crea la NASA (National Aeronautics and Space Administration) en Estados Unidos.'

  // Insertar efeméride
  const { error: insertError } = await supabase
    .from('ephemerides')
    .insert([
      {
        day,
        month,
        year,
        event,
        display_date: `${year}-07-29`
      }
    ])

  if (insertError) {
    console.error('Error insertando efeméride:', insertError)
    return
  }
  console.log('Efeméride insertada correctamente.')

  // Leer efeméride del 29 de julio
  const { data, error } = await supabase
    .from('ephemerides')
    .select('*')
    .eq('day', day)
    .eq('month', month)
    .order('year', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error leyendo efeméride:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('Efeméride del 29 de julio:', data[0].event)
  } else {
    console.log('No hay efeméride para el 29 de julio.')
  }
}

main() 