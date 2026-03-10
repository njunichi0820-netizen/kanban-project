# SPR テーマ企画連鎖 ナレッジマップ — Claude Code 引き継ぎドキュメント

## プロジェクト概要

SPR（Self-Piercing Rivet）技術の検証項目をインタラクティブなナレッジマップとして可視化するシングルファイルHTMLアプリケーション。D3.jsのcircle packingを使ったサークルマップ、概要カード一覧、リスト表示、5M+Eチェック機能を持つ。

## 成果物

- **`knowledge-map-6lv.html`** — 本体（約1,666行、単一HTML）

## データソース

- **`SPR_テーマ企画連鎖一望化_見やすい版.xlsx`** — シート「ツリー整理版」
- 152行のデータ。列構造:
  - A列: QCDE分類（Q/C/D/M）
  - B列: 上位項目（溶接総投資守り切り、手直し率、可動率 等）
  - D列: 要件項目（強度、サイクルタイム、検査 等）
  - I列: 技術確認項目（GAPタフネス検証、形状バラつき検証 等）
  - N列: 因子（ADC、ダイ、リベット 等）
  - O列: 水準（鋳巣、ダイ摩耗、軸ズレ 等）
- **注意**: A列の「D」は「D:設備」と表示する（「D:納期」ではない）

## アーキテクチャ

### 4タブ構成
1. **概要** — カードグリッド表示。上位要件別 / 要件項目別のトグル切替あり
2. **サークルマップ** — D3.js circle packing。上位項目別（6階層）/ QCDE分類別（5階層）のトグル切替あり
3. **リスト** — テーブル表示
4. **5M+E チェック** — 5M+E観点での網羅性チェック

### 6階層構造（フルモード）
```
Lv1: B列 — 上位項目（最大の円、9個）
Lv2: A列 — QCDE分類（Q:品質 / C:コスト / D:設備 / M:管理）
Lv3: D列 — 要件項目
Lv4: I列 — 技術確認項目
Lv5: N列 — 因子
Lv6: O列 — 水準（リーフノード、約150個）
```

### QCDE分類別モード（5階層）
Lv1をスキップし、同じQCDE分類を1つの大円にマージ:
```
Lv1: QCDE分類（Q:品質 / C:コスト / D:設備 / M:管理）
Lv2: 要件項目
Lv3: 技術確認項目
Lv4: 因子
Lv5: 水準
```

## ⚠️ 絶対に変更してはいけないもの（最重要）

### morph() 関数
ピクセルサイズベースのラベル表示制御ロジック。以下の閾値・ロジックを一切変更しないこと:

```javascript
function morph(k){
  // ...
  // depth 1: pixelR > 30 ? 1 : lin(pixelR, 15, 30, 0, 1)
  // depth 2: pixelR > 25 ? lin(k,.4,1,0,1) : 0
  // depth 3: pixelR > 22 ? lin(k,.5,1.5,0,1) : 0
  // depth 4: pixelR >= 20 ? 1 : 0
  // depth 5: pixelR >= 18 ? 1 : 0
  // depth 6+: pixelR >= 20 ? 1 : 0
  // baseFontSize: depth<=1?18 : depth===2?15 : depth===3?13 : depth===4?12 : 11
  // maxFontPx = d.r * (d.children ? 0.4 : 1.6)
}
```

### buildMap() 関数
D3 circle packing の構築ロジック。glow effect、ラベル描画（白ストローク/ハロー）、hit area のコードも変更不可。

### ラベル描画の色設定
- 親ラベル: `fill:col`, `stroke:rgba(250,251,253,.92)` (白ハロー)
- リーフラベル: `fill:#1A1F36`, `stroke:rgba(255,255,255,.85)` (白ハロー)

## 現在のUI設計

### テーマ
- **ホワイトクリーンモダン** — 背景 `#F6F8FB`、カード `#FFFFFF`
- フォント: DM Sans + Noto Sans JP

### 概要カード（参考画像準拠で実装済み）
- 左端4pxの単色カラーアクセントバー
- 右上に半円デコレーション（opacity .08）
- SVGアイコン（絵文字ではなくSVG: shield/gear/search/tool/cost を自動選択）
- 「INCLUSIONS / N FILES」+ ファイルプレビュー2件 + 「+ N more items…」
- 「↗ Click to Zoom」フッター

