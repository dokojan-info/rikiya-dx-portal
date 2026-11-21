// 麻雀版（4人卓・上位2名通過）ダブルエリミネーションの表示

import { useMemo, useState } from "react";
import { Swords, Flame, Crown, Trophy, Medal } from "lucide-react";
import { getDependents, roundLabel, type MatchDef, type Source } from "@/utils/doubleElimination";
import {
  buildMahjongStructure,
  resolveMahjong,
  getFinalRanking,
  FINAL_TABLE_ID,
  type MjSlot,
  type MjTable,
} from "@/utils/mahjongDoubleElimination";
import {
  TournamentHeader,
  RenamePanel,
  LiveSection,
  LiveBadge,
  BracketSection,
  BracketGrid,
  RoundPill,
  toDisplayNames,
} from "./ui";

const TABLE_SLOT_HEIGHT = 228; // 1回戦1卓あたりの縦幅(px)

const RANK_STYLES = [
  { label: "1位", chip: "bg-gradient-to-br from-amber-400 to-orange-500 text-white" },
  { label: "2位", chip: "bg-gradient-to-br from-slate-300 to-slate-500 text-white" },
  { label: "3位", chip: "bg-gradient-to-br from-orange-300 to-amber-700 text-white" },
  { label: "4位", chip: "bg-slate-200 text-slate-600" },
];

