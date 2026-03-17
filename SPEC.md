# 数学マスター — 仕様書

## 概要

高校数学「数と式」分野の学習アプリ。公式暗記・用語確認・解法パターン判別・練習問題の4モードで、体系的な学習を支援する。

- **対象ユーザー**: 高校1年生〜受験生（塾の補助教材として使用）
- **デプロイ先**: GitHub Pages（静的サイト）
- **認証**: なし（誰でもアクセス可）
- **データ永続化**: localStorage（学習履歴・自己評価の保存）

---

## 技術スタック

| 項目 | 選定 | 理由 |
|------|------|------|
| フレームワーク | Vite + React (TypeScript) | 高速ビルド、型安全 |
| スタイリング | Tailwind CSS | ユーティリティベースで生産性高い |
| 数式レンダリング | KaTeX | MathJax より軽量・高速 |
| デプロイ | GitHub Actions → GitHub Pages | 自動デプロイ |
| データ | JSON ファイル（`src/data/`配下） | DB不要、Git管理可能 |

### ディレクトリ構成

```
math-master/
├── public/
│   └── favicon.svg
├── src/
│   ├── data/
│   │   ├── chapters.json          # チャプター一覧（メタ情報）
│   │   ├── polynomial.json        # 整式の計算・展開
│   │   ├── factoring.json         # 因数分解
│   │   ├── realnumbers.json       # 実数・平方根・対称式
│   │   └── equations.json         # 方程式と不等式
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── ModeTabs.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── modes/
│   │   │   ├── FormulaCards.tsx    # 公式フラッシュカード
│   │   │   ├── TermQuiz.tsx       # 用語クイズ
│   │   │   ├── PatternQuiz.tsx    # 解法パターン判別
│   │   │   └── PracticeProblems.tsx # 練習問題
│   │   ├── shared/
│   │   │   ├── MathDisplay.tsx    # KaTeX ラッパー
│   │   │   ├── RatingButtons.tsx  # ○△× 評価ボタン
│   │   │   ├── QuizOption.tsx     # 4択の選択肢
│   │   │   └── CompletionCard.tsx # 完了画面
│   │   └── App.tsx
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   └── useStudySession.ts     # セッション管理（進捗・統計）
│   ├── types/
│   │   └── index.ts               # 型定義
│   ├── utils/
│   │   ├── shuffle.ts
│   │   └── katex.ts               # KaTeX ヘルパー
│   ├── main.tsx
│   └── index.css                  # Tailwind directives + カスタムCSS
├── prototype.html                 # プロトタイプ（参考資料）
├── SPEC.md                        # この仕様書
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── .github/
    └── workflows/
        └── deploy.yml             # GitHub Pages 自動デプロイ
```

---

## 型定義（`src/types/index.ts`）

```typescript
// チャプターのメタ情報
export interface Chapter {
  id: string;           // 例: "polynomial"
  name: string;         // 例: "整式の計算・展開"
  description?: string; // 任意の説明文
  order: number;        // 表示順
}

// 公式フラッシュカード
export interface Formula {
  id: string;
  category: string;     // 例: "展開公式[1]"（カード上部に表示）
  name: string;         // 例: "和の2乗"（表面に表示）
  formula: string;      // KaTeX 文字列（裏面に表示）
  example?: string;     // KaTeX 文字列（表面の補足）
  note?: string;        // 注意点・覚え方（裏面の補足）
}

// 用語
export interface Term {
  id: string;
  term: string;         // 用語名
  definition: string;   // 定義文
  example?: string;     // KaTeX 文字列（補足の具体例）
}

// 解法パターン
export interface Pattern {
  id: string;
  problem: string;      // KaTeX 文字列（問題の式）
  prompt: string;       // 問いかけ文（例: "この展開にはどの工夫が有効？"）
  correct: string;      // 正解の選択肢テキスト
  options: string[];    // 4つの選択肢（correct を含む、表示時にシャッフル）
  explanation: string;  // 解説文
}

// 練習問題
export interface Problem {
  id: string;
  problem: string;      // KaTeX 文字列（問題文）
  hints: string[];      // ヒント配列（段階的に表示）
  solution: string;     // KaTeX 文字列（最終答え）
  steps: string[];      // KaTeX 文字列の配列（解法の各ステップ）
}

// チャプターのデータ（1つのJSONファイルの構造）
export interface ChapterData {
  id: string;
  formulas: Formula[];
  terms: Term[];
  patterns: Pattern[];
  problems: Problem[];
}

// 学習履歴（localStorage 保存用）
export interface StudyRecord {
  chapterId: string;
  mode: 'formula' | 'term' | 'pattern' | 'practice';
  date: string;         // ISO 8601
  total: number;
  correct: number;      // term, pattern モード用
  ratings?: {           // formula, practice モード用
    good: number;
    ok: number;
    bad: number;
  };
}
```

