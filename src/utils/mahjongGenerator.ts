import Riichi from 'riichi';

// ===== 定数 =====
const NUM_SUITS = ['m', 'p', 's'] as const;
const ALL_SUITS = ['m', 'p', 's', 'z'] as const;

const ALL_TILES: string[] = [];
ALL_SUITS.forEach((suit) => {
  const max = suit === 'z' ? 7 : 9;
  for (let i = 1; i <= max; i++) {
    ALL_TILES.push(`${i}${suit}`);
  }
});

// タンヤオ用（2～8の数牌のみ）
const TANYAO_TILES: string[] = [];
NUM_SUITS.forEach((suit) => {
  for (let i = 2; i <= 8; i++) {
    TANYAO_TILES.push(`${i}${suit}`);
  }
});

// 役牌（三元牌: 白發中）
const DRAGON_TILES = ['5z', '6z', '7z'];

// 么九牌（老頭牌: 1・9の数牌 + 字牌全種）。暗槓の高符数化に使用
const YAOCHUU_TILES = [
  '1m', '9m', '1p', '9p', '1s', '9s',
  '1z', '2z', '3z', '4z', '5z', '6z', '7z',
];

// 老頭牌（1・9の数牌のみ、字牌を含まない）。清老頭・純全帯么九用
const TERMINAL_TILES = ['1m', '9m', '1p', '9p', '1s', '9s'];

// 字牌全種。字一色用
const HONOR_TILES = ['1z', '2z', '3z', '4z', '5z', '6z', '7z'];

// 風牌（東南西北）。小四喜・大四喜用
const WIND_TILES = ['1z', '2z', '3z', '4z'];

// 緑一色専用牌（索子の2,3,4,6,8 + 發）
const GREEN_TILES = ['2s', '3s', '4s', '6s', '8s', '6z'];

// ===== ユーティリティ =====

export const parseTilesString = (str: string): string[] => {
  const tiles: string[] = [];
  const regex = /([0-9]+)([mpsz])/ig;
  let match;
  while ((match = regex.exec(str)) !== null) {
    for (const d of match[1]) tiles.push(`${d}${match[2]}`);
  }
  return tiles;
};

export const formatTilesArray = (tiles: string[]): string => {
  const suitOrder: Record<string, number> = { m: 1, p: 2, s: 3, z: 4 };
  tiles.sort((a, b) => {
    if (suitOrder[a[1]] !== suitOrder[b[1]]) return suitOrder[a[1]] - suitOrder[b[1]];
    return parseInt(a[0]) - parseInt(b[0]);
  });
  let result = '', currentSuit = '', currentNumbers = '';
  tiles.forEach((tile) => {
    const num = tile[0], suit = tile[1];
    if (suit !== currentSuit) {
      if (currentSuit !== '') result += currentNumbers + currentSuit;
      currentSuit = suit;
      currentNumbers = num;
    } else {
      currentNumbers += num;
    }
  });
  if (currentSuit !== '') result += currentNumbers + currentSuit;
  return result;
};

// ===== オプション型定義 =====

export type WaitOptions = {
  mode: "preset" | "custom";
  presetLevel: 1 | 2 | 3;
  minWaits: number;
  maxWaits: number;
  chinitsu: boolean;
  allow4tiles: boolean;
};

export type ScoreOptions = {
  mode: "preset" | "custom";
  presetLevel: 1 | 2 | 3;
  yakuFilter: string[];
  yakuFilterMode?: "or" | "and";
  minFu: number;
  maxFu: number;
  minHan: number;
  maxHan: number;
  waitTypes?: ("tanki" | "nobetan" | "ryanmen" | "shanpon")[];
  scoreNakiTypes?: ("chi" | "pon" | "minkan" | "ankan")[];
};

// プリセットから内部オプションに変換
export const waitPresetToOptions = (level: 1 | 2 | 3): WaitOptions => {
  switch (level) {
    case 1: return { mode: "preset", presetLevel: 1, minWaits: 1, maxWaits: 3, chinitsu: false, allow4tiles: false };
    case 2: return { mode: "preset", presetLevel: 2, minWaits: 2, maxWaits: 99, chinitsu: false, allow4tiles: true };
    case 3: return { mode: "preset", presetLevel: 3, minWaits: 4, maxWaits: 99, chinitsu: true, allow4tiles: true };
  }
};

export const scorePresetToOptions = (level: 1 | 2 | 3): ScoreOptions => {
  switch (level) {
    // 平和(ロン1翻/ツモ2翻)・七対子(ロン2翻/ツモ3翻)をすべて許容する範囲
    case 1: return { mode: "preset", presetLevel: 1, yakuFilter: ["平和", "七対子"], minFu: 0, maxFu: 999, minHan: 1, maxHan: 3 };
    case 2: return { mode: "preset", presetLevel: 2, yakuFilter: [], minFu: 0, maxFu: 70, minHan: 1, maxHan: 99 };
    // 80符以上は么九牌の暗槓なしでは到達困難なため暗槓を必須にする（1つだとロンでギリギリ80符・ツモは届かないため2つ要求）
    case 3: return { mode: "preset", presetLevel: 3, yakuFilter: [], minFu: 80, maxFu: 999, minHan: 1, maxHan: 2, scoreNakiTypes: ['ankan', 'ankan'] };
  }
};

// ===== 自前の待ち計算エンジン =====

const tileToIndex = (tile: string): number => {
  const num = parseInt(tile[0]);
  switch (tile[1]) {
    case 'm': return num - 1;
    case 'p': return num - 1 + 9;
    case 's': return num - 1 + 18;
    case 'z': return num - 1 + 27;
    default: return -1;
  }
};

