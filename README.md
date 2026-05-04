This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## ぷよぷよ 要件定義

### 1. プロジェクト概要

Next.js製のWebアプリとして動作するぷよぷよゲーム。プレイヤーが手動操作し、Claude AIが対戦相手として自律的に手を選択する1対1の対戦ゲーム。

---

### 2. ゲームルール

#### 2.1 ボード
- サイズ: 6列 × 13行
- 左上が (0, 0)、右下が (5, 12)
- 各セルは「空」またはいずれかの色のぷよを持つ

#### 2.2 ぷよの色
- 赤 (R) / 緑 (G) / 青 (B) / 黄 (Y) / 紫 (P) の5色

#### 2.3 ぷよペア
- 1ターンごとに2つのぷよ（ペア）を操作する
- 回転は4方向: 縦（軸が下）/ 横（軸が左）/ 縦（軸が上）/ 横（軸が右）

#### 2.4 落下・消去・連鎖
1. ペアを任意の列・回転で落とす
2. 重力で空白のセルを埋めるように落下
3. 同色4つ以上が上下左右に連結 → 消去
4. 消去後に再度落下、連鎖が発生する場合は繰り返す

#### 2.5 おじゃまぷよ（将来拡張）
- 連鎖数に応じた相手フィールドへの妨害ぷよ送り込み（初期スコープ外）

#### 2.6 ゲームオーバー
- 最上段（row 0）にぷよが存在する状態で新しいぷよを置けない場合

---

### 3. 画面構成

#### 3.1 ページレイアウト (`/`)
```
┌─────────────────────────────────────────┐
│         ぷよぷよ vs Claude AI            │
├───────────────────┬─────────────────────┤
│  プレイヤー盤面   │    Claude AI 盤面   │
│  (6×13)           │    (6×13)           │
│                   │                     │
│  NEXT: [○][●]    │    NEXT: [○][●]    │
├───────────────────┴─────────────────────┤
│  スコア: 1200      チェーン数: 3         │
│  [← →] 移動  [Z] 回転  [↓] 高速落下   │
└─────────────────────────────────────────┘
```

#### 3.2 コンポーネント構成
| コンポーネント | 役割 |
|---|---|
| `GameBoard` | 6×13 グリッドの描画 |
| `PuyoCell` | 各セルのぷよ色表示 |
| `NextPuyo` | 次のぷよペア表示 |
| `ScorePanel` | スコア・チェーン数表示 |
| `GameScreen` | 両プレイヤー盤面の統合 |
| `GameController` | キー入力・ゲームループ管理 |

---

### 4. 操作仕様（プレイヤー）

| 操作 | キー |
|---|---|
| 左移動 | ← / A |
| 右移動 | → / D |
| 左回転 | Z |
| 右回転 | X |
| 高速落下 | ↓ / S |
| 即時落下 | Space |

---

### 5. Claude AI 仕様

#### 5.1 概要
- Anthropic SDK（`@anthropic-ai/sdk`）を使用
- モデル: `claude-opus-4-7`（adaptive thinking 有効）
- 毎ターン、現在の盤面状態をテキストでプロンプトに渡し、最適な手（列・回転）を JSON で返す

#### 5.2 プロンプト設計
```
あなたはぷよぷよの AI プレイヤーです。
現在の盤面（6×13）と次のぷよペアを受け取り、
最適な配置（列番号 0-5、回転 0-3）を JSON で返してください。

盤面:
{board}

次のぷよ: {color1} / {color2}

{"col": <0-5>, "rotation": <0-3>}
```

#### 5.3 API エンドポイント
- `POST /api/ai-move`
  - Request: `{ board: string[][], pair: [string, string] }`
  - Response: `{ col: number, rotation: number }`

#### 5.4 タイミング
- プレイヤーがぷよを落としたターン終了後、AIのターンを自動実行
- AI の思考中は盤面をロック表示（スピナー）

---

### 6. スコアリング

| 条件 | 点数 |
|---|---|
| 1チェーン目の消去 | 消去数 × 10 |
| 2チェーン目以降 | 消去数 × 10 × チェーン数 |
| 連鎖ボーナス | チェーン数 × 50 |

---

### 7. 技術スタック

| 役割 | 技術 |
|---|---|
| フロントエンド | Next.js (App Router) + TypeScript |
| スタイリング | Tailwind CSS |
| AI 連携 | Anthropic SDK (`@anthropic-ai/sdk`) |
| ゲームエンジン | TypeScript 実装（`game.py` を移植） |
| 状態管理 | React `useState` / `useReducer` |

---

### 8. ディレクトリ構成（予定）

```
src/
├── app/
│   ├── page.tsx          # ゲーム画面エントリ
│   ├── layout.tsx
│   └── api/
│       └── ai-move/
│           └── route.ts  # Claude AI への問い合わせ
├── components/
│   ├── GameBoard.tsx
│   ├── PuyoCell.tsx
│   ├── NextPuyo.tsx
│   ├── ScorePanel.tsx
│   └── GameScreen.tsx
├── lib/
│   ├── game.ts           # ゲームロジック（game.py 移植）
│   └── types.ts          # 型定義
└── hooks/
    └── useGameLoop.ts    # ゲームループ・キー入力管理
```

---

### 9. 開発フェーズ

| フェーズ | 内容 |
|---|---|
| Phase 1 | ゲームエンジン (`lib/game.ts`) の TypeScript 実装 |
| Phase 2 | 盤面描画コンポーネント実装 |
| Phase 3 | プレイヤー操作（キー入力）実装 |
| Phase 4 | Claude AI API 連携 (`/api/ai-move`) |
| Phase 5 | 対戦UI・スコア・ゲームオーバー処理 |