---

## 画面構成

### ヘッダー（固定）

- アプリ名「数学マスター」
- チャプター選択ドロップダウン（chapters.json から生成）
- チャプター切り替え時、各モードの状態はリセットされる

### モードタブ（ヘッダー直下）

| タブ | アイコン | ラベル |
|------|----------|--------|
| 公式 | 📐 | 公式 |
| 用語 | 📖 | 用語 |
| 解法 | 🧩 | 解法 |
| 演習 | ✏️ | 演習 |

---

## 各モードの詳細仕様

### モード1: 公式フラッシュカード（FormulaCards）

**目的**: 公式の暗記確認

**フロー**:
1. カードの**表面**に公式名（name）と補足例（example）を表示
2. タップ/クリックで**裏面**にフリップ → 公式（formula）と注意点（note）を表示
3. 裏面表示後、3段階の自己評価ボタンが出現:
   - ○ わかった（good）
   - △ あやしい（ok）
   - × 忘れてた（bad）
4. 評価後、次のカードへ
5. 全カード終了時:
   - 統計表示（○△× の各件数）
   - △× のカードがある場合「△×の N 枚を復習する」ボタン
   - 「最初からやり直す」ボタン

**表示仕様**:
- カードフリップアニメーション（CSS 3D transform, 0.5s）
- 表面: category をラベル表示、name を大きく表示、example を小さく
- 裏面: formula を KaTeX display モードで表示、note を補足表示
- カードの出題順はシャッフル

---

### モード2: 用語クイズ（TermQuiz）

**目的**: 数学用語と定義の対応を確認

**フロー**:
1. ランダムに「定義→用語」か「用語→定義」の出題形式を選択
2. 正解＋ランダム3つの誤答で4択を生成（選択肢はシャッフル）
3. 選択肢をタップ → 正誤判定
4. 正解/不正解のフィードバック ＋ 正しい定義の表示 ＋ example があれば表示
5. 「次の問題」ボタンで次へ
6. 全問終了時: 正答数/総数、正答率を表示

**表示仕様**:
- 選択肢マーカー: ア、イ、ウ、エ
- 正解: 緑背景 + 緑ボーダー
- 不正解: 赤背景 + 赤ボーダー（選択したもの）+ 正解も緑で表示
- 解説エリアはスライドアップアニメーション

---

### モード3: 解法パターン判別（PatternQuiz）

**目的**: 問題を見て「どの手法を使うか」を判別する力を鍛える

**フロー**:
1. 問題の式（problem, KaTeX）と問いかけ文（prompt）を表示
2. 4つの解法選択肢を表示（options, シャッフル）
3. 選択 → 正誤判定
4. 正解表示 + 解説（explanation）表示
5. 「次の問題」で次へ
6. 全問終了時: 正答数/総数、正答率

**表示仕様**:
- 用語クイズと同じUI構造（4択）
- 問題の式は display モード（中央寄せ・大きめ）で表示

---

### モード4: 練習問題（PracticeProblems）

**目的**: 実際に解く練習。ヒントを段階的に表示し、最後に解答を確認

**フロー**:
1. 問題文（problem, KaTeX display モード）を表示
2. 「ヒント1を見る」ボタン → 押すとヒント1が表示 → 「ヒント2を見る」が出現 → ...
3. 全ヒント表示後 or いつでも「解答を見る」ボタンを押せる
4. 解答表示: steps を順に表示 + 最終答え（solution）をハイライト
5. 自己評価ボタン（○△×）
6. 評価後「次の問題」で次へ