export default function MahjongTournamentView({
  title, players, results, onResultsChange, onPlayersChange, onEdit, onResetResults,
}: {
  title: string;
  players: string[];
  results: Record<string, number[]>;
  onResultsChange: (r: Record<string, number[]>) => void;
  onPlayersChange: (p: string[]) => void;
  onEdit: () => void;
  onResetResults: () => void;
}) {
  const structure = useMemo(() => buildMahjongStructure(players.length), [players.length]);
  const tables = useMemo(
    () => resolveMahjong(structure, players.length, results),
    [structure, players.length, results],
  );
  const names = toDisplayNames(players);
  const ranking = getFinalRanking(tables);
  const [renaming, setRenaming] = useState(false);

  const renamePlayer = (index: number, name: string) => {
    const next = [...players];
    next[index] = name;
    onPlayersChange(next);
  };

  // 通常卓: 通過する2名を選ぶ（再タップで取消）
  // 決勝卓: 1位から順にタップ（3人目まで選ぶと4位は自動。順位のついた人をタップするとそこから下を取消）
  const handleTap = (id: string, player: number) => {
    const t = tables[id];
    const cur = t.picks;
    let picks: number[];

    if (t.isFinal) {
      const idx = cur.indexOf(player);
      if (idx >= 0) {
        picks = cur.slice(0, idx);
      } else {
        picks = [...cur, player];
        if (picks.length === 3) picks.push(t.players!.find((p) => !picks.includes(p))!);
      }
    } else if (cur.includes(player)) {
      picks = cur.filter((p) => p !== player);
    } else if (cur.length < 2) {
      picks = [...cur, player];
    } else {
      return; // 2名選択済み。入れ替えるときは先に取り消す
    }

    const next = { ...results };
    if (picks.length) next[id] = picks;
    else delete next[id];

    // 勝ち抜けの2名が変わる場合は、以降の卓の結果をリセット
    const need = t.isFinal ? 4 : 2;
    const sameTop =
      picks.length >= need && cur.slice(0, 2).every((p) => picks.slice(0, 2).includes(p));
    if (t.done && !sameTop) {
      const dependents = getDependents(structure, id).filter((d) => d in results);
      if (dependents.length > 0) {
        if (!confirm("この卓の結果を変更すると、以降の卓の結果もリセットされます。よろしいですか？")) return;
        dependents.forEach((d) => delete next[d]);
      }
    }
    onResultsChange(next);
  };

  const realTables = structure.all.map((d) => tables[d.id]).filter((t) => !t.isBye && t.def.id !== "GF2");
  const doneCount = realTables.filter((t) => t.done).length;
  const liveTables = realTables.filter((t) => t.playable && !t.done);

  const wCount = structure.winnersRounds.length;
  const lCount = structure.losersRounds.length;
  const labelOf = (def: MatchDef) =>
    def.id === FINAL_TABLE_ID ? "決勝卓" : roundLabel(def.bracket, def.round, def.bracket === "W" ? wCount : lCount);

  const card = (def: MatchDef) => <TableCard t={tables[def.id]} names={names} onTap={handleTap} />;

  return (
    <div className="space-y-6">
      <TournamentHeader
        eyebrow="MAHJONG DOUBLE ELIMINATION"
        title={title || "麻雀ダブルエリミネーション"}
        playerCount={players.length}
        doneCount={doneCount}
        totalCount={realTables.length}
        liveCount={liveTables.length}
        unit="卓"
        finished={ranking !== null}
        hint="光っている卓が対局可能です。通過した2名を押して入力します（決勝卓は1位から順に押す）。"
        renaming={renaming}
        onToggleRename={() => setRenaming((v) => !v)}
        onEdit={onEdit}
        onResetResults={onResetResults}
      />

      {renaming && <RenamePanel players={players} onRename={renamePlayer} onClose={() => setRenaming(false)} />}

      {ranking && <MahjongPodium names={names} ranking={ranking} />}

      {liveTables.length > 0 && (
        <LiveSection title="対局可能な卓" hint="通過した2名をタップで入力">
          {liveTables.map((t) => (
            <div key={t.def.id}>
              <p className="mb-5 text-xs font-bold text-slate-600">{labelOf(t.def)}</p>
              {card(t.def)}
            </div>
          ))}
        </LiveSection>
      )}

      <BracketSection
        icon={<Swords className="w-5 h-5" />}
        iconClass="from-indigo-500 to-blue-500 shadow-indigo-500/30"
        title="勝者側ブラケット"
        subtitle="上位2名は勝者側に残り、下位2名は敗者側へ"
      >
        <BracketGrid
          rounds={structure.winnersRounds}
          labels={structure.winnersRounds.map((d) => labelOf(d[0]))}
          slotHeight={TABLE_SLOT_HEIGHT}
          isHidden={(d) => tables[d.id].a === "BYE" && tables[d.id].b === "BYE"}
          isDone={(d) => tables[d.id].done || tables[d.id].isBye}
          renderCard={card}
        />
      </BracketSection>

      <BracketSection
        icon={<Flame className="w-5 h-5" />}
        iconClass="from-rose-500 to-orange-500 shadow-rose-500/30"
        title="敗者側ブラケット"
        subtitle="上位2名は勝ち残り、下位2名は敗退（2回目の下位）"
      >
        <BracketGrid
          rounds={structure.losersRounds}
          labels={structure.losersRounds.map((d) => labelOf(d[0]))}
          slotHeight={TABLE_SLOT_HEIGHT}
          isHidden={(d) => tables[d.id].a === "BYE" && tables[d.id].b === "BYE"}
          isDone={(d) => tables[d.id].done || tables[d.id].isBye}
          renderCard={card}
        />
      </BracketSection>

      <BracketSection
        icon={<Crown className="w-5 h-5" />}
        iconClass="from-amber-400 to-orange-500 shadow-amber-500/30"
        title="決勝卓"
        subtitle="勝者側の上位2名 + 敗者側の上位2名で1〜4位を決定"
      >
        <div className="w-64">
          <RoundPill label="決勝卓" />
          <div className="mt-6">{card(structure.grandFinal)}</div>
        </div>
      </BracketSection>
    </div>
  );
}

// 未確定の枠に「どこから来るか」を表示する
const sourceHint = (s: Source): string => {
  if (s.type === "seed") return "未定";
  return `${s.matchId} の${s.type === "winner" ? "上位2名" : "下位2名"}`;
};

