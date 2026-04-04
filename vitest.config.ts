import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/modules/**', 'src/i18n/**'],
      exclude: ['**/*.test.ts', '**/*.d.ts'],
    },
  },
})
