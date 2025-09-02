# マネタイゼーションシステム設計仕様書

## 💰 概要

AI疑似恋人アプリ向けの包括的な収益化システム。バーチャルアイテム、サブスクリプション、デジタルギフト機能を統合したフリーミアムモデルによる持続可能な収益構造の設計。

---

## 🏗️ システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                 Monetization Core                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐│
│ │Payment Engine│  │Item Store    │  │Subscription     ││
│ │- Stripe API  │  │- Inventory   │  │Manager          ││
│ │- Transaction │  │- Pricing     │  │- Tiers          ││
│ │- Receipts    │  │- Categories  │  │- Billing Cycles ││
│ └──────────────┘  └──────────────┘  └─────────────────┘│
│                                                         │
│ ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐│
│ │Virtual       │  │Gift System   │  │Analytics Engine ││
│ │Currency      │  │- Send/Receive│  │- Revenue Track  ││
│ │- Gems/Points │  │- Reactions   │  │- User Behavior  ││
│ │- Exchange    │  │- History     │  │- Conversion     ││
│ └──────────────┘  └──────────────┘  └─────────────────┘│
│                                                         │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                Integration Layer                         │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐│
│ │Avatar System │  │Chat System   │  │User Profile    ││
│ │- Cosmetics   │  │- Premium     │  │- Purchase       ││
│ │- Unlocks     │  │- Features    │  │- History        ││
│ └──────────────┘  └──────────────┘  └─────────────────┘│
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                External Services                         │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐│
│ │Stripe        │  │Tax Service   │  │Fraud Detection  ││
│ │- Payments    │  │- VAT/Sales   │  │- Risk Score     ││
│ │- Webhooks    │  │- Compliance  │  │- Prevention     ││
│ └──────────────┘  └──────────────┘  └─────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 💎 バーチャル通貨システム

### Gem Economy Design

```typescript
interface VirtualCurrencyConfig {
  name: string; // "ハートジェム"
  symbol: string; // "💎"
  denominations: {
    smallest: number; // 1 gem
    display: number; // Usually shown in multiples of 10
    purchase: number; // Min purchase amount
  };
  exchangeRates: {
    jpyPerGem: number; // 1 gem = 1 JPY (base rate)
    volumeDiscounts: VolumeDiscount[];
    subscriptionBonus: number; // % bonus for subscribers
  };
  earnMethods: EarnMethod[];
  spendMethods: SpendMethod[];
}

interface VolumeDiscount {
  minAmount: number; // Minimum gem purchase
  bonusPercent: number; // Additional gems as %
  displayName: string; // "お得パック"
}

class VirtualCurrencyService {
  private config: VirtualCurrencyConfig;
  private transactionLog: Map<string, Transaction[]> = new Map();

  constructor(config: VirtualCurrencyConfig) {
    this.config = config;
  }

  async purchaseGems(request: GemPurchaseRequest): Promise<GemPurchaseResult> {
    // 1. Validate purchase request
    const validation = await this.validatePurchase(request);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 2. Calculate total gems with bonuses
    const baseGems = request.amount;
    const volumeBonus = this.calculateVolumeBonus(baseGems);
    const subscriptionBonus = await this.calculateSubscriptionBonus(request.userId, baseGems);
    const totalGems = baseGems + volumeBonus + subscriptionBonus;

    // 3. Create Stripe payment intent
    const paymentIntent = await this.createPaymentIntent({
      amount: this.gemsToJpy(baseGems), // Only charge for base gems
      currency: 'jpy',
      metadata: {
        userId: request.userId,
        baseGems: baseGems.toString(),
        bonusGems: (volumeBonus + subscriptionBonus).toString(),
        totalGems: totalGems.toString()
      }
    });

    // 4. Store pending transaction
    await this.storePendingTransaction({
      userId: request.userId,
      paymentIntentId: paymentIntent.id,
      baseGems,
      bonusGems: volumeBonus + subscriptionBonus,
      totalGems,
      status: 'pending'
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      baseGems,
      bonusGems: volumeBonus + subscriptionBonus,
      totalGems,
      totalCostJpy: this.gemsToJpy(baseGems)
    };
  }

  async confirmGemPurchase(paymentIntentId: string): Promise<void> {
    // 1. Retrieve pending transaction
    const transaction = await this.getPendingTransaction(paymentIntentId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // 2. Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not completed');
    }

    // 3. Credit gems to user account
    await this.creditGems(transaction.userId, transaction.totalGems);

    // 4. Log transaction
    await this.logTransaction({
      ...transaction,
      status: 'completed',
      completedAt: new Date()
    });

    // 5. Update user purchase history
    await this.updatePurchaseHistory(transaction.userId, transaction);

    // 6. Trigger analytics event
    await this.trackPurchaseEvent(transaction);
  }

  async spendGems(userId: string, amount: number, itemId: string, itemType: string): Promise<SpendResult> {
    // 1. Check user balance
    const balance = await this.getGemBalance(userId);
    if (balance < amount) {
      return {
        success: false,
        error: 'Insufficient gems',
        requiredGems: amount,
        currentBalance: balance,
        shortfall: amount - balance
      };
    }

    // 2. Begin transaction
    const transaction = await this.beginSpendTransaction({
      userId,
      amount,
      itemId,
      itemType,
      timestamp: new Date()
    });

    try {
      // 3. Deduct gems from balance
      await this.deductGems(userId, amount);

      // 4. Grant item to user
      await this.grantItem(userId, itemId, itemType);

      // 5. Complete transaction
      await this.completeTransaction(transaction.id);

      // 6. Track spend event
      await this.trackSpendEvent(userId, amount, itemId, itemType);

      return {
        success: true,
        newBalance: balance - amount,
        transactionId: transaction.id,
        itemGranted: true
      };
    } catch (error) {
      // Rollback transaction
      await this.rollbackTransaction(transaction.id);
      throw error;
    }
  }

  private calculateVolumeBonus(gems: number): number {
    const discount = this.config.exchangeRates.volumeDiscounts
      .filter(d => gems >= d.minAmount)
      .reduce((max, current) => 
        current.minAmount > max.minAmount ? current : max, 
        { minAmount: 0, bonusPercent: 0 }
      );

    return Math.floor(gems * (discount.bonusPercent / 100));
  }

  private async calculateSubscriptionBonus(userId: string, gems: number): Promise<number> {
    const user = await this.getUserSubscription(userId);
    if (!user || user.tier === 'free') return 0;

    return Math.floor(gems * (this.config.exchangeRates.subscriptionBonus / 100));
  }
}
```

