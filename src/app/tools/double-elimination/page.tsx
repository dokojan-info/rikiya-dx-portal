"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Shuffle, Trophy, Printer, RotateCcw, Pencil, Play, Medal, Check, ListRestart,
  Swords, Flame, Crown, Users, Sparkles,
} from "lucide-react";
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

const STORAGE_KEY = "rdx-double-elimination-v1";
const MATCH_SLOT_HEIGHT = 108; // 1回戦1試合あたりの縦幅(px)
const COLUMN_GAP = 48; // ラウンド間の横幅(px)。半分ずつ接続線を描く

type SavedState = {
  title: string;
  entriesText: string;
  players: string[] | null; // null = 作成前（入力画面）
  useReset: boolean;
  results: Record<string, number>;
};

const initialState: SavedState = {
  title: "",
  entriesText: "",
  players: null,
  useReset: true,
  results: {},
};

const parseEntries = (text: string) =>
  text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

// 名前が空欄の参加者は番号で表示する
const toDisplayNames = (players: string[]) =>
  players.map((n, i) => n.trim() || `参加者${i + 1}`);

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
  const canCreate =
    entries.length >= MIN_PLAYERS && entries.length <= MAX_PLAYERS && duplicateNames.length === 0;

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
    update({ players: entries, results: {} });
  };

  const backToEdit = () => {
    const hasResults = Object.keys(state.results).length > 0;
    if (hasResults && !confirm("組み合わせを作り直すと、入力済みの結果はすべてリセットされます。よろしいですか？")) return;
    // 名前変更した内容を入力欄に反映して戻る
    const names = state.players ? toDisplayNames(state.players) : entries;
    update({ players: null, results: {}, entriesText: names.join("\n") });
  };

  const resetResults = () => {
    if (!confirm("入力済みの結果をすべてリセットしますか？")) return;
    update({ results: {} });
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

/* ---------------- 共通パーツ ---------------- */

// ダークなヒーローヘッダー
function Hero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 print:bg-white print:text-slate-900 print:shadow-none print:p-0 print:rounded-none">
      <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-indigo-600/40 blur-3xl print:hidden" />
      <div className="pointer-events-none absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-fuchsia-600/25 blur-3xl print:hidden" />
      <div className="pointer-events-none absolute top-6 right-1/3 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl print:hidden" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] print:hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-indigo-200 print:hidden">
          <Sparkles className="w-3 h-3" /> {eyebrow}
        </p>
        <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight">{title}</h1>
        {children}
      </div>
    </div>
  );
}

