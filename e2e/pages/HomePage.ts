/**
 * ホームページのページオブジェクトモデル
 */

import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly characterSetupButton: Locator;
  readonly chatContainer: Locator;
  readonly characterName: Locator;
  readonly onlineStatus: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.characterSetupButton = page.getByText('キャラクターを設定');
    this.chatContainer = page.locator('.chat-container');
    this.characterName = page.locator('h1').first();
    this.onlineStatus = page.getByText('オンライン');
  }

  async goto() {
    await this.page.goto('/');
  }

  async isCharacterSetupVisible() {
    return await this.characterSetupButton.isVisible();
  }

  async isChatVisible() {
    return await this.chatContainer.isVisible();
  }

  async getCharacterName() {
    return await this.characterName.textContent();
  }

  async isOnline() {
    return await this.onlineStatus.isVisible();
  }
}