const indexToTile = (index: number): string => {
  if (index < 9) return `${index + 1}m`;
  if (index < 18) return `${index - 9 + 1}p`;
  if (index < 27) return `${index - 18 + 1}s`;
  return `${index - 27 + 1}z`;
};

const tilesToCounts = (tiles: string[]): number[] => {
  const counts = new Array(34).fill(0);
  for (const t of tiles) counts[tileToIndex(t)]++;
  return counts;
};

const canDecomposeMentsu = (counts: number[], startIndex: number, mentsuLeft: number): boolean => {
  if (mentsuLeft === 0) {
    for (let i = startIndex; i < 34; i++) { if (counts[i] !== 0) return false; }
    return true;
  }
  let i = startIndex;
  while (i < 34 && counts[i] === 0) i++;
  if (i >= 34) return false;
  // 刻子
  if (counts[i] >= 3) {
    counts[i] -= 3;
    if (canDecomposeMentsu(counts, i, mentsuLeft - 1)) { counts[i] += 3; return true; }
    counts[i] += 3;
  }
  // 順子
  if (i < 27) {
    const posInSuit = i % 9;
    if (posInSuit <= 6 && counts[i] >= 1 && counts[i + 1] >= 1 && counts[i + 2] >= 1) {
      counts[i]--; counts[i + 1]--; counts[i + 2]--;
      if (canDecomposeMentsu(counts, i, mentsuLeft - 1)) { counts[i]++; counts[i + 1]++; counts[i + 2]++; return true; }
      counts[i]++; counts[i + 1]++; counts[i + 2]++;
    }
  }
  return false;
};

const isWinningHand = (counts: number[]): boolean => {
  for (let i = 0; i < 34; i++) {
    if (counts[i] >= 2) {
      counts[i] -= 2;
      if (canDecomposeMentsu(counts, 0, 4)) { counts[i] += 2; return true; }
      counts[i] += 2;
    }
  }
  // 七対子
  let pairs = 0, allPairs = true;
  for (let i = 0; i < 34; i++) {
    if (counts[i] === 2) pairs++;
    else if (counts[i] !== 0) { allPairs = false; break; }
  }
  return allPairs && pairs === 7;
};

const calculateWaits = (tenpaiTiles: string[]): string[] => {
  const baseCounts = tilesToCounts(tenpaiTiles);
  const waits: string[] = [];
  for (let i = 0; i < 34; i++) {
    if (baseCounts[i] >= 4) continue;
    baseCounts[i]++;
    if (isWinningHand(baseCounts)) waits.push(indexToTile(i));
    baseCounts[i]--;
  }
  return waits;
};

// ===== 手牌バリデーション =====

const isValidHandTiles = (tiles: string[], allow4tiles: boolean): boolean => {
  const counts: Record<string, number> = {};
  const maxSame = allow4tiles ? 4 : 3;
  for (const t of tiles) {
    counts[t] = (counts[t] || 0) + 1;
    if (counts[t] > maxSame) return false;
  }
  return true;
};

// ===== 手牌生成ビルダー =====

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// ランダムな順子を1つ生成
const randomShuntsu = (suit?: string): string[] => {
  const s = suit || pick(NUM_SUITS);
  const start = randInt(1, 7);
  return [`${start}${s}`, `${start + 1}${s}`, `${start + 2}${s}`];
};

// ランダムな刻子を1つ生成
const randomKoutsu = (pool?: readonly string[]): string[] => {
  const tile = pick(pool || ALL_TILES);
  return [tile, tile, tile];
};

// ランダムな面子（順子or刻子）を1つ生成
const randomMentsu = (shuntsuRatio = 0.6, suit?: string): string[] => {
  if (Math.random() < shuntsuRatio) return randomShuntsu(suit);
  return suit ? randomKoutsu(ALL_TILES.filter(t => t[1] === suit)) : randomKoutsu();
};

// ランダムな雀頭を1つ生成
const randomHead = (pool?: readonly string[]): string[] => {
  const tile = pick(pool || ALL_TILES);
  return [tile, tile];
};

// ===== 役別の手牌生成関数（14枚のアガリ形を返す） =====

// 汎用: 雀頭1 + 面子4
const buildGenericHand = (suitLimit?: string, allow4tiles = true): string[] => {
  for (let retry = 0; retry < 500; retry++) {
    const pool = suitLimit ? ALL_TILES.filter(t => t[1] === suitLimit) : ALL_TILES;
    const head = randomHead(pool);
    const mentsu = [];
    for (let i = 0; i < 4; i++) mentsu.push(...randomMentsu(0.6, suitLimit));
    const tiles = [...head, ...mentsu];
    if (isValidHandTiles(tiles, allow4tiles)) return tiles;
  }
  throw new Error("手牌生成失敗");
};

// 4枚使い必須: 同じ牌が必ず4枚（刻子3枚+順子内1枚）含まれる手牌を生成
const buildForced4Hand = (suitLimit?: string): string[] => {
  for (let retry = 0; retry < 500; retry++) {
    const suit = suitLimit || pick(NUM_SUITS);
    const n = randInt(2, 8); // 両側に順子を作れる範囲
    const forcedTile = `${n}${suit}`;
    const koutsu = [forcedTile, forcedTile, forcedTile];
    const shuntsu = [`${n - 1}${suit}`, forcedTile, `${n + 1}${suit}`];

    const restPool = (suitLimit ? ALL_TILES.filter(t => t[1] === suitLimit) : ALL_TILES);
    const head = randomHead(restPool);
    const mentsu: string[] = [];
    for (let i = 0; i < 2; i++) mentsu.push(...randomMentsu(0.6, suitLimit));

    const tiles = [...head, ...koutsu, ...shuntsu, ...mentsu];
    // forcedTileがちょうど4枚（他の牌も4枚以内）であることを検証
    if (tiles.filter(t => t === forcedTile).length !== 4) continue;
    if (isValidHandTiles(tiles, true)) return tiles;
  }
  throw new Error("4枚使い手牌生成失敗");
};

