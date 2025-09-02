# 🏗️ AI疑似恋人アプリ - システム設計書
*Generated: 2025-09-01*

## 📋 システム概要

### アーキテクチャパターン
- **フロントエンド**: Next.js App Router + React 19 + TypeScript
- **状態管理**: Zustand (軽量、永続化対応)
- **データベース**: SQLite (開発) → PostgreSQL (本番)
- **AI統合**: OpenAI GPT-4o-mini
- **デプロイ**: Vercel (フロント) + データベース外部サービス

---

## 🗄️ データベース設計

### エンティティ関係図
```
User (ユーザー)
├── id: String (PK)
├── email: String (UNIQUE)
├── name: String (本名)
├── nickname: String (呼び名)
└── createdAt: DateTime

Character (AIキャラクター)
├── id: String (PK)
├── userId: String (FK → User.id)
├── name: String (本名)
├── nickname: String (呼び名)
├── gender: String (boyfriend/girlfriend)
├── age: Int
├── occupation: String
├── hobbies: JSON (配列として保存)
└── personality: JSON (5つのパラメータ)

Conversation (会話セッション)
├── id: String (PK)
├── userId: String (FK → User.id)
├── characterId: String (FK → Character.id)
├── lastActiveAt: DateTime
└── context: String (長期記憶コンテキスト)

Message (メッセージ)
├── id: String (PK)
├── conversationId: String (FK → Conversation.id)
├── senderId: String (User.id or Character.id)
├── content: String (メッセージ内容)
├── timestamp: DateTime
├── type: String (text/image/audio)
├── isRead: Boolean
└── isUser: Boolean
```

### 拡張テーブル（Phase 2-5用）
```sql
-- 気分状態管理
CREATE TABLE mood_states (
  id STRING PRIMARY KEY,
  character_id STRING REFERENCES characters(id),
  current_mood INTEGER, -- -100 to 100
  cycle_day INTEGER, -- 生理周期（彼女のみ）
  last_updated DATETIME,
  factors JSON -- 気分要因の配列
);

-- 日常イベント
CREATE TABLE daily_events (
  id STRING PRIMARY KEY,
  character_id STRING REFERENCES characters(id),
  event_type STRING, -- school/work/friends/family/hobby/random
  description STRING,
  mood_impact INTEGER,
  season STRING,
  created_at DATETIME,
  shared_with_user BOOLEAN
);

-- アバターシステム
CREATE TABLE avatar_settings (
  id STRING PRIMARY KEY,
  character_id STRING REFERENCES characters(id),
  hair_style STRING,
  hair_color STRING,
  eye_color STRING,
  outfit STRING,
  accessories JSON -- アクセサリーの配列
);

-- ストア/アイテム
CREATE TABLE store_items (
  id STRING PRIMARY KEY,
  name STRING,
  category STRING, -- hair/outfit/accessories
  price INTEGER, -- 円
  image_url STRING,
  description STRING,
  is_premium BOOLEAN
);

-- 購入履歴
CREATE TABLE purchases (
  id STRING PRIMARY KEY,
  user_id STRING REFERENCES users(id),
  item_id STRING REFERENCES store_items(id),
  purchased_at DATETIME,
  amount INTEGER
);

-- 思い出・記念日
CREATE TABLE memories (
  id STRING PRIMARY KEY,
  user_id STRING REFERENCES users(id),
  character_id STRING REFERENCES characters(id),
  title STRING,
  description STRING,
  memory_type STRING, -- date/gift/special_conversation
  created_at DATETIME,
  image_url STRING
);
```

---

## 🔌 API設計仕様

### Core Endpoints

#### 1. Chat API
```typescript
POST /api/chat
Request: {
  message: string;
  character: Character;
  conversationHistory: Message[];
  user: User;
}
Response: {
  success: boolean;
  data: {
    content: string;
    timestamp: string;
    moodState?: MoodState;
    dailyEvent?: string;
  };
  error?: string;
}
```

#### 2. Character Management
```typescript
// キャラクター作成
POST /api/characters
Request: {
  name: string;
  nickname: string;
  gender: 'boyfriend' | 'girlfriend';
  age: number;
  occupation: string;
  hobbies: string[];
  personality: CharacterPersonality;
}

// キャラクター更新
PUT /api/characters/:id
Request: Partial<Character>

// キャラクター削除
DELETE /api/characters/:id
```

#### 3. Conversation Management
```typescript
// 会話履歴取得
GET /api/conversations/:characterId
Response: {
  conversation: Conversation;
  messages: Message[];
}

// 会話コンテキスト更新
PUT /api/conversations/:id/context
Request: { context: string }
```

#### 4. Store & Commerce
```typescript
// アイテム一覧
GET /api/store/items?category=hair|outfit|accessories

// アイテム購入
POST /api/store/purchase
Request: {
  itemId: string;
  characterId: string;
}
```

---

## 🧩 コンポーネント設計

### アーキテクチャ改善提案

#### 1. State Management 最適化
```typescript
// 現在: 4つの独立したストア
// 提案: ルートストアで統合管理

interface AppState {
  user: UserState;
  character: CharacterState;
  chat: ChatState;
  mood: MoodState;
  ui: UIState; // モーダル状態等
}

// Zustand Combined Store Pattern
const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createUserSlice(set, get),
      ...createCharacterSlice(set, get),
      ...createChatSlice(set, get),
      ...createMoodSlice(set, get),
      ...createUISlice(set, get),
    }),
    { name: 'nakao-app-storage' }
  )
);
```

#### 2. Component Hierarchy 再設計
```
App Layout
├── AuthProvider (認証状態管理)
├── AppStateProvider (Zustand context)
├── ErrorBoundary (エラー境界)
└── Main Layout
    ├── Header (キャラクター情報、メニュー)
    ├── ChatArea
    │   ├── MessageList (仮想化対応)
    │   ├── TypingIndicator
    │   └── ChatInput
    ├── Sidebar (PC版用)
    └── ModalManager (モーダル統合管理)
```

