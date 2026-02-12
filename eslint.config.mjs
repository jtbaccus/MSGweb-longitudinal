import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextCoreWebVitals,
  {
    ignores: ['e2e/**', 'playwright.config.ts', 'src/generated/**'],
  },
]

export default config
