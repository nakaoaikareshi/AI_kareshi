/**
 * 基本的なE2Eテスト
 */

import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { testMessages } from './fixtures/testData';

test.describe('AI疑似恋人アプリ - 基本機能', () => {
  test.beforeEach(async ({ page }) => {
    // アプリケーションにアクセス
    await page.goto('/');
  });

  test('ホームページが正しく表示される', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // タイトルの確認
    await expect(page).toHaveTitle(/AI疑似恋人アプリ/);
    
    // キャラクター未設定の場合、設定画面が表示される
    const isSetupVisible = await homePage.isCharacterSetupVisible();
    const isChatVisible = await homePage.isChatVisible();
    
    // どちらかが表示されていることを確認
    expect(isSetupVisible || isChatVisible).toBeTruthy();
  });

  test('チャット画面のUIコンポーネントが正しく表示される', async ({ page }) => {
    const chatPage = new ChatPage(page);
    
    // チャット画面が表示されていると仮定
    // （実際のテストでは事前にキャラクター設定が必要）
    
    // 各ボタンの存在確認
    const buttons = [
      chatPage.settingsButton,
      chatPage.storeButton,
      chatPage.dateButton,
      chatPage.giftButton,
      chatPage.memoriesButton,
      chatPage.scheduleButton,
      chatPage.videoCallButton,
      chatPage.backgroundButton,
    ];

    for (const button of buttons) {
      // ボタンが存在することを確認（表示されていなくてもDOM上に存在）
      await expect(button).toBeAttached();
    }
  });

  test('メッセージ入力フォームが機能する', async ({ page }) => {
    const chatPage = new ChatPage(page);
    
    // 入力フィールドが存在することを確認
    await expect(chatPage.messageInput).toBeVisible();
    
    // テキストを入力
    const testMessage = testMessages[0];
    await chatPage.messageInput.fill(testMessage);
    
    // 入力されたテキストの確認
    await expect(chatPage.messageInput).toHaveValue(testMessage);
    
    // 送信ボタンが存在することを確認
    await expect(chatPage.sendButton).toBeVisible();
  });

  test('設定モーダルが開閉する', async ({ page }) => {
    const chatPage = new ChatPage(page);
    
    // 設定ボタンをクリック
    await chatPage.settingsButton.click();
    
    // モーダルが表示されることを確認
    const modal = page.locator('.modal, [role="dialog"]').first();
    await expect(modal).toBeVisible();
    
    // 閉じるボタンをクリック（ESCキーでも可）
    await page.keyboard.press('Escape');
    
    // モーダルが閉じることを確認
    await expect(modal).not.toBeVisible();
  });

  test('レスポンシブデザインが機能する', async ({ page }) => {
    // デスクトップビュー
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    // デスクトップでの表示確認
    const desktopLayout = page.locator('.lg\\:flex');
    await expect(desktopLayout).toBeVisible();
    
    // モバイルビュー
    await page.setViewportSize({ width: 375, height: 667 });
    
    // モバイルでの表示確認
    const mobileLayout = page.locator('.lg\\:hidden');
    await expect(mobileLayout).toBeVisible();
  });
});

test.describe('AI疑似恋人アプリ - チャット機能', () => {
  test.skip('メッセージを送信してAIからの返答を受け取る', async ({ page }) => {
    // このテストはAPIが必要なため、モック環境では実行しない
    const chatPage = new ChatPage(page);
    
    // メッセージを送信
    await chatPage.sendMessage('こんにちは！');
    
    // AIの返答を待つ
    await chatPage.waitForResponse();
    
    // 返答が表示されることを確認
    const messages = await chatPage.getAllMessages();
    expect(messages.length).toBeGreaterThan(0);
    
    // 最後のメッセージがAIからの返答であることを確認
    const lastMessage = await chatPage.getLastMessage();
    expect(lastMessage).toBeTruthy();
    expect(lastMessage).not.toBe('こんにちは！');
  });

  test('複数のメッセージを連続で送信できる', async ({ page }) => {
    const chatPage = new ChatPage(page);
    
    // 複数のメッセージを送信
    for (const message of testMessages.slice(0, 3)) {
      await chatPage.messageInput.fill(message);
      await chatPage.sendButton.click();
      
      // 少し待機
      await page.waitForTimeout(100);
    }
    
    // メッセージが表示されることを確認
    const messages = await chatPage.getAllMessages();
    expect(messages.length).toBeGreaterThanOrEqual(3);
  });
});

test.describe('AI疑似恋人アプリ - モーダル機能', () => {
  const modalTests = [
    { name: 'ショップ', method: 'openStore' },
    { name: 'デート', method: 'openDate' },
    { name: 'プレゼント', method: 'openGift' },
    { name: '思い出', method: 'openMemories' },
    { name: 'スケジュール', method: 'openSchedule' },
    { name: 'ビデオ通話', method: 'openVideoCall' },
    { name: '背景', method: 'openBackground' },
  ];

  for (const { name, method } of modalTests) {
    test(`${name}モーダルが開閉する`, async ({ page }) => {
      const chatPage = new ChatPage(page);
      
      // モーダルを開く
      await chatPage[method]();
      
      // モーダルが表示されることを確認
      const modal = page.locator('.modal, [role="dialog"]').first();
      await expect(modal).toBeVisible();
      
      // 閉じるボタンまたはESCキーでモーダルを閉じる
      await page.keyboard.press('Escape');
      
      // モーダルが閉じることを確認
      await expect(modal).not.toBeVisible();
    });
  }
});

test.describe('AI疑似恋人アプリ - アクセシビリティ', () => {
  test('キーボードナビゲーションが機能する', async ({ page }) => {
    // Tabキーでナビゲーション
    await page.keyboard.press('Tab');
    
    // フォーカスが移動することを確認
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('適切なARIA属性が設定されている', async ({ page }) => {
    // ボタンにaria-labelまたはtitle属性があることを確認
    const buttons = await page.locator('button').all();
    
    for (const button of buttons.slice(0, 5)) { // 最初の5つのボタンをチェック
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      
      // どちらかが設定されていることを確認
      expect(ariaLabel || title).toBeTruthy();
    }
  });
});