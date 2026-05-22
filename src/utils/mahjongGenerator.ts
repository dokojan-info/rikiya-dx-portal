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
  minFu: number;
  maxFu: number;
  minHan: number;
  maxHan: number;
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
    case 1: return { mode: "preset", presetLevel: 1, yakuFilter: ["平和", "七対子"], minFu: 0, maxFu: 999, minHan: 1, maxHan: 1 };
    case 2: return { mode: "preset", presetLevel: 2, yakuFilter: [], minFu: 0, maxFu: 70, minHan: 1, maxHan: 99 };
    case 3: return { mode: "preset", presetLevel: 3, yakuFilter: [], minFu: 80, maxFu: 999, minHan: 1, maxHan: 2 };
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
      winningHand = buildGenericHand(suitLimit, effectiveOptions.allow4tiles);
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

// --- 点数計算問題 ---
export const generateScoreProblem = (options: ScoreOptions) => {
  // 役フィルタがある場合、その役の生成関数をランダムに選ぶ
  const yakuBuilders = options.yakuFilter.length > 0
    ? options.yakuFilter.filter(y => YAKU_BUILDERS[y])
    : [];

  let retries = 0;

  while (retries < MAX_RETRIES) {
    let winningHand: string[];
    try {
      if (yakuBuilders.length > 0) {
        const selectedYaku = pick(yakuBuilders);
        winningHand = YAKU_BUILDERS[selectedYaku](true);
      } else {
        winningHand = buildGenericHand(undefined, true);
      }
    } catch {
      retries++;
      continue;
    }

    // 14枚からどれか1枚を抜いてアガリ牌とする
    for (let i = 0; i < winningHand.length; i++) {
      const lastTile = winningHand[i];
      const tenpaiHandArr = [...winningHand];
      tenpaiHandArr.splice(i, 1);

      // 待ちチェック（自前エンジン）
      const waits = calculateWaits(tenpaiHandArr);
      if (waits.length === 0) continue;

      const formattedTenpai = formatTilesArray(tenpaiHandArr);
      const isTsumo = Math.random() < 0.5;
      const suffix = `${lastTile} ${isTsumo ? 'ツモ' : 'ロン'}`;

      // 点数計算（riichiを使用、14枚のアガリ形なので安全）
      const riichiInput = formattedTenpai + lastTile;
      try {
        const riichi = new Riichi(riichiInput);
        const calcResult = riichi.calc();

        if (calcResult.error) continue;

        const han = calcResult.han || 0;
        const fu = calcResult.fu || 0;
        const yaku = calcResult.yaku ? Object.keys(calcResult.yaku).join(', ') : '';
        const points = calcResult.ten;

        // 符・翻のフィルタ
        if (fu < options.minFu || fu > options.maxFu) continue;
        if (han < options.minHan || han > options.maxHan) continue;

        // 役フィルタ（指定がある場合、少なくとも1つの指定役を含むか）
        if (options.yakuFilter.length > 0 && calcResult.yaku) {
          const resultYakuNames = Object.keys(calcResult.yaku);
          const hasMatch = options.yakuFilter.some(y => resultYakuNames.some(ry => ry.includes(y)));
          if (!hasMatch) continue;
        }

        return {
          tiles: formattedTenpai,
          suffix: suffix,
          answer: `${han}翻 ${fu}符 | ${points}点 | 役: ${yaku}`
        };
      } catch {
        continue;
      }
    }
    retries++;
  }

  throw new Error("条件を満たす問題が見つかりませんでした。条件を緩めてお試しください。");
};
