"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shuffle, Trophy, Play, Medal, Check, Swords, Flame, Crown } from "lucide-react";
import {
  buildStructure,
  resolveAll,
  getStandings,
  getDependents,
  roundLabel,
  MIN_PLAYERS,
  MAX_PLAYERS,
  type MatchDef,
  type ResolvedMatch,
  type SlotValue,
  type Source,
} from "@/utils/doubleElimination";
import { MJ_MIN_PLAYERS, MJ_MAX_PLAYERS, isValidMahjongCount } from "@/utils/mahjongDoubleElimination";
import {
  Hero,
  TournamentHeader,
  RenamePanel,
  LiveSection,
  LiveBadge,
  BracketSection,
  BracketGrid,
  RoundPill,
  toDisplayNames,
} from "@/components/double-elimination/ui";
import MahjongTournamentView from "@/components/double-elimination/MahjongTournamentView";

const STORAGE_KEY = "rdx-double-elimination-v1";
const MATCH_SLOT_HEIGHT = 108; // 1回戦1試合あたりの縦幅(px)

type Format = "1v1" | "mahjong";

type SavedState = {
  format: Format;
  title: string;
  entriesText: string;
  players: string[] | null; // null = 作成前（入力画面）
  useReset: boolean;
  results: Record<string, number>; // 1対1: 試合ID -> 勝者
  mjResults: Record<string, number[]>; // 麻雀: 卓ID -> 通過者（決勝卓は着順）
};

const initialState: SavedState = {
  format: "1v1",
  title: "",
  entriesText: "",
  players: null,
  useReset: true,
  results: {},
  mjResults: {},
};

const FORMAT_RULES: Record<Format, { min: number; max: number; step: number; presets: number[] }> = {
  "1v1": { min: MIN_PLAYERS, max: MAX_PLAYERS, step: 1, presets: [4, 8, 12, 16, 24, 32] },
  mahjong: { min: MJ_MIN_PLAYERS, max: MJ_MAX_PLAYERS, step: 4, presets: [8, 12, 16, 24, 32] },
};

const isValidCount = (format: Format, n: number) =>
  format === "mahjong"
    ? isValidMahjongCount(n)
    : Number.isInteger(n) && n >= MIN_PLAYERS && n <= MAX_PLAYERS;

const countRuleText = (format: Format) =>
  format === "mahjong"
    ? `${MJ_MIN_PLAYERS}〜${MJ_MAX_PLAYERS}名の4の倍数`
    : `${MIN_PLAYERS}〜${MAX_PLAYERS}名`;

const parseEntries = (text: string) =>
  text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