function TableCard({
  t, names, onTap,
}: {
  t: MjTable;
  names: string[];
  onTap: (id: string, player: number) => void;
}) {
  const live = t.playable && !t.done;
  const outLabel = t.def.bracket === "W" ? "敗者側へ" : "敗退";

  type Row = { player: number | null; text: string; tag?: string };
  const rowsOf = (slot: MjSlot, source: Source, tag?: string): Row[] => {
    if (slot === "BYE") return [{ player: null, text: "BYE", tag }, { player: null, text: "BYE", tag }];
    if (slot === null) {
      const hint = sourceHint(source);
      return [{ player: null, text: hint, tag }, { player: null, text: hint, tag }];
    }
    return slot.map((p) => ({ player: p, text: names[p], tag }));
  };
  const rows = [
    ...rowsOf(t.a, t.def.a, t.isFinal ? "勝者側" : undefined),
    ...rowsOf(t.b, t.def.b, t.isFinal ? "敗者側" : undefined),
  ];

  const footer = t.isBye
    ? "不戦通過"
    : live
      ? t.isFinal
        ? `1位から順にタップ（${t.picks.length}/4）`
        : `通過する2名をタップ（${t.picks.length}/2）`
      : null;

  return (
    <div className={`relative ${t.isBye ? "opacity-45" : ""}`}>
      <span className="absolute -top-[18px] left-1 font-mono text-[10px] font-semibold text-slate-400">
        {t.isFinal ? "FINAL" : t.def.id}
      </span>
      {live && <LiveBadge />}
      <div className={`rounded-xl p-[1.5px] ${live ? "de-live" : t.done ? "bg-indigo-200" : "bg-slate-200"}`}>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-[10px] bg-white">
          {rows.map((row, i) => {
            const p = row.player;
            const pickIndex = p === null ? -1 : t.picks.indexOf(p);
            const passed = !t.isFinal && pickIndex >= 0;
            const out = !t.isFinal && t.done && p !== null && pickIndex < 0;
            const rank = t.isFinal && pickIndex >= 0 ? RANK_STYLES[pickIndex] : null;

            return (
              <button
                key={i}
                type="button"
                disabled={!t.playable || p === null}
                onClick={() => p !== null && onTap(t.def.id, p)}
                className={[
                  "group relative flex h-10 w-full items-center gap-2 px-2.5 text-left text-sm transition",
                  t.playable && p !== null ? "cursor-pointer hover:bg-indigo-50" : "cursor-default",
                  passed || (rank && pickIndex < 2) ? "bg-gradient-to-r from-indigo-50 via-indigo-50/60 to-transparent" : "",
                ].join(" ")}
              >
                {(passed || (rank && pickIndex === 0)) && (
                  <span className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-gradient-to-b from-indigo-500 to-fuchsia-500" />
                )}
                <span
                  className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md px-1 text-[10px] font-bold tabular-nums ${
                    passed ? "bg-indigo-600 text-white" : p !== null ? "bg-slate-100 text-slate-500" : "text-transparent"
                  }`}
                >
                  {p !== null ? p + 1 : "-"}
                </span>
                <span
                  className={`flex-1 truncate ${
                    passed || (rank && pickIndex === 0)
                      ? "font-bold text-slate-900"
                      : out
                        ? "text-slate-400"
                        : p !== null
                          ? "font-medium text-slate-700"
                          : "text-xs italic text-slate-400"
                  }`}
                >
                  {row.text}
                </span>
                {row.tag && (
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">{row.tag}</span>
                )}
                {passed && (
                  <span className="shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    通過
                  </span>
                )}
                {out && <span className="shrink-0 text-[10px] font-semibold text-slate-400">{outLabel}</span>}
                {rank && (
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${rank.chip}`}>{rank.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {footer && (
        <p className={`mt-1 px-1 text-[10px] font-semibold ${live ? "text-indigo-500" : "text-slate-400"}`}>{footer}</p>
      )}
    </div>
  );
}

function MahjongPodium({ names, ranking }: { names: string[]; ranking: number[] }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 p-[1.5px] shadow-xl shadow-amber-500/20 print:shadow-none">
      <div className="relative rounded-[calc(1.5rem-1.5px)] bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-300/40 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/40">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-amber-600">CHAMPION</p>
              <p className="text-2xl font-black text-slate-900 sm:text-3xl">{names[ranking[0]]}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 sm:ml-auto">
            {ranking.slice(1).map((p, i) => (
              <div key={p} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5">
                <Medal className={`h-5 w-5 ${i === 0 ? "text-slate-400" : i === 1 ? "text-orange-400" : "text-slate-300"}`} />
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-slate-400">{i + 2}位</p>
                  <p className="font-bold text-slate-800">{names[p]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