// 平和: 順子4つ + 非役牌の雀頭
const buildPinfuHand = (allow4tiles = true): string[] => {
  for (let retry = 0; retry < 500; retry++) {
    // 雀頭は数牌のみ（役牌を避ける）
    const headSuit = pick(NUM_SUITS);
    const headNum = randInt(1, 9);
    const head = [`${headNum}${headSuit}`, `${headNum}${headSuit}`];
    const mentsu = [];
    for (let i = 0; i < 4; i++) mentsu.push(...randomShuntsu());
    const tiles = [...head, ...mentsu];
    if (isValidHandTiles(tiles, allow4tiles)) return tiles;
  }
  throw new Error("平和手牌生成失敗");
};

// 七対子: 7つの異なる対子
const buildChiitoiHand = (allow4tiles = true): string[] => {
  for (let retry = 0; retry < 500; retry++) {
    const usedTiles = new Set<string>();
    const tiles: string[] = [];
    let valid = true;
    for (let i = 0; i < 7; i++) {
      let tile: string;
      let attempts = 0;
      do {
        tile = pick(ALL_TILES);
        attempts++;
        if (attempts > 100) { valid = false; break; }
      } while (usedTiles.has(tile));
      if (!valid) break;
      usedTiles.add(tile);
      tiles.push(tile, tile);
    }
    if (valid && isValidHandTiles(tiles, allow4tiles)) return tiles;
  }
  throw new Error("七対子手牌生成失敗");
};

// 国士無双: 么九牌13種+そのうち1種の対子(=13面待ちの形で生成)
const buildKokushiHand = (): string[] => {
  const pairTile = pick(YAOCHUU_TILES);
  return [...YAOCHUU_TILES, pairTile];
};

// 九蓮宝燈: 1112345678999(純正形)+同色1枚
const buildChuurenHand = (): string[] => {
  const suit = pick(NUM_SUITS);
  const base = [1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9].map(n => `${n}${suit}`);
  const extra = `${randInt(1, 9)}${suit}`;
  return [...base, extra];
};

// タンヤオ: 2～8の数牌のみ
const buildTanyaoHand = (allow4tiles = true): string[] => {
  for (let retry = 0; retry < 500; retry++) {
    const head = randomHead(TANYAO_TILES);
    const mentsu = [];
    for (let i = 0; i < 4; i++) {
      if (Math.random() < 0.6) {
        const suit = pick(NUM_SUITS);
        const start = randInt(2, 6); // 2～6で始まる順子なら全て2～8内
        mentsu.push(`${start}${suit}`, `${start + 1}${suit}`, `${start + 2}${suit}`);
      } else {
        mentsu.push(...randomKoutsu(TANYAO_TILES));
      }
    }
    const tiles = [...head, ...mentsu];
    if (isValidHandTiles(tiles, allow4tiles)) return tiles;
  }
  throw new Error("タンヤオ手牌生成失敗");
};

// 役牌: 三元牌の刻子を含む
const buildYakuhaiHand = (allow4tiles = true): string[] => {
  for (let retry = 0; retry < 500; retry++) {
    const dragonTile = pick(DRAGON_TILES);
    const yakuhaiMentsu = [dragonTile, dragonTile, dragonTile];
    const head = randomHead();
    const mentsu = [...yakuhaiMentsu];
    for (let i = 0; i < 3; i++) mentsu.push(...randomMentsu());
    const tiles = [...head, ...mentsu];
    if (isValidHandTiles(tiles, allow4tiles)) return tiles;
  }
  throw new Error("役牌手牌生成失敗");
};

// イーペーコー: 同じ順子が2つ
const buildIipeikouHand = (allow4tiles = true): string[] => {
  for (let retry = 0; retry < 500; retry++) {
    const suit = pick(NUM_SUITS);
    const start = randInt(1, 7);
    const sameShuntsu = [`${start}${suit}`, `${start + 1}${suit}`, `${start + 2}${suit}`];
    const head = randomHead();
    const mentsu = [...sameShuntsu, ...sameShuntsu]; // 同じ順子×2
    for (let i = 0; i < 2; i++) mentsu.push(...randomMentsu());
    const tiles = [...head, ...mentsu];
    if (isValidHandTiles(tiles, allow4tiles)) return tiles;
  }
  throw new Error("イーペーコー手牌生成失敗");
};

// 三色同順: 3色で同じ数の順子
const buildSanshokuHand = (allow4tiles = true): string[] => {
  for (let retry = 0; retry < 500; retry++) {
    const start = randInt(1, 7);
    const mentsu = [];
    for (const suit of NUM_SUITS) {
      mentsu.push(`${start}${suit}`, `${start + 1}${suit}`, `${start + 2}${suit}`);
    }
    mentsu.push(...randomMentsu());
    const head = randomHead();
    const tiles = [...head, ...mentsu];
    if (isValidHandTiles(tiles, allow4tiles)) return tiles;
  }
  throw new Error("三色同順手牌生成失敗");
};

// 一気通貫: 同色で123, 456, 789
const buildIttsuHand = (allow4tiles = true): string[] => {
  for (let retry = 0; retry < 500; retry++) {
    const suit = pick(NUM_SUITS);
    const mentsu = [
      `1${suit}`, `2${suit}`, `3${suit}`,
      `4${suit}`, `5${suit}`, `6${suit}`,
      `7${suit}`, `8${suit}`, `9${suit}`,
    ];
    mentsu.push(...randomMentsu());
    const head = randomHead();
    const tiles = [...head, ...mentsu];
    if (isValidHandTiles(tiles, allow4tiles)) return tiles;
  }
  throw new Error("一気通貫手牌生成失敗");
};