export default function DoubleEliminationPage() {
  const [state, setState] = useState<SavedState>(initialState);
  const [loaded, setLoaded] = useState(false);

  // ブラウザ保存から復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
    } catch {
      // 保存データが壊れている・使えない場合は初期状態で開始
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 保存できない環境（プライベートモード等）は無視
    }
  }, [state, loaded]);

  const entries = parseEntries(state.entriesText);
  const duplicateNames = entries.filter((n, i) => entries.indexOf(n) !== i);
  const canCreate = isValidCount(state.format, entries.length) && duplicateNames.length === 0;

  const update = (patch: Partial<SavedState>) => setState((prev) => ({ ...prev, ...patch }));

  const shuffleEntries = () => {
    const list = [...entries];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    update({ entriesText: list.join("\n") });
  };

  const createTournament = () => {
    if (!canCreate) return;
    update({ players: entries, results: {}, mjResults: {} });
  };

  // 人数だけ指定：名前は空欄で作成し、表示は「参加者N」になる
  const createByCount = (count: number) => {
    if (!isValidCount(state.format, count)) return;
    update({ players: Array(count).fill(""), results: {}, mjResults: {} });
  };

  const backToEdit = () => {
    const hasResults = Object.keys(state.results).length > 0 || Object.keys(state.mjResults).length > 0;
    if (hasResults && !confirm("組み合わせを作り直すと、入力済みの結果はすべてリセットされます。よろしいですか？")) return;
    // 名前変更した内容を入力欄に反映して戻る
    const names = state.players ? toDisplayNames(state.players) : entries;
    update({ players: null, results: {}, mjResults: {}, entriesText: names.join("\n") });
  };

  const resetResults = () => {
    if (!confirm("入力済みの結果をすべてリセットしますか？")) return;
    update({ results: {}, mjResults: {} });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans print:bg-white">
      <Header />

      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 print:p-0">
        <div className="max-w-6xl mx-auto print:max-w-none">
          {!loaded ? null : state.players === null ? (
            <SetupForm
              state={state}
              entries={entries}
              duplicateNames={duplicateNames}
              canCreate={canCreate}
              onChange={update}
              onShuffle={shuffleEntries}
              onCreate={createTournament}
              onCreateByCount={createByCount}
            />
          ) : state.format === "mahjong" ? (
            <MahjongTournamentView
              title={state.title}
              players={state.players}
              results={state.mjResults}
              onResultsChange={(mjResults) => update({ mjResults })}
              onPlayersChange={(players) => update({ players })}
              onEdit={backToEdit}
              onResetResults={resetResults}
            />
          ) : (
            <TournamentView
              title={state.title}
              players={state.players}
              useReset={state.useReset}
              results={state.results}
              onResultsChange={(results) => update({ results })}
              onPlayersChange={(players) => update({ players })}
              onToggleReset={(useReset) => update({ useReset })}
              onEdit={backToEdit}
              onResetResults={resetResults}
            />
          )}
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

function ResetToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const options = [
    { v: true, label: "リセットあり", desc: "敗者側代表が勝ったらもう1試合" },
    { v: false, label: "1試合のみ", desc: "グランドファイナル1試合で決着" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const selected = value === opt.v;
        return (
          <button
            key={String(opt.v)}
            type="button"
            onClick={() => onChange(opt.v)}
            className={`rounded-xl border p-3 text-left transition ${
              selected
                ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span className={`block text-sm font-bold ${selected ? "text-indigo-700" : "text-slate-700"}`}>
              {opt.label}
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{opt.desc}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- 入力画面 ---------------- */

function SetupForm({
  state, entries, duplicateNames, canCreate, onChange, onShuffle, onCreate, onCreateByCount,
}: {
  state: SavedState;
  entries: string[];
  duplicateNames: string[];
  canCreate: boolean;
  onChange: (patch: Partial<SavedState>) => void;
  onShuffle: () => void;
  onCreate: () => void;
  onCreateByCount: (count: number) => void;
}) {
  const format = state.format;
  const rules = FORMAT_RULES[format];
  const isMahjong = format === "mahjong";
  const [mode, setMode] = useState<"count" | "names">("count");
  const [countText, setCountText] = useState("8");
  const count = Number(countText);
  const countValid = isValidCount(format, count);

  // 範囲内に収め、麻雀は4の倍数に丸める
  const normalize = (n: number) => {
    const stepped = Math.round(n / rules.step) * rules.step;
    return Math.min(rules.max, Math.max(rules.min, stepped));
  };
  const stepBy = (delta: number) =>
    setCountText(String(normalize((Number.isFinite(count) && count > 0 ? count : rules.min) + delta)));

  const changeFormat = (f: Format) => {
    onChange({ format: f });
    if (f === "mahjong" && !isValidMahjongCount(count)) setCountText(String(MJ_MIN_PLAYERS));
  };

  const playerCount = mode === "count" ? (countValid ? count : 0) : entries.length;
  const showStats = isValidCount(format, playerCount);
  // ブラケット枠（麻雀は2人1組の単位で数える）
  const units = isMahjong ? playerCount / 2 : playerCount;
  let size = 2;
  while (size < units) size *= 2;
  const byePlayers = showStats ? (size - units) * (isMahjong ? 2 : 1) : 0;
  const ready = mode === "count" ? countValid : canCreate;

  const tabClass = (active: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-bold transition ${
      active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
    }`;

  return (
    <div className="space-y-6">
      <Hero eyebrow="DOUBLE ELIMINATION" title="ダブルエリミネーション作成ツール">
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          人数を指定するだけでトーナメント表を自動作成。1回負けても敗者側から優勝を狙える、2敗で敗退の形式です。
          1対1の対戦のほか、麻雀の4人卓（上位2名通過）にも対応。入力内容と結果はこのブラウザに自動保存されます。
        </p>
      </Hero>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">対戦形式</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {([
                { f: "1v1", label: "1対1", desc: "勝った1名が勝ち上がり" },
                { f: "mahjong", label: "麻雀（4人卓）", desc: "上位2名が通過・4の倍数の人数" },
              ] as const).map((o) => {
                const selected = format === o.f;
                return (
                  <button
                    key={o.f}
                    type="button"
                    onClick={() => changeFormat(o.f)}
                    className={`rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className={`block font-bold ${selected ? "text-indigo-700" : "text-slate-700"}`}>{o.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{o.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">大会名（任意）</span>
            <input
              type="text"
              value={state.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="例：第1回 〇〇杯"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-slate-800 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </label>

          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            <button type="button" onClick={() => setMode("count")} className={tabClass(mode === "count")}>
              人数だけ指定
            </button>
            <button type="button" onClick={() => setMode("names")} className={tabClass(mode === "names")}>
              名前を入力
            </button>
          </div>

          {mode === "count" ? (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">参加人数</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => stepBy(-rules.step)}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-2xl font-bold text-slate-700 transition hover:bg-slate-50"
                  aria-label="人数を減らす"
                >
                  −
                </button>
                <div className="relative flex-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={rules.min}
                    max={rules.max}
                    step={rules.step}
                    value={countText}
                    onChange={(e) => setCountText(e.target.value)}
                    onBlur={() => countText !== "" && setCountText(String(normalize(count || rules.min)))}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/60 pr-12 text-center text-3xl font-black tabular-nums text-slate-900 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">名</span>
                </div>
                <button
                  type="button"
                  onClick={() => stepBy(rules.step)}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-2xl font-bold text-slate-700 transition hover:bg-slate-50"
                  aria-label="人数を増やす"
                >
                  ＋
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rules.presets.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCountText(String(n))}
                    className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                      count === n
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {n}名
                  </button>
                ))}
              </div>
              {!countValid && countText !== "" && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  人数は{countRuleText(format)}で指定してください。
                </p>
              )}
              <p className="rounded-xl bg-indigo-50/70 px-4 py-3 text-xs leading-relaxed text-indigo-900">
                「参加者1」「参加者2」…の仮の名前で作成します。名前は作成後に
                <span className="font-bold">「名前を変更」</span>
                からいつでも変えられます（組み合わせ・結果はそのまま）。
              </p>
            </div>
          ) : (
            <>
              <label className="block">
                <div className="flex items-end justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    参加者（1行に1名・上から順にシード）
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      entries.length > rules.max ? "bg-red-100 text-red-700" : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    {entries.length}名
                  </span>
                </div>
                <textarea
                  value={state.entriesText}
                  onChange={(e) => onChange({ entriesText: e.target.value })}
                  rows={12}
                  placeholder={"山田\n佐藤\n鈴木\n田中"}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-7 text-slate-800 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              {duplicateNames.length > 0 && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  同じ名前が重複しています：{Array.from(new Set(duplicateNames)).join("、")}
                </p>
              )}
              {entries.length > 0 && !isValidCount(format, entries.length) && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  参加者は{countRuleText(format)}で入力してください（現在{entries.length}名）。
                </p>
              )}

              {entries.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">シード順プレビュー</p>
                  <div className="flex flex-wrap gap-1.5">
                    {entries.map((name, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-xs text-slate-700"
                      >
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white tabular-nums">
                          {i + 1}
                        </span>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-4">
          {isMahjong ? (
            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Crown className="w-4 h-4 text-amber-500" /> 麻雀版のルール
              </p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-slate-600">
                <li>・勝者側の卓：上位2名は勝者側に残り、下位2名は敗者側へ</li>
                <li>・敗者側の卓：上位2名は勝ち残り、下位2名は敗退</li>
                <li>・決勝卓：勝者側の上位2名＋敗者側の上位2名で1〜4位を決定</li>
              </ul>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Crown className="w-4 h-4 text-amber-500" /> グランドファイナル
              </p>
              <ResetToggle value={state.useReset} onChange={(useReset) => onChange({ useReset })} />
            </div>
          )}

          <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 py-3">
                <p className="text-[11px] font-semibold text-slate-500">{isMahjong ? "1回戦" : "ブラケット"}</p>
                <p className="text-xl font-black text-slate-800 tabular-nums">
                  {!showStats ? "—" : isMahjong ? `${(playerCount - byePlayers) / 4}卓` : `${size}枠`}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 py-3">
                <p className="text-[11px] font-semibold text-slate-500">{isMahjong ? "1回戦免除" : "不戦勝"}</p>
                <p className="text-xl font-black text-slate-800 tabular-nums">{showStats ? `${byePlayers}名` : "—"}</p>
              </div>
            </div>

            {mode === "names" && (
              <button
                onClick={onShuffle}
                disabled={entries.length < 2}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <Shuffle className="w-4 h-4" /> 順番をシャッフル
              </button>
            )}

            <button
              onClick={() => (mode === "count" ? onCreateByCount(count) : onCreate())}
              disabled={!ready}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              <Play className="w-4 h-4 fill-white" /> トーナメントを作成
            </button>

            <p className="text-[11px] leading-relaxed text-slate-500">
              {isMahjong
                ? "人数が8・16・32名以外の場合は、上位シードから順に1回戦が免除（打たずに通過）になります。"
                : "人数が2のべき乗（4・8・16…）に満たない場合は、上位シードから順に1回戦が不戦勝になります。"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- トーナメント表（1対1） ---------------- */

function TournamentView({
  title, players, useReset, results, onResultsChange, onPlayersChange, onToggleReset, onEdit, onResetResults,
}: {
  title: string;
  players: string[];
  useReset: boolean;
  results: Record<string, number>;
  onResultsChange: (r: Record<string, number>) => void;
  onPlayersChange: (p: string[]) => void;
  onToggleReset: (v: boolean) => void;
  onEdit: () => void;
  onResetResults: () => void;
}) {
  const structure = useMemo(() => buildStructure(players.length), [players.length]);
  const resolved = useMemo(
    () => resolveAll(structure, players.length, results, useReset),
    [structure, players.length, results, useReset],
  );
  const standings = getStandings(structure, resolved);
  const names = toDisplayNames(players);
  const [renaming, setRenaming] = useState(false);

  // 結果は参加者番号で記録しているため、名前だけ差し替えても結果は維持される
  const renamePlayer = (index: number, name: string) => {
    const next = [...players];
    next[index] = name;
    onPlayersChange(next);
  };

  const handlePick = (matchId: string, player: number) => {
    const current = results[matchId];
    const next = { ...results };
    const dependents = getDependents(structure, matchId).filter((id) => id in results);

    if (current === player) {
      delete next[matchId];
    } else {
      next[matchId] = player;
    }
    if (current !== undefined && dependents.length > 0) {
      if (!confirm("この試合の結果を変更すると、以降の試合の結果もリセットされます。よろしいですか？")) return;
      dependents.forEach((id) => delete next[id]);
    }
    onResultsChange(next);
  };

  // 進行状況（不戦・未実施のリセットマッチを除く）
  const realMatches = Object.values(resolved).filter((m) => !m.isBye && m.active);
  const doneCount = realMatches.filter((m) => m.winner !== null).length;
  const liveMatches = structure.all
    .map((def) => resolved[def.id])
    .filter((m) => m.playable && m.winner === null);

  const wCount = structure.winnersRounds.length;
  const lCount = structure.losersRounds.length;
  const roundLabelOf = (def: MatchDef) =>
    roundLabel(def.bracket, def.round, def.bracket === "W" ? wCount : lCount);

  const isHidden = (def: MatchDef) => resolved[def.id].a === "BYE" && resolved[def.id].b === "BYE";
  const isDone = (def: MatchDef) => resolved[def.id].winner !== null;
  const card = (def: MatchDef) => <MatchCard m={resolved[def.id]} names={names} onPick={handlePick} />;

  return (
    <div className="space-y-6">
      <TournamentHeader
        eyebrow="DOUBLE ELIMINATION"
        title={title || "ダブルエリミネーション"}
        playerCount={players.length}
        doneCount={doneCount}
        totalCount={realMatches.length}
        liveCount={liveMatches.length}
        unit="試合"
        finished={standings.champion !== null}
        hint="光っている試合が対戦可能です。勝った方の名前を押すと勝ち上がります（もう一度押すと取消）。"
        renaming={renaming}
        onToggleRename={() => setRenaming((v) => !v)}
        onEdit={onEdit}
        onResetResults={onResetResults}
      />

      {renaming && <RenamePanel players={players} onRename={renamePlayer} onClose={() => setRenaming(false)} />}

      {standings.champion !== null && <Podium names={names} standings={standings} />}

      {liveMatches.length > 0 && (
        <LiveSection title="対戦可能な試合" hint="勝った方をタップで入力">
          {liveMatches.map((m) => (
            <div key={m.def.id}>
              <p className="mb-5 text-xs font-bold text-slate-600">{roundLabelOf(m.def)}</p>
              <MatchCard
                m={m}
                names={names}
                onPick={handlePick}
                tags={m.def.bracket === "GF" ? ["勝者側", "敗者側"] : undefined}
              />
            </div>
          ))}
        </LiveSection>
      )}

      <BracketSection
        icon={<Swords className="w-5 h-5" />}
        iconClass="from-indigo-500 to-blue-500 shadow-indigo-500/30"
        title="勝者側ブラケット"
        subtitle="負けると敗者側ブラケットへ"
      >
        <BracketGrid
          rounds={structure.winnersRounds}
          labels={structure.winnersRounds.map((_, i) => roundLabel("W", i + 1, wCount))}
          slotHeight={MATCH_SLOT_HEIGHT}
          isHidden={isHidden}
          isDone={isDone}
          renderCard={card}
        />
      </BracketSection>

      {lCount > 0 && (
        <BracketSection
          icon={<Flame className="w-5 h-5" />}
          iconClass="from-rose-500 to-orange-500 shadow-rose-500/30"
          title="敗者側ブラケット"
          subtitle="ここで負けると敗退（2敗目）"
        >
          <BracketGrid
            rounds={structure.losersRounds}
            labels={structure.losersRounds.map((_, i) => roundLabel("L", i + 1, lCount))}
            slotHeight={MATCH_SLOT_HEIGHT}
            isHidden={isHidden}
            isDone={isDone}
            renderCard={card}
          />
        </BracketSection>
      )}

      <BracketSection
        icon={<Crown className="w-5 h-5" />}
        iconClass="from-amber-400 to-orange-500 shadow-amber-500/30"
        title="グランドファイナル"
        subtitle="勝者側代表 vs 敗者側代表"
      >
        <div className="flex flex-wrap items-start gap-x-10 gap-y-6">
          <div className="w-60">
            <RoundPill label="グランドファイナル" />
            <div className="mt-6">
              <MatchCard m={resolved["GF1"]} names={names} onPick={handlePick} tags={["勝者側", "敗者側"]} />
            </div>
          </div>
          {useReset && (
            <div className="w-60">
              <RoundPill label="リセットマッチ" />
              <div className="mt-6">
                {resolved["GF2"].active ? (
                  <MatchCard m={resolved["GF2"]} names={names} onPick={handlePick} tags={["勝者側", "敗者側"]} />
                ) : (
                  <div className="flex h-[74px] items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-4 text-center text-xs text-slate-400">
                    {resolved["GF1"].winner === null
                      ? "敗者側代表が勝った場合のみ実施"
                      : "勝者側代表の勝利のため実施なし"}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="w-full max-w-xs print:hidden">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">ルール</p>
            <ResetToggle value={useReset} onChange={onToggleReset} />
          </div>
        </div>
      </BracketSection>
    </div>
  );
}

function Podium({ names, standings }: { names: string[]; standings: ReturnType<typeof getStandings> }) {
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
              <p className="text-2xl font-black text-slate-900 sm:text-3xl">{names[standings.champion!]}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 sm:ml-auto">
            {standings.runnerUp !== null && (
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5">
                <Medal className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-slate-400">準優勝</p>
                  <p className="font-bold text-slate-800">{names[standings.runnerUp]}</p>
                </div>
              </div>
            )}
            {standings.third !== null && (
              <div className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-white/80 px-4 py-2.5">
                <Medal className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-orange-400">3位</p>
                  <p className="font-bold text-slate-800">{names[standings.third]}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 未確定の枠に「どこから来るか」を表示する
const sourceHint = (s: Source): string => {
  if (s.type === "seed") return "未定";
  return `${s.matchId} の${s.type === "winner" ? "勝者" : "敗者"}`;
};

function MatchCard({
  m, names, onPick, tags,
}: {
  m: ResolvedMatch;
  names: string[];
  onPick: (matchId: string, player: number) => void;
  tags?: [string, string];
}) {
  const live = m.playable && m.winner === null;
  const done = m.winner !== null && !m.isBye;

  const row = (slot: SlotValue, source: Source, tag?: string) => {
    const isPlayer = typeof slot === "number";
    const isWinner = done && m.winner === slot;
    const isLoser = done && m.loser === slot;
    const label = slot === "BYE" ? "BYE" : isPlayer ? names[slot] : sourceHint(source);

    return (
      <button
        type="button"
        disabled={!m.playable}
        onClick={() => isPlayer && onPick(m.def.id, slot)}
        className={[
          "group relative flex h-10 sm:h-9 w-full items-center gap-2 px-2.5 text-left text-sm transition",
          m.playable ? "cursor-pointer hover:bg-indigo-50" : "cursor-default",
          isWinner ? "bg-gradient-to-r from-indigo-50 via-indigo-50/60 to-transparent" : "",
        ].join(" ")}
      >
        {isWinner && <span className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-gradient-to-b from-indigo-500 to-fuchsia-500" />}
        <span
          className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md px-1 text-[10px] font-bold tabular-nums ${
            isWinner ? "bg-indigo-600 text-white" : isPlayer ? "bg-slate-100 text-slate-500" : "bg-transparent text-transparent"
          }`}
        >
          {isPlayer ? slot + 1 : "-"}
        </span>
        <span
          className={`flex-1 truncate ${
            isWinner
              ? "font-bold text-slate-900"
              : isLoser
                ? "text-slate-400"
                : isPlayer
                  ? "font-medium text-slate-700"
                  : "text-xs italic text-slate-400"
          }`}
        >
          {label}
        </span>
        {tag && (
          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">{tag}</span>
        )}
        {isWinner && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        )}
        {m.playable && !isWinner && (
          <span className="shrink-0 text-[10px] font-bold text-indigo-500 opacity-0 transition group-hover:opacity-100">
            勝ち
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={`relative ${m.isBye ? "opacity-45" : ""}`}>
      <span className="absolute -top-[18px] left-1 font-mono text-[10px] font-semibold text-slate-400">{m.def.id}</span>
      {live && <LiveBadge />}
      <div className={`rounded-xl p-[1.5px] ${live ? "de-live" : done ? "bg-indigo-200" : "bg-slate-200"}`}>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-[10px] bg-white">
          {row(m.a, m.def.a, tags?.[0])}
          {row(m.b, m.def.b, tags?.[1])}
        </div>
      </div>
      {m.isBye && (
        <span className="absolute -bottom-4 right-1 text-[10px] font-semibold text-slate-400">不戦勝</span>
      )}
    </div>
  );
}
