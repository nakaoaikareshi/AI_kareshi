/**
 * チャット画面のページオブジェクトモデル
 */

import { Page, Locator } from '@playwright/test';

export class ChatPage {
  readonly page: Page;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly messages: Locator;
  readonly typingIndicator: Locator;
  readonly settingsButton: Locator;
  readonly storeButton: Locator;
  readonly dateButton: Locator;
  readonly giftButton: Locator;
  readonly memoriesButton: Locator;
  readonly scheduleButton: Locator;
  readonly videoCallButton: Locator;
  readonly backgroundButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.messageInput = page.locator('input[type="text"]').first();
    this.sendButton = page.getByRole('button', { name: /送信|send/i });
    this.messages = page.locator('.message-container');
    this.typingIndicator = page.locator('.typing-indicator');
    this.settingsButton = page.locator('[title="設定"]');
    this.storeButton = page.locator('[title="ショップ"]');
    this.dateButton = page.locator('[title="デート"]');
    this.giftButton = page.locator('[title="プレゼント"]');
    this.memoriesButton = page.locator('[title="思い出"]');
    this.scheduleButton = page.locator('[title="スケジュール"]');
    this.videoCallButton = page.locator('[title="ビデオ通話"]');
    this.backgroundButton = page.locator('[title="背景"]');
  }

  async sendMessage(text: string) {
    await this.messageInput.fill(text);
    await this.sendButton.click();
  }

  async waitForResponse() {
    await this.typingIndicator.waitFor({ state: 'visible' });
    await this.typingIndicator.waitFor({ state: 'hidden', timeout: 30000 });
  }

  async getLastMessage() {
    const messages = await this.messages.all();
    if (messages.length === 0) return null;
    return await messages[messages.length - 1].textContent();
  }

  async getAllMessages() {
    const messages = await this.messages.all();
    return Promise.all(messages.map(msg => msg.textContent()));
  }

  async openSettings() {
    await this.settingsButton.click();
  }

  async openStore() {
    await this.storeButton.click();
  }

  async openDate() {
    await this.dateButton.click();
  }

  async openGift() {
    await this.giftButton.click();
  }

  async openMemories() {
    await this.memoriesButton.click();
  }

  async openSchedule() {
    await this.scheduleButton.click();
  }

  async openVideoCall() {
    await this.videoCallButton.click();
  }

  async openBackground() {
    await this.backgroundButton.click();
  }
}