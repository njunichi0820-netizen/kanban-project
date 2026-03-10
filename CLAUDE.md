# CLAUDE.md — SPR Knowledge Map Project

## What is this project?
SPR（Self-Piercing Rivet）技術検証項目のインタラクティブナレッジマップ。D3.js circle packingによるサークルマップ＋概要カード＋リスト＋5M+Eチェックの4タブ構成。単一HTMLファイル。

## Key files
- `knowledge-map-6lv.html` — メインアプリ（~1,666行）
- `HANDOFF.md` — 詳細な設計・データ構造・制約の解説
- `SPR_テーマ企画連鎖一望化_見やすい版.xlsx` — 元データ（152行、シート「ツリー整理版」）

## Critical constraints — DO NOT MODIFY
1. **`morph(k)` function** — ピクセルサイズベースのラベル表示制御。閾値(20px/25px/30px等)、lin()計算、baseFontSize設定を一切変更しないこと
2. **`buildMap()` function** — D3 circle packing描画。glow effect、ラベルstroke色、hit area含む
3. **Label stroke colors** — 親: `stroke:rgba(250,251,253,.92)` / リーフ: `stroke:rgba(255,255,255,.85)`

## Data hierarchy (6 levels)
```
Lv1: B列(上位項目) → Lv2: A列(QCDE分類) → Lv3: D列(要件項目) → Lv4: I列(技術確認項目) → Lv5: N列(因子) → Lv6: O列(水準)
```
QCDE分類の「D」は「D:設備」（「D:納期」ではない）

## Tech stack
D3.js 7.8.5, DM Sans + Noto Sans JP, Vanilla JS, single HTML file

## UI theme
White clean modern — bg `#F6F8FB`, cards `#FFFFFF`, accent `#4F6CF7`. SVG icons (no emoji in UI).

## Read HANDOFF.md for full details
Contains: complete function reference, data structures, color palette, architecture diagram, and future integration plans.