---

## 🎁 ギフトシステム設計

### Digital Gift Infrastructure

```typescript
interface GiftSystemConfig {
  giftTypes: {
    [category: string]: GiftCategory;
  };
  sendingLimits: {
    perDay: number;
    perWeek: number;
    perMonth: number;
  };
  reactions: GiftReaction[];
  notifications: NotificationConfig;
}

interface GiftCategory {
  id: string;
  name: string;
  description: string;
  items: GiftItem[];
  unlockRequirements?: {
    relationshipLevel?: number;
    subscriptionTier?: string;
    specialEvent?: string;
  };
}

interface GiftItem {
  id: string;
  name: string;
  description: string;
  animation: string; // Animation file for gift presentation
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  cost: {
    gems: number;
    realMoney?: number; // Optional direct purchase
  };
  effects: GiftEffect[];
  seasonality?: {
    startDate: string;
    endDate: string;
    isRecurring: boolean;
  };
}

interface GiftEffect {
  type: 'mood_boost' | 'relationship_exp' | 'unlock_content' | 'special_animation';
  parameters: {
    [key: string]: any;
  };
  duration?: number; // milliseconds, undefined for permanent
}

class GiftService {
  private giftQueue: Map<string, PendingGift[]> = new Map();
  private reactionEngine: ReactionEngine;

  constructor(
    private config: GiftSystemConfig,
    private currencyService: VirtualCurrencyService,
    private relationshipService: RelationshipService
  ) {
    this.reactionEngine = new ReactionEngine();
  }

  async sendGift(request: SendGiftRequest): Promise<SendGiftResult> {
    // 1. Validate gift sending
    const validation = await this.validateGiftSending(request);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 2. Check daily limits
    const todaySent = await this.getTodayGiftCount(request.senderId);
    if (todaySent >= this.config.sendingLimits.perDay) {
      throw new Error('Daily gift limit reached');
    }

    // 3. Get gift item details
    const giftItem = await this.getGiftItem(request.giftId);
    if (!giftItem) {
      throw new Error('Gift item not found');
    }

    // 4. Process payment
    const paymentResult = await this.currencyService.spendGems(
      request.senderId,
      giftItem.cost.gems,
      giftItem.id,
      'gift'
    );

    if (!paymentResult.success) {
      return {
        success: false,
        error: paymentResult.error,
        requiredGems: paymentResult.requiredGems
      };
    }

    // 5. Create gift record
    const gift: Gift = {
      id: crypto.randomUUID(),
      senderId: request.senderId,
      receiverId: request.receiverId,
      giftId: request.giftId,
      message: request.message,
      sentAt: new Date(),
      status: 'sent',
      isOpened: false
    };

    // 6. Queue gift for delivery
    await this.queueGiftDelivery(gift);

    // 7. Generate AI character reaction
    const reaction = await this.generateGiftReaction(gift, giftItem);

    // 8. Update relationship metrics
    await this.relationshipService.processGiftEvent(gift, giftItem);

    // 9. Send notifications
    await this.sendGiftNotifications(gift, giftItem, reaction);

    return {
      success: true,
      giftId: gift.id,
      reaction: reaction,
      newRelationshipLevel: await this.relationshipService.getLevel(request.receiverId),
      transactionId: paymentResult.transactionId
    };
  }

  async openGift(userId: string, giftId: string): Promise<OpenGiftResult> {
    // 1. Retrieve gift
    const gift = await this.getGift(giftId);
    if (!gift || gift.receiverId !== userId) {
      throw new Error('Gift not found or not authorized');
    }

    if (gift.isOpened) {
      throw new Error('Gift already opened');
    }

    // 2. Get gift item details
    const giftItem = await this.getGiftItem(gift.giftId);
    if (!giftItem) {
      throw new Error('Gift item not found');
    }

    // 3. Mark gift as opened
    await this.markGiftOpened(giftId);

    // 4. Apply gift effects
    const effectResults = await this.applyGiftEffects(userId, giftItem.effects);

    // 5. Generate opening animation data
    const openingAnimation = await this.generateOpeningAnimation(giftItem);

    // 6. Create memory for the character
    await this.createGiftMemory(userId, gift, giftItem);

    // 7. Track analytics
    await this.trackGiftOpenEvent(gift, giftItem);

    return {
      gift,
      giftItem,
      effects: effectResults,
      openingAnimation,
      characterReaction: await this.generateOpeningReaction(gift, giftItem)
    };
  }

  private async generateGiftReaction(gift: Gift, giftItem: GiftItem): Promise<GiftReaction> {
    const character = await this.getCharacter(gift.receiverId);
    const relationship = await this.relationshipService.getRelationship(gift.senderId, gift.receiverId);
    
    // Base reaction based on gift rarity and relationship level
    let reactionIntensity = this.calculateReactionIntensity(giftItem.rarity, relationship.level);
    
    // Modify based on character personality
    reactionIntensity = this.applyPersonalityModifier(reactionIntensity, character.personality);
    
    // Generate appropriate reaction text and animation
    const reactionData = await this.selectReaction(giftItem, reactionIntensity, character);
    
    return {
      type: reactionData.type,
      text: reactionData.text,
      animation: reactionData.animation,
      emotionChange: reactionData.emotionChange,
      intensity: reactionIntensity
    };
  }

  private calculateReactionIntensity(rarity: string, relationshipLevel: number): number {
    const rarityBonus = {
      'common': 1.0,
      'rare': 1.3,
      'epic': 1.6,
      'legendary': 2.0
    }[rarity] || 1.0;

    const relationshipBonus = Math.min(1.0 + (relationshipLevel * 0.1), 2.0);
    
    return rarityBonus * relationshipBonus;
  }
}
```

