# Medical Student Grader

A web application for medical educators to evaluate student performance and generate professional narrative evaluations using AI.

## Features

- **Template-Based Evaluation**: Choose from multiple clerkship templates (Internal Medicine, Surgery, Pediatrics, Psychiatry, OB/GYN, Family Medicine, Emergency Medicine)
- **Three-Column Evaluation Form**: Organize criteria by Fail/Pass/Honors categories
- **Personal Attributes**: Select from 26 predefined personal attributes
- **Narrative Context**: Add free-text observations to enhance AI-generated narratives
- **AI Generation**: Generate professional evaluation narratives using GPT-4o
- **PDF Export**: Export comprehensive evaluation reports
- **Dark Mode**: Full light/dark/system theme support

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
cd medical-student-grader
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your OpenAI API key:
```bash
cp .env.local.example .env.local
# Edit .env.local and add your API key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
medical-student-grader/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── templates/        # Template selection
│   ├── evaluation/       # Evaluation form
│   ├── attributes/       # Personal attributes
│   ├── narrative/        # Narrative input
│   ├── summary/          # Evaluation summary
│   ├── generate/         # AI generation
│   ├── export/           # PDF export
│   ├── settings/         # Settings
│   ├── providers/        # Context providers
│   └── ui/               # Shared UI components
├── lib/                   # Utilities and stores
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript types
│   ├── data/             # Default data
│   └── utils/            # Utility functions
└── styles/               # Additional styles
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o
- **Icons**: Lucide React
- **Theme**: next-themes

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Self-Hosted

For production deployment, we recommend using nginx as a reverse proxy with SSL.

## License

MIT
