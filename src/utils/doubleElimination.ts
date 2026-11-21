// ダブルエリミネーション（1対1）のブラケット生成と勝ち上がり計算

export type Source =
  | { type: "seed"; seed: number } // 1始まりのシード番号
  | { type: "winner"; matchId: string }
  | { type: "loser"; matchId: string };

export type Bracket = "W" | "L" | "GF";

export type MatchDef = {
  id: string;
  bracket: Bracket;
  round: number; // 1始まり
  index: number; // ラウンド内の位置（0始まり）
  a: Source;
  b: Source;
};

export type Structure = {
  size: number; // 2のべき乗に切り上げた枠数
  winnersRounds: MatchDef[][];
  losersRounds: MatchDef[][];
  grandFinal: MatchDef;
  grandFinalReset: MatchDef;
  all: MatchDef[];
};

// 参加者番号（0始まり） / BYE / 未確定
export type SlotValue = number | "BYE" | null;

export type ResolvedMatch = {
  def: MatchDef;
  a: SlotValue;
  b: SlotValue;
  winner: SlotValue;
  loser: SlotValue;
  playable: boolean; // 両者が確定しており結果入力できる
  isBye: boolean; // 片方以上がBYE（不戦）
  active: boolean; // グランドファイナルリセットが行われない場合 false
};

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 64;

// 標準的なシード配置（1 vs 最下位、上位シード同士が最後に当たる）
const seedOrder = (size: number): number[] => {
  let order = [1, 2];
  while (order.length < size) {
    const n = order.length * 2;
    order = order.flatMap((s) => [s, n + 1 - s]);
  }
  return order;
};

export const buildStructure = (playerCount: number): Structure => {
  let size = 2;
  while (size < playerCount) size *= 2;
  const k = Math.log2(size);
  const order = seedOrder(size);

  const winnersRounds: MatchDef[][] = [];
  for (let r = 1; r <= k; r++) {
    const count = size / 2 ** r;
    const round: MatchDef[] = [];
    for (let i = 0; i < count; i++) {
      const id = `W${r}-${i + 1}`;
      if (r === 1) {
        round.push({
          id, bracket: "W", round: r, index: i,
          a: { type: "seed", seed: order[i * 2] },
          b: { type: "seed", seed: order[i * 2 + 1] },
        });
      } else {
        const prev = winnersRounds[r - 2];
        round.push({
          id, bracket: "W", round: r, index: i,
          a: { type: "winner", matchId: prev[i * 2].id },
          b: { type: "winner", matchId: prev[i * 2 + 1].id },
        });
      }
    }
    winnersRounds.push(round);
  }

  // 敗者側: 2(k-1) ラウンド
  // 奇数ラウンド: 敗者側同士（L1のみ勝者側1回戦の敗者同士）
  // 偶数ラウンド: 敗者側の勝者 vs 勝者側から落ちてきた敗者
  const losersRounds: MatchDef[][] = [];
  const lCount = 2 * (k - 1);
  for (let r = 1; r <= lCount; r++) {
    const round: MatchDef[] = [];
    if (r === 1) {
      const w1 = winnersRounds[0];
      for (let i = 0; i < w1.length / 2; i++) {
        round.push({
          id: `L1-${i + 1}`, bracket: "L", round: 1, index: i,
          a: { type: "loser", matchId: w1[i * 2].id },
          b: { type: "loser", matchId: w1[i * 2 + 1].id },
        });
      }
    } else if (r % 2 === 0) {
      const prev = losersRounds[r - 2];
      const wRound = winnersRounds[r / 2]; // 勝者側 (r/2 + 1) 回戦
      const m = prev.length;
      // 再戦を避けるため、落ちてくる順番をラウンドごとに反転させる
      const flip = (r / 2) % 2 === 1;
      for (let i = 0; i < m; i++) {
        const wi = flip ? m - 1 - i : i;
        round.push({
          id: `L${r}-${i + 1}`, bracket: "L", round: r, index: i,
          a: { type: "winner", matchId: prev[i].id },
          b: { type: "loser", matchId: wRound[wi].id },
        });
      }
    } else {
      const prev = losersRounds[r - 2];
      for (let i = 0; i < prev.length / 2; i++) {
        round.push({
          id: `L${r}-${i + 1}`, bracket: "L", round: r, index: i,
          a: { type: "winner", matchId: prev[i * 2].id },
          b: { type: "winner", matchId: prev[i * 2 + 1].id },
        });
      }
    }
    losersRounds.push(round);
  }

  const wFinal = winnersRounds[k - 1][0];
  const lChampion: Source =
    lCount > 0
      ? { type: "winner", matchId: losersRounds[lCount - 1][0].id }
      : { type: "loser", matchId: wFinal.id };

  const grandFinal: MatchDef = {
    id: "GF1", bracket: "GF", round: 1, index: 0,
    a: { type: "winner", matchId: wFinal.id },
    b: lChampion,
  };
  // リセットマッチ: 同じ2人（a=勝者側代表, b=敗者側代表）で再戦
  const grandFinalReset: MatchDef = {
    id: "GF2", bracket: "GF", round: 2, index: 0,
    a: grandFinal.a,
    b: grandFinal.b,
  };

  const all = [...winnersRounds.flat(), ...losersRounds.flat(), grandFinal, grandFinalReset];
  return { size, winnersRounds, losersRounds, grandFinal, grandFinalReset, all };
};