#### 3. Performance 最適化
```typescript
// Message List 仮想化
const MessageList = React.memo(() => {
  const { messages } = useChatStore();
  
  return (
    <VirtualizedList
      items={messages}
      renderItem={ChatMessage}
      itemHeight={80}
      windowSize={10}
    />
  );
});

// Chat Input デバウンス
const ChatInput = () => {
  const debouncedSend = useCallback(
    debounce((message: string) => {
      sendMessage(message);
    }, 300),
    []
  );
};
```

---

## 🔐 セキュリティ設計

### 認証・認可フロー
```typescript
// NextAuth.js設定
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
};
```

### API保護
```typescript
// Middleware for API protection
export async function middleware(request: NextRequest) {
  // 認証チェック
  const token = await getToken({ req: request });
  
  if (!token && request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // レート制限
  const isLimited = await checkRateLimit(request);
  if (isLimited) {
    return NextResponse.json(
      { error: 'Rate limited' },
      { status: 429 }
    );
  }
}
```

### データ暗号化
```typescript
// 会話内容の暗号化
import crypto from 'crypto';

export class MessageEncryption {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly secretKey = process.env.ENCRYPTION_KEY!;
  
  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey);
    cipher.setAAD(Buffer.from('nakao-ai-chat'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }
}
```

---

## 📱 モバイル最適化設計

### PWA対応
```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.openai\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'openai-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 24時間
        },
      },
    },
  ],
});
```

### レスポンシブUI
```typescript
// Tailwind Breakpoints
const breakpoints = {
  sm: '640px',   // モバイル縦
  md: '768px',   // タブレット
  lg: '1024px',  // PC
  xl: '1280px',  // 大画面
};

// Component適応例
<div className="
  px-4 py-2           // モバイル: 小さなpadding
  md:px-6 md:py-4     // タブレット: 中程度
  lg:px-8 lg:py-6     // PC: 大きなpadding
  max-w-sm            // モバイル幅制限
  md:max-w-2xl        // タブレット幅
  lg:max-w-4xl        // PC幅
">
```

---

## ⚡ パフォーマンス最適化設計

### 1. 状態管理最適化
```typescript
// メッセージ履歴の効率的管理
interface ChatState {
  recentMessages: Message[]; // 直近50件のみメモリ保持
  messageCache: Map<string, Message[]>; // LRUキャッシュ
  loadMoreMessages: (conversationId: string, offset: number) => Promise<void>;
}

// 無限スクロール実装
const useInfiniteMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  
  const loadMore = useCallback(async () => {
    // データベースから追加メッセージを取得
  }, [conversationId]);
};
```

### 2. AI Response キャッシュ
```typescript
// Redis/Vercel KVでレスポンスキャッシュ
interface AICache {
  key: string; // hash(userMessage + characterPersonality)
  response: string;
  timestamp: number;
  ttl: number; // 1時間
}

export class AIResponseCache {
  static async get(message: string, character: Character): Promise<string | null> {
    const key = this.generateKey(message, character);
    const cached = await redis.get(key);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.response;
    }
    return null;
  }
}
```

---

## 🚀 デプロイメント設計

### Vercel設定最適化
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "OPENAI_API_KEY": "@openai_api_key",
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  },
  "functions": {
    "src/app/api/*/route.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["nrt1", "hnd1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

### 環境別設定
```typescript
// 環境設定管理
export const config = {
  development: {
    database: 'sqlite://./dev.db',
    aiModel: 'gpt-4o-mini',
    rateLimit: 100, // リクエスト/分
  },
  production: {
    database: process.env.DATABASE_URL!,
    aiModel: 'gpt-4o',
    rateLimit: 10,
  },
};
```

---

## 📊 監視・メトリクス設計

### KPI追跡
```typescript
// アプリ内メトリクス
interface AppMetrics {
  dailyActiveUsers: number;
  averageSessionDuration: number; // 分
  messagesPerSession: number;
  conversionRate: number; // 課金転換率
  characterSetupCompletionRate: number;
}

// イベント追跡
export class Analytics {
  static trackEvent(event: string, properties: Record<string, any>) {
    // Vercel Analytics または Google Analytics
    if (typeof window !== 'undefined') {
      gtag('event', event, properties);
    }
  }
}
```

---

## 🔄 Phase別実装ロードマップ

### Phase 1: MVP (完了済み) ✅
- ✅ 基本チャット機能
- ✅ キャラクター設定
- ✅ 気分システム
- ✅ 日常イベント

### Phase 2: 強化機能
```typescript
// 実装予定
- WebSocket リアルタイム通信
- プッシュ通知システム
- 画像アップロード機能
- 音声メッセージ対応
```

### Phase 3: 収益化
```typescript
// ストア機能
- Stripe決済統合
- アイテム管理システム
- サブスクリプション機能
- アナリティクスダッシュボード
```

### Phase 4: スケーラビリティ
```typescript
// インフラ拡張
- Redis キャッシュ層
- CDN画像配信
- マイクロサービス分離
- 負荷バランシング
```

---

## 💡 技術的改善提案

### 1. 即座に実装可能
- エラーバウンダリ追加
- メッセージ仮想化
- API応答キャッシュ
- TypeScript厳格化

### 2. 中期改善
- WebSocket導入
- 画像最適化
- PWA対応
- 認証システム統合

### 3. 長期改善
- マイクロサービス分離
- AI応答の品質向上
- リアルタイム音声通話
- 3Dアバター対応

---

*設計ドキュメント最終更新: 2025-09-01*
*実装準備完了*