// ホンイツ: 1色の数牌 + 字牌
const buildHonitsuHand = (allow4tiles = true): string[] => {
  const suit = pick(NUM_SUITS);
  const honPool = ALL_TILES.filter(t => t[1] === suit || t[1] === 'z');
  for (let retry = 0; retry < 500; retry++) {
    const head = randomHead(honPool);
    const mentsu = [];
    for (let i = 0; i < 4; i++) {
      if (Math.random() < 0.5) {
        mentsu.push(...randomShuntsu(suit));
      } else {
        mentsu.push(...randomKoutsu(honPool));
      }
    }
    const tiles = [...head, ...mentsu];
    // 字牌が含まれていることを確認（含まれないと清一色になる）
    const hasHonor = tiles.some(t => t[1] === 'z');
    if (hasHonor && isValidHandTiles(tiles, allow4tiles)) return tiles;
  }
  throw new Error("ホンイツ手牌生成失敗");
};

// 清一色: 1色の数牌のみ
const buildChinitsuHand = (allow4tiles = true): string[] => {
  return buildGenericHand(pick(NUM_SUITS), allow4tiles);
};

// 役名から生成関数へのマッピング
const YAKU_BUILDERS: Record<string, (allow4tiles: boolean) => string[]> = {
  "平和": buildPinfuHand,
  "七対子": buildChiitoiHand,
  "タンヤオ": buildTanyaoHand,
  "役牌": buildYakuhaiHand,
  "一盃口": buildIipeikouHand,
  "三色同順": buildSanshokuHand,
  "一気通貫": buildIttsuHand,
  "混一色": buildHonitsuHand,
  "清一色": buildChinitsuHand,
};

export const AVAILABLE_YAKU = Object.keys(YAKU_BUILDERS);

// ===== 問題生成 =====

const MAX_RETRIES = 300;

// --- 何待ち問題 ---
export const generateWaitProblem = (options: WaitOptions) => {
  // Lv.2 は2パターンからランダム選択
  let effectiveOptions = { ...options };
  if (options.mode === "preset" && options.presetLevel === 2) {
    if (Math.random() < 0.5) {
      effectiveOptions = { ...options, minWaits: 4, maxWaits: 99, chinitsu: false, allow4tiles: true };
    } else {
      effectiveOptions = { ...options, minWaits: 2, maxWaits: 99, chinitsu: true, allow4tiles: false };
    }
  }

  const suitLimit = effectiveOptions.chinitsu ? pick(NUM_SUITS) : undefined;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    let winningHand: string[];
    try {
      // 「4枚使い」ONの場合は同じ牌が必ず4枚使われる形を強制生成する
      winningHand = effectiveOptions.allow4tiles
        ? buildForced4Hand(suitLimit)
        : buildGenericHand(suitLimit, effectiveOptions.allow4tiles);
    } catch {
      retries++;
      continue;
    }

    for (let i = 0; i < winningHand.length; i++) {
      const tenpaiHand = [...winningHand];
      tenpaiHand.splice(i, 1);

      const waits = calculateWaits(tenpaiHand);
      const machiCount = waits.length;

      if (machiCount >= effectiveOptions.minWaits && machiCount <= effectiveOptions.maxWaits) {
        const formattedStr = formatTilesArray(tenpaiHand);
        return {
          tiles: formattedStr,
          suffix: "",
          answer: `待ち: ${formatTilesArray(waits)} (${machiCount}面待ち)`
        };
      }
    }
    retries++;
  }

  throw new Error("条件を満たす問題が見つかりませんでした。条件を緩めてお試しください。");
};

type Block = { type: 'shuntsu' | 'koutsu' | 'janto', suit: string, start?: number, tile?: string, isNaki?: boolean, nakiType?: 'chi' | 'pon' | 'minkan' | 'ankan' };

type WaitKind = "tanki" | "nobetan" | "ryanmen" | "shanpon";

