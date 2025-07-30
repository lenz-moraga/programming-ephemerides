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

async function testAPI() {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.vercel.app' 
    : 'http://localhost:3000'

  console.log('Testing Ephemeris API...')
  console.log('Environment:', process.env.NODE_ENV || 'development')
  console.log('Base URL:', baseUrl)

  // Test POST - Generate new ephemeris
  try {
    console.log('\n--- Testing POST /api/generate-ephemeris ---')
    const postResponse = await fetch(`${baseUrl}/api/generate-ephemeris`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        day: 29,
        month: 7,
        year: 2024
      })
    })

    const postData = await postResponse.json()
    console.log('POST Response Status:', postResponse.status)
    console.log('POST Response:', JSON.stringify(postData, null, 2))

    if (postData.success) {
      console.log('✅ POST successful!')
    } else {
      console.log('❌ POST failed!')
    }
  } catch (error) {
    console.error('❌ POST Error:', error)
  }

  // Test GET - Retrieve existing ephemeris
  try {
    console.log('\n--- Testing GET /api/generate-ephemeris ---')
    const getResponse = await fetch(`${baseUrl}/api/generate-ephemeris?day=29&month=7`)
    
    const getData = await getResponse.json()
    console.log('GET Response Status:', getResponse.status)
    console.log('GET Response:', JSON.stringify(getData, null, 2))

    if (getData.success) {
      console.log(`✅ GET successful! Found ${getData.count} ephemerides`)
    } else {
      console.log('❌ GET failed!')
    }
  } catch (error) {
    console.error('❌ GET Error:', error)
  }
}

// Run the test
testAPI().catch(console.error) 