---

## 🏪 アイテムストア設計

### Virtual Item Store Architecture

```typescript
interface StoreConfig {
  categories: StoreCategory[];
  featuredRotation: {
    intervalHours: number;
    featuredCount: number;
  };
  pricingStrategy: {
    baseMarkup: number; // % markup from cost
    rarityMultipliers: { [rarity: string]: number };
    demandPricing: boolean;
    seasonalDiscounts: boolean;
  };
  inventory: {
    unlimitedItems: string[]; // Items always available
    limitedItems: LimitedItem[];
    exclusiveItems: ExclusiveItem[];
  };
}

interface StoreCategory {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  requiresUnlock?: {
    level?: number;
    subscription?: string;
    achievement?: string;
  };
  items: StoreItem[];
}

interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  prices: {
    gems: number;
    realMoney?: {
      jpy: number;
      usd: number;
      eur: number;
    };
  };
  preview: {
    images: string[];
    videos?: string[];
    demoAvailable: boolean;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    totalPurchases: number;
    averageRating: number;
    tags: string[];
  };
  unlockRequirements?: UnlockRequirement[];
  bundleInfo?: BundleInfo;
}

interface UnlockRequirement {
  type: 'level' | 'subscription' | 'achievement' | 'previous_purchase';
  value: any;
  displayName: string;
}

class ItemStore {
  private inventory: Map<string, StoreItem> = new Map();
  private featuredItems: string[] = [];
  private personalizedRecommendations: Map<string, string[]> = new Map();

  constructor(
    private config: StoreConfig,
    private currencyService: VirtualCurrencyService,
    private personalizationEngine: PersonalizationEngine
  ) {
    this.initializeStore();
  }

  async getStorefront(userId: string): Promise<Storefront> {
    // 1. Get user profile for personalization
    const userProfile = await this.getUserProfile(userId);
    
    // 2. Filter items based on unlock status
    const availableItems = await this.getAvailableItems(userId);
    
    // 3. Generate personalized recommendations
    const recommendations = await this.personalizationEngine.generateRecommendations(
      userId,
      availableItems
    );
    
    // 4. Get featured items (rotated regularly)
    const featured = await this.getFeaturedItems();
    
    // 5. Get category breakdown
    const categories = await this.getCategorizedItems(availableItems);
    
    // 6. Get user's purchase history for "recently purchased" section
    const recentPurchases = await this.getRecentPurchases(userId);
    
    return {
      featured,
      recommendations,
      categories,
      recentPurchases,
      userGemBalance: await this.currencyService.getGemBalance(userId),
      metadata: {
        totalItems: availableItems.length,
        newItemsThisWeek: await this.getNewItemsCount(7),
        userDiscounts: await this.getUserDiscounts(userId)
      }
    };
  }

  async purchaseItem(request: ItemPurchaseRequest): Promise<ItemPurchaseResult> {
    // 1. Validate purchase
    const validation = await this.validateItemPurchase(request);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 2. Get item details
    const item = this.inventory.get(request.itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    // 3. Check if user already owns this item
    const alreadyOwned = await this.userOwnsItem(request.userId, request.itemId);
    if (alreadyOwned && !item.bundleInfo?.allowMultiple) {
      throw new Error('Item already owned');
    }

    // 4. Calculate final price (including discounts)
    const finalPrice = await this.calculateFinalPrice(request.userId, item);

    // 5. Process payment
    let paymentResult;
    if (request.paymentMethod === 'gems') {
      paymentResult = await this.currencyService.spendGems(
        request.userId,
        finalPrice.gems,
        item.id,
        'item_purchase'
      );
    } else {
      paymentResult = await this.processRealMoneyPurchase(request.userId, item, finalPrice);
    }

    if (!paymentResult.success) {
      return {
        success: false,
        error: paymentResult.error,
        requiredAmount: finalPrice
      };
    }

    // 6. Grant item to user
    await this.grantItemToUser(request.userId, item);

    // 7. Update item statistics
    await this.updateItemStats(item.id);

    // 8. Generate purchase receipt
    const receipt = await this.generatePurchaseReceipt({
      userId: request.userId,
      item,
      finalPrice,
      transactionId: paymentResult.transactionId,
      timestamp: new Date()
    });

    // 9. Trigger post-purchase events
    await this.triggerPostPurchaseEvents(request.userId, item);

    return {
      success: true,
      item,
      receipt,
      newBalance: paymentResult.newBalance,
      unlockedContent: await this.getUnlockedContent(request.userId, item)
    };
  }

  async previewItem(userId: string, itemId: string): Promise<ItemPreview> {
    const item = this.inventory.get(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    // 1. Check if user can access preview
    const canPreview = await this.canUserPreviewItem(userId, item);
    if (!canPreview) {
      throw new Error('Preview not available');
    }

    // 2. Generate temporary preview assets
    const previewAssets = await this.generatePreviewAssets(item);

    // 3. Create time-limited preview session
    const previewSession = await this.createPreviewSession({
      userId,
      itemId,
      duration: 300000, // 5 minutes
      assets: previewAssets
    });

    return {
      sessionId: previewSession.id,
      assets: previewAssets,
      expiresAt: previewSession.expiresAt,
      purchasePrice: await this.calculateFinalPrice(userId, item)
    };
  }

  private async generatePreviewAssets(item: StoreItem): Promise<PreviewAssets> {
    const assets: PreviewAssets = {
      images: item.preview.images,
      videos: item.preview.videos || [],
    };

    // For avatar items, generate try-on preview
    if (item.category === 'avatar') {
      assets.tryOnDemo = await this.generateTryOnDemo(item);
    }

    // For animations, generate preview clips
    if (item.category === 'animations') {
      assets.animationPreview = await this.generateAnimationPreview(item);
    }

    return assets;
  }
}
```

