/**
 * Playwright E2Eテスト設定
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* 並列実行数 */
  fullyParallel: true,
  /* CI環境でリトライを無効化 */
  forbidOnly: !!process.env.CI,
  /* リトライ回数 */
  retries: process.env.CI ? 2 : 0,
  /* 並列ワーカー数 */
  workers: process.env.CI ? 1 : undefined,
  /* レポーター設定 */
  reporter: 'html',
  /* 共通設定 */
  use: {
    /* 基本URL */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    /* スクリーンショット */
    screenshot: 'only-on-failure',
    /* ビデオ録画 */
    video: 'retain-on-failure',
    /* アクションのトレース */
    trace: 'on-first-retry',
    /* タイムアウト */
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  /* ブラウザ設定 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* モバイルビューのテスト */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* 開発サーバー設定 */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* グローバル設定 */
  expect: {
    timeout: 10000,
  },

  /* テストの出力ディレクトリ */
  outputDir: 'test-results/',
});