嗯# クライミング上達アプリ - 実装計画（最初から作り直し版）

## 概要

YouTubeチャンネル「@sportclimbing-coach」の動画コンテンツのみを使用して、Gemini APIで情報を抽出・分析する個人用スマホアプリ（PWA）を作成する。

### 基本方針
- ログイン機能なし（個人用）
- モバイルファーストデザイン
- データはクラウド同期
- スムーズなアニメーション（Framer Motion）

---

## 技術スタック

- **フレームワーク**: Next.js 16 + React 19 + TypeScript
- **データベース**: Prisma + SQLite
- **スタイリング**: Tailwind CSS 4
- **AI**: Gemini API（要約・Q&A・練習メニュー生成）
- **YouTube**: YouTube Data API v3 + youtube-transcript
- **PWA**: next-pwa
- **アニメーション**: Framer Motion
- **アイコン**: Lucide React

---

## プロジェクト構成

```
sportcliming/
├── app/                          # Next.js App Router
│   ├── (app)/                    # メインのページ
│   │   ├── page.tsx             # ホーム（動画検索・閲覧）
│   │   ├── videos/
│   │   │   └── [id]/page.tsx    # 動画詳細
│   │   ├── qa/page.tsx          # Q&Aページ
│   │   ├── tips/page.tsx        # コツ一覧
│   │   ├── practice/page.tsx    # 今日の練習メニュー
│   │   ├── level/
│   │   │   └── [level]/page.tsx # レベル別おすすめ
│   │   └── records/page.tsx     # 練習記録
│   ├── api/                     # APIエンドポイント
│   │   ├── videos/route.ts      # 動画一覧
│   │   ├── sync/route.ts        # チャンネル同期
│   │   ├── transcripts/[id]/route.ts # 字幕取得
│   │   ├── summary/route.ts     # 要約生成
│   │   ├── qa/route.ts          # Q&A
│   │   ├── tips/route.ts        # コツ一覧
│   │   ├── practice/route.ts    # 練習メニュー
│   │   ├── quiz/[id]/route.ts   # クイズ生成
│   │   ├── favorites/route.ts   # お気に入り
│   │   ├── history/route.ts     # 履歴
│   │   └── records/route.ts     # 練習記録
│   ├── layout.tsx               # ルートレイアウト
│   ├── globals.css              # グローバルスタイル
│   └── manifest.json            # PWAマニフェスト
├── components/
│   ├── mobile/                  # モバイル用コンポーネント
│   │   ├── BottomNav.tsx        # ボトムナビゲーション
│   │   └── SwipeContainer.tsx   # スワイプ操作
│   ├── ui/                      # 共通UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ...他必要なコンポーネント
│   └── features/                # 機能コンポーネント
│       ├── VideoCard.tsx        # 動画カード
│       ├── QuizCard.tsx         # クイズカード
│       └── ...他
├── lib/
│   ├── db/prisma.ts             # データベース接続
│   ├── youtube/                 # YouTube関連
│   │   ├── client.ts            # YouTube APIクライアント
│   │   └── transcript.ts        # 字幕取得
│   ├── gemini/                  # Gemini関連
│   │   ├── client.ts            # Gemini APIクライアント
│   │   └── prompts.ts           # プロンプトテンプレート
│   └── utils.ts                 # ユーティリティ
├── prisma/
│   └── schema.prisma            # データベーススキーマ
├── public/                      # 静的ファイル
│   ├── icons/                   # PWAアイコン
│   └── sw.js                    # Service Worker
├── .env.local                   # 環境変数（ローカル）
├── .env.example                 # 環境変数（サンプル）
└── package.json
```

---

## データベーススキーマ

### Video（動画）
```
id: String (cuid)
youtubeId: String (unique)
title: String
description: String?
thumbnailUrl: String?
publishedAt: DateTime
transcript: String? (字幕)
summary: String? (要約)
summaryData: String? (JSON形式の要約データ)
difficultyLevel: String? (beginner, intermediate, advanced)
createdAt: DateTime
updatedAt: DateTime
```