---

## 📊 サブスクリプション設計

### Subscription Tier Management

```typescript
interface SubscriptionConfig {
  tiers: {
    [tierId: string]: SubscriptionTier;
  };
  billing: {
    currency: 'JPY';
    taxRate: number; // 10% for Japan
    gracePeriod: number; // Days before suspension
    retryAttempts: number;
  };
  features: {
    [featureId: string]: FeatureDefinition;
  };
}

interface SubscriptionTier {
  id: string;
  name: string;
  displayName: string;
  description: string;
  pricing: {
    monthly: number;
    quarterly: number;
    annually: number;
  };
  features: string[]; // Feature IDs
  benefits: TierBenefit[];
  limitations: TierLimitation[];
  isPopular?: boolean;
  colorScheme: {
    primary: string;
    accent: string;
  };
}

interface TierBenefit {
  id: string;
  name: string;
  description: string;
  icon: string;
  value?: string; // "Unlimited", "50% more", etc.
}

enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid'
}

class SubscriptionService {
  private stripeService: StripeService;
  private featureGate: FeatureGateService;

  constructor(
    private config: SubscriptionConfig,
    stripeConfig: StripeConfig
  ) {
    this.stripeService = new StripeService(stripeConfig);
    this.featureGate = new FeatureGateService(config.features);
  }

  async createSubscription(request: CreateSubscriptionRequest): Promise<SubscriptionResult> {
    // 1. Validate tier and user
    const tier = this.config.tiers[request.tierId];
    if (!tier) {
      throw new Error('Invalid subscription tier');
    }

    // 2. Check if user already has an active subscription
    const existingSubscription = await this.getUserSubscription(request.userId);
    if (existingSubscription && existingSubscription.status === SubscriptionStatus.ACTIVE) {
      throw new Error('User already has active subscription');
    }

    // 3. Create Stripe customer if needed
    let customerId = await this.getStripeCustomerId(request.userId);
    if (!customerId) {
      customerId = await this.createStripeCustomer(request.userId);
    }

    // 4. Create subscription in Stripe
    const stripeSubscription = await this.stripeService.createSubscription({
      customer: customerId,
      price_id: this.getPriceId(tier.id, request.billingCycle),
      trial_period_days: request.trialDays || 7,
      metadata: {
        userId: request.userId,
        tierId: tier.id,
        billingCycle: request.billingCycle
      }
    });

    // 5. Store subscription in database
    const subscription = await this.storeSubscription({
      userId: request.userId,
      stripeSubscriptionId: stripeSubscription.id,
      tierId: tier.id,
      status: stripeSubscription.status as SubscriptionStatus,
      billingCycle: request.billingCycle,
      trialEndDate: request.trialDays ? new Date(Date.now() + request.trialDays * 24 * 60 * 60 * 1000) : undefined,
      nextBillingDate: new Date(stripeSubscription.current_period_end * 1000),
      createdAt: new Date()
    });

    // 6. Update user permissions
    await this.updateUserFeatureAccess(request.userId, tier.features);

    // 7. Send welcome email/notification
    await this.sendSubscriptionWelcome(request.userId, tier);

    return {
      subscription,
      stripeClientSecret: stripeSubscription.latest_invoice?.payment_intent?.client_secret,
      trialEndDate: subscription.trialEndDate,
      features: await this.getUserFeatures(request.userId)
    };
  }

  async upgradeSubscription(userId: string, newTierId: string): Promise<UpgradeResult> {
    // 1. Get current subscription
    const currentSubscription = await this.getUserSubscription(userId);
    if (!currentSubscription) {
      throw new Error('No active subscription found');
    }

    const currentTier = this.config.tiers[currentSubscription.tierId];
    const newTier = this.config.tiers[newTierId];

    if (!newTier) {
      throw new Error('Invalid tier');
    }

    // 2. Calculate prorated charges
    const prorationResult = await this.calculateProration(currentSubscription, newTier);

    // 3. Update Stripe subscription
    const updatedStripeSubscription = await this.stripeService.updateSubscription(
      currentSubscription.stripeSubscriptionId,
      {
        items: [{
          id: currentSubscription.stripeItemId,
          price: this.getPriceId(newTier.id, currentSubscription.billingCycle)
        }],
        proration_behavior: 'always_invoice'
      }
    );

    // 4. Update local subscription record
    await this.updateSubscription(currentSubscription.id, {
      tierId: newTier.id,
      updatedAt: new Date()
    });

    // 5. Update user feature access
    await this.updateUserFeatureAccess(userId, newTier.features);

    // 6. Log upgrade event
    await this.logSubscriptionEvent(userId, 'upgrade', {
      from: currentTier.name,
      to: newTier.name,
      prorationAmount: prorationResult.amount
    });

    return {
      newTier,
      prorationAmount: prorationResult.amount,
      nextBillingDate: new Date(updatedStripeSubscription.current_period_end * 1000),
      newFeatures: await this.getUserFeatures(userId)
    };
  }

  async cancelSubscription(userId: string, immediate: boolean = false): Promise<CancelResult> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    // 1. Cancel in Stripe
    if (immediate) {
      await this.stripeService.cancelSubscriptionImmediately(subscription.stripeSubscriptionId);
    } else {
      await this.stripeService.cancelSubscriptionAtPeriodEnd(subscription.stripeSubscriptionId);
    }

    // 2. Update local record
    await this.updateSubscription(subscription.id, {
      status: immediate ? SubscriptionStatus.CANCELED : SubscriptionStatus.ACTIVE,
      cancelAtPeriodEnd: !immediate,
      canceledAt: new Date()
    });

    // 3. Schedule feature access removal (if immediate)
    if (immediate) {
      await this.removeUserFeatureAccess(userId);
    } else {
      await this.scheduleFeatureAccessRemoval(userId, subscription.nextBillingDate);
    }

    // 4. Send cancellation confirmation
    await this.sendCancellationConfirmation(userId, subscription, immediate);

    return {
      canceledImmediately: immediate,
      accessEndsAt: immediate ? new Date() : subscription.nextBillingDate,
      refundAmount: immediate ? await this.calculateRefund(subscription) : 0
    };
  }

  async handleWebhook(event: StripeEvent): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
}
```