const buildCustomScoreProblemInner = (options: ScoreOptions) => {
  let suitLimit: string | undefined = undefined;
  let pool = ALL_TILES;
  let forceDragon = false;
  let forceShuntsu = false;
  let forceKoutsuAll = false;  // 全面子を刻子に強制(対々和・混老頭・清老頭・字一色)
  let forceAnkouCount = 0;     // 暗刻をちょうどN個要求(三暗刻=3, 四暗刻=4)
  let forceAnkanCount = 0;     // 暗槓をちょうどN個要求(三槓子=3, 四槓子=4)
  let forceChanta = false;     // 么九牌を絡めた順子にする(混全帯么九・純全帯么九)

  const mode = options.yakuFilterMode || "or";
  let targetYakus: string[] = [];

  if (options.yakuFilter && options.yakuFilter.length > 0) {
    if (mode === "or") {
      targetYakus = [pick(options.yakuFilter)];
    } else {
      targetYakus = options.yakuFilter;
    }
  }

  const isGreenTarget = targetYakus.includes("緑一色");

  if (targetYakus.length > 0) {
    if (targetYakus.includes("清一色")) {
      suitLimit = pick(NUM_SUITS);
      pool = pool.filter(t => t[1] === suitLimit);
    } else if (targetYakus.includes("混一色")) {
      suitLimit = pick(NUM_SUITS);
      pool = pool.filter(t => t[1] === suitLimit || t[1] === 'z');
    } else if (targetYakus.includes("字一色")) {
      pool = HONOR_TILES;
      forceKoutsuAll = true;
    } else if (isGreenTarget) {
      pool = GREEN_TILES;
    } else if (targetYakus.includes("清老頭")) {
      pool = TERMINAL_TILES;
      forceKoutsuAll = true;
    } else if (targetYakus.includes("混老頭")) {
      pool = YAOCHUU_TILES;
      forceKoutsuAll = true;
    } else if (targetYakus.includes("純全帯么九")) {
      pool = TERMINAL_TILES;
      forceChanta = true;
    } else if (targetYakus.includes("混全帯么九")) {
      pool = YAOCHUU_TILES;
      forceChanta = true;
    } else if (targetYakus.includes("断么九")) {
      pool = TANYAO_TILES;
    }
    if (targetYakus.includes("役牌")) forceDragon = true;
    if (targetYakus.includes("平和")) forceShuntsu = true;
    if (targetYakus.includes("対々和")) forceKoutsuAll = true;
    if (targetYakus.includes("三暗刻")) forceAnkouCount = 3;
    if (targetYakus.includes("四暗刻")) forceAnkouCount = 4;
    if (targetYakus.includes("三槓子")) forceAnkanCount = 3;
    if (targetYakus.includes("四槓子")) forceAnkanCount = 4;
  }

  // --- 待ちタイプの決定(役の制約に応じて候補を絞り込む) ---
  let waitTypePool: WaitKind[] = options.waitTypes && options.waitTypes.length > 0 ? [...options.waitTypes] : ["tanki", "ryanmen", "shanpon", "nobetan"];
  const restrictWaitTo = (types: WaitKind[]) => {
    const filtered = waitTypePool.filter(w => types.includes(w));
    waitTypePool = filtered.length > 0 ? filtered : types;
  };
  const excludeWaitType = (types: WaitKind[]) => {
    const filtered = waitTypePool.filter(w => !types.includes(w));
    if (filtered.length > 0) waitTypePool = filtered;
  };
  // 暗刻/暗槓の個数を厳密に揃えたい役はロンでの明刻化を避けるためtanki固定
  if (forceAnkouCount > 0 || forceAnkanCount > 0 || targetYakus.includes("二盃口")) {
    restrictWaitTo(["tanki"]);
  } else if (forceKoutsuAll || targetYakus.includes("大四喜")) {
    restrictWaitTo(["tanki", "shanpon"]);
  }
  // 小三元/小四喜は雀頭を役牌固定にするためtankiだと待ち牌側と衝突するので除外
  if (targetYakus.includes("小三元") || targetYakus.includes("小四喜")) excludeWaitType(["tanki"]);
  // チャンタ系/緑一色はnobetanの雀頭側が么九牌・緑牌からズレるため除外
  if (forceChanta || isGreenTarget) excludeWaitType(["nobetan"]);

  const waitType = pick(waitTypePool);

  // 順子のスート/開始位置(役の制約に応じて選ぶ)
  const pickShuntsuSuit = (): string => isGreenTarget ? 's' : (suitLimit || pick(NUM_SUITS));
  const pickShuntsuStart = (): number => {
    if (forceChanta) return pick([1, 7]); // 123 or 789(么九牌を含む)
    if (isGreenTarget) return pick([2, 6]); // 234s or 678s(緑牌のみ)
    return randInt(1, 7);
  };

  const blocks: Block[] = [];
  let winningTile = "";

  if (waitType === "tanki") {
    const t = pick(pool);
    blocks.push({ type: 'janto', suit: t[1], tile: t });
    winningTile = t;
  } else if (waitType === "ryanmen") {
    const s = pickShuntsuSuit();
    const start = (forceChanta || isGreenTarget) ? pickShuntsuStart() : pick([2, 3, 4, 5, 6]);
    blocks.push({ type: 'shuntsu', suit: s, start });
    // 順子の両端いずれかをアガリ牌にする（中央を外すとカンチャンになるため避ける）
    // 例: start側を外す→残りは[start+1,start+2]でstart/start+3待ちの両面
    //     start+2側を外す→残りは[start,start+1]でstart-1/start+2待ちの両面
    winningTile = Math.random() < 0.5 ? `${start}${s}` : `${start + 2}${s}`;
  } else if (waitType === "shanpon") {
    const t = pick(pool);
    blocks.push({ type: 'koutsu', suit: t[1], tile: t });
    winningTile = t;
  } else if (waitType === "nobetan") {
    const s = suitLimit || pick(NUM_SUITS);
    const start = pick([2, 3, 4, 5, 6]);
    blocks.push({ type: 'shuntsu', suit: s, start });
    const jantoStart = Math.random() < 0.5 ? start - 1 : start + 3;
    blocks.push({ type: 'janto', suit: s, tile: `${jantoStart}${s}` });
    winningTile = `${jantoStart}${s}`;
  }

  const jantoCount = blocks.filter(b => b.type === 'janto').length;
  let mentsuCount = blocks.filter(b => b.type !== 'janto').length;

  if (jantoCount === 0) {
    let t = pick(pool);
    if (forceShuntsu) {
      const nonYakuhai = pool.filter(x => !['5z', '6z', '7z', '1z', '2z', '3z', '4z'].includes(x));
      t = nonYakuhai.length > 0 ? pick(nonYakuhai) : pick(ALL_TILES.filter(x => x[1] !== 'z'));
    }
    blocks.push({ type: 'janto', suit: t[1], tile: t });
  }

  mentsuCount = blocks.filter(b => b.type !== 'janto').length;

  if (targetYakus.includes("二盃口")) {
    // 4面子すべてを2種類の順子×2組で埋める(門前限定のためtankiに固定済み)
    const used: { suit: string; start: number }[] = [];
    while (used.length < 2) {
      const s = pickShuntsuSuit();
      const start = pickShuntsuStart();
      if (!used.some(u => u.suit === s && u.start === start)) used.push({ suit: s, start });
    }
    used.forEach(u => {
      for (let i = 0; i < 2; i++) {
        if (mentsuCount < 4) {
          blocks.push({ type: 'shuntsu', suit: u.suit, start: u.start });
          mentsuCount++;
        }
      }
    });
  }

  if (targetYakus.includes("三色同刻")) {
    const n = targetYakus.includes("断么九") ? randInt(2, 8) : randInt(1, 9);
    ['m', 'p', 's'].forEach(s => {
      if (mentsuCount < 4) {
        blocks.push({ type: 'koutsu', suit: s, tile: `${n}${s}` });
        mentsuCount++;
      }
    });
  }

  if (targetYakus.includes("大三元")) {
    DRAGON_TILES.forEach(d => {
      if (mentsuCount < 4) {
        blocks.push({ type: 'koutsu', suit: 'z', tile: d });
        mentsuCount++;
      }
    });
  } else if (targetYakus.includes("小三元")) {
    const dragons = [...DRAGON_TILES];
    const pairDragon = dragons.splice(randInt(0, dragons.length - 1), 1)[0];
    dragons.forEach(d => {
      if (mentsuCount < 4) {
        blocks.push({ type: 'koutsu', suit: 'z', tile: d });
        mentsuCount++;
      }
    });
    const jb = blocks.find(b => b.type === 'janto');
    if (jb) { jb.tile = pairDragon; jb.suit = 'z'; }
  }

  if (targetYakus.includes("大四喜")) {
    WIND_TILES.forEach(w => {
      if (mentsuCount < 4) {
        blocks.push({ type: 'koutsu', suit: 'z', tile: w });
        mentsuCount++;
      }
    });
  } else if (targetYakus.includes("小四喜")) {
    const winds = [...WIND_TILES];
    const pairWind = winds.splice(randInt(0, winds.length - 1), 1)[0];
    winds.forEach(w => {
      if (mentsuCount < 4) {
        blocks.push({ type: 'koutsu', suit: 'z', tile: w });
        mentsuCount++;
      }
    });
    const jb = blocks.find(b => b.type === 'janto');
    if (jb) { jb.tile = pairWind; jb.suit = 'z'; }
  }

  if (targetYakus.includes("三色同順")) {
    const start = targetYakus.includes("断么九") ? randInt(2, 6) : randInt(1, 7);
    ['m', 'p', 's'].forEach(s => {
      if (mentsuCount < 4) {
         blocks.push({ type: 'shuntsu', suit: s, start });
         mentsuCount++;
      }
    });
  }

  if (targetYakus.includes("一気通貫")) {
    const s = suitLimit || pick(NUM_SUITS);
    [1, 4, 7].forEach(start => {
      if (mentsuCount < 4) {
         blocks.push({ type: 'shuntsu', suit: s, start });
         mentsuCount++;
      }
    });
  }

  if (targetYakus.includes("一盃口")) {
    const s = suitLimit || pick(NUM_SUITS);
    const start = targetYakus.includes("断么九") ? randInt(2, 6) : randInt(1, 7);
    for(let i=0; i<2; i++) {
      if (mentsuCount < 4) {
         blocks.push({ type: 'shuntsu', suit: s, start });
         mentsuCount++;
      }
    }
  }

  let koutsuPlaced = blocks.filter(b => b.type === 'koutsu').length;
  const koutsuNeeded = forceAnkouCount + forceAnkanCount;
  // 三暗刻(ちょうど3個)は残りの1面子が偶然刻子になると四暗刻(役満)に化けて
  // 三暗刻自体がyakuから消えてしまう(riichiライブラリは役満確定後は通常役の判定を打ち切るため)ので、
  // 4個目は明示的に順子にして刻子化を避ける
  const capAnkouAtThree = forceAnkouCount === 3;

  while (mentsuCount < 4) {
    if (koutsuNeeded > koutsuPlaced) {
      const t = pick(pool);
      blocks.push({ type: 'koutsu', suit: t[1], tile: t });
      koutsuPlaced++;
    } else if (capAnkouAtThree && koutsuPlaced >= forceAnkouCount) {
      blocks.push({ type: 'shuntsu', suit: pickShuntsuSuit(), start: randInt(1, 7) });
    } else if (forceDragon && !blocks.some(b => b.tile && DRAGON_TILES.includes(b.tile))) {
      const d = pick(DRAGON_TILES);
      blocks.push({ type: 'koutsu', suit: 'z', tile: d });
    } else if (forceKoutsuAll) {
      const t = pick(pool);
      blocks.push({ type: 'koutsu', suit: t[1], tile: t });
    } else if (forceShuntsu) {
      const s = suitLimit || pick(NUM_SUITS);
      const start = randInt(1, 7);
      blocks.push({ type: 'shuntsu', suit: s, start });
    } else if (forceChanta || isGreenTarget) {
      if (Math.random() < 0.6) {
        blocks.push({ type: 'shuntsu', suit: pickShuntsuSuit(), start: pickShuntsuStart() });
      } else {
        const t = pick(pool);
        blocks.push({ type: 'koutsu', suit: t[1], tile: t });
      }
    } else {
      if (Math.random() < 0.6) {
        const s = suitLimit || pick(NUM_SUITS);
        const start = randInt(1, 7);
        blocks.push({ type: 'shuntsu', suit: s, start });
      } else {
        const t = pick(pool);
        blocks.push({ type: 'koutsu', suit: t[1], tile: t });
      }
    }
    mentsuCount++;
  }

  // 三槓子/四槓子は暗槓をちょうどN個自動要求する(ユーザー指定の鳴きと合算)
  const requestedNakiFromOptions = options.scoreNakiTypes ? [...options.scoreNakiTypes] : [];
  for (let i = 0; i < forceAnkanCount; i++) requestedNakiFromOptions.push('ankan');
  // 対々和/混老頭は全面子が刻子だが、4つとも暗刻になると四暗刻(役満)に化けてyakuから消えてしまうため
  // 1つは明示的にポン(明刻)にして四暗刻化を防ぐ
  if (targetYakus.includes("対々和") || targetYakus.includes("混老頭")) {
    requestedNakiFromOptions.push('pon');
  }

  if (requestedNakiFromOptions.length > 0) {
    const requestedNaki = requestedNakiFromOptions;
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].type === 'janto') continue;
      if (waitType === "nobetan" && i <= 1) continue;
      if (i === 0) continue;

      if (requestedNaki.length > 0) {
        const shuntsuNakis = requestedNaki.filter(r => r === 'chi');
        const koutsuNakis = requestedNaki.filter(r => r !== 'chi');
        
        if (blocks[i].type === 'shuntsu' && shuntsuNakis.length > 0) {
           blocks[i].isNaki = true;
           blocks[i].nakiType = 'chi';
           requestedNaki.splice(requestedNaki.indexOf('chi'), 1);
        } else if (blocks[i].type === 'koutsu' && koutsuNakis.length > 0) {
           blocks[i].isNaki = true;
           const type = pick(koutsuNakis) as 'pon' | 'minkan' | 'ankan';
           blocks[i].nakiType = type;
           requestedNaki.splice(requestedNaki.indexOf(type), 1);
           if (type === 'ankan') {
             // 暗槓は高符数（32符）を狙うため么九牌に強制する
             let yaochuuPool = YAOCHUU_TILES.filter(t => pool.includes(t));
             if (yaochuuPool.length === 0) {
               yaochuuPool = suitLimit ? YAOCHUU_TILES.filter(t => t[1] === suitLimit || t[1] === 'z') : YAOCHUU_TILES;
             }
             if (yaochuuPool.length > 0) {
               const forcedTile = pick(yaochuuPool);
               blocks[i].tile = forcedTile;
               blocks[i].suit = forcedTile[1];
             }
           }
        }
      }
    }
    if (requestedNaki.length > 0) {
      return { riichiInput: "", formattedTenpai: "", suffix: "" };
    }
  }

  const closedTiles: string[] = [];
  let nakiStr = "";
  let nakiVisualStr = "";

  blocks.forEach((b, i) => {
    let blockTiles: string[] = [];
    if (b.type === 'shuntsu') {
      blockTiles = [`${b.start}${b.suit}`, `${b.start! + 1}${b.suit}`, `${b.start! + 2}${b.suit}`];
    } else {
      blockTiles = [b.tile!, b.tile!, b.tile!];
      if (b.type === 'janto') blockTiles = [b.tile!, b.tile!];
      if (b.nakiType === 'minkan' || b.nakiType === 'ankan') blockTiles.push(b.tile!);
    }

    if (i === 0 || (waitType === 'nobetan' && i === 1)) {
      const winIdx = blockTiles.indexOf(winningTile);
      if (winIdx !== -1) {
        blockTiles.splice(winIdx, 1);
        closedTiles.push(...blockTiles);
        return;
      }
    }

    if (b.isNaki) {
      const suit = blockTiles[0].substring(1);
      if (b.nakiType === 'chi') {
        nakiStr += `+${blockTiles[0][0]}${blockTiles[1][0]}${blockTiles[2][0]}${suit}`;
        nakiVisualStr += `　${blockTiles[0]}-${blockTiles[1][0]}${blockTiles[2][0]}${suit}`;
      } else if (b.nakiType === 'pon') {
        nakiStr += `+${blockTiles[0][0]}${blockTiles[1][0]}${blockTiles[2][0]}${suit}`;
        nakiVisualStr += `　${blockTiles[0]}-${blockTiles[1][0]}${blockTiles[2][0]}${suit}`;
      } else if (b.nakiType === 'minkan') {
        nakiStr += `+${blockTiles[0][0]}${blockTiles[1][0]}${blockTiles[2][0]}${blockTiles[3][0]}${suit}`;
        nakiVisualStr += `　${blockTiles[0]}-${blockTiles[1][0]}${blockTiles[2][0]}${blockTiles[3][0]}${suit}`;
      } else if (b.nakiType === 'ankan') {
        // riichiライブラリの仕様: 暗槓は「同じ牌2桁」の省略記法で表現する(4桁だと明槓と誤認識される)
        nakiStr += `+${blockTiles[0][0]}${blockTiles[1][0]}${suit}`;
        nakiVisualStr += `　0z${blockTiles[0][0]}${blockTiles[1][0]}${suit}0z`;
      }
    } else {
      closedTiles.push(...blockTiles);
    }
  });

  const isTsumo = Math.random() < 0.5;
  const formattedTenpai = formatTilesArray(closedTiles) + nakiVisualStr;
  // riichiライブラリの仕様: アガリ牌を素で連結=ツモ、"+アガリ牌"で区切る=ロン
  // (副露がある場合はアガリ牌を独立した"+"区切りにしないと副露側の記法まで壊れる)
  const riichiInput = isTsumo
    ? formatTilesArray(closedTiles) + winningTile + nakiStr
    : formatTilesArray(closedTiles) + `+${winningTile}` + nakiStr;

  return {
    riichiInput,
    formattedTenpai,
    suffix: `${winningTile} ${isTsumo ? 'ツモ' : 'ロン'}`
  };
};