### Favorite（お気に入り）
```
id: String (cuid)
videoId: String (unique)
createdAt: DateTime
```

### History（視聴履歴）
```
id: String (cuid)
videoId: String (unique)
watchedAt: DateTime
```

### Tip（コツ）
```
id: String (cuid)
title: String
content: String (Text)
category: String (technique, training, mental, equipment)
difficulty: String? (beginner, intermediate, advanced)
videoIds: String (JSON)
createdAt: DateTime
```

### PracticeMenu（練習メニュー）
```
id: String (cuid)
content: String (Text)
createdAt: DateTime
```

### Quiz（クイズ）
```
id: String (cuid)
videoId: String
question: String
options: String (JSON)
answer: String
createdAt: DateTime
```

### VideoNote（動画メモ）
```
id: String (cuid)
videoId: String (unique)
note: String (Text)
createdAt: DateTime
updatedAt: DateTime
```

### PracticeRecord（練習記録）
```
id: String (cuid)
gymName: String?
date: DateTime (default: now())
duration: Int? (練習時間・分)
practiceMenuId: String?
videoId: String?
routes: String (JSON: [{grade, attempts, success, notes}])
reflection: String?
nextGoal: String?
createdAt: DateTime
```

### QASession（Q&Aセッション）
```
id: String (cuid)
question: String
answer: String (Text)
sources: String? (JSON: video IDs)
createdAt: DateTime
```

---

## 実装フェーズ

### フェーズ1: プロジェクト初期化
1. Next.js プロジェクト作成
2. 必要なパッケージインストール
3. TypeScript 設定
4. Tailwind CSS 設定
5. Prisma + SQLite 設定
6. PWA 設定（manifest.json, next.config.ts）
7. 環境変数設定（.env.local, .env.example）

### フェーズ2: データベース構築
1. Prisma スキーマ作成
2. データベースマイグレーション
3. Prisma Client 設定

### フェーズ3: YouTube API 統合
1. YouTube Data API クライアント作成
2. チャンネルID取得機能
3. チャンネル動画の取得機能
4. `/api/sync` エンドポイント（チャンネル同期）
5. `/api/videos` エンドポイント（動画一覧）

### フェーズ4: 字幕取得・キャッシュ
1. youtube-transcript 統合
2. `/api/transcripts/[id]` エンドポイント
3. 字幕データのキャッシュ戦略

### フェーズ5: Gemini API 統合
1. Gemini API クライアント作成
2. プロンプトテンプレート作成（日本語）
3. `/api/summary` エンドポイント（要約生成）
4. `/api/qa` エンドポイント（Q&A）
5. `/api/practice` エンドポイント（練習メニュー）
6. `/api/tips` エンドポイント（コツ抽出）
7. `/api/quiz/[id]` エンドポイント（クイズ生成）

### フェーズ6: 基本UIコンポーネント
1. Button コンポーネント
2. Card コンポーネント
3. Input コンポーネント
4. Modal コンポーネント
5. 他必要なコンポーネント

### フェーズ7: モバイルUI基盤
1. BottomNav コンポーネント
2. レスポンシブレイアウト
3. スワイプ操作対応

### フェーズ8: ホームページ
1. 動画検索機能
2. 動画一覧表示
3. VideoCard コンポーネント
4. 今日の練習メニュー表示

### フェーズ9: 動画詳細ページ
1. 動画プレイヤー埋め込み
2. 要約表示
3. メモ機能
4. クイズ機能

### フェーズ10: Q&Aページ
1. 質問入力UI
2. 回答表示UI
3. ソース引用表示

### フェーズ11: お気に入り・履歴機能
1. `/api/favorites` エンドポイント
2. `/api/history` エンドポイント
3. お気に入りUI
4. 履歴UI

### フェーズ12: コツ一覧ページ
1. コツ一覧表示
2. カテゴリーフィルター
3. レベル別フィルター

### フェーズ13: 練習メニューページ
1. 練習メニュー表示
2. 新規メニュー生成ボタン

### フェーズ14: レベル別おすすめ
1. レベル別ページ（初級・中級・上級）
2. レベル別動画フィルター