---

## 📈 収益分析・最適化

### Revenue Analytics Engine

```typescript
interface RevenueAnalyticsConfig {
  metrics: {
    cohortAnalysis: boolean;
    ltv: boolean;
    churnPrediction: boolean;
    pricingOptimization: boolean;
  };
  reporting: {
    dailyReports: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
    realTimeAlerts: boolean;
  };
  optimization: {
    abTesting: boolean;
    dynamicPricing: boolean;
    personalizedOffers: boolean;
  };
}

class RevenueAnalyticsEngine {
  private metricsCollector: MetricsCollector;
  private cohortAnalyzer: CohortAnalyzer;
  private ltvCalculator: LTVCalculator;
  private churnPredictor: ChurnPredictor;

  async calculateKPIs(timeRange: TimeRange): Promise<RevenueKPIs> {
    const [
      revenue,
      users,
      subscriptions,
      transactions
    ] = await Promise.all([
      this.getRevenueMetrics(timeRange),
      this.getUserMetrics(timeRange),
      this.getSubscriptionMetrics(timeRange),
      this.getTransactionMetrics(timeRange)
    ]);

    return {
      // Revenue Metrics
      totalRevenue: revenue.total,
      recurringRevenue: revenue.recurring,
      oneTimeRevenue: revenue.oneTime,
      
      // User Metrics
      totalUsers: users.total,
      paidUsers: users.paid,
      conversionRate: users.paid / users.total,
      
      // ARPU (Average Revenue Per User)
      arpu: revenue.total / users.total,
      arppu: revenue.total / users.paid, // Average Revenue Per Paying User
      
      // Subscription Metrics
      newSubscriptions: subscriptions.new,
      canceledSubscriptions: subscriptions.canceled,
      churnRate: subscriptions.canceled / subscriptions.active,
      
      // Transaction Metrics
      averageTransactionValue: transactions.totalValue / transactions.count,
      transactionFrequency: transactions.count / users.paid,
      
      // Cohort Analysis
      cohortRetention: await this.cohortAnalyzer.getRetentionRates(timeRange),
      
      // LTV
      averageLTV: await this.ltvCalculator.getAverageLTV(),
      ltvBySegment: await this.ltvCalculator.getLTVBySegment(),
    };
  }

  async generateRevenueReport(timeRange: TimeRange): Promise<RevenueReport> {
    const kpis = await this.calculateKPIs(timeRange);
    
    return {
      period: timeRange,
      summary: {
        totalRevenue: kpis.totalRevenue,
        growth: await this.calculateGrowthRate(timeRange),
        topPerformingItems: await this.getTopPerformingItems(timeRange),
        underPerformingItems: await this.getUnderPerformingItems(timeRange)
      },
      
      segments: {
        byTier: await this.getRevenueByTier(timeRange),
        byCategory: await this.getRevenueByCategory(timeRange),
        byUserSegment: await this.getRevenueByUserSegment(timeRange),
        byRegion: await this.getRevenueByRegion(timeRange)
      },
      
      trends: {
        dailyRevenue: await this.getDailyRevenueTrend(timeRange),
        subscriptionGrowth: await this.getSubscriptionGrowthTrend(timeRange),
        churnTrend: await this.getChurnTrend(timeRange),
        ltvTrend: await this.getLTVTrend(timeRange)
      },
      
      recommendations: await this.generateOptimizationRecommendations(kpis),
      
      alerts: await this.getActiveAlerts()
    };
  }

  async optimizePricing(itemId: string): Promise<PricingOptimization> {
    // 1. Get current performance data
    const currentPerformance = await this.getItemPerformance(itemId);
    
    // 2. Analyze price elasticity
    const elasticity = await this.calculatePriceElasticity(itemId);
    
    // 3. Run Monte Carlo simulation for different price points
    const simulations = await this.runPriceSimulations(itemId, elasticity);
    
    // 4. Find optimal price point
    const optimalPrice = this.findOptimalPrice(simulations);
    
    // 5. Generate A/B test plan
    const abTestPlan = await this.generateABTestPlan(itemId, optimalPrice);
    
    return {
      currentPrice: currentPerformance.price,
      recommendedPrice: optimalPrice.price,
      expectedLift: optimalPrice.expectedRevenueLift,
      confidence: optimalPrice.confidence,
      abTestPlan,
      reasoning: optimalPrice.reasoning
    };
  }

  private async generateOptimizationRecommendations(kpis: RevenueKPIs): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Churn rate too high
    if (kpis.churnRate > 0.1) { // 10% monthly churn
      recommendations.push({
        type: 'churn_reduction',
        priority: 'high',
        title: 'High Churn Rate Detected',
        description: `Monthly churn rate is ${(kpis.churnRate * 100).toFixed(1)}%. Consider implementing retention campaigns.`,
        actionItems: [
          'Create win-back campaign for at-risk users',
          'Analyze cancellation reasons',
          'Implement churn prediction model',
          'Offer cancellation incentives'
        ],
        potentialImpact: 'Could reduce churn by 20-30%'
      });
    }

    // Low conversion rate
    if (kpis.conversionRate < 0.05) { // Less than 5% conversion
      recommendations.push({
        type: 'conversion_optimization',
        priority: 'high',
        title: 'Low Conversion Rate',
        description: `Only ${(kpis.conversionRate * 100).toFixed(1)}% of users are converting to paid.`,
        actionItems: [
          'Optimize onboarding flow',
          'A/B test pricing strategy',
          'Improve value proposition',
          'Add limited-time offers'
        ],
        potentialImpact: 'Could increase conversion by 15-25%'
      });
    }

    // Low ARPU
    const benchmarkARPU = 2000; // 2000 JPY benchmark
    if (kpis.arpu < benchmarkARPU) {
      recommendations.push({
        type: 'arpu_increase',
        priority: 'medium',
        title: 'ARPU Below Benchmark',
        description: `Current ARPU is ¥${kpis.arpu.toFixed(0)}, below benchmark of ¥${benchmarkARPU}.`,
        actionItems: [
          'Introduce premium features',
          'Create item bundles',
          'Implement dynamic pricing',
          'Add subscription upsells'
        ],
        potentialImpact: 'Could increase ARPU by 10-20%'
      });
    }

    return recommendations;
  }
}
```