// results: matchId -> 勝者の参加者番号
export const resolveAll = (
  structure: Structure,
  playerCount: number,
  results: Record<string, number>,
  useReset: boolean,
): Record<string, ResolvedMatch> => {
  const defs = new Map(structure.all.map((m) => [m.id, m]));
  const memo: Record<string, ResolvedMatch> = {};

  const resolveSource = (s: Source): SlotValue => {
    if (s.type === "seed") return s.seed <= playerCount ? s.seed - 1 : "BYE";
    const m = resolve(s.matchId);
    return s.type === "winner" ? m.winner : m.loser;
  };

  const resolve = (id: string): ResolvedMatch => {
    if (memo[id]) return memo[id];
    const def = defs.get(id)!;
    const a = resolveSource(def.a);
    const b = resolveSource(def.b);
    let winner: SlotValue = null;
    let loser: SlotValue = null;
    const isBye = a === "BYE" || b === "BYE";
    const playable = typeof a === "number" && typeof b === "number";

    if (a === "BYE" && b === "BYE") {
      winner = "BYE";
      loser = "BYE";
    } else if (isBye) {
      // BYEの相手は不戦勝。敗者は存在しない
      const other = a === "BYE" ? b : a;
      winner = other;
      loser = "BYE";
    } else if (playable) {
      const r = results[id];
      if (r === a || r === b) {
        winner = r;
        loser = r === a ? b : a;
      }
    }

    let active = true;
    if (id === "GF2") {
      const gf1 = resolve("GF1");
      // 敗者側代表がGF1に勝った場合のみリセットマッチを行う
      active = useReset && gf1.winner !== null && gf1.winner === gf1.b;
      if (!active) {
        winner = null;
        loser = null;
      }
    }

    memo[id] = { def, a, b, winner, loser, playable: playable && active, isBye, active };
    return memo[id];
  };

  structure.all.forEach((m) => resolve(m.id));
  return memo;
};

export type Standings = { champion: number | null; runnerUp: number | null; third: number | null };

export const getStandings = (structure: Structure, resolved: Record<string, ResolvedMatch>): Standings => {
  const gf1 = resolved["GF1"];
  const gf2 = resolved["GF2"];
  const final = gf2.active ? gf2 : gf1;
  const num = (v: SlotValue) => (typeof v === "number" ? v : null);

  const lRounds = structure.losersRounds;
  const third =
    lRounds.length > 0 ? num(resolved[lRounds[lRounds.length - 1][0].id].loser) : null;

  return { champion: num(final.winner), runnerUp: num(final.loser), third };
};

// 指定した試合の結果に依存する（下流の）試合IDを列挙する
export const getDependents = (structure: Structure, matchId: string): string[] => {
  const children = new Map<string, string[]>();
  structure.all.forEach((m) => {
    [m.a, m.b].forEach((s) => {
      if (s.type === "seed") return;
      const list = children.get(s.matchId) ?? [];
      list.push(m.id);
      children.set(s.matchId, list);
    });
  });
  // GF2 は GF1 の結果で実施有無が変わる
  children.set("GF1", [...(children.get("GF1") ?? []), "GF2"]);

  const seen = new Set<string>();
  const stack = [...(children.get(matchId) ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    stack.push(...(children.get(id) ?? []));
  }
  return Array.from(seen);
};

export const roundLabel = (bracket: Bracket, round: number, totalRounds: number): string => {
  if (bracket === "W") {
    if (round === totalRounds) return "勝者側 決勝";
    if (round === totalRounds - 1 && totalRounds >= 3) return "勝者側 準決勝";
    return `勝者側 ${round}回戦`;
  }
  if (bracket === "L") {
    if (round === totalRounds) return "敗者側 決勝";
    return `敗者側 ${round}回戦`;
  }
  return round === 1 ? "グランドファイナル" : "リセットマッチ";
};