### フェーズ15: 練習記録ページ
1. 記録一覧表示
2. 記録作成・編集・削除
3. 課題記録（グレード、試行回数、成功/失敗）
4. 反・次回の目標

### フェーズ16: デザインとアニメーション
1. カラーパレット適用
2. Framer Motion アニメーション
3. ゲーム化要素（バッジ、進捗表示）
4. 楽しいフィードバックエフェクト

### フェーズ17: PWA オフライン対応
1. Service Worker 実装
2. キャッシュ戦略
3. オフライン時のUI表示

---

## 環境変数

```env
DATABASE_URL="file:./dev.db"
YOUTUBE_API_KEY="your-youtube-api-key"
GEMINI_API_KEY="your-gemini-api-key"
YOUTUBE_CHANNEL_ID="UC..."
```

---

## カラーパレット

```
Primary:   #FF6B35 (オレンジ - 元気)
Secondary: #4ECDC4 (グリーン - 成功)
Accent:    #45B7D1 (青 - 信頼)
Background: #FFF8F0 (クリーム色)
Text:      #2D3436 (ダークグレー)
```

---

## 重要なファイル一覧

| ファイル | 役割 |
|---------|------|
| `lib/db/prisma.ts` | データベース接続 |
| `lib/youtube/client.ts` | YouTube API クライアント |
| `lib/youtube/transcript.ts` | 字幕取得 |
| `lib/gemini/client.ts` | Gemini API クライアント |
| `lib/gemini/prompts.ts` | プロンプトテンプレート |
| `prisma/schema.prisma` | データベーススキーマ |
| `app/api/sync/route.ts` | チャンネル同期API |
| `app/api/videos/route.ts` | 動画一覧API |
| `app/api/transcripts/[id]/route.ts` | 字幕取得API |
| `app/api/summary/route.ts` | 要約生成API |
| `app/api/qa/route.ts` | Q&A API |
| `app/api/practice/route.ts` | 練習メニューAPI |
| `app/api/tips/route.ts` | コツ一覧API |
| `app/api/quiz/[id]/route.ts` | クイズ生成API |
| `app/api/favorites/route.ts` | お気に入りAPI |
| `app/api/history/route.ts` | 履歴API |
| `app/api/records/route.ts` | 練習記録API |
| `components/mobile/BottomNav.tsx` | ボトムナビゲーション |
| `app/(app)/page.tsx` | ホームページ |
| `app/(app)/videos/[id]/page.tsx` | 動画詳細ページ |
| `app/(app)/qa/page.tsx` | Q&Aページ |
| `app/(app)/tips/page.tsx` | コツ一覧ページ |
| `app/(app)/practice/page.tsx` | 練習メニューページ |
| `app/(app)/level/[level]/page.tsx` | レベル別ページ |
| `app/(app)/records/page.tsx` | 練習記録ページ |
| `app/globals.css` | グローバルスタイル |
| `app/manifest.json` | PWAマニフェスト |
| `app/sw.js` | Service Worker |

---

## 検証チェックリスト

- [ ] Next.js プロジェクトが正常に作成されている
- [ ] Prisma マイグレーションが成功する
- [ ] `.env.local` にAPIキーが設定されている
- [ ] `npm run dev` で開発サーバーが起動する
- [ ] PWAマニフェストが正しく読み込まれる
- [ ] `/api/sync` でチャンネル動画が同期できる
- [ ] ホームページで動画一覧・検索ができる
- [ ] ボトムナビゲーションが動作する
- [ ] 動画詳細ページで要約生成ができる
- [ ] メモ機能が動作する
- [ ] クイズ機能が動作する
- [ ] Q&Aページで質問に回答できる
- [ ] お気に入り機能が動作する
- [ ] 履歴機能が動作する
- [ ] 今日の練習メニューが生成される
- [ ] レベル別おすすめが動作する
- [ ] コツ一覧が表示される
- [ ] 練習記録が保存できる
- [ ] オフラインでキャッシュされたデータを閲覧できる
- [ ] デザインがカラフルで楽しい
- [ ] アニメーションがスムーズ
