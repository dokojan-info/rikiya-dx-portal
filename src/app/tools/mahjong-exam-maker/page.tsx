"use client";

import { useState, ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Plus, Trash2, Printer, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

type SubQuestion = {
  id: string;
  tiles: string;
  suffix: string;
  answer?: string;
};

type QuestionGroup = {
  id: string;
  title: string;
  problemType: "wait" | "score";
  settingMode: "preset" | "custom";
  presetLevel: 1 | 2 | 3;
  // 何待ちカスタム
  minWaits: number;
  maxWaits: number;
  chinitsu: boolean;
  allow4tiles: boolean;
  // 点数計算カスタム
  yakuFilter: string[];
  minFu: number;
  maxFu: number;
  minHan: number;
  maxHan: number;
  scoreWaitTypes: ("tanki" | "nobetan" | "ryanmen" | "shanpon")[];
  allowNaki: boolean;
  allowAnkan: boolean;
  // 小問
  subQuestions: SubQuestion[];
};

const WAIT_TITLE = "以下に示した手牌の待ち牌を全て答えよ。";
const SCORE_TITLE = "以下の手牌の和了点を申告通りに算用数字で答えよ。 ※ドラ、積み棒、リーチは考慮しないこと。";

const AVAILABLE_YAKU_LIST = ["平和", "七対子", "タンヤオ", "役牌", "一盃口", "三色同順", "一気通貫", "混一色", "清一色"];

const defaultGroupSettings = (type: "wait" | "score"): Omit<QuestionGroup, "id" | "subQuestions"> => ({
  title: type === "wait" ? WAIT_TITLE : SCORE_TITLE,
  problemType: type,
  settingMode: "preset",
  presetLevel: 1,
  minWaits: 1, maxWaits: 3, chinitsu: false, allow4tiles: false,
  yakuFilter: ["平和", "七対子"], minFu: 0, maxFu: 999, minHan: 1, maxHan: 1,
  scoreWaitTypes: ["tanki", "ryanmen", "shanpon", "nobetan"], allowNaki: false, allowAnkan: false,
});

// 123m -> 1m2m3m に変換
const expandTiles = (input: string): string => {
  if (!input) return "";
  return input.replace(/([0-9]+)([mpsz])([-_^*]?)/ig, (match, digits, suit, symbol) => {
    const chars = digits.split('');
    return chars.map((d: string, index: number) => {
      const isLast = index === chars.length - 1;
      return d + suit + (isLast && symbol ? symbol : '');
    }).join('');
  });
};

const FormattedText = ({ text }: { text: string }) => {
  if (!text) return null;
  const regex = /([0-9]+[mpsz][-_^*]?)+/ig;
  const elements: ReactNode[] = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
    }
    elements.push(
      <span key={`tiles-${match.index}`} className="font-mahjong-color text-[1.8em] leading-none inline-block align-middle mx-0.5 translate-y-[-3px]">
        {expandTiles(match[0])}
      </span>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  return <>{elements}</>;
};

export default function MahjongExamMaker() {
  const [groups, setGroups] = useState<QuestionGroup[]>([]);
  const [generatingGroupId, setGeneratingGroupId] = useState<string>("");
  const [expandedSettings, setExpandedSettings] = useState<Record<string, boolean>>({});

  // 大問追加
  const addGroup = (type: "wait" | "score") => {
    const id = crypto.randomUUID();
    setGroups([...groups, {
      id,
      ...defaultGroupSettings(type),
      subQuestions: [],
    }]);
    setExpandedSettings(prev => ({ ...prev, [id]: true }));
  };

  const updateGroup = (groupId: string, updates: Partial<QuestionGroup>) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, ...updates } : g));
  };

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
  };

  // 小問の操作
  const addSubQuestion = (groupId: string) => {
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, subQuestions: [...g.subQuestions, { id: crypto.randomUUID(), tiles: "", suffix: "", answer: "" }] }
        : g
    ));
  };

  const updateSubQuestion = (groupId: string, subId: string, field: keyof SubQuestion, value: string) => {
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, subQuestions: g.subQuestions.map(q => q.id === subId ? { ...q, [field]: value } : q) }
        : g
    ));
  };

  const removeSubQuestion = (groupId: string, subId: string) => {
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, subQuestions: g.subQuestions.filter(q => q.id !== subId) }
        : g
    ));
  };

  // 1問生成
  const handleGenerate = async (group: QuestionGroup) => {
    setGeneratingGroupId(group.id);
    try {
      const gen = await import("@/utils/mahjongGenerator");

      if (group.problemType === "wait") {
        const options = group.settingMode === "preset"
          ? gen.waitPresetToOptions(group.presetLevel)
          : {
              mode: "custom" as const, presetLevel: 1 as const,
              minWaits: group.minWaits, maxWaits: group.maxWaits,
              chinitsu: group.chinitsu, allow4tiles: group.allow4tiles,
            };
        const problem = gen.generateWaitProblem(options);
        setGroups(prev => prev.map(g =>
          g.id === group.id
            ? { ...g, subQuestions: [...g.subQuestions, { id: crypto.randomUUID(), tiles: problem.tiles, suffix: problem.suffix, answer: problem.answer }] }
            : g
        ));
      } else {
        const options = group.settingMode === "preset"
          ? gen.scorePresetToOptions(group.presetLevel)
          : {
              mode: "custom" as const, presetLevel: 1 as const,
              yakuFilter: group.yakuFilter, minFu: group.minFu, maxFu: group.maxFu,
              minHan: group.minHan, maxHan: group.maxHan,
              waitTypes: group.scoreWaitTypes, allowNaki: group.allowNaki, allowAnkan: group.allowAnkan,
            };
        const problem = gen.generateScoreProblem(options);
        setGroups(prev => prev.map(g =>
          g.id === group.id
            ? { ...g, subQuestions: [...g.subQuestions, { id: crypto.randomUUID(), tiles: problem.tiles, suffix: problem.suffix, answer: problem.answer }] }
            : g
        ));
      }
    } catch (e) {
      console.error("生成に失敗しました:", e);
      alert("条件を満たす問題が生成できませんでした。設定を変更してお試しください。");
    } finally {
      setGeneratingGroupId("");
    }
  };

  const handlePrint = () => { window.print(); };

  const toggleSettings = (groupId: string) => {
    setExpandedSettings(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // プリセットのラベル
  const waitPresetLabel = (level: number) => {
    switch (level) {
      case 1: return "1～3面待ち / 清一色OFF / 4枚使いOFF";
      case 2: return "4面待ち以上 or 清一色ON（ランダム）";
      case 3: return "4面待ち以上 / 清一色ON / 4枚使いON";
      default: return "";
    }
  };

  const scorePresetLabel = (level: number) => {
    switch (level) {
      case 1: return "1翻役（平和 / 七対子）ツモ or ロン";
      case 2: return "70符以下";
      case 3: return "80符以上 / 2翻以下";
      default: return "";
    }
  };

  const isWait = (g: QuestionGroup) => g.problemType === "wait";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans print:bg-white">
      <Header />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 print:p-0 print:m-0 print:pt-0">
        <div className="max-w-5xl mx-auto print:max-w-none print:w-full">
          
          {/* フォーム領域 (印刷時非表示) */}
          <div className="print:hidden mb-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">麻雀問題作成ツール</h1>
                <p className="text-sm text-slate-500 mt-1">
                  大問を追加して、1問ずつ自動生成できます。手動入力も可能です。
                  <span className="text-blue-600 font-medium block mt-1">
                    ※ 「123m」→「1m2m3m」に自動変換。末尾「-」で横向き。伏せ牌は「0z」。
                  </span>
                </p>
              </div>
              <button onClick={handlePrint}
                className="flex-shrink-0 flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors font-medium shadow-sm">
                <Printer className="w-5 h-5" /> 印刷する
              </button>
            </div>

            {/* 大問一覧 */}
            <div className="space-y-6 mb-6">
              {groups.map((group, groupIndex) => {
                const isSettingsOpen = expandedSettings[group.id] ?? false;
                const borderClass = isWait(group) ? "border-indigo-200" : "border-emerald-200";
                const bgClass = isWait(group) ? "bg-indigo-50/50" : "bg-emerald-50/50";
                const headerBg = isWait(group)
                  ? "bg-gradient-to-r from-indigo-500 to-blue-500"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500";

                return (
                  <div key={group.id} className={`rounded-xl border ${borderClass} overflow-hidden shadow-sm`}>
                    {/* ヘッダー */}
                    <div className={`${headerBg} px-4 py-2.5 flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-sm">問題 {groupIndex + 1}</span>
                        <span className="text-white/80 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          {isWait(group) ? "何待ち（待ち当て）" : "点数計算"}
                        </span>
                      </div>
                      <button onClick={() => removeGroup(group.id)}
                        className="text-white/70 hover:text-white p-1 rounded transition-colors" title="大問を削除">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4">
                      {/* 問題文 */}
                      <textarea value={group.title}
                        onChange={(e) => updateGroup(group.id, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white resize-none mb-3"
                        rows={2} placeholder="問題文を入力..." />

                      {/* 設定エリア */}
                      <div className={`${bgClass} rounded-lg border ${borderClass} mb-3`}>
                        <button onClick={() => toggleSettings(group.id)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-slate-700">
                          <span>⚙️ 生成設定</span>
                          {isSettingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {isSettingsOpen && (
                          <div className="px-3 pb-3 space-y-3">
                            {/* プリセット / カスタム切替 */}
                            <div className="flex gap-1 bg-white rounded-lg p-1">
                              <button onClick={() => updateGroup(group.id, { settingMode: "preset" })}
                                className={`flex-1 px-3 py-1 rounded-md text-xs font-bold transition-all ${group.settingMode === "preset" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                                簡単設定
                              </button>
                              <button onClick={() => updateGroup(group.id, { settingMode: "custom" })}
                                className={`flex-1 px-3 py-1 rounded-md text-xs font-bold transition-all ${group.settingMode === "custom" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                                カスタム設定
                              </button>
                            </div>

                            {group.settingMode === "preset" ? (
                              <div className="flex gap-2">
                                {([1, 2, 3] as const).map(lv => (
                                  <button key={lv} onClick={() => updateGroup(group.id, { presetLevel: lv })}
                                    className={`flex-1 p-2 rounded-lg border text-left transition-all ${
                                      group.presetLevel === lv
                                        ? (isWait(group) ? "border-indigo-400 bg-indigo-50" : "border-emerald-400 bg-emerald-50")
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}>
                                    <span className={`text-xs font-bold ${isWait(group) ? "text-indigo-600" : "text-emerald-600"}`}>Lv.{lv}</span>
                                    <span className="text-[10px] text-slate-500 block mt-0.5 leading-tight">
                                      {isWait(group) ? waitPresetLabel(lv) : scorePresetLabel(lv)}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ) : isWait(group) ? (
                              /* 何待ちカスタム */
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 mb-0.5 block">最小待ち数</label>
                                    <select value={group.minWaits} onChange={(e) => updateGroup(group.id, { minWaits: parseInt(e.target.value) })}
                                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white outline-none">
                                      {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}面以上</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 mb-0.5 block">最大待ち数</label>
                                    <select value={group.maxWaits} onChange={(e) => updateGroup(group.id, { maxWaits: parseInt(e.target.value) })}
                                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white outline-none">
                                      {[1,2,3,4,5,6,7,8,9,99].map(n => <option key={n} value={n}>{n === 99 ? "制限なし" : `${n}面以下`}</option>)}
                                    </select>
                                  </div>
                                </div>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={group.chinitsu} onChange={(e) => updateGroup(group.id, { chinitsu: e.target.checked })}
                                      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600" />
                                    <span className="text-xs text-slate-700">清一色</span>
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={group.allow4tiles} onChange={(e) => updateGroup(group.id, { allow4tiles: e.target.checked })}
                                      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600" />
                                    <span className="text-xs text-slate-700">4枚使い</span>
                                  </label>
                                </div>
                              </div>
                            ) : (
                              /* 点数計算カスタム */
                              <div className="space-y-2">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">手役フィルタ</label>
                                  <div className="flex flex-wrap gap-1">
                                    {AVAILABLE_YAKU_LIST.map(yaku => {
                                      const sel = group.yakuFilter.includes(yaku);
                                      return (
                                        <button key={yaku}
                                          onClick={() => updateGroup(group.id, {
                                            yakuFilter: sel ? group.yakuFilter.filter(y => y !== yaku) : [...group.yakuFilter, yaku]
                                          })}
                                          className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                                            sel ? "bg-emerald-100 border-emerald-400 text-emerald-700" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                                          }`}>
                                          {yaku}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 mb-0.5 block">符の範囲</label>
                                    <div className="flex items-center gap-1">
                                      <select value={group.minFu} onChange={(e) => updateGroup(group.id, { minFu: parseInt(e.target.value) })}
                                        className="flex-1 px-1.5 py-1 border border-slate-200 rounded text-xs bg-white outline-none">
                                        {[0,20,25,30,40,50,60,70,80,90,100,110].map(n => <option key={n} value={n}>{n}符〜</option>)}
                                      </select>
                                      <select value={group.maxFu} onChange={(e) => updateGroup(group.id, { maxFu: parseInt(e.target.value) })}
                                        className="flex-1 px-1.5 py-1 border border-slate-200 rounded text-xs bg-white outline-none">
                                        {[30,40,50,60,70,80,90,100,110,999].map(n => <option key={n} value={n}>{n === 999 ? "上限なし" : `〜${n}符`}</option>)}
                                      </select>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 mb-0.5 block">翻数の範囲</label>
                                    <div className="flex items-center gap-1">
                                      <select value={group.minHan} onChange={(e) => updateGroup(group.id, { minHan: parseInt(e.target.value) })}
                                        className="flex-1 px-1.5 py-1 border border-slate-200 rounded text-xs bg-white outline-none">
                                        {[1,2,3,4].map(n => <option key={n} value={n}>{n}翻〜</option>)}
                                      </select>
                                      <select value={group.maxHan} onChange={(e) => updateGroup(group.id, { maxHan: parseInt(e.target.value) })}
                                        className="flex-1 px-1.5 py-1 border border-slate-200 rounded text-xs bg-white outline-none">
                                        {[1,2,3,4,99].map(n => <option key={n} value={n}>{n === 99 ? "上限なし" : `〜${n}翻`}</option>)}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">待ちの形</label>
                                  <div className="flex flex-wrap gap-1">
                                    {(["tanki", "nobetan", "ryanmen", "shanpon"] as const).map(wt => {
                                      const label = wt === "tanki" ? "単騎" : wt === "nobetan" ? "ノベタン" : wt === "ryanmen" ? "両面" : "シャンポン";
                                      const sel = group.scoreWaitTypes.includes(wt);
                                      return (
                                        <button key={wt}
                                          onClick={() => {
                                            const newTypes = sel ? group.scoreWaitTypes.filter(t => t !== wt) : [...group.scoreWaitTypes, wt];
                                            if (newTypes.length > 0) updateGroup(group.id, { scoreWaitTypes: newTypes });
                                          }}
                                          className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                                            sel ? "bg-emerald-100 border-emerald-400 text-emerald-700" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                                          }`}>
                                          {label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={group.allowNaki} onChange={(e) => updateGroup(group.id, { allowNaki: e.target.checked })}
                                      className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600" />
                                    <span className="text-xs text-slate-700">鳴きを含める</span>
                                  </label>
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={group.allowAnkan} onChange={(e) => updateGroup(group.id, { allowAnkan: e.target.checked })}
                                      className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600" />
                                    <span className="text-xs text-slate-700">暗槓を含める</span>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 生成ボタン + 手動追加ボタン */}
                      <div className="flex gap-2 mb-3">
                        <button onClick={() => handleGenerate(group)}
                          disabled={generatingGroupId !== ""}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                            isWait(group)
                              ? "bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white"
                              : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                          }`}>
                          <Sparkles className="w-4 h-4" />
                          {generatingGroupId === group.id ? "生成中..." : "1問を自動生成"}
                        </button>
                        <button onClick={() => addSubQuestion(group.id)}
                          className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 小問一覧 */}
                      <div className="space-y-2">
                        {group.subQuestions.map((sub, subIndex) => (
                          <div key={sub.id} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                            <span className="text-xs font-bold text-slate-400 w-7 shrink-0">({subIndex + 1})</span>
                            
                            <div className="flex-grow flex flex-col gap-1.5 w-full">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div className="sm:col-span-2">
                                  <input type="text" value={sub.tiles}
                                    onChange={(e) => updateSubQuestion(group.id, sub.id, "tiles", e.target.value)}
                                    className="w-full px-2.5 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                                    placeholder="牌姿 (例: 123456m)" />
                                </div>
                                <div className="sm:col-span-1">
                                  <input type="text" value={sub.suffix}
                                    onChange={(e) => updateSubQuestion(group.id, sub.id, "suffix", e.target.value)}
                                    className="w-full px-2.5 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="補足 (例: 1sツモ)" />
                                </div>
                              </div>
                              <input type="text" value={sub.answer || ""}
                                onChange={(e) => updateSubQuestion(group.id, sub.id, "answer", e.target.value)}
                                className="w-full px-2.5 py-1 border border-amber-200 bg-amber-50 text-amber-800 rounded text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                                placeholder="解答（画面でのみ表示）" />
                            </div>

                            <button onClick={() => removeSubQuestion(group.id, sub.id)}
                              className="flex-shrink-0 p-1 text-slate-300 hover:text-red-500 rounded transition-colors" title="削除">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {group.subQuestions.length === 0 && (
                          <div className="text-center text-slate-400 text-xs py-4">
                            まだ小問がありません。「1問を自動生成」で追加してください。
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 大問追加ボタン */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => addGroup("wait")}
                className="py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 font-bold shadow-sm">
                <Plus className="w-5 h-5" /> 何待ち問題を追加
              </button>
              <button onClick={() => addGroup("score")}
                className="py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 font-bold shadow-sm">
                <Plus className="w-5 h-5" /> 点数計算問題を追加
              </button>
            </div>
          </div>

          {/* 印刷・プレビュー領域 */}
          <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0 text-black">
            <h2 className="text-2xl font-bold text-center mb-10 print:mb-8 print:text-xl text-slate-800 print:text-black">麻雀問題用紙</h2>
            
            <div className="space-y-8 print:space-y-6">
              {groups.filter(g => g.subQuestions.length > 0).map((group, groupIndex) => (
                <div key={group.id} className="break-inside-avoid">
                  <h3 className="text-lg print:text-base font-bold text-slate-900 mb-3 print:mb-2 whitespace-pre-wrap">
                    問題{groupIndex + 1}　{group.title}
                  </h3>
                  
                  <div className="pl-4 print:pl-6 space-y-3 print:space-y-2">
                    {group.subQuestions.map((sub, subIndex) => (
                      <div key={sub.id} className="flex items-center">
                        <span className="font-bold text-slate-800 print:text-black text-base print:text-sm w-10 shrink-0">
                          （{subIndex + 1}）
                        </span>
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                          <div className="text-5xl print:text-4xl font-mahjong-color text-slate-800 print:text-black leading-none py-1">
                            {sub.tiles ? expandTiles(sub.tiles) : <span className="text-sm text-slate-300 font-sans print:hidden">(未入力)</span>}
                          </div>
                          {sub.suffix && (
                            <span className="text-xl print:text-lg font-bold text-slate-700 print:text-black ml-3 whitespace-nowrap">
                              <FormattedText text={sub.suffix} />
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {groups.filter(g => g.subQuestions.length > 0).length === 0 && (
              <div className="text-center text-slate-400 py-12 print:hidden">
                問題がありません。上のボタンから大問を追加して、問題を生成してください。
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
