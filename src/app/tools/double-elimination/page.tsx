"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shuffle, Trophy, Printer, RotateCcw, Pencil, Play, Medal } from "lucide-react";
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
} from "@/utils/doubleElimination";

const STORAGE_KEY = "rdx-double-elimination-v1";
const MATCH_SLOT_HEIGHT = 92; // 1回戦1試合あたりの縦幅(px)

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
    if (hasResults && !confirm("参加者を編集すると、入力済みの結果はすべてリセットされます。よろしいですか？")) return;
    update({ players: null, results: {} });
  };

  const resetResults = () => {
    if (!confirm("入力済みの結果をすべてリセットしますか？")) return;
    update({ results: {} });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans print:bg-white">
      <Header />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 print:p-0">
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
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
      <h1 className="text-2xl font-bold text-slate-800">ダブルエリミネーション作成ツール</h1>
      <p className="text-sm text-slate-500 mt-1">
        参加者を入力するとトーナメント表を自動で作成します。2敗するまで敗退しない形式です。
        <span className="block mt-1">入力内容と結果はこのブラウザに自動保存されます。</span>
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">大会名（任意）</span>
            <input
              type="text"
              value={state.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="例：第1回 〇〇杯"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>

          <label className="block">
            <div className="flex items-end justify-between">
              <span className="text-sm font-bold text-slate-700">
                参加者（1行に1名・上から順にシード）
              </span>
              <span className={`text-xs ${entries.length > MAX_PLAYERS ? "text-red-600" : "text-slate-500"}`}>
                {entries.length}名
              </span>
            </div>
            <textarea
              value={state.entriesText}
              onChange={(e) => onChange({ entriesText: e.target.value })}
              rows={12}
              placeholder={"山田\n佐藤\n鈴木\n田中"}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>

          {duplicateNames.length > 0 && (
            <p className="text-sm text-red-600">
              同じ名前が重複しています：{Array.from(new Set(duplicateNames)).join("、")}
            </p>
          )}
          {entries.length > 0 && entries.length < MIN_PLAYERS && (
            <p className="text-sm text-red-600">参加者は{MIN_PLAYERS}名以上入力してください。</p>
          )}
          {entries.length > MAX_PLAYERS && (
            <p className="text-sm text-red-600">参加者は最大{MAX_PLAYERS}名までです。</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-bold text-slate-700 mb-2">グランドファイナル</p>
            <ResetToggle value={state.useReset} onChange={(useReset) => onChange({ useReset })} />
          </div>

          <button
            onClick={onShuffle}
            disabled={entries.length < 2}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium disabled:opacity-40"
          >
            <Shuffle className="w-4 h-4" /> 順番をシャッフル
          </button>

          <button
            onClick={onCreate}
            disabled={!canCreate}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-xl hover:bg-slate-700 transition-colors font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" /> トーナメントを作成
          </button>

          <p className="text-xs text-slate-500 leading-relaxed">
            人数が2のべき乗（4・8・16…）に満たない場合は、上位シードから順に1回戦が不戦勝になります。
          </p>
        </div>
      </div>
    </div>
  );
}

function ResetToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="space-y-2">
      {[
        { v: true, label: "リセットあり", desc: "敗者側代表が勝ったらもう1試合" },
        { v: false, label: "1試合のみ", desc: "グランドファイナル1試合で決着" },
      ].map((opt) => (
        <label key={String(opt.v)} className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value === opt.v}
            onChange={() => onChange(opt.v)}
            className="mt-1"
          />
          <span>
            <span className="text-sm font-medium text-slate-700">{opt.label}</span>
            <span className="block text-xs text-slate-500">{opt.desc}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

/* ---------------- トーナメント表 ---------------- */

function TournamentView({
  title, players, useReset, results, onResultsChange, onToggleReset, onEdit, onResetResults,
}: {
  title: string;
  players: string[];
  useReset: boolean;
  results: Record<string, number>;
  onResultsChange: (r: Record<string, number>) => void;
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

  const wCount = structure.winnersRounds.length;
  const lCount = structure.losersRounds.length;
  const wHeight = structure.winnersRounds[0].length * MATCH_SLOT_HEIGHT;
  const lHeight = (structure.losersRounds[0]?.length ?? 1) * MATCH_SLOT_HEIGHT;

  const renderCard = (def: MatchDef) => (
    <MatchCard key={def.id} m={resolved[def.id]} players={players} onPick={handlePick} />
  );

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:shadow-none print:border-0 print:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{title || "ダブルエリミネーション"}</h1>
            <p className="text-sm text-slate-500 mt-1">
              参加者 {players.length}名 ／ 勝った方の名前をクリックすると勝ち上がります（もう一度クリックで取消）
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button onClick={onEdit}
              className="flex items-center gap-1.5 border border-slate-200 bg-white text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-50 text-sm font-medium">
              <Pencil className="w-4 h-4" /> 参加者を編集
            </button>
            <button onClick={onResetResults}
              className="flex items-center gap-1.5 border border-slate-200 bg-white text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-50 text-sm font-medium">
              <RotateCcw className="w-4 h-4" /> 結果をリセット
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-slate-800 text-white px-3 py-2 rounded-xl hover:bg-slate-700 text-sm font-medium">
              <Printer className="w-4 h-4" /> 印刷
            </button>
          </div>
        </div>

        {standings.champion !== null && (
          <div className="mt-5 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-4 flex flex-wrap items-center gap-x-8 gap-y-2">
            <span className="flex items-center gap-2 text-lg font-bold text-amber-700">
              <Trophy className="w-6 h-6" /> 優勝：{players[standings.champion]}
            </span>
            {standings.runnerUp !== null && (
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Medal className="w-4 h-4" /> 準優勝：{players[standings.runnerUp]}
              </span>
            )}
            {standings.third !== null && (
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Medal className="w-4 h-4" /> 3位：{players[standings.third]}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 勝者側 */}
      <BracketSection title="勝者側ブラケット" accent="bg-blue-600">
        <div className="flex gap-6" style={{ height: wHeight }}>
          {structure.winnersRounds.map((round, ri) => (
            <RoundColumn key={ri} label={roundLabel("W", ri + 1, wCount)}>
              {round.map(renderCard)}
            </RoundColumn>
          ))}
        </div>
      </BracketSection>

      {/* 敗者側 */}
      {lCount > 0 && (
        <BracketSection title="敗者側ブラケット" accent="bg-rose-500">
          <div className="flex gap-6" style={{ height: lHeight }}>
            {structure.losersRounds.map((round, ri) => (
              <RoundColumn key={ri} label={roundLabel("L", ri + 1, lCount)}>
                {round.map(renderCard)}
              </RoundColumn>
            ))}
          </div>
        </BracketSection>
      )}

      {/* グランドファイナル */}
      <BracketSection title="グランドファイナル" accent="bg-amber-500">
        <div className="flex flex-wrap items-start gap-6">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2">グランドファイナル</p>
            {renderCard(structure.grandFinal)}
            <p className="text-[11px] text-slate-400 mt-1">上：勝者側代表 ／ 下：敗者側代表</p>
          </div>
          {useReset && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2">リセットマッチ</p>
              {resolved["GF2"].active ? (
                renderCard(structure.grandFinalReset)
              ) : (
                <div className="w-52 rounded-lg border border-dashed border-slate-300 px-3 py-4 text-xs text-slate-400">
                  {resolved["GF1"].winner === null
                    ? "敗者側代表が勝った場合のみ実施"
                    : "勝者側代表の勝利のため実施なし"}
                </div>
              )}
            </div>
          )}
          <div className="rounded-xl border border-slate-200 p-4 print:hidden">
            <p className="text-sm font-bold text-slate-700 mb-2">ルール</p>
            <ResetToggle value={useReset} onChange={onToggleReset} />
          </div>
        </div>
      </BracketSection>
    </div>
  );
}

function BracketSection({ title, accent, children }: { title: string; accent: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:break-inside-avoid">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
        <span className={`w-2 h-5 rounded-full ${accent}`} />
        <h2 className="font-bold text-slate-800">{title}</h2>
      </div>
      <div className="p-5 overflow-x-auto">{children}</div>
    </section>
  );
}

function RoundColumn({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col shrink-0 w-52">
      <p className="text-xs font-bold text-slate-500 mb-2 whitespace-nowrap">{label}</p>
      <div className="flex-1 flex flex-col justify-around">{children}</div>
    </div>
  );
}

function MatchCard({
  m, players, onPick,
}: {
  m: ResolvedMatch;
  players: string[];
  onPick: (matchId: string, player: number) => void;
}) {
  // 両者BYEの試合は空枠（レイアウト維持のため高さだけ確保）
  if (m.a === "BYE" && m.b === "BYE") {
    return <div className="h-[68px]" aria-hidden />;
  }

  const row = (slot: SlotValue, seedNo: number | null) => {
    const isPlayer = typeof slot === "number";
    const isWinner = isPlayer && m.winner === slot && !m.isBye;
    const isLoser = isPlayer && m.loser === slot && !m.isBye;
    const name = slot === "BYE" ? "BYE（不戦）" : isPlayer ? players[slot] : "未定";

    return (
      <button
        type="button"
        disabled={!m.playable}
        onClick={() => isPlayer && onPick(m.def.id, slot)}
        className={[
          "w-full flex items-center gap-2 px-2.5 h-[30px] text-left text-sm transition-colors",
          m.playable ? "hover:bg-blue-50 cursor-pointer" : "cursor-default",
          isWinner ? "bg-blue-50 font-bold text-slate-900" : "",
          isLoser ? "text-slate-400 line-through decoration-slate-300" : "",
          !isPlayer ? "text-slate-400 italic" : "text-slate-700",
        ].join(" ")}
      >
        <span className="w-5 shrink-0 text-[10px] text-slate-400 tabular-nums">{seedNo ?? ""}</span>
        <span className="truncate flex-1">{name}</span>
        {isWinner && <span className="text-[10px] font-bold text-blue-600 shrink-0">WIN</span>}
      </button>
    );
  };

  const seedOf = (slot: SlotValue) => (typeof slot === "number" ? slot + 1 : null);

  return (
    <div className={m.isBye ? "opacity-50" : ""}>
      <p className="text-[10px] text-slate-400 mb-0.5 tabular-nums">{m.def.id}</p>
      <div
        className={`rounded-lg border bg-white overflow-hidden divide-y divide-slate-100 ${
          m.playable && m.winner === null ? "border-blue-300 shadow-sm" : "border-slate-200"
        }`}
      >
        {row(m.a, seedOf(m.a))}
        {row(m.b, seedOf(m.b))}
      </div>
    </div>
  );
}
