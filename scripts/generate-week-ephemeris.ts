import { existsSync } from 'fs'
import { join } from 'path'

// Load environment variables
const envLocalPath = join(process.cwd(), '.env.local')
const envPath = join(process.cwd(), '.env')

if (existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath })
} else if (existsSync(envPath)) {
  require('dotenv').config({ path: envPath })
} else {
  require('dotenv').config()
}

async function generateWeekEphemeris() {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.vercel.app' 
    : 'http://localhost:3000'

  console.log('Generating ephemeris for the week...')
  console.log('Environment:', process.env.NODE_ENV || 'development')
  console.log('Base URL:', baseUrl)

  const today = new Date()
  const results = []

  // Generate for next 7 days
  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + i)
    
    const day = targetDate.getDate()
    const month = targetDate.getMonth() + 1
    const year = targetDate.getFullYear()
    
    console.log(`\n--- Generating for ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ---`)
    
    try {
      const response = await fetch(`${baseUrl}/api/generate-ephemeris`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day,
          month,
          year
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        console.log(`✅ Success: ${data.message}`)
        console.log(`📅 Event: ${data.ephemeris.event.substring(0, 100)}...`)
        results.push({
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          success: true,
          source: data.ephemeris.source
        })
      } else {
        console.log(`❌ Failed: ${data.error || 'Unknown error'}`)
        results.push({
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          success: false,
          error: data.error
        })
      }
    } catch (error) {
      console.error(`❌ Error for ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}:`, error)
      results.push({
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Summary
  console.log('\n--- Summary ---')
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log(`✅ Successful: ${successful}`)
  console.log(`❌ Failed: ${failed}`)
  
  if (successful > 0) {
    console.log('\nSuccessful generations:')
    results.filter(r => r.success).forEach(r => {
      console.log(`  - ${r.date} (${r.source})`)
    })
  }
  
  if (failed > 0) {
    console.log('\nFailed generations:')
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.date}: ${r.error}`)
    })
  }

  console.log('\n🎉 Week ephemeris generation completed!')
}

// Run the script
generateWeekEphemeris().catch(console.error) 