### ズーム詳細画面（参考画像準拠で実装済み）
- ソリッドカラー（単色）のバナーヘッダー
- 右端に円形「←」戻るボタン
- 「INCLUDED FILES (N)」セクション
- ドキュメントアイコン付きファイルカード

### サークルマップ
- マップ上部中央にトグルスイッチ（上位項目別 / QCDE分類別）
- 左サイドバーにノード詳細（階層ラベル自動切替）
- 右下にズーム操作ボタン
- 左下に凡例

## 主要JS関数一覧

| 関数名 | 役割 | 変更可否 |
|--------|------|----------|
| `morph(k)` | ズームレベルに応じたラベル/円の表示制御 | **変更不可** |
| `buildMap()` | D3 circle packing の描画 | **変更不可** |
| `getMapData(mode)` | full/skipモードでデータツリーを生成 | 変更可（データ構造のみ） |
| `setMapMode(mode)` | マップトグル切替 | 変更可 |
| `buildOverview()` | 概要カード生成 | 変更可 |
| `setOvMode(mode)` | 概要トグル切替 | 変更可 |
| `getOvCats()` | 概要用データのグルーピング | 変更可 |
| `openDetail(ev, catId)` | ズーム詳細の展開アニメーション | 変更可 |
| `renderDetail(cat)` | ズーム詳細のヘッダー描画 | 変更可 |
| `renderItems(cat, subId)` | ズーム詳細のファイルリスト描画 | 変更可 |
| `openMapSidebar(d)` | マップサイドバーの描画 | 変更可 |
| `buildListView()` | リストビュー構築 | 変更可 |
| `buildCheckView()` | 5M+Eチェック構築 | 変更可 |

## データ構造

### CATS配列（概要・リスト用）
```javascript
CATS = [
  {
    id: "溶接総投資守り切",
    title: "溶接総投資守り切り",
    icon: "📌",         // 実際にはcatIcon()でSVGに変換
    themeColor: "#4F6CF7",
    description: "...",
    kpi: "$182.1M(HCM) 225.1ｵｸ円(YO)",
    subs: [
      {
        id: "s_C_台当たりコスト",
        name: "[C:コスト] 台当たりコスト",
        tags: [],
        updated: "2025-06",
        items: [
          { id:"x", name:"台当たりコスト目標", type:"管理", status:"standard", author:"SPR-PJ", date:"2025/06", detail:"..." },
          ...
        ]
      },
      ...
    ]
  },
  ...
];
```

### RAW_DATA（サークルマップ用）
6階層のネストされたオブジェクト:
```javascript
RAW_DATA = {
  name: "SPR テーマ企画連鎖",
  children: [
    { name: "溶接総投資守り切り", color: "#4F6CF7", kpi: "...",
      children: [
        { name: "C:コスト", color: "...",
          children: [
            { name: "台当たりコスト", req: "ボルト以下", value: 1 },
            ...
          ]
        }
      ]
    },
    ...
  ]
};
```

## 今後の想定作業

- 既存のプロジェクト（Streamlit/FastAPIベースのSPRダッシュボード等）との統合
- SharePoint連携によるリアルデータ取得
- データの動的読み込み（現在はHTMLにハードコード）
- PWA化、認証連携

## カラーパレット（カテゴリ別）

| カテゴリ | Color |
|----------|-------|
| 溶接総投資守り切り | `#4F6CF7` |
| WE工場生産台数 | `#10B981` |
| 可動率(ISO準拠) | `#EC4899` |
| 手直し率 | `#F59E0B` |
| 直直要員 | `#8B5CF6` |
| - (環境負荷) | `#14B8A6` |
| WE工場スペース | `#EF4444` |
| エネルギーミニマム... | `#06B6D4` |
| エルゴイエロー作業 | `#F97316` |

## QCDE分類カラー（skipモード）

| 分類 | Color |
|------|-------|
| Q:品質 | `#4F6CF7` |
| C:コスト | `#14B8A6` |
| D:設備 | `#10B981` |
| M:管理 | `#F59E0B` |

## 技術スタック

- D3.js 7.8.5（CDN）
- DM Sans + Noto Sans JP（Google Fonts CDN）
- Vanilla JS（フレームワーク無し）
- 単一HTMLファイル

## 開発方針

- 単一ファイルHTMLでのプロトタイプを優先
- Google Material Design寄りのクリーンUI
- 絵文字ではなくSVGアイコンを使用
- 非エンジニアも使えるツールを目指す
