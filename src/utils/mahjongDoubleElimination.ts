// 麻雀（4人卓・上位2名通過）のダブルエリミネーション
//
// 2人1組を「1単位」とみなすと、4人卓は「単位 vs 単位」の1対1と同じ形になる
// （上位2名 = 勝ち単位、下位2名 = 負け単位）。そのため1対1版のブラケット構造を
// 参加人数/2 の単位数で生成して流用する。
// - 勝者側の卓: 上位2名は勝者側に残り、下位2名は敗者側へ
// - 敗者側の卓: 上位2名は敗者側に残り、下位2名は敗退
// - 決勝卓（GF1）: 勝者側代表2名 + 敗者側代表2名で1〜4位を決める（リセットなし）

import { buildStructure, type Structure, type MatchDef, type Source } from "./doubleElimination";

export const MJ_MIN_PLAYERS = 8;
export const MJ_MAX_PLAYERS = 64;
export const FINAL_TABLE_ID = "GF1";

export const isValidMahjongCount = (n: number) =>
  Number.isInteger(n) && n >= MJ_MIN_PLAYERS && n <= MJ_MAX_PLAYERS && n % 4 === 0;

export type Pair = [number, number];
export type MjSlot = Pair | "BYE" | null; // 参加者2名 / BYE / 未確定

export type MjTable = {
  def: MatchDef;
  a: MjSlot;
  b: MjSlot;
  players: number[] | null; // 4名確定時のみ
  upper: MjSlot; // 上位2名（勝ち抜け）
  lower: MjSlot; // 下位2名
  picks: number[]; // 入力途中を含む選択（通常卓: 通過者 / 決勝卓: 着順）
  playable: boolean;
  isBye: boolean;
  done: boolean;
  isFinal: boolean;
};

export const buildMahjongStructure = (playerCount: number): Structure => buildStructure(playerCount / 2);

export const resolveMahjong = (
  structure: Structure,
  playerCount: number,
  results: Record<string, number[]>,
): Record<string, MjTable> => {
  const units = playerCount / 2;
  const defs = new Map(structure.all.map((m) => [m.id, m]));
  const memo: Record<string, MjTable> = {};

  const resolveSource = (s: Source): MjSlot => {
    // 単位sは参加者 (2s-1, 2s)番。上位シードの単位から順に不戦が割り当たる
    if (s.type === "seed") return s.seed <= units ? [2 * s.seed - 2, 2 * s.seed - 1] : "BYE";
    const t = resolve(s.matchId);
    return s.type === "winner" ? t.upper : t.lower;
  };

  const resolve = (id: string): MjTable => {
    if (memo[id]) return memo[id];
    const def = defs.get(id)!;
    const isFinal = id === FINAL_TABLE_ID;
    const a = resolveSource(def.a);
    const b = resolveSource(def.b);
    const isBye = a === "BYE" || b === "BYE";
    let upper: MjSlot = null;
    let lower: MjSlot = null;
    let players: number[] | null = null;
    let picks: number[] = [];
    let done = false;

    if (a === "BYE" && b === "BYE") {
      upper = "BYE";
      lower = "BYE";
    } else if (isBye) {
      // 相手が不戦なら2名とも卓を打たずに通過
      upper = a === "BYE" ? b : a;
      lower = "BYE";
    } else if (a && b) {
      players = [...a, ...b];
      const valid = (results[id] ?? []).filter((p, i, arr) => players!.includes(p) && arr.indexOf(p) === i);
      picks = valid.slice(0, isFinal ? 4 : 2);
      const need = isFinal ? 4 : 2;
      if (picks.length === need) {
        done = true;
        const top = picks.slice(0, 2);
        const rest = players.filter((p) => !top.includes(p));
        upper = [top[0], top[1]];
        lower = [rest[0], rest[1]];
      }
    }

    // GF2（リセットマッチ）は麻雀版では使わない
    const unused = id === "GF2";
    memo[id] = {
      def, a, b, players, upper, lower, picks,
      playable: !unused && players !== null,
      isBye, done: !unused && done, isFinal,
    };
    return memo[id];
  };

  structure.all.forEach((m) => resolve(m.id));
  return memo;
};

// 決勝卓の着順（1〜4位）
export const getFinalRanking = (tables: Record<string, MjTable>): number[] | null => {
  const t = tables[FINAL_TABLE_ID];
  return t.done ? t.picks : null;
};
