# Programming Ephemerides

<!-- Badges -->
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#) <!-- To be updated with actual CI/CD status -->
[![Deployment](https://img.shields.io/badge/deployment-vercel-black)](#) <!-- To be updated with deployment status -->
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A Next.js web application that showcases historical programming-related events (ephemerides) for each day of the year. Built with modern web technologies and powered by Supabase, this project demonstrates the integration of AI-driven content generation with a serverless backend architecture.

## 🚀 Live Demo

<!-- To be added after deployment -->
**Live URL:** *Coming soon - to be updated after Vercel deployment*

## 📖 About the Project

Programming Ephemerides is an educational and engaging platform that brings historical programming milestones to life. Each day, users can discover significant events from computer science history, from the creation of programming languages to groundbreaking software releases and technological achievements.

### Key Benefits

- **Educational Value**: Learn about programming history and important milestones in technology
- **Daily Discovery**: Automated content generation ensures fresh, relevant historical events
- **Modern Architecture**: Demonstrates best practices in full-stack development with Next.js and Supabase
- **AI Integration**: Leverages OpenAI API for intelligent content generation through automated workflows
- **Scalable Backend**: Supabase provides a robust, serverless database solution with real-time capabilities

### Project Origins

This proof-of-concept was inspired by the tutorial from [MoureDev by Brais Moure](https://www.youtube.com/watch?v=BWIhNQ-DvqY&ab_channel=MoureDevbyBraisMoure), showcasing the power of modern development tools including v0 from Vercel, Cursor, ChatGPT API, Supabase, and GitHub Actions automation.

## 🛠️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 15, React 18, TypeScript |
| **Styling** | Tailwind CSS, Radix UI Components |
| **Backend** | Supabase (PostgreSQL, Authentication, Storage) |
| **AI Integration** | OpenAI API (via GitHub Actions) |
| **Deployment** | Vercel |
| **CI/CD** | GitHub Actions |
| **Package Manager** | pnpm |
| **Development Tools** | ESLint, PostCSS, Model Context Protocol (MCP) |

## 🚦 Getting Started

Follow these steps to set up and run the project locally:

### 1. Clone the repository
```sh
git clone git@github.com:lenz-moraga/programming-ephemerides.git
cd programming-ephemeris
```

### 2. Install dependencies
```sh
pnpm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard: https://app.supabase.com/

### 4. Supabase Database Setup
- Create a table called `ephemerides` with at least the following columns:
  - `id` (bigint, primary key, auto-increment)
  - `day` (integer)
  - `month` (integer)
  - `year` (integer)
  - `event` (text)
  - `display_date` (date, optional)
  - (other columns are optional)

- Enable Row Level Security (RLS) and add these policies for development:

```sql
-- Allow public select
CREATE POLICY "Allow public select" ON ephemerides
  FOR SELECT
  USING (true);

-- Allow public insert (for testing scripts)
CREATE POLICY "Allow public insert" ON ephemerides
  FOR INSERT
  USING (true)
  WITH CHECK (true);
```

### 5. Add Example Data (Optional)
You can use the provided script to add an example efeméride for today:

```sh
npx tsx scripts/add-today-ephemeris.ts
```

This script will insert a historical event for today's date and print it to the console.

### 6. Test the API (Optional)
You can test the ephemeris generation API:

```sh
npx tsx scripts/test-api.ts
```

This will test both POST (generate new ephemeris) and GET (retrieve existing) endpoints.

### 7. Generate Week Data (Optional)
You can generate ephemeris data for the entire week:

```sh
npx tsx scripts/generate-week-ephemeris.ts
```

This will create ephemeris entries for the next 7 days and save them to Supabase.

### 8. Run the development server
```sh
pnpm dev
```

Open http://localhost:3000 in your browser to see the app.

---

## 📂 Project Structure

- `app/page.tsx` — Main page, displays the efeméride for today
- `app/api/generate-ephemeris/route.ts` — API endpoint for generating ephemeris data
- `lib/supabase.ts` — Supabase client configuration
- `lib/ephemeris-data.ts` — Local ephemeris data for development
- `scripts/add-today-ephemeris.ts` — Script to insert and read an efeméride for today
- `scripts/test-api.ts` — Script to test the API endpoints
- `scripts/generate-week-ephemeris.ts` — Script to generate ephemeris for a week
- `.github/workflows/generate-ephemeris.yml` — GitHub Action for automated generation
- `hooks/` — Custom React hooks
- `components/` — UI components

---

## ⚙️ Customization
- You can add more columns to the `ephemerides` table as needed (e.g., tags, author, etc.)
- You can change the logic in `app/page.tsx` to display multiple events per day or filter by year
- For production, restrict the RLS policies to authenticated users only

---

## 🤖 GitHub Actions Setup

To enable automated ephemeris generation:

1. **Add Secrets to your GitHub repository:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`

2. **Update the domain in the workflow:**
   - Edit `.github/workflows/generate-ephemeris.yml`
   - Replace `https://your-domain.vercel.app` with your actual Vercel domain

3. **The workflow will:**
   - Run every Monday at 9 AM UTC
   - Generate ephemeris for the next 7 days
   - Save all data to Supabase
   - Can be triggered manually via GitHub Actions tab

---

## 📝 Notes
- Make sure your Supabase project is running and the credentials are correct
- If you change the table structure, update the queries in the code accordingly
- For any issues, check the Supabase logs and your browser console
- The GitHub Action requires your Vercel deployment to be live and accessible

---

## 👥 Contributors

This project welcomes contributions! Whether you're fixing bugs, improving documentation, or proposing new features, your help is appreciated.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Current Contributors

<!-- Contributors will be automatically added here -->
Thanks to all the contributors who have helped make this project better!

---

## 📄 License
MIT 