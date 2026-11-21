// ダブルエリミネーション作成ツール（1対1版・麻雀版）共通のUI部品

import type { ReactNode } from "react";
import { Printer, RotateCcw, Pencil, Check, ListRestart, Users, Sparkles } from "lucide-react";
import type { MatchDef } from "@/utils/doubleElimination";

export const COLUMN_GAP = 48; // ラウンド間の横幅(px)。半分ずつ接続線を描く

// 名前が空欄の参加者は番号で表示する
export const toDisplayNames = (players: string[]) =>
  players.map((n, i) => n.trim() || `参加者${i + 1}`);

export const glassButton =
  "inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20";

// ダークなヒーローヘッダー
export function Hero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
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

// トーナメント表示中のヘッダー（進行状況と操作ボタン）
export function TournamentHeader({
  eyebrow, title, playerCount, doneCount, totalCount, liveCount, unit, finished, hint,
  renaming, onToggleRename, onEdit, onResetResults,
}: {
  eyebrow: string;
  title: string;
  playerCount: number;
  doneCount: number;
  totalCount: number;
  liveCount: number;
  unit: string; // 「試合」「卓」
  finished: boolean;
  hint: string;
  renaming: boolean;
  onToggleRename: () => void;
  onEdit: () => void;
  onResetResults: () => void;
}) {
  const progress = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  return (
    <Hero eyebrow={eyebrow} title={title}>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs print:hidden">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold">
          <Users className="w-3.5 h-3.5" /> {playerCount}名
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-semibold">
          <Check className="w-3.5 h-3.5" /> {doneCount} / {totalCount} {unit}終了
        </span>
        {liveCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/15 px-3 py-1 font-semibold text-cyan-200 ring-1 ring-cyan-300/40">
            <PingDot className="h-2 w-2" color="bg-cyan-300" />
            対戦可能 {liveCount}{unit}
          </span>
        )}
      </div>

      <div className="mt-4 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/10 print:hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-cyan-300 to-fuchsia-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {!finished && <p className="mt-4 text-sm text-slate-400 print:hidden">{hint}</p>}

      <div className="mt-5 flex flex-wrap gap-2 print:hidden">
        <button onClick={onToggleRename} className={`${glassButton} ${renaming ? "bg-white/25 ring-1 ring-white/40" : ""}`}>
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
  );
}

export function PingDot({ className, color }: { className: string; color: string }) {
  return (
    <span className={`relative flex ${className}`}>
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${color}`} />
      <span className={`relative inline-flex rounded-full ${className} ${color}`} />
    </span>
  );
}

// 結果を残したまま名前だけ変更するパネル
export function RenamePanel({
  players, onRename, onClose,
}: {
  players: string[];
  onRename: (index: number, name: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm print:hidden">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-bold text-slate-800">名前を変更</p>
          <p className="text-xs text-slate-500">組み合わせと入力済みの結果はそのまま残ります。</p>
        </div>
        <button
          onClick={onClose}
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
              onChange={(e) => onRename(i, e.target.value)}
              placeholder={`参加者${i + 1}`}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm transition focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

// 「対戦可能な試合（卓）」の一覧
export function LiveSection({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-cyan-200/70 bg-gradient-to-br from-cyan-50/70 via-white to-indigo-50/60 p-5 shadow-sm print:hidden">
      <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <PingDot className="h-2.5 w-2.5" color="bg-cyan-500" />
        <h2 className="font-black tracking-tight text-slate-900">{title}</h2>
        <span className="text-xs text-slate-500">{hint}</span>
      </div>
      <div className="grid gap-x-4 gap-y-8 pt-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

export function LiveBadge() {
  return (
    <span className="absolute -top-2.5 right-2 z-20 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md shadow-cyan-500/40 print:hidden">
      <PingDot className="h-1.5 w-1.5" color="bg-white" />
      対戦可能
    </span>
  );
}

export function BracketSection({
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

export function RoundPill({ label }: { label: string }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold tracking-wide text-white">
      {label}
    </span>
  );
}

// ラウンドを列として並べ、試合同士を接続線でつなぐ
export function BracketGrid({
  rounds, labels, slotHeight, isHidden, isDone, renderCard,
}: {
  rounds: MatchDef[][];
  labels: string[];
  slotHeight: number; // 1回戦1試合あたりの縦幅(px)
  isHidden: (def: MatchDef) => boolean; // 両者不戦などで表示しない
  isDone: (def: MatchDef) => boolean;
  renderCard: (def: MatchDef) => ReactNode;
}) {
  const height = rounds[0].length * slotHeight;
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
                const hidden = isHidden(def);
                const line = !hidden && isDone(def) ? "bg-indigo-400" : "bg-slate-300";
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
                    <div className="relative z-10 w-full">{hidden ? null : renderCard(def)}</div>
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
