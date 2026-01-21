import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        medical: {
          primary: 'rgb(var(--medical-primary) / <alpha-value>)',
          secondary: 'rgb(var(--medical-secondary) / <alpha-value>)',
        },
        category: {
          pass: 'rgb(var(--color-pass) / <alpha-value>)',
          honors: 'rgb(var(--color-honors) / <alpha-value>)',
          fail: 'rgb(var(--color-fail) / <alpha-value>)',
        },
        status: {
          success: 'rgb(var(--color-success) / <alpha-value>)',
          warning: 'rgb(var(--color-warning) / <alpha-value>)',
          critical: 'rgb(var(--color-critical) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}
export default config
