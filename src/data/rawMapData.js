// Extracted from knowledge-map-6lv.html
// CATS - overview card data
export const CATS = [
  {id:"溶接総投資守り切",title:"溶接総投資守り切り",icon:"📌",themeColor:"#4F6CF7",
   description:"溶接総投資守り切り",kpi:"$182.1M(HCM) 225.1ｵｸ円(YO)",
   subs:[
     {id:"s_C_台当たりコスト",name:"[C:コスト] 台当たりコスト",tags:[],updated:"2025-06",items:[
       {id:"x",name:"台当たりコスト",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"- — - — 台当たりコスト"},
     ]},
     {id:"s_C_投資",name:"[C:コスト] 投資",tags:[],updated:"2025-06",items:[
       {id:"x",name:"投資",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"- — - — 投資"},
     ]},
   ]
  },
  {id:"WE工場生産台数",title:"WE工場生産台数",icon:"📌",themeColor:"#10B981",
   description:"WE工場生産台数",kpi:"1000UPD",
   subs:[
     {id:"s_D_サイクルタイム",name:"[D:設備] サイクルタイム",tags:["設備システム"],updated:"2025-06",items:[
       {id:"x",name:"エアー流量",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"サイクルタイム検証 — 設備システム — エアー流量"},
       {id:"x",name:"ホース長さ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"サイクルタイム検証 — 設備システム — ホース長さ"},
       {id:"x",name:"マガジン",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"サイクルタイム検証 — 設備システム — マガジン"},
     ]},
   ]
  },
  {id:"可動率(ISO準",title:"可動率(ISO準拠)",icon:"📌",themeColor:"#EC4899",
   description:"可動率(ISO準拠)",kpi:"0.973",
   subs:[
     {id:"s_D_耐久性",name:"[D:設備] 耐久性",tags:["連打数", "瞬停影響"],updated:"2025-06",items:[
       {id:"x",name:"瞬停影響",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"瞬停時ツール影響検証 — 瞬停影響 — 瞬停影響"},
       {id:"x",name:"連打N数",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"耐久試験 — 連打数 — 連打N数"},
     ]},
     {id:"s_D_要素信頼性",name:"[D:設備] 要素信頼性",tags:["復旧方法", "連打数", "エラー表示", "再加工方案"],updated:"2025-06",items:[
       {id:"x",name:"連打N数",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"信頼性検証 — 連打数 — 連打N数"},
       {id:"x",name:"供給/加工時姿勢",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"最適艤装検証 — 艤装 — 供給/加工時姿勢"},
       {id:"x",name:"エラー表示",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"エラー表示機能構築検証 — エラー表示 — エラー表示"},
       {id:"x",name:"再加工方案",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"再加工手法構築検証 — 再加工方案 — 再加工方案"},
       {id:"x",name:"復旧方法",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"復旧方法/時間検証 — 復旧方法 — 復旧方法"},
       {id:"x",name:"負荷大影響",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"負荷大時通信影響検証 — 負荷大影響 — 負荷大影響"},
     ]},
   ]
  },
  {id:"手直し率",title:"手直し率",icon:"📌",themeColor:"#F59E0B",
   description:"手直し率",kpi:"0.954",
   subs:[
     {id:"s_D_良品率",name:"[D:設備] 良品率",tags:["品質"],updated:"2025-06",items:[
       {id:"x",name:"内部品質(インタロック/リベットクラック)",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"良品率検証 — 品質 — 内部品質(インタロック/リベットクラック)"},
       {id:"x",name:"外観品質(ヘッドハイト/裏面クラック)",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"良品率検証 — 品質 — 外観品質(ヘッドハイト/裏面クラック)"},
       {id:"x",name:"リベット反転",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"良品率検証 — 品質 — リベット反転"},
     ]},
     {id:"s_Q_周辺品質",name:"[Q:品質] 周辺品質",tags:["ADC製品", "打順", "GAP", "引き込み量"],updated:"2025-06",items:[
       {id:"x",name:"伸び",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"変形影響明確化検証 — ADC製品 — 伸び"},
       {id:"x",name:"剛性/形状",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"変形影響明確化検証 — ADC製品 — 剛性/形状"},
       {id:"x",name:"実ワーク 基準PIN穴影響",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"変形影響明確化検証 — ADC製品 — 実ワーク 基準PIN穴影響"},
       {id:"x",name:"GAP量",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"変形影響明確化検証 — GAP — GAP量"},
       {id:"x",name:"JIG押さえ量",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"変形影響明確化検証 — JIG押さえ量 — JIG押さえ量"},
       {id:"x",name:"引き込み量",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"変形影響明確化検証 — 引き込み量 — 引き込み量"},
       {id:"x",name:"打順影響",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"変形影響明確化検証 — 打順 — 打順影響"},
       {id:"x",name:"ADC品質(曲げ/伸び)",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"端部距離明確化検証 — 端部距離 — ADC品質(曲げ/伸び)"},
       {id:"x",name:"端部距離",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"端部距離明確化検証 — 端部距離 — 端部距離"},
     ]},
     {id:"s_Q_強度",name:"[Q:品質] 強度",tags:["リベット", "GAP", "N数", "ADC"],updated:"2025-06",items:[
       {id:"x",name:"N数",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"板組N増し検証 — N数 — N数"},
       {id:"x",name:"ダイ-板間 GAP量",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"GAPタフネス検証 — GAP — ダイ-板間 GAP量"},
       {id:"x",name:"ノーズピース-板間 GAP量",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"GAPタフネス検証 — GAP — ノーズピース-板間 GAP量"},
       {id:"x",name:"板間GAP量",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"GAPタフネス検証 — GAP — 板間GAP量"},
       {id:"x",name:"移動時抵抗",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"RB姿勢タフネス検証 — パンチ — 移動時抵抗"},
       {id:"x",name:"フィンガーへの収まり",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"RB姿勢タフネス検証 — リベット — フィンガーへの収まり"},
       {id:"x",name:"ノイズ影響",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"RB姿勢タフネス検証 — 加圧波形 — ノイズ影響"},
       {id:"x",name:"ダイ取付忘れ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"人外乱タフネス検証 — ダイ — ダイ取付忘れ"},
       {id:"x",name:"違うダイを取り付ける",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"人外乱タフネス検証 — ダイ — 違うダイを取り付ける"},
       {id:"x",name:"はずれ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"人外乱タフネス検証 — ノーズピース — はずれ"},
       {id:"x",name:"ガタ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"人外乱タフネス検証 — ノーズピース — ガタ"},
       {id:"x",name:"取付ミス(ガタなど)",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"人外乱タフネス検証 — ノーズピース — 取付ミス(ガタなど)"},
       {id:"x",name:"加圧条件変更",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"人外乱タフネス検証 — パンチ — 加圧条件変更"},
       {id:"x",name:"取付ミス(ガタなど)",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"人外乱タフネス検証 — パンチ — 取付ミス(ガタなど)"},
       {id:"x",name:"違うリベットを入れる",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"人外乱タフネス検証 — リベット — 違うリベットを入れる"},
       {id:"x",name:"ガンたわみ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"位置バラつきタフネス検証 — 位置 — ガンたわみ"},
       {id:"x",name:"位置",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"位置バラつきタフネス検証 — 位置 — 位置"},
       {id:"x",name:"端部距離",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"位置バラつきタフネス検証 — 位置 — 端部距離"},
       {id:"x",name:"軸ズレ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"位置バラつきタフネス検証 — 位置 — 軸ズレ"},
       {id:"x",name:"角度",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"位置バラつきタフネス検証 — 角度 — 角度"},
       {id:"x",name:"伸び",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"内部品質タフネス検証 — ADC — 伸び"},
       {id:"x",name:"外観品質",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"内部品質タフネス検証 — ADC — 外観品質"},
       {id:"x",name:"曲げ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"内部品質タフネス検証 — ADC — 曲げ"},
       {id:"x",name:"材料成分",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"内部品質タフネス検証 — ADC — 材料成分"},
       {id:"x",name:"鋳巣",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"内部品質タフネス検証 — ADC — 鋳巣"},
       {id:"x",name:"熱処理",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"内部品質タフネス検証 — ダイ — 熱処理"},
       {id:"x",name:"強度/成分",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"内部品質タフネス検証 — リベット — 強度/成分"},
       {id:"x",name:"平面度",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ADC — 平面度"},
       {id:"x",name:"抜き勾配",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ADC — 抜き勾配"},
       {id:"x",name:"板厚ばらつき",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ADC — 板厚ばらつき"},
       {id:"x",name:"ダイ傷",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ダイ — ダイ傷"},
       {id:"x",name:"ダイ割れ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ダイ — ダイ割れ"},
       {id:"x",name:"ダイ容量",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ダイ — ダイ容量"},
       {id:"x",name:"ダイ摩耗",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ダイ — ダイ摩耗"},
       {id:"x",name:"ダイ破損",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ダイ — ダイ破損"},
       {id:"x",name:"ダイ詰まり",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ダイ — ダイ詰まり"},
       {id:"x",name:"ノーズピース傷",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ノーズピース — ノーズピース傷"},
       {id:"x",name:"ノーズピース変形",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ノーズピース — ノーズピース変形"},
       {id:"x",name:"ノーズピース摩耗",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ノーズピース — ノーズピース摩耗"},
       {id:"x",name:"ノーズピース曲がり",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ノーズピース — ノーズピース曲がり"},
       {id:"x",name:"ノーズピース破損",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ノーズピース — ノーズピース破損"},
       {id:"x",name:"ノーズピース長さ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — ノーズピース — ノーズピース長さ"},
       {id:"x",name:"パンチフレ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — パンチ — パンチフレ"},
       {id:"x",name:"パンチ傷",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — パンチ — パンチ傷"},
       {id:"x",name:"パンチ摩耗",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — パンチ — パンチ摩耗"},
       {id:"x",name:"パンチ破損",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — パンチ — パンチ破損"},
       {id:"x",name:"リベット長さ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — リベット — リベット長さ"},
       {id:"x",name:"内部体積",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — リベット — 内部体積"},
       {id:"x",name:"寸法公差",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"形状バラつき検証 — リベット — 寸法公差"},
       {id:"x",name:"ゴミカミ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"異物タフネス検証 — ADC — ゴミカミ"},
     ]},
     {id:"s_Q_裏面品質",name:"[Q:品質] 裏面品質",tags:["ADC", "材料SPEC", "ダイ"],updated:"2025-06",items:[
       {id:"x",name:"上記検証のなかで推進",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"ADC反映項目明確化 — 材料SPEC — 上記検証のなかで推進"},
       {id:"x",name:"上記検証のなかで推進",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"裏面クラックSPEC最適化 — 材料SPEC — 上記検証のなかで推進"},
       {id:"x",name:"RR ADC ERトライワーク",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"裏面クラックメカニズム検証 — ADC — RR ADC ERトライワーク"},
       {id:"x",name:"曲げ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"裏面クラックメカニズム検証 — ADC — 曲げ"},
       {id:"x",name:"表面部の伸び",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"裏面クラックメカニズム検証 — ADC — 表面部の伸び"},
       {id:"x",name:"フラットダイ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"最適ダイ検証 — ダイ — フラットダイ"},
       {id:"x",name:"リングダイ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"最適ダイ検証 — ダイ — リングダイ"},
     ]},
   ]
  },
  {id:"直直要員",title:"直直要員",icon:"📌",themeColor:"#8B5CF6",
   description:"直直要員",kpi:"182名/2直 (244名@YO)",
   subs:[
     {id:"s_D_リペア",name:"[D:設備] リペア",tags:["品質", "工数"],updated:"2025-06",items:[
       {id:"x",name:"GAP影響",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"リペア手法品質検証 — 品質 — GAP影響"},
       {id:"x",name:"ロバスト性",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"リペア手法品質検証 — 品質 — ロバスト性"},
       {id:"x",name:"出張り",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"リペア手法品質検証 — 品質 — 出張り"},
       {id:"x",name:"変形",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"リペア手法品質検証 — 品質 — 変形"},
       {id:"x",name:"強度",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"リペア手法品質検証 — 品質 — 強度"},
       {id:"x",name:"耐食性",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"リペア手法品質検証 — 品質 — 耐食性"},
       {id:"x",name:"共通板組範囲",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"リペア手法品質検証 — 工数 — 共通板組範囲"},
       {id:"x",name:"加工工数",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"リペア手法品質検証 — 工数 — 加工工数"},
     ]},
     {id:"s_D_検査",name:"[D:設備] 検査",tags:["設備システム", "貫通クラック", "各エラー", "材料バラつき"],updated:"2025-06",items:[
       {id:"x",name:"人によるバラつき",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"ヘッドハイト検査検証 — 人測り方バラつき — 人によるバラつき"},
       {id:"x",name:"TP",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"ヘッドハイト検査検証 — 材料バラつき — TP"},
       {id:"x",name:"実機(密度低)",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"ヘッドハイト検査検証 — 材料バラつき — 実機(密度低)"},
       {id:"x",name:"抜き勾配",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"ヘッドハイト検査検証 — 材料バラつき — 抜き勾配"},
       {id:"x",name:"HPA",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"ヘッドハイト検査検証 — 異物バラつき — HPA"},
       {id:"x",name:"パッケージチェック",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"リベット検知機能検証 — 設備システム — パッケージチェック"},
       {id:"x",name:"フィーダー部",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"リベット検知機能検証 — 設備システム — フィーダー部"},
       {id:"x",name:"ホース部センサ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"リベット検知機能検証 — 設備システム — ホース部センサ"},
       {id:"x",name:"ヘッドハイト管理",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"加圧カーブ機能検証 — 各エラー — ヘッドハイト管理"},
       {id:"x",name:"リベットなし",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"加圧カーブ機能検証 — 各エラー — リベットなし"},
       {id:"x",name:"反転",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"加圧カーブ機能検証 — 各エラー — 反転"},
       {id:"x",name:"板厚変化",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"加圧カーブ機能検証 — 各エラー — 板厚変化"},
       {id:"x",name:"軸ズレ",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"加圧カーブ機能検証 — 各エラー — 軸ズレ"},
       {id:"x",name:"部位(円周クラック検知)",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"裏面クラック検査検証 — 貫通クラック — 部位(円周クラック検知)"},
     ]},
     {id:"s_D_量産管理手法",name:"[D:設備] 量産管理手法",tags:["設備条件"],updated:"2025-06",items:[
       {id:"x",name:"ストローク",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"量産管理手法構築検証 — 設備条件 — ストローク"},
       {id:"x",name:"加圧",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"量産管理手法構築検証 — 設備条件 — 加圧"},
     ]},
   ]
  },
  {id:"-",title:"-",icon:"📌",themeColor:"#14B8A6",
   description:"-",kpi:"-",
   subs:[
     {id:"s_M_環境負荷",name:"[M:管理] 環境負荷",tags:[],updated:"2025-06",items:[
       {id:"x",name:"環境負荷",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"- — - — 環境負荷"},
     ]},
   ]
  },
  {id:"WE工場スペース",title:"WE工場スペース",icon:"📌",themeColor:"#EF4444",
   description:"WE工場スペース",kpi:"72,000m2以内 (40,000m2@YO)",
   subs:[
     {id:"s_M_スペース要員",name:"[M:管理] スペース要員",tags:[],updated:"2025-06",items:[
       {id:"x",name:"スペース要員",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"- — - — スペース要員"},
     ]},
   ]
  },
  {id:"エネルギーミニマ",title:"エネルギーミニマムな車体構造とプロセスを構築し、エ...",icon:"📌",themeColor:"#06B6D4",
   description:"エネルギーミニマムな車体構造とプロセスを構築し、エンドユーザーに魅力ある商品を適正な価格でタイムリーに提供すること",kpi:"生産総エネルギーの費用対効果を高める車体構造と生産プロセスを構築すること (新機種エネルギ▲30%)",
   subs:[
     {id:"s_M_標準化",name:"[M:管理] 標準化",tags:["板組素材"],updated:"2025-06",items:[
       {id:"x",name:"板組範囲",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"板組範囲明確化検証 — 板組素材 — 板組範囲"},
     ]},
   ]
  },
  {id:"エルゴイエロー作",title:"エルゴイエロー作業",icon:"📌",themeColor:"#F97316",
   description:"エルゴイエロー作業",kpi:"",
   subs:[
     {id:"s_M_安全基準",name:"[M:管理] 安全基準",tags:[],updated:"2025-06",items:[
       {id:"x",name:"安全基準",type:"検証",status:"standard",author:"SPR-PJ",date:"2025/06",detail:"- — - — 安全基準"},
     ]},
   ]
  },
];

// RAW_DATA - D3 circle packing hierarchy
export const RAW_DATA={name:"SPR テーマ企画連鎖",children:[
  {name:"溶接総投資守り切り",fullName:"溶接総投資守り切り",color:"#4F6CF7",kpi:"$182.1M(HCM) 225.1ｵｸ円(YO)",children:[
    {name:"C:コスト",color:"#4F6CF7",children:[
      {name:"台当たりコスト",color:"#4F6CF7",req:"ボルト以下",value:1},
      {name:"投資",color:"#4F6CF7",req:"総投資ボルト以下",value:1},
    ]},
  ]},
  {name:"WE工場生産台数",fullName:"WE工場生産台数",color:"#10B981",kpi:"1000UPD",children:[
    {name:"D:設備",color:"#10B981",children:[
      {name:"サイクルタイム",color:"#10B981",req:"4.9s 3.0s以下 (チャレンジ項目)",children:[
        {name:"サイクルタイム検証",color:"#10B981",perspective:"Machine：設備",children:[
          {name:"設備システム",color:"#10B981",children:[
            {name:"エアー流量",color:"#10B981",value:1},
            {name:"ホース長さ",color:"#10B981",value:1},
            {name:"マガジン",color:"#10B981",value:1},
          ]},
        ]},
      ]},
    ]},
  ]},
  {name:"可動率(ISO準拠)",fullName:"可動率(ISO準拠)",color:"#EC4899",kpi:"0.973",children:[
    {name:"D:設備",color:"#EC4899",children:[
      {name:"耐久性",color:"#EC4899",req:"1回/1月以上",children:[
        {name:"瞬停時ツール影響検証",color:"#EC4899",perspective:"Machine：設備",children:[
          {name:"瞬停影響",color:"#EC4899",children:[
            {name:"瞬停影響",color:"#EC4899",value:1},
          ]},
        ]},
        {name:"耐久試験",color:"#EC4899",perspective:"Machine：設備",children:[
          {name:"連打数",color:"#EC4899",children:[
            {name:"連打N数",color:"#EC4899",value:1},
          ]},
        ]},
      ]},
      {name:"要素信頼性",color:"#EC4899",req:"99.96%以上",children:[
        {name:"信頼性検証",color:"#EC4899",perspective:"Machine：設備",children:[
          {name:"連打数",color:"#EC4899",children:[
            {name:"連打N数",color:"#EC4899",value:1},
          ]},
        ]},
        {name:"最適艤装検証",color:"#EC4899",perspective:"Machine：設備",children:[
          {name:"艤装",color:"#EC4899",children:[
            {name:"供給/加工時姿勢",color:"#EC4899",value:1},
          ]},
        ]},
        {name:"エラー表示機能構築検証",color:"#EC4899",perspective:"Machine：設備",children:[
          {name:"エラー表示",color:"#EC4899",children:[
            {name:"エラー表示",color:"#EC4899",value:1},
          ]},
        ]},
        {name:"再加工手法構築検証",color:"#EC4899",perspective:"Machine：設備",children:[
          {name:"再加工方案",color:"#EC4899",children:[
            {name:"再加工方案",color:"#EC4899",value:1},
          ]},
        ]},
        {name:"復旧方法/時間検証",color:"#EC4899",perspective:"Machine：設備",children:[
          {name:"復旧方法",color:"#EC4899",children:[
            {name:"復旧方法",color:"#EC4899",value:1},
          ]},
        ]},
        {name:"負荷大時通信影響検証",color:"#EC4899",perspective:"Machine：設備",children:[
          {name:"負荷大影響",color:"#EC4899",children:[
            {name:"負荷大影響",color:"#EC4899",value:1},
          ]},
        ]},
      ]},
    ]},
  ]},
  {name:"手直し率",fullName:"手直し率",color:"#F59E0B",kpi:"0.954",children:[
    {name:"D:設備",color:"#F59E0B",children:[
      {name:"良品率",color:"#F59E0B",req:"99.994%以上",children:[
        {name:"良品率検証",color:"#F59E0B",perspective:"Machine：設備",children:[
          {name:"品質",color:"#F59E0B",children:[
            {name:"内部品質(インタロック/リベットクラック)",color:"#F59E0B",value:1},
            {name:"外観品質(ヘッドハイト/裏面クラック)",color:"#F59E0B",value:1},
            {name:"リベット反転",color:"#F59E0B",value:1},
          ]},
        ]},
      ]},
    ]},
    {name:"Q:品質",color:"#F59E0B",children:[
      {name:"周辺品質",color:"#F59E0B",req:"精度変化B面±0.3以下 端部割れなきこと",children:[
        {name:"変形影響明確化検証",color:"#F59E0B",perspective:"Machine：設備",children:[
          {name:"ADC製品",color:"#F59E0B",children:[
            {name:"伸び",color:"#F59E0B",value:1},
            {name:"剛性/形状",color:"#F59E0B",value:1},
            {name:"実ワーク 基準PIN穴影響",color:"#F59E0B",value:1},
          ]},
          {name:"GAP",color:"#F59E0B",children:[
            {name:"GAP量",color:"#F59E0B",value:1},
          ]},
          {name:"JIG押さえ量",color:"#F59E0B",children:[
            {name:"JIG押さえ量",color:"#F59E0B",value:1},
          ]},
          {name:"引き込み量",color:"#F59E0B",children:[
            {name:"引き込み量",color:"#F59E0B",value:1},
          ]},
          {name:"打順",color:"#F59E0B",children:[
            {name:"打順影響",color:"#F59E0B",value:1},
          ]},
        ]},
        {name:"端部距離明確化検証",color:"#F59E0B",perspective:"Machine：設備",children:[
          {name:"端部距離",color:"#F59E0B",children:[
            {name:"ADC品質(曲げ/伸び)",color:"#F59E0B",value:1},
            {name:"端部距離",color:"#F59E0B",value:1},
          ]},
        ]},
      ]},
      {name:"強度",color:"#F59E0B",req:"SPEC以上満足 ※付表1 ヘッドハイト±0.2㎜以下",children:[
        {name:"リベットクラックメカニズム検証",color:"#F59E0B",value:1},
        {name:"板組N増し検証",color:"#F59E0B",perspective:"Machine：設備",children:[
          {name:"N数",color:"#F59E0B",children:[
            {name:"N数",color:"#F59E0B",value:1},
          ]},
        ]},
        {name:"GAPタフネス検証",color:"#F59E0B",perspective:"Machine：設備",children:[
          {name:"GAP",color:"#F59E0B",children:[
            {name:"ダイ-板間 GAP量",color:"#F59E0B",value:1},
            {name:"ノーズピース-板間 GAP量",color:"#F59E0B",value:1},
            {name:"板間GAP量",color:"#F59E0B",value:1},
          ]},
        ]},
        {name:"RB姿勢タフネス検証",color:"#F59E0B",perspective:"Machine：設備",children:[
          {name:"パンチ",color:"#F59E0B",children:[
            {name:"移動時抵抗",color:"#F59E0B",value:1},
          ]},
          {name:"リベット",color:"#F59E0B",children:[
            {name:"フィンガーへの収まり",color:"#F59E0B",value:1},
          ]},
          {name:"加圧波形",color:"#F59E0B",children:[
            {name:"ノイズ影響",color:"#F59E0B",value:1},
          ]},
        ]},
        {name:"人外乱タフネス検証",color:"#F59E0B",perspective:"Man：人",children:[
          {name:"ダイ",color:"#F59E0B",children:[
            {name:"ダイ取付忘れ",color:"#F59E0B",value:1},
            {name:"違うダイを取り付ける",color:"#F59E0B",value:1},
          ]},
          {name:"ノーズピース",color:"#F59E0B",children:[
            {name:"はずれ",color:"#F59E0B",value:1},
            {name:"ガタ",color:"#F59E0B",value:1},
            {name:"取付ミス(ガタなど)",color:"#F59E0B",value:1},
          ]},
          {name:"パンチ",color:"#F59E0B",children:[
            {name:"加圧条件変更",color:"#F59E0B",value:1},
            {name:"取付ミス(ガタなど)",color:"#F59E0B",value:1},
          ]},
          {name:"リベット",color:"#F59E0B",children:[
            {name:"違うリベットを入れる",color:"#F59E0B",value:1},
          ]},
        ]},
        {name:"位置バラつきタフネス検証",color:"#F59E0B",perspective:"Machine：設備",children:[
          {name:"位置",color:"#F59E0B",children:[
            {name:"ガンたわみ",color:"#F59E0B",value:1},
            {name:"位置",color:"#F59E0B",value:1},
            {name:"端部距離",color:"#F59E0B",value:1},
            {name:"軸ズレ",color:"#F59E0B",value:1},
          ]},
          {name:"角度",color:"#F59E0B",children:[
            {name:"角度",color:"#F59E0B",value:1},
          ]},
        ]},
        {name:"内部品質タフネス検証",color:"#F59E0B",perspective:"Material：材料",children:[
          {name:"ADC",color:"#F59E0B",children:[
            {name:"伸び",color:"#F59E0B",value:1},
            {name:"外観品質",color:"#F59E0B",value:1},
            {name:"曲げ",color:"#F59E0B",value:1},
            {name:"材料成分",color:"#F59E0B",value:1},
            {name:"鋳巣",color:"#F59E0B",value:1},
          ]},
          {name:"ダイ",color:"#F59E0B",children:[
            {name:"熱処理",color:"#F59E0B",value:1},
          ]},
          {name:"リベット",color:"#F59E0B",children:[
            {name:"強度/成分",color:"#F59E0B",value:1},
          ]},
        ]},
        {name:"形状バラつき検証",color:"#F59E0B",perspective:"Material：材料",children:[
          {name:"ADC",color:"#F59E0B",children:[
            {name:"平面度",color:"#F59E0B",value:1},
            {name:"抜き勾配",color:"#F59E0B",value:1},
            {name:"板厚ばらつき",color:"#F59E0B",value:1},
          ]},
          {name:"ダイ",color:"#F59E0B",children:[
            {name:"ダイ傷",color:"#F59E0B",value:1},
            {name:"ダイ割れ",color:"#F59E0B",value:1},
            {name:"ダイ容量",color:"#F59E0B",value:1},
            {name:"ダイ摩耗",color:"#F59E0B",value:1},
            {name:"ダイ破損",color:"#F59E0B",value:1},
            {name:"ダイ詰まり",color:"#F59E0B",value:1},
          ]},
          {name:"ノーズピース",color:"#F59E0B",children:[
            {name:"ノーズピース傷",color:"#F59E0B",value:1},
            {name:"ノーズピース変形",color:"#F59E0B",value:1},
            {name:"ノーズピース摩耗",color:"#F59E0B",value:1},
            {name:"ノーズピース曲がり",color:"#F59E0B",value:1},
            {name:"ノーズピース破損",color:"#F59E0B",value:1},
            {name:"ノーズピース長さ",color:"#F59E0B",value:1},
          ]},
          {name:"パンチ",color:"#F59E0B",children:[
            {name:"パンチフレ",color:"#F59E0B",value:1},
            {name:"パンチ傷",color:"#F59E0B",value:1},
            {name:"パンチ摩耗",color:"#F59E0B",value:1},
            {name:"パンチ破損",color:"#F59E0B",value:1},
          ]},
          {name:"リベット",color:"#F59E0B",children:[
            {name:"リベット長さ",color:"#F59E0B",value:1},
            {name:"内部体積",color:"#F59E0B",value:1},
            {name:"寸法公差",color:"#F59E0B",value:1},
          ]},
        ]},
        {name:"異物タフネス検証",color:"#F59E0B",perspective:"Machine：設備",children:[
          {name:"ADC",color:"#F59E0B",children:[
            {name:"ゴミカミ",color:"#F59E0B",value:1},
          ]},
          {name:"その他",color:"#F59E0B",children:[
            {name:"HPA",color:"#F59E0B",value:1},
            {name:"スパッタ",color:"#F59E0B",value:1},
            {name:"洗浄液",color:"#F59E0B",value:1},
            {name:"防錆油",color:"#F59E0B",value:1},
          ]},
        ]},
        {name:"表面状態タフネス検証",color:"#F59E0B",perspective:"Material：材料",children:[
          {name:"ADC",color:"#F59E0B",children:[
            {name:"表面粗さ",color:"#F59E0B",value:1},
            {name:"面削有無",color:"#F59E0B",value:1},
          ]},
          {name:"ダイ",color:"#F59E0B",children:[
            {name:"メッキ",color:"#F59E0B",value:1},
            {name:"硬度",color:"#F59E0B",value:1},
            {name:"表面粗さ",color:"#F59E0B",value:1},
          ]},
          {name:"ノーズピース",color:"#F59E0B",children:[
            {name:"表面状態",color:"#F59E0B",value:1},
          ]},
          {name:"パンチ",color:"#F59E0B",children:[
            {name:"表面状態",color:"#F59E0B",value:1},
          ]},
          {name:"リベット",color:"#F59E0B",children:[
            {name:"メッキ",color:"#F59E0B",value:1},
            {name:"硬度",color:"#F59E0B",value:1},
          ]},
        ]},
        {name:"加工条件管理幅",color:"#F59E0B",perspective:"Machine：設備",children:[
          {name:"ダイ条件",color:"#F59E0B",children:[
            {name:"形状/体積管理幅",color:"#F59E0B",value:1},
          ]},
          {name:"プリクランプ加圧",color:"#F59E0B",children:[
            {name:"プリクランプ加圧幅",color:"#F59E0B",value:1},
          ]},
          {name:"リベット条件",color:"#F59E0B",children:[
            {name:"形状管理幅",color:"#F59E0B",value:1},
          ]},
          {name:"加圧条件",color:"#F59E0B",children:[
            {name:"しきい値設定",color:"#F59E0B",value:1},
            {name:"加圧カーブバラつき",color:"#F59E0B",value:1},
            {name:"加圧バラつき",color:"#F59E0B",value:1},
            {name:"実行値との乖離",color:"#F59E0B",value:1},
            {name:"波形ノイズ",color:"#F59E0B",value:1},
            {name:"管理幅設定",color:"#F59E0B",value:1},
          ]},
          {name:"加工速度",color:"#F59E0B",children:[
            {name:"加工速度幅",color:"#F59E0B",value:1},
          ]},
        ]},
        {name:"受入基準検証",color:"#F59E0B",perspective:"Material：材料",children:[
          {name:"ダイ",color:"#F59E0B",children:[
            {name:"ロット差",color:"#F59E0B",value:1},
            {name:"寸法公差",color:"#F59E0B",value:1},
            {name:"製造工場違い",color:"#F59E0B",value:1},
          ]},
          {name:"ノーズピース",color:"#F59E0B",children:[
            {name:"ロット差",color:"#F59E0B",value:1},
            {name:"寸法公差",color:"#F59E0B",value:1},
            {name:"種類違い",color:"#F59E0B",value:1},
            {name:"製造工場違い",color:"#F59E0B",value:1},
          ]},
          {name:"パンチ",color:"#F59E0B",children:[
            {name:"ロット差",color:"#F59E0B",value:1},
            {name:"寸法公差",color:"#F59E0B",value:1},
            {name:"種類違い",color:"#F59E0B",value:1},
            {name:"製造工場違い",color:"#F59E0B",value:1},
          ]},
          {name:"リベット",color:"#F59E0B",children:[
            {name:"供給ロット差",color:"#F59E0B",value:1},
            {name:"変形",color:"#F59E0B",value:1},
            {name:"寸法公差",color:"#F59E0B",value:1},
            {name:"破損",color:"#F59E0B",value:1},
            {name:"製造工場違い",color:"#F59E0B",value:1},
          ]},
        ]},
      ]},
      {name:"裏面品質",color:"#F59E0B",req:"レベル4以下のこと(仮SPEC)",children:[
        {name:"ADC反映項目明確化",color:"#F59E0B",perspective:"Management：管理",children:[
          {name:"材料SPEC",color:"#F59E0B",children:[
            {name:"上記検証のなかで推進",color:"#F59E0B",value:1},
          ]},
        ]},
        {name:"裏面クラックSPEC最適化",color:"#F59E0B",perspective:"Management：管理",children:[
          {name:"材料SPEC",color:"#F59E0B",children:[
            {name:"上記検証のなかで推進",color:"#F59E0B",value:1},
          ]},
        ]},
        {name:"裏面クラックメカニズム検証",color:"#F59E0B",perspective:"Method：方法",children:[
          {name:"ADC",color:"#F59E0B",children:[
            {name:"RR ADC ERトライワーク",color:"#F59E0B",value:1},
            {name:"曲げ",color:"#F59E0B",value:1},
            {name:"表面部の伸び",color:"#F59E0B",value:1},
          ]},
        ]},
        {name:"最適ダイ検証",color:"#F59E0B",perspective:"Machine：設備",children:[
          {name:"ダイ",color:"#F59E0B",children:[
            {name:"フラットダイ",color:"#F59E0B",value:1},
            {name:"リングダイ",color:"#F59E0B",value:1},
          ]},
        ]},
      ]},
    ]},
  ]},
  {name:"直直要員",fullName:"直直要員",color:"#8B5CF6",kpi:"182名/2直 (244名@YO)",children:[
    {name:"D:設備",color:"#8B5CF6",children:[
      {name:"リペア",color:"#8B5CF6",req:"手法確立のこと",children:[
        {name:"リペア手法品質検証",color:"#8B5CF6",perspective:"Machine：設備",children:[
          {name:"品質",color:"#8B5CF6",children:[
            {name:"GAP影響",color:"#8B5CF6",value:1},
            {name:"ロバスト性",color:"#8B5CF6",value:1},
            {name:"出張り",color:"#8B5CF6",value:1},
            {name:"変形",color:"#8B5CF6",value:1},
            {name:"強度",color:"#8B5CF6",value:1},
            {name:"耐食性",color:"#8B5CF6",value:1},
          ]},
          {name:"工数",color:"#8B5CF6",children:[
            {name:"共通板組範囲",color:"#8B5CF6",value:1},
            {name:"加工工数",color:"#8B5CF6",value:1},
          ]},
        ]},
      ]},
      {name:"検査",color:"#8B5CF6",req:"G-PACV工程ランク 1.5以上",children:[
        {name:"ヘッドハイト検査検証",color:"#8B5CF6",perspective:"Machine：設備",children:[
          {name:"人測り方バラつき",color:"#8B5CF6",children:[
            {name:"人によるバラつき",color:"#8B5CF6",value:1},
          ]},
          {name:"材料バラつき",color:"#8B5CF6",children:[
            {name:"TP",color:"#8B5CF6",value:1},
            {name:"実機(密度低)",color:"#8B5CF6",value:1},
            {name:"抜き勾配",color:"#8B5CF6",value:1},
          ]},
          {name:"異物バラつき",color:"#8B5CF6",children:[
            {name:"HPA",color:"#8B5CF6",value:1},
          ]},
        ]},
        {name:"リベット検知機能検証",color:"#8B5CF6",perspective:"Machine：設備",children:[
          {name:"設備システム",color:"#8B5CF6",children:[
            {name:"パッケージチェック",color:"#8B5CF6",value:1},
            {name:"フィーダー部",color:"#8B5CF6",value:1},
            {name:"ホース部センサ",color:"#8B5CF6",value:1},
          ]},
        ]},
        {name:"加圧カーブ機能検証",color:"#8B5CF6",perspective:"Machine：設備",children:[
          {name:"各エラー",color:"#8B5CF6",children:[
            {name:"ヘッドハイト管理",color:"#8B5CF6",value:1},
            {name:"リベットなし",color:"#8B5CF6",value:1},
            {name:"反転",color:"#8B5CF6",value:1},
            {name:"板厚変化",color:"#8B5CF6",value:1},
            {name:"軸ズレ",color:"#8B5CF6",value:1},
          ]},
        ]},
        {name:"裏面クラック検査検証",color:"#8B5CF6",perspective:"Machine：設備",children:[
          {name:"貫通クラック",color:"#8B5CF6",children:[
            {name:"部位(円周クラック検知)",color:"#8B5CF6",value:1},
          ]},
        ]},
      ]},
      {name:"量産管理手法",color:"#8B5CF6",req:"手法確立のこと",children:[
        {name:"量産管理手法構築検証",color:"#8B5CF6",perspective:"Machine：設備",children:[
          {name:"設備条件",color:"#8B5CF6",children:[
            {name:"ストローク",color:"#8B5CF6",value:1},
            {name:"加圧",color:"#8B5CF6",value:1},
          ]},
        ]},
      ]},
    ]},
  ]},
  {name:"-",fullName:"-",color:"#14B8A6",kpi:"-",children:[
    {name:"M:管理",color:"#14B8A6",children:[
      {name:"環境負荷",color:"#14B8A6",req:"法規満足",value:1},
    ]},
  ]},
  {name:"WE工場スペース",fullName:"WE工場スペース",color:"#EF4444",kpi:"72,000m2以内 (40,000m2@YO)",children:[
    {name:"M:管理",color:"#EF4444",children:[
      {name:"スペース要員",color:"#EF4444",req:"与件スペース以下",value:1},
    ]},
  ]},
  {name:"エネルギーミニマムな車体構造とプロセスを構築し、エ...",fullName:"エネルギーミニマムな車体構造とプロセスを構築し、エンドユーザーに魅力ある商品を適正な価格でタイムリーに提供すること",color:"#06B6D4",kpi:"生産総エネルギーの費用対効果を高める車体構造と生産プロセスを構築すること (新機種エネルギ▲30%)",children:[
    {name:"M:管理",color:"#06B6D4",children:[
      {name:"標準化",color:"#06B6D4",req:"GLOBAL標準仕様確立",children:[
        {name:"板組範囲明確化検証",color:"#06B6D4",perspective:"Machine：設備",children:[
          {name:"板組素材",color:"#06B6D4",children:[
            {name:"板組範囲",color:"#06B6D4",value:1},
          ]},
        ]},
      ]},
    ]},
  ]},
  {name:"エルゴイエロー作業",fullName:"エルゴイエロー作業",color:"#F97316",kpi:"",children:[
    {name:"M:管理",color:"#F97316",children:[
      {name:"安全基準",color:"#F97316",req:"HM基準満足",value:1},
    ]},
  ]},
]};
