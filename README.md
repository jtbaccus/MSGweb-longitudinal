# Medical Student Grader

A web application for medical educators to evaluate student performance and generate professional narrative evaluations using AI.

## Features

- **Template-Based Evaluation**: Choose from multiple clerkship templates (Internal Medicine, Surgery, Pediatrics, Psychiatry, OB/GYN, Family Medicine, Emergency Medicine)
- **Three-Column Evaluation Form**: Organize criteria by Fail/Pass/Honors categories
- **Personal Attributes**: Select from predefined personal attributes
- **Narrative Context**: Add free-text observations to enhance AI-generated narratives
- **AI Generation**: Generate professional strengths-only evaluation narratives using GPT-5.2
- **Dark Mode**: Full light/dark/system theme support

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/jtbaccus/MSGweb.git
cd MSGweb
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-5.2
- **Icons**: Lucide React
- **Theme**: next-themes