**表示仕様**:
- ヒント: 黄色背景のボックス、💡 アイコン付き
- 解答: 青系背景のボックス、ステップごとに区切り線
- 最終答えは薄い青背景でハイライト

---

## KaTeX 数式表示について

### MathDisplay コンポーネント仕様

```tsx
interface MathDisplayProps {
  tex: string;        // KaTeX 文字列
  display?: boolean;  // true: 独立行（中央寄せ）、false: インライン
}
```

- `katex.render()` を使用（dangerouslySetInnerHTML は避ける）
- `useRef` + `useEffect` で DOM に直接レンダリング
- `throwOnError: false` でエラー時はソーステキストをフォールバック表示
- display モードは `displayMode: true` で中央寄せ・大きめ表示

### KaTeX のインストール

```bash
npm install katex
```

`index.css` で KaTeX の CSS をインポート:
```css
@import 'katex/dist/katex.min.css';
```

---

## データファイル仕様

### `src/data/chapters.json`

チャプターの一覧とメタ情報。

```json
[
  { "id": "polynomial", "name": "整式の計算・展開", "order": 1 },
  { "id": "factoring", "name": "因数分解", "order": 2 },
  { "id": "realnumbers", "name": "実数・平方根・対称式", "order": 3 },
  { "id": "equations", "name": "方程式と不等式", "order": 4 }
]
```

### 各チャプターの JSON（例: `src/data/polynomial.json`）

```json
{
  "id": "polynomial",
  "formulas": [
    {
      "id": "f1",
      "category": "展開公式[1]",
      "name": "和の2乗",
      "formula": "(a+b)^2 = a^2 + 2ab + b^2",
      "example": "(2x+3y)^2 = 4x^2+12xy+9y^2",
      "note": "中学範囲の基本。2乗の係数に注意"
    }
  ],
  "terms": [...],
  "patterns": [...],
  "problems": [...]
}
```

**データファイルは別途作成する**（この仕様書には含めない）。
PDFの全内容を網羅的に抽出した JSON ファイルを `src/data/` に配置すること。

---

## 学習履歴（localStorage）

### 保存キー

- `math-master-records`: `StudyRecord[]` の JSON 文字列

### 保存タイミング

- 各モードで1周完了したとき

### 利用箇所

- 現時点では保存のみ。将来的に統計画面やスペースドリピティション（間隔反復）に活用予定

---

## デザイン方針

### カラーパレット

| 用途 | 色 |
|------|----|
| 背景 | `#f5f1eb`（温かみのあるオフホワイト） |
| カード背景 | `#ffffff` |
| テキスト | `#1a1a2e` |
| サブテキスト | `#6b7280` |
| アクセント1（暖色） | `#c2410c`（ヒント・演習系） |
| アクセント2（寒色） | `#1e40af`（クイズ・進捗系） |
| 正解 | `#15803d` / `#dcfce7` |
| 不正解 | `#b91c1c` / `#fee2e2` |
| ヘッダー | `#1a1a2e` → `#16213e` のグラデーション |

### フォント

- 本文: `Noto Sans JP`（weight: 300, 400, 500, 700）
- 見出し: `Zen Kaku Gothic New`（weight: 700, 900）
- Google Fonts から読み込み

### レスポンシブ

- モバイルファースト
- ブレークポイント: 640px（sm）で微調整
- メインコンテンツ最大幅: 720px、中央寄せ

---

## GitHub Pages デプロイ

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### `vite.config.ts` の注意点

```typescript
export default defineConfig({
  base: '/リポジトリ名/',  // GitHub Pages 用
  plugins: [react()],
})
```

---

## 将来の拡張予定

- [ ] 他分野の追加（2次関数、集合と論理、場合の数、数列 等）
- [ ] スペースドリピティション（間隔反復学習）
- [ ] 学習統計ダッシュボード
- [ ] Excel → JSON 変換スクリプト（大量データ投入用）
- [ ] PWA 対応（オフライン利用）
- [ ] ダークモード

---

## 参考資料

- `prototype.html`: 動作するプロトタイプ（単一 HTML ファイル）。UIの雰囲気・動作の参考として使用
- 元データ: `2in1_数と式.pdf`（examist.jp の体系的な数学教材）