// --- 点数計算問題 ---
export const generateScoreProblem = (options: ScoreOptions) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // 七対子・国士無双・九蓮宝燈はBlock[]構成に乗らないため専用ビルダーで直接生成する
      let isChiitoi = false;
      let isKokushi = false;
      let isChuuren = false;
      const specialYakuCount = options.yakuFilter.length;
      if (specialYakuCount > 0) {
        const specialCandidates: ("chiitoi" | "kokushi" | "chuuren")[] = [];
        if (options.yakuFilter.includes("七対子")) specialCandidates.push("chiitoi");
        if (options.yakuFilter.includes("国士無双")) specialCandidates.push("kokushi");
        if (options.yakuFilter.includes("九蓮宝燈")) specialCandidates.push("chuuren");
        // 該当する専用ビルダー役がyakuFilter中に占める割合の確率で、その中から1つを公平に選ぶ
        // (specialCandidates.length === specialYakuCountなら常に専用ビルダー経由になる)
        if (specialCandidates.length > 0 && Math.random() < specialCandidates.length / specialYakuCount) {
          const chosen = pick(specialCandidates);
          isChiitoi = chosen === "chiitoi";
          isKokushi = chosen === "kokushi";
          isChuuren = chosen === "chuuren";
        }
      }

      if (isChiitoi || isKokushi || isChuuren) {
         if (options.waitTypes && options.waitTypes.length > 0 && !options.waitTypes.includes("tanki")) {
             retries++; continue;
         }
         const winningHand = isChiitoi ? buildChiitoiHand(true) : isKokushi ? buildKokushiHand() : buildChuurenHand();
         const lastTile = winningHand[winningHand.length - 1];
         const tenpaiHandArr = [...winningHand];
         tenpaiHandArr.pop();
         
         const formattedTenpai = formatTilesArray(tenpaiHandArr);
         const isTsumo = Math.random() < 0.5;
         const suffix = `${lastTile} ${isTsumo ? 'ツモ' : 'ロン'}`;
         // riichiライブラリの仕様: アガリ牌を素で連結=ツモ、"+アガリ牌"で区切る=ロン
         const riichiInput = isTsumo ? formattedTenpai + lastTile : formattedTenpai + `+${lastTile}`;

         const riichi = new Riichi(riichiInput);
         const calcResult = riichi.calc();
         if (calcResult.error) { retries++; continue; }

         const han = calcResult.han || 0;
         const fu = calcResult.fu || 0;
         const yaku = calcResult.yaku ? Object.keys(calcResult.yaku).join(', ') : '';
         const points = calcResult.ten;
         // 役満はhan/fuが常に0で返るため(倍率とten/nameは正しく入る)、fu/han範囲チェックはスキップする
         const isYakuman = (calcResult.yakuman || 0) > 0;

         if (!isYakuman && (fu < options.minFu || fu > options.maxFu)) { retries++; continue; }
         if (!isYakuman && (han < options.minHan || han > options.maxHan)) { retries++; continue; }

         if (options.yakuFilter.length > 0 && calcResult.yaku) {
           const resultYakuNames = Object.keys(calcResult.yaku);
           const mode = options.yakuFilterMode || "or";
           let hasMatch = false;
           if (mode === "or") {
             hasMatch = options.yakuFilter.some(y => resultYakuNames.some(ry => ry.includes(y)));
           } else {
             hasMatch = options.yakuFilter.every(y => resultYakuNames.some(ry => ry.includes(y)));
           }
           if (!hasMatch) { retries++; continue; }
         }
         const answer = isYakuman
           ? `${calcResult.name || '役満'} | ${points}点 | 役: ${yaku}`
           : `${han}翻 ${fu}符 | ${points}点 | 役: ${yaku}`;
         return { tiles: formattedTenpai, suffix, answer };
      }

      const p = buildCustomScoreProblemInner(options);
      
      if (!p.riichiInput) {
        retries++;
        continue;
      }

      const riichi = new Riichi(p.riichiInput);
      const calcResult = riichi.calc();

      if (calcResult.error) { retries++; continue; }

      const han = calcResult.han || 0;
      const fu = calcResult.fu || 0;
      const yaku = calcResult.yaku ? Object.keys(calcResult.yaku).join(', ') : '';
      const points = calcResult.ten;
      // 役満はhan/fuが常に0で返るため(倍率とten/nameは正しく入る)、fu/han範囲チェックはスキップする
      const isYakuman = (calcResult.yakuman || 0) > 0;

      if (!isYakuman && (fu < options.minFu || fu > options.maxFu)) { retries++; continue; }
      if (!isYakuman && (han < options.minHan || han > options.maxHan)) { retries++; continue; }

      if (options.yakuFilter.length > 0 && calcResult.yaku) {
        const resultYakuNames = Object.keys(calcResult.yaku);
        const mode = options.yakuFilterMode || "or";
        let hasMatch = false;
        if (mode === "or") {
          hasMatch = options.yakuFilter.some(y => resultYakuNames.some(ry => ry.includes(y)));
        } else {
          hasMatch = options.yakuFilter.every(y => resultYakuNames.some(ry => ry.includes(y)));
        }
        if (!hasMatch) { retries++; continue; }
      }

      const answer = isYakuman
        ? `${calcResult.name || '役満'} | ${points}点 | 役: ${yaku}`
        : `${han}翻 ${fu}符 | ${points}点 | 役: ${yaku}`;
      return {
        tiles: p.formattedTenpai,
        suffix: p.suffix,
        answer
      };
    } catch {
      retries++;
    }
  }

  throw new Error("条件を満たす問題が見つかりませんでした。条件を緩めてお試しください。");
};