---

## 💳 決済・税務処理

### Payment Processing Architecture

```typescript
interface PaymentConfig {
  providers: {
    primary: 'stripe';
    fallback: 'paypal';
  };
  currencies: {
    primary: 'JPY';
    supported: ['JPY', 'USD', 'EUR'];
  };
  tax: {
    japanVAT: 0.10;
    euVAT: 0.20;
    taxProviders: {
      primary: 'stripe-tax';
      fallback: 'manual';
    };
  };
  compliance: {
    pci: true;
    gdpr: true;
    ccpa: true;
  };
}

class PaymentProcessor {
  private stripeClient: Stripe;
  private taxCalculator: TaxCalculator;
  private complianceEngine: ComplianceEngine;

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // 1. Validate payment request
    const validation = await this.validatePaymentRequest(request);
    if (!validation.valid) {
      throw new PaymentError(validation.error, 'VALIDATION_FAILED');
    }

    // 2. Calculate taxes
    const taxCalculation = await this.taxCalculator.calculate({
      amount: request.amount,
      currency: request.currency,
      userLocation: request.userLocation,
      itemType: request.itemType
    });

    // 3. Create payment intent with Stripe
    const paymentIntent = await this.stripeClient.paymentIntents.create({
      amount: Math.round((request.amount + taxCalculation.totalTax) * 100), // Convert to cents
      currency: request.currency.toLowerCase(),
      customer: await this.getOrCreateStripeCustomer(request.userId),
      metadata: {
        userId: request.userId,
        itemId: request.itemId,
        itemType: request.itemType,
        baseAmount: request.amount.toString(),
        taxAmount: taxCalculation.totalTax.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Enable SCA compliance for EU customers
      confirm: false,
      use_stripe_sdk: true
    });

    // 4. Store pending transaction
    const transaction = await this.storePendingTransaction({
      paymentIntentId: paymentIntent.id,
      userId: request.userId,
      amount: request.amount,
      tax: taxCalculation.totalTax,
      currency: request.currency,
      itemId: request.itemId,
      itemType: request.itemType,
      status: 'pending'
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      amount: request.amount,
      tax: taxCalculation,
      transactionId: transaction.id
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentConfirmation> {
    // 1. Retrieve payment intent from Stripe
    const paymentIntent = await this.stripeClient.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new PaymentError('Payment not completed', 'PAYMENT_FAILED');
    }

    // 2. Get pending transaction
    const transaction = await this.getPendingTransaction(paymentIntentId);
    if (!transaction) {
      throw new PaymentError('Transaction not found', 'TRANSACTION_NOT_FOUND');
    }

    // 3. Complete the transaction
    await this.completeTransaction(transaction.id, {
      stripeChargeId: paymentIntent.latest_charge as string,
      completedAt: new Date(),
      status: 'completed'
    });

    // 4. Generate receipt
    const receipt = await this.generateReceipt(transaction, paymentIntent);

    // 5. Grant purchased items
    if (transaction.itemId) {
      await this.grantPurchasedItem(transaction.userId, transaction.itemId);
    }

    // 6. Update user balance if gems purchase
    if (transaction.itemType === 'gems') {
      await this.creditGems(transaction.userId, transaction.itemId);
    }

    // 7. Send confirmation email
    await this.sendPaymentConfirmation(transaction.userId, receipt);

    return {
      success: true,
      transactionId: transaction.id,
      receipt,
      chargeId: paymentIntent.latest_charge as string
    };
  }

  async handleRefund(transactionId: string, amount?: number, reason?: string): Promise<RefundResult> {
    // 1. Get original transaction
    const transaction = await this.getTransaction(transactionId);
    if (!transaction) {
      throw new PaymentError('Transaction not found', 'TRANSACTION_NOT_FOUND');
    }

    // 2. Validate refund eligibility
    const eligibility = await this.validateRefundEligibility(transaction);
    if (!eligibility.eligible) {
      throw new PaymentError(eligibility.reason, 'REFUND_NOT_ELIGIBLE');
    }

    // 3. Calculate refund amount
    const refundAmount = amount || transaction.amount + transaction.tax;

    // 4. Process refund with Stripe
    const refund = await this.stripeClient.refunds.create({
      charge: transaction.stripeChargeId,
      amount: Math.round(refundAmount * 100), // Convert to cents
      reason: reason || 'requested_by_customer',
      metadata: {
        originalTransactionId: transactionId,
        refundReason: reason
      }
    });

    // 5. Update transaction record
    await this.updateTransaction(transactionId, {
      refundId: refund.id,
      refundAmount: refundAmount,
      refundedAt: new Date(),
      status: 'refunded'
    });

    // 6. Revoke purchased items if necessary
    if (transaction.itemId) {
      await this.revokePurchasedItem(transaction.userId, transaction.itemId);
    }

    // 7. Deduct gems if gems purchase
    if (transaction.itemType === 'gems') {
      await this.deductGems(transaction.userId, transaction.itemId);
    }

    // 8. Send refund confirmation
    await this.sendRefundConfirmation(transaction.userId, refund, transaction);

    return {
      success: true,
      refundId: refund.id,
      amount: refundAmount,
      processedAt: new Date()
    };
  }
}
```

---

このマネタイゼーションシステム設計により、持続可能で拡張可能な収益構造を構築し、ユーザー体験を損なうことなく効果的な収益化を実現できます。フリーミアムモデルとバーチャル経済の組み合わせにより、多様な収益チャネルを確保します。