const glassButton =
  "inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20";

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
  state, entries, duplicateNames, canCreate, onChange, onShuffle, onCreate,
}: {
  state: SavedState;
  entries: string[];
  duplicateNames: string[];
  canCreate: boolean;
  onChange: (patch: Partial<SavedState>) => void;
  onShuffle: () => void;
  onCreate: () => void;
}) {
  let size = 2;
  while (size < entries.length) size *= 2;
  const byes = entries.length >= MIN_PLAYERS ? size - entries.length : 0;

  return (
    <div className="space-y-6">
      <Hero eyebrow="DOUBLE ELIMINATION" title="ダブルエリミネーション作成ツール">
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          参加者を入力するだけでトーナメント表を自動作成。1回負けても敗者側から優勝を狙える、2敗で敗退の形式です。
          入力内容と結果はこのブラウザに自動保存されます。
        </p>
      </Hero>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm space-y-5">
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

          <label className="block">
            <div className="flex items-end justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                参加者（1行に1名・上から順にシード）
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  entries.length > MAX_PLAYERS ? "bg-red-100 text-red-700" : "bg-indigo-50 text-indigo-700"
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
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 font-mono text-sm leading-7 text-slate-800 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </label>

          {duplicateNames.length > 0 && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
              同じ名前が重複しています：{Array.from(new Set(duplicateNames)).join("、")}
            </p>
          )}
          {entries.length > 0 && entries.length < MIN_PLAYERS && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
              参加者は{MIN_PLAYERS}名以上入力してください。
            </p>
          )}
          {entries.length > MAX_PLAYERS && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
              参加者は最大{MAX_PLAYERS}名までです。
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
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Crown className="w-4 h-4 text-amber-500" /> グランドファイナル
            </p>
            <ResetToggle value={state.useReset} onChange={(useReset) => onChange({ useReset })} />
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 py-3">
                <p className="text-[11px] font-semibold text-slate-500">ブラケット</p>
                <p className="text-xl font-black text-slate-800 tabular-nums">
                  {entries.length >= MIN_PLAYERS ? `${size}枠` : "—"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 py-3">
                <p className="text-[11px] font-semibold text-slate-500">不戦勝</p>
                <p className="text-xl font-black text-slate-800 tabular-nums">
                  {entries.length >= MIN_PLAYERS ? `${byes}名` : "—"}
                </p>
              </div>
            </div>

            <button
              onClick={onShuffle}
              disabled={entries.length < 2}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <Shuffle className="w-4 h-4" /> 順番をシャッフル
            </button>

            <button
              onClick={onCreate}
              disabled={!canCreate}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              <Play className="w-4 h-4 fill-white" /> トーナメントを作成
            </button>

            <p className="text-[11px] leading-relaxed text-slate-500">
              人数が2のべき乗（4・8・16…）に満たない場合は、上位シードから順に1回戦が不戦勝になります。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- トーナメント表 ---------------- */

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
  const liveCount = realMatches.filter((m) => m.playable && m.winner === null).length;
  const progress = realMatches.length ? Math.round((doneCount / realMatches.length) * 100) : 0;

  const wCount = structure.winnersRounds.length;
  const lCount = structure.losersRounds.length;

  return (
    <div className="space-y-6">
      <Hero eyebrow="DOUBLE ELIMINATION" title={title || "ダブルエリミネーション"}>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs print:hidden">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold">
            <Users className="w-3.5 h-3.5" /> {players.length}名
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold">
            <Check className="w-3.5 h-3.5" /> {doneCount} / {realMatches.length} 試合終了
          </span>
          {liveCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/15 px-3 py-1 font-semibold text-cyan-200 ring-1 ring-cyan-300/40">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
              </span>
              対戦可能 {liveCount}試合
            </span>
          )}
        </div>

        <div className="mt-4 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/10 print:hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-cyan-300 to-fuchsia-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-4 text-sm text-slate-400 print:hidden">
          光っている試合が対戦可能です。勝った方の名前をクリックすると勝ち上がります（もう一度クリックで取消）。
        </p>

        <div className="mt-5 flex flex-wrap gap-2 print:hidden">
          <button
            onClick={() => setRenaming((v) => !v)}
            className={`${glassButton} ${renaming ? "bg-white/25 ring-1 ring-white/40" : ""}`}
          >
            <Pencil className="w-4 h-4" /> 名前を変更
          </button>
          <button onClick={onEdit} className={glassButton}>
            <ListRestart className="w-4 h-4" /> 組み合わせを作り直す
          </button>
          <button onClick={onResetResults} className={glassButton}>
            <RotateCcw className="w-4 h-4" /> 結果をリセット
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-sm font-bold text-slate-900 transition hover:bg-indigo-50"
          >
            <Printer className="w-4 h-4" /> 印刷
          </button>
        </div>
      </Hero>

      {renaming && (
        <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm print:hidden">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-800">名前を変更</p>
              <p className="text-xs text-slate-500">組み合わせと入力済みの結果はそのまま残ります。</p>
            </div>
            <button
              onClick={() => setRenaming(false)}
              className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              <Check className="w-4 h-4" /> 完了
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((name, i) => (
              <label key={i} className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-bold text-white tabular-nums">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => renamePlayer(i, e.target.value)}
                  placeholder={`参加者${i + 1}`}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm transition focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {standings.champion !== null && <Podium names={names} standings={standings} />}

      <BracketSection
        icon={<Swords className="w-5 h-5" />}
        iconClass="from-indigo-500 to-blue-500 shadow-indigo-500/30"
        title="勝者側ブラケット"
        subtitle="負けると敗者側ブラケットへ"
      >
        <BracketGrid
          rounds={structure.winnersRounds}
          labels={structure.winnersRounds.map((_, i) => roundLabel("W", i + 1, wCount))}
          resolved={resolved}
          names={names}
          onPick={handlePick}
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
            resolved={resolved}
            names={names}
            onPick={handlePick}
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

function BracketSection({
  icon, iconClass, title, subtitle, children,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm print:break-inside-avoid print:shadow-none">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${iconClass}`}>
          {icon}
        </span>
        <div>
          <h2 className="font-black tracking-tight text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div
        className="overflow-x-auto p-6"
        style={{
          backgroundImage: "radial-gradient(rgb(226 232 240) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function RoundPill({ label }: { label: string }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold tracking-wide text-white">
      {label}
    </span>
  );
}

// ラウンドを列として並べ、試合同士を接続線でつなぐ
function BracketGrid({
  rounds, labels, resolved, names, onPick,
}: {
  rounds: MatchDef[][];
  labels: string[];
  resolved: Record<string, ResolvedMatch>;
  names: string[];
  onPick: (matchId: string, player: number) => void;
}) {
  const height = rounds[0].length * MATCH_SLOT_HEIGHT;
  const half = COLUMN_GAP / 2;

  return (
    <div className="flex w-max" style={{ gap: COLUMN_GAP }}>
      {rounds.map((round, ri) => {
        const next = rounds[ri + 1];
        const mode: "merge" | "straight" | "none" = !next
          ? "none"
          : next.length * 2 === round.length
            ? "merge"
            : "straight";

        return (
          <div key={ri} className="w-60 shrink-0">
            <RoundPill label={labels[ri]} />
            <div className="mt-3 flex flex-col" style={{ height }}>
              {round.map((def, mi) => {
                const m = resolved[def.id];
                const hidden = m.a === "BYE" && m.b === "BYE";
                const done = m.winner !== null && !hidden;
                const line = done ? "bg-indigo-400" : "bg-slate-300";
                return (
                  <div key={def.id} className="relative flex flex-1 items-center">
                    {!hidden && (
                      <>
                        {ri > 0 && (
                          <span className="absolute top-1/2 h-0.5 bg-slate-300" style={{ left: -half, width: half }} />
                        )}
                        {mode !== "none" && (
                          <span className={`absolute top-1/2 h-0.5 ${line}`} style={{ right: -half, width: half }} />
                        )}
                        {mode === "merge" && (
                          <span
                            className={`absolute w-0.5 ${line}`}
                            style={{
                              right: -half - 1,
                              top: mi % 2 === 0 ? "50%" : 0,
                              height: "calc(50% + 1px)",
                            }}
                          />
                        )}
                      </>
                    )}
                    <div className="relative z-10 w-full">
                      {hidden ? <div className="h-[74px]" aria-hidden /> : <MatchCard m={m} names={names} onPick={onPick} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
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
          "group relative flex h-9 w-full items-center gap-2 px-2.5 text-left text-sm transition",
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
      {live && (
        <span className="absolute -top-2.5 right-2 z-20 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md shadow-cyan-500/40 print:hidden">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          対戦可能
        </span>
      )}
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
