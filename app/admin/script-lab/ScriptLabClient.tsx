'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { LabQuestionnaire } from '@/lib/ai/script-lab-chat';
import type { MeditationPlan } from '@/lib/ai/plan-generator';
import type { MappedQuestionnaireData } from '@/lib/questionnaire/response-mapper';

// ─── Types ─────────────────────────────────────────────────────────────────

interface CurrentScript {
  text: string;
  wordCount: number;
  durationSeconds: number;
  meditationId: string;
}

interface LabSession {
  id: string;
  meditationId: string;
  scriptPreview: string;
  wordCount: number;
  audioUrl: string | null;
  starred: boolean;
  personaName: string;
  archetype: string;
  hasCustomPrompt: boolean;
  scriptMethod: string | null;
  createdAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

// ─── Tag parsing ────────────────────────────────────────────────────────────

interface ParsedBlock {
  type: 'text' | 'script' | 'approach' | 'prompt' | 'questionnaire';
  content: string;
}

function parseMessageContent(content: string): ParsedBlock[] {
  const tagPattern = /(\[SCRIPT\][\s\S]*?\[\/SCRIPT\]|\[APPROACH\][\s\S]*?\[\/APPROACH\]|\[PROMPT\][\s\S]*?\[\/PROMPT\]|\[QUESTIONNAIRE\][\s\S]*?\[\/QUESTIONNAIRE\])/g;
  const parts = content.split(tagPattern);
  return parts
    .filter((p) => p.length > 0)
    .map((part) => {
      const scriptMatch = part.match(/^\[SCRIPT\]([\s\S]*?)\[\/SCRIPT\]$/);
      if (scriptMatch) return { type: 'script' as const, content: scriptMatch[1].trim() };
      const approachMatch = part.match(/^\[APPROACH\]([\s\S]*?)\[\/APPROACH\]$/);
      if (approachMatch) return { type: 'approach' as const, content: approachMatch[1].trim() };
      const promptMatch = part.match(/^\[PROMPT\]([\s\S]*?)\[\/PROMPT\]$/);
      if (promptMatch) return { type: 'prompt' as const, content: promptMatch[1].trim() };
      const questionnaireMatch = part.match(/^\[QUESTIONNAIRE\]([\s\S]*?)\[\/QUESTIONNAIRE\]$/);
      if (questionnaireMatch) return { type: 'questionnaire' as const, content: questionnaireMatch[1].trim() };
      return { type: 'text' as const, content: part };
    });
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ScriptBlock({
  scriptText, isStreaming, onUseScript,
}: { scriptText: string; isStreaming: boolean; onUseScript: (t: string) => void }) {
  return (
    <div className="my-2 rounded-lg border border-neutral-600 bg-neutral-900 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Script Variant</span>
        <button
          onClick={() => onUseScript(scriptText)}
          disabled={isStreaming}
          className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
        >
          Use this version
        </button>
      </div>
      <pre className="whitespace-pre-wrap text-sm text-neutral-200 font-sans leading-relaxed">{scriptText}</pre>
    </div>
  );
}

function ApproachBlock({
  approachText, isStreaming, onApply,
}: { approachText: string; isStreaming: boolean; onApply: (t: string) => void }) {
  return (
    <div className="my-2 rounded-lg border border-amber-600/50 bg-amber-950/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Approach Override</span>
        <button
          onClick={() => onApply(approachText)}
          disabled={isStreaming}
          className="rounded bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-40 transition-colors"
        >
          Apply approach
        </button>
      </div>
      <p className="text-sm text-amber-100 leading-relaxed">{approachText}</p>
    </div>
  );
}

function PromptBlock({
  promptText, isStreaming, onApply,
}: { promptText: string; isStreaming: boolean; onApply: (t: string) => void }) {
  return (
    <div className="my-2 rounded-lg border border-purple-600/50 bg-purple-950/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Full Prompt Swap</span>
        <button
          onClick={() => onApply(promptText)}
          disabled={isStreaming}
          className="rounded bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-40 transition-colors"
        >
          Use this prompt
        </button>
      </div>
      <pre className="whitespace-pre-wrap text-xs text-purple-200 leading-relaxed max-h-40 overflow-y-auto">{promptText}</pre>
    </div>
  );
}

function QuestionnaireBlock({
  content, isStreaming, onUse,
}: { content: string; isStreaming: boolean; onUse: (q: LabQuestionnaire) => void }) {
  let parsed: LabQuestionnaire | null = null;
  let parseError = false;
  try {
    parsed = JSON.parse(content);
    if (!parsed?.persona?.name || !parsed?.questions?.length) throw new Error('bad shape');
    parsed = { ...parsed, generatedAt: parsed.generatedAt || new Date().toISOString() };
  } catch {
    parseError = true;
  }

  if (parseError || !parsed) {
    return (
      <div className="my-2 rounded-lg border border-neutral-600 bg-neutral-900 p-4">
        <span className="text-xs text-red-400">Questionnaire JSON parse error</span>
        <pre className="text-xs text-neutral-500 mt-1 max-h-24 overflow-y-auto">{content.substring(0, 200)}</pre>
      </div>
    );
  }

  const q = parsed;
  return (
    <div className="my-2 rounded-lg border border-sky-600/50 bg-sky-950/20 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">New Questionnaire</span>
          <p className="text-sm text-white mt-0.5">{q.persona.name} <span className="text-neutral-400">· {q.persona.archetype}</span></p>
        </div>
        <button
          onClick={() => onUse(q)}
          disabled={isStreaming}
          className="rounded bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-40 transition-colors"
        >
          Use this questionnaire
        </button>
      </div>
      <p className="text-xs text-sky-200/70 mb-2">{q.persona.background}</p>
      <div className="space-y-1">
        {q.questions.slice(0, 3).map((item) => (
          <p key={item.id} className="text-xs text-neutral-400 truncate">
            <span className="text-sky-400/60">{item.category}:</span> {item.question}
          </p>
        ))}
        {q.questions.length > 3 && (
          <p className="text-xs text-neutral-600">+{q.questions.length - 3} more questions</p>
        )}
      </div>
    </div>
  );
}

function ChatMessageBubble({
  message, isStreaming, streamingContent, onUseScript, onApplyApproach, onApplyPrompt, onUseQuestionnaire,
}: {
  message: ChatMessage;
  isStreaming: boolean;
  streamingContent: string;
  onUseScript: (t: string) => void;
  onApplyApproach: (t: string) => void;
  onApplyPrompt: (t: string) => void;
  onUseQuestionnaire: (q: LabQuestionnaire) => void;
}) {
  const displayContent = message.isStreaming ? streamingContent : message.content;

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-neutral-700 px-4 py-3">
          <p className="text-sm text-white whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  const blocks = parseMessageContent(displayContent);
  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] space-y-1">
        {blocks.map((block, i) => {
          if (block.type === 'script') return <ScriptBlock key={i} scriptText={block.content} isStreaming={isStreaming && !!message.isStreaming} onUseScript={onUseScript} />;
          if (block.type === 'approach') return <ApproachBlock key={i} approachText={block.content} isStreaming={isStreaming && !!message.isStreaming} onApply={onApplyApproach} />;
          if (block.type === 'prompt') return <PromptBlock key={i} promptText={block.content} isStreaming={isStreaming && !!message.isStreaming} onApply={onApplyPrompt} />;
          if (block.type === 'questionnaire') return <QuestionnaireBlock key={i} content={block.content} isStreaming={isStreaming && !!message.isStreaming} onUse={onUseQuestionnaire} />;
          return (
            <div key={i} className="rounded-2xl rounded-tl-sm bg-neutral-800 px-4 py-3">
              <p className="text-sm text-neutral-100 whitespace-pre-wrap leading-relaxed">{block.content}</p>
            </div>
          );
        })}
        {message.isStreaming && <span className="inline-block h-4 w-2 animate-pulse bg-neutral-400 rounded-sm ml-1" />}
      </div>
    </div>
  );
}

// ─── Questionnaire Display ───────────────────────────────────────────────────

function QuestionnaireCard({
  questionnaire,
  onNewQuestionnaire,
  isGeneratingQ,
}: {
  questionnaire: LabQuestionnaire;
  onNewQuestionnaire: () => void;
  isGeneratingQ: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-3">
      {/* Persona header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold text-white">{questionnaire.persona.name}</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {questionnaire.persona.archetype} · {questionnaire.sessionLength === 'ultra_quick' ? '~2 min' : '~4 min'}
          </p>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{questionnaire.persona.background}</p>
        </div>
        <button
          onClick={onNewQuestionnaire}
          disabled={isGeneratingQ}
          className="shrink-0 ml-3 rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700 disabled:opacity-50 transition-colors"
        >
          {isGeneratingQ ? '…' : 'New ↺'}
        </button>
      </div>

      {/* Q&A list */}
      <div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          {expanded ? '▲ Hide Q&A' : `▼ View ${questionnaire.questions.length} questions`}
        </button>
        {expanded && (
          <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-1">
            {questionnaire.questions.map((q) => (
              <div key={q.id} className="rounded-lg bg-neutral-800/60 px-3 py-2">
                <p className="text-xs text-neutral-400 mb-0.5">
                  <span className="text-neutral-600 uppercase tracking-wide text-[10px]">{q.category}</span>
                </p>
                <p className="text-xs text-neutral-300 mb-1">{q.question}</p>
                <p className="text-xs text-white leading-relaxed">"{q.answer}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Plan Preview ────────────────────────────────────────────────────────────

function PlanPreview({ plan, mapped }: { plan: MeditationPlan; mapped: MappedQuestionnaireData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        {expanded ? '▲ Hide generation plan' : '▼ View generation plan'}
      </button>

      {expanded && (
        <div className="mt-2 space-y-3 rounded-lg border border-neutral-700 bg-neutral-800/50 p-3">
          {/* Audience + approach */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Messaging Framework</p>
            <p className="text-xs text-white">
              {plan.messagingFramework.audienceType}
              <span className="text-neutral-500"> · {plan.messagingFramework.keyValues.join(', ')}</span>
            </p>
            <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{plan.messagingFramework.approachDescription}</p>
          </div>

          {/* Session structure */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
              Session Structure · {plan.sessionStructure.totalMinutes} min
            </p>
            <div className="flex gap-2 flex-wrap">
              {plan.sessionStructure.phases.map((phase, i) => (
                <span key={i} className="text-xs bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded">
                  {phase.name} ({phase.durationMinutes}m)
                </span>
              ))}
            </div>
          </div>

          {/* Technique components */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Technique Stack</p>
            <div className="space-y-1.5">
              {plan.components.map((c, i) => (
                <div key={i} className="rounded bg-neutral-700/50 px-2 py-1.5">
                  <p className="text-xs font-medium text-emerald-400">{c.componentName}</p>
                  <p className="text-xs text-neutral-400 leading-relaxed mt-0.5">{c.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key context fed to the generator */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Context fed to generator</p>
            <div className="space-y-0.5">
              {mapped.innerCritic && (
                <p className="text-xs text-neutral-400"><span className="text-neutral-600">Inner critic:</span> {mapped.innerCritic.substring(0, 100)}</p>
              )}
              {mapped.pastSuccess && (
                <p className="text-xs text-neutral-400"><span className="text-neutral-600">Past success:</span> {mapped.pastSuccess.substring(0, 100)}</p>
              )}
              {mapped.identityStatement && (
                <p className="text-xs text-neutral-400"><span className="text-neutral-600">Identity:</span> {mapped.identityStatement.substring(0, 100)}</p>
              )}
              {mapped.stakes && (
                <p className="text-xs text-neutral-400"><span className="text-neutral-600">Stakes:</span> {mapped.stakes.substring(0, 100)}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Client Component ──────────────────────────────────────────────────

export default function ScriptLabClient({ userId }: { userId: string }) {
  // Chat session logging
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  // Questionnaire state
  const [questionnaire, setQuestionnaire] = useState<LabQuestionnaire | null>(null);
  const [isGeneratingQ, setIsGeneratingQ] = useState(false);
  const [qError, setQError] = useState<string | null>(null);
  const [previousPersonas, setPreviousPersonas] = useState<string[]>([]);

  // Plan preview
  const [planPreview, setPlanPreview] = useState<{ plan: MeditationPlan; mapped: MappedQuestionnaireData } | null>(null);

  // Script method controls
  const [voiceType, setVoiceType] = useState('default');
  const [scriptMethod, setScriptMethod] = useState<string | null>(null);      // [APPROACH]
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string | null>(null); // [PROMPT]
  const [methodPulse, setMethodPulse] = useState(false);

  // Current script
  const [currentScript, setCurrentScript] = useState<CurrentScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Audio
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Text selection
  const [selectedText, setSelectedText] = useState('');
  const [selectionPos, setSelectionPos] = useState<{ x: number; y: number } | null>(null);
  const scriptDivRef = useRef<HTMLDivElement>(null);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [pendingQuote, setPendingQuote] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Session history
  const [sessions, setSessions] = useState<LabSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Auto-generate questionnaire on mount
  useEffect(() => {
    handleGenerateQuestionnaire();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear selection when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-floating-btn]') && !t.closest('[data-script-div]')) {
        setSelectionPos(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch plan preview when questionnaire or scriptMethod changes
  useEffect(() => {
    if (!questionnaire) return;
    setPlanPreview(null);
    fetch('/api/admin/script-lab/preview-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labQuestionnaire: questionnaire, scriptMethod: scriptMethod || undefined }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.plan && d.mapped) setPlanPreview({ plan: d.plan, mapped: d.mapped }); })
      .catch(() => {});
  }, [questionnaire, scriptMethod]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingContent]);

  // ─── Generate questionnaire ─────────────────────────────────────────────

  const handleGenerateQuestionnaire = async (seed?: string) => {
    setIsGeneratingQ(true);
    setQError(null);
    try {
      const res = await fetch('/api/admin/script-lab/generate-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed, previousPersonas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Failed to generate questionnaire');

      const q: LabQuestionnaire = data.questionnaire;
      setQuestionnaire(q);
      setPreviousPersonas((prev) => [...prev, `${q.persona.name} (${q.persona.archetype})`].slice(-8));
    } catch (err) {
      setQError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGeneratingQ(false);
    }
  };

  // ─── Generate script ──────────────────────────────────────────────────────

  const handleGenerate = async (overrideQ?: LabQuestionnaire) => {
    const q = overrideQ || questionnaire;
    if (!q) return;
    setIsGenerating(true);
    setGenerateError(null);
    setAudioUrl(null);

    try {
      const res = await fetch('/api/admin/script-lab/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labQuestionnaire: q,
          voiceType,
          scriptMethod: scriptMethod || undefined,
          customSystemPrompt: customSystemPrompt || undefined,
          userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Generation failed');

      const newScript: CurrentScript = {
        text: data.scriptText,
        wordCount: data.wordCount,
        durationSeconds: data.durationSeconds,
        meditationId: data.meditationId,
      };
      setCurrentScript(newScript);
      setActiveSessionId(data.meditationId);

      const session: LabSession = {
        id: data.meditationId,
        meditationId: data.meditationId,
        scriptPreview: data.scriptText.substring(0, 80) + '…',
        wordCount: data.wordCount,
        audioUrl: null,
        starred: false,
        personaName: q.persona.name,
        archetype: q.persona.archetype,
        hasCustomPrompt: !!customSystemPrompt,
        scriptMethod: scriptMethod || null,
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => [session, ...prev]);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Use script from [SCRIPT] block ──────────────────────────────────────

  const handleUseScript = async (scriptText: string) => {
    if (!questionnaire) return;
    setIsGenerating(true);
    setGenerateError(null);
    setAudioUrl(null);

    try {
      const res = await fetch('/api/admin/script-lab/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labQuestionnaire: questionnaire,
          voiceType,
          scriptMethod: `DIRECT_SCRIPT: ${scriptText}`,
          userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save script variant');

      setCurrentScript({
        text: scriptText,
        wordCount: data.wordCount,
        durationSeconds: data.durationSeconds,
        meditationId: data.meditationId,
      });
      setActiveSessionId(data.meditationId);

      const session: LabSession = {
        id: data.meditationId,
        meditationId: data.meditationId,
        scriptPreview: scriptText.substring(0, 80) + '…',
        wordCount: data.wordCount,
        audioUrl: null,
        starred: false,
        personaName: questionnaire.persona.name,
        archetype: questionnaire.persona.archetype,
        hasCustomPrompt: false,
        scriptMethod: 'chat-variant',
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => [session, ...prev]);
      // Update chat log to link to the new meditation
      if (chatMessages.length > 0) {
        await saveChat(chatMessages, data.meditationId);
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Apply approach / prompt from chat ───────────────────────────────────

  const handleApplyApproach = (text: string) => {
    setScriptMethod(text);
    setCustomSystemPrompt(null);
    triggerMethodPulse();
  };

  const handleApplyPrompt = (text: string) => {
    setCustomSystemPrompt(text);
    setScriptMethod(null);
    triggerMethodPulse();
  };

  const triggerMethodPulse = () => {
    setMethodPulse(true);
    setTimeout(() => setMethodPulse(false), 1200);
  };

  // ─── Use questionnaire from [QUESTIONNAIRE] block ────────────────────────

  const handleUseQuestionnaire = (q: LabQuestionnaire) => {
    setQuestionnaire(q);
    setPreviousPersonas((prev) => [...prev, `${q.persona.name} (${q.persona.archetype})`].slice(-8));
  };

  // ─── Text selection ───────────────────────────────────────────────────────

  const handleScriptMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';
    if (text.length >= 20) {
      const range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setSelectionPos({ x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 8 });
    } else {
      setSelectionPos(null);
    }
  }, []);

  const handleChatAboutSelection = () => {
    setPendingQuote(selectedText);
    setSelectionPos(null);
    window.getSelection()?.removeAllRanges();
    setTimeout(() => chatInputRef.current?.focus(), 50);
  };

  // ─── Generate audio ───────────────────────────────────────────────────────

  const handleGenerateAudio = async () => {
    if (!currentScript) return;
    setIsGeneratingAudio(true);
    setAudioError(null);
    try {
      const res = await fetch('/api/admin/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: currentScript.meditationId, voiceType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audio generation failed');
      setAudioUrl(data.audioUrl);
      setSessions((prev) =>
        prev.map((s) => s.meditationId === currentScript.meditationId ? { ...s, audioUrl: data.audioUrl } : s)
      );
    } catch (err) {
      setAudioError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // ─── Star session ─────────────────────────────────────────────────────────

  const handleToggleStar = async (meditationId: string) => {
    const session = sessions.find((s) => s.meditationId === meditationId);
    if (!session) return;
    const newStarred = !session.starred;
    setSessions((prev) => prev.map((s) => s.meditationId === meditationId ? { ...s, starred: newStarred } : s));
    try {
      await fetch('/api/admin/script-lab/star', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meditationId, starred: newStarred }),
      });
    } catch {
      setSessions((prev) => prev.map((s) => s.meditationId === meditationId ? { ...s, starred: !newStarred } : s));
    }
  };

  // ─── Chat logging ─────────────────────────────────────────────────────────

  const saveChat = async (messages: ChatMessage[], meditationId: string | null) => {
    try {
      const res = await fetch('/api/admin/script-lab/save-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: chatSessionId,
          userId,
          messages: messages.map(({ role, content }) => ({
            role,
            content,
            timestamp: new Date().toISOString(),
          })),
          meditationId,
          questionnaire,
          sessionLength: questionnaire?.sessionLength,
          scriptMethod,
          customPromptUsed: !!customSystemPrompt,
        }),
      });
      const data = await res.json();
      if (data.sessionId && !chatSessionId) {
        setChatSessionId(data.sessionId);
      }
    } catch {
      // Non-blocking — logging failure should never interrupt the user
    }
  };

  // ─── Chat ─────────────────────────────────────────────────────────────────

  const handleSendChat = async () => {
    const rawInput = chatInput.trim();
    if (!rawInput && !pendingQuote) return;
    if (isStreaming) return;

    const content = pendingQuote
      ? `Regarding this section:\n\n"${pendingQuote}"\n\n${rawInput}`
      : rawInput;

    const userMessage: ChatMessage = { role: 'user', content };
    const updated = [...chatMessages, userMessage];
    setChatMessages(updated);
    setChatInput('');
    setPendingQuote(null);
    setIsStreaming(true);
    setStreamingContent('');
    setChatMessages([...updated, { role: 'assistant', content: '', isStreaming: true }]);

    try {
      const res = await fetch('/api/admin/script-lab/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(({ role, content }) => ({ role, content })),
          currentScript: currentScript?.text || '',
          questionnaire,
          sessionLength: questionnaire?.sessionLength || 'ultra_quick',
        }),
      });
      if (!res.ok) throw new Error('Chat request failed');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;
          try {
            const event = JSON.parse(jsonStr);
            if (event.type === 'text') {
              accumulated += event.delta;
              setStreamingContent(accumulated);
            }
          } catch { /* ignore */ }
        }
      }

      const finalMessages = [...updated, { role: 'assistant' as const, content: accumulated }];
      setChatMessages((prev) => [...prev.slice(0, -1), { role: 'assistant', content: accumulated }]);
      await saveChat(finalMessages, currentScript?.meditationId ?? null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setChatMessages((prev) => [...prev.slice(0, -1), { role: 'assistant', content: `Error: ${msg}` }]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  // ─── Derived values ───────────────────────────────────────────────────────

  const durationMin = currentScript ? Math.floor(currentScript.durationSeconds / 60) : 0;
  const durationSec = currentScript ? currentScript.durationSeconds % 60 : 0;
  const activeMethod = customSystemPrompt ? 'Full prompt swap' : scriptMethod ? 'Approach override' : null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-white">
      {/* Nav */}
      <nav className="border-b border-neutral-800 bg-neutral-900 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm transition-colors">← Admin</Link>
          <span className="text-neutral-600">/</span>
          <h1 className="text-sm font-semibold text-white">Script Lab</h1>
        </div>
        <span className="text-xs text-neutral-500">High-velocity script iteration</span>
      </nav>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL (55%) ── */}
        <div className="flex w-[55%] flex-col border-r border-neutral-800 overflow-hidden">

          {/* Questionnaire Card */}
          <div className="border-b border-neutral-800 bg-neutral-900 p-5">
            {isGeneratingQ && !questionnaire ? (
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <span className="animate-pulse text-primary">●</span>
                Generating test persona…
              </div>
            ) : qError ? (
              <div className="space-y-2">
                <p className="text-xs text-red-400">{qError}</p>
                <button onClick={() => handleGenerateQuestionnaire()} className="text-xs text-primary hover:underline">Retry</button>
              </div>
            ) : questionnaire ? (
              <>
                <QuestionnaireCard
                  questionnaire={questionnaire}
                  onNewQuestionnaire={() => handleGenerateQuestionnaire()}
                  isGeneratingQ={isGeneratingQ}
                />
                {planPreview && <PlanPreview plan={planPreview.plan} mapped={planPreview.mapped} />}
              </>
            ) : null}

            {/* Script method indicator */}
            {activeMethod && (
              <div className={`mt-4 rounded-lg border px-3 py-2 transition-all duration-300 ${
                methodPulse
                  ? customSystemPrompt
                    ? 'border-purple-400 bg-purple-950/30 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'border-amber-400 bg-amber-950/20 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                  : customSystemPrompt
                    ? 'border-purple-600/40 bg-purple-950/20'
                    : 'border-amber-600/40 bg-amber-950/15'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${customSystemPrompt ? 'text-purple-400' : 'text-amber-400'}`}>
                      {activeMethod}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5 truncate">
                      {(customSystemPrompt || scriptMethod || '').substring(0, 80)}…
                    </p>
                  </div>
                  <button
                    onClick={() => { setScriptMethod(null); setCustomSystemPrompt(null); }}
                    className="text-xs text-neutral-500 hover:text-neutral-300 shrink-0"
                  >
                    ✕ Clear
                  </button>
                </div>
              </div>
            )}

            {/* Voice + Generate */}
            <div className="mt-4 flex items-center gap-3">
              <select
                value={voiceType}
                onChange={(e) => setVoiceType(e.target.value)}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              >
                <option value="default">Coach</option>
                <option value="sarge">Sarge</option>
                <option value="professional">Adam</option>
                <option value="calm">Sarah</option>
                <option value="energizing">Antoni</option>
              </select>
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating || !questionnaire}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                {isGenerating ? 'Generating…' : 'Generate Script'}
              </button>
            </div>
            {generateError && <p className="mt-2 text-xs text-red-400">{generateError}</p>}
          </div>

          {/* Script Display */}
          {currentScript ? (
            <div className="flex-1 overflow-y-auto min-h-0 p-5 relative">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">{currentScript.wordCount} words</span>
                  <span className="text-neutral-700">·</span>
                  <span className="text-xs text-neutral-500">
                    {durationMin}:{String(durationSec).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xs text-neutral-600">Select text to chat</span>
              </div>
              <div
                ref={scriptDivRef}
                data-script-div
                onMouseUp={handleScriptMouseUp}
                className="select-text whitespace-pre-wrap text-sm leading-relaxed text-neutral-100 cursor-text"
              >
                {currentScript.text}
              </div>

              {/* Floating chat button */}
              {selectionPos && (
                <button
                  data-floating-btn
                  onClick={handleChatAboutSelection}
                  style={{ position: 'fixed', top: selectionPos.y - 36, left: selectionPos.x, transform: 'translateX(-50%)' }}
                  className="z-50 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-neutral-950 shadow-lg hover:bg-primary/90 whitespace-nowrap"
                >
                  Chat about this →
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex items-center justify-center text-neutral-600 text-sm p-8 text-center">
              {isGenerating ? (
                <div className="space-y-2">
                  <div className="animate-pulse text-primary text-base font-medium">Generating script…</div>
                  <p className="text-xs text-neutral-600">10–15 seconds</p>
                </div>
              ) : (
                <p>Generate a questionnaire and click Generate Script</p>
              )}
            </div>
          )}

          {/* Audio */}
          {currentScript && (
            <div className="border-t border-neutral-800 p-5 space-y-3">
              {!audioUrl ? (
                <button
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                  {isGeneratingAudio ? 'Generating audio…' : 'Generate Audio'}
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-400">Audio ready</p>
                  <audio controls src={audioUrl} className="w-full h-8" />
                </div>
              )}
              {audioError && <p className="text-xs text-red-400">{audioError}</p>}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL (45%) ── */}
        <div className="flex w-[45%] flex-col overflow-hidden">

          {/* Chat */}
          <div className="flex flex-1 flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-500">AI Consultant — Opus 4.6</p>
                    <p className="text-xs text-neutral-600 max-w-xs leading-relaxed">
                      Generate a script, then chat about it. The AI can propose script variants, approach overrides, full prompt swaps, and new questionnaires.
                    </p>
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <ChatMessageBubble
                  key={i}
                  message={msg}
                  isStreaming={isStreaming}
                  streamingContent={streamingContent}
                  onUseScript={handleUseScript}
                  onApplyApproach={handleApplyApproach}
                  onApplyPrompt={handleApplyPrompt}
                  onUseQuestionnaire={handleUseQuestionnaire}
                />
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Pending quote */}
            {pendingQuote && (
              <div className="mx-4 mb-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-primary/80 italic line-clamp-2">"{pendingQuote}"</p>
                  <button onClick={() => setPendingQuote(null)} className="text-xs text-neutral-500 hover:text-neutral-300 shrink-0">✕</button>
                </div>
              </div>
            )}

            {/* Chat input */}
            <div className="border-t border-neutral-800 p-3 flex gap-2">
              <textarea
                ref={chatInputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder={pendingQuote ? 'What do you want to explore?' : 'Ask anything… or request a new questionnaire, approach, or prompt'}
                rows={2}
                disabled={isStreaming}
                className="flex-1 resize-none rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-primary focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSendChat}
                disabled={isStreaming || (!chatInput.trim() && !pendingQuote)}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-neutral-950 hover:bg-primary/90 disabled:opacity-50 transition-colors self-end"
              >
                {isStreaming ? '…' : '↑'}
              </button>
            </div>
          </div>

          {/* Session History */}
          {sessions.length > 0 && (
            <div className="border-t border-neutral-800 max-h-64 overflow-y-auto">
              <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Session History</p>
              </div>
              <div className="divide-y divide-neutral-800">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-start gap-2 px-4 py-3 cursor-default ${
                      activeSessionId === session.meditationId ? 'bg-neutral-800' : ''
                    } ${session.starred ? 'bg-yellow-500/5 border-l-2 border-l-yellow-500/50' : ''}`}
                  >
                    <button
                      onClick={() => handleToggleStar(session.meditationId)}
                      className={`mt-0.5 text-sm shrink-0 transition-colors ${session.starred ? 'text-yellow-400' : 'text-neutral-600 hover:text-yellow-400'}`}
                    >
                      {session.starred ? '★' : '☆'}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-neutral-300 truncate">{session.personaName}</span>
                        <span className="text-xs text-neutral-600">{session.archetype}</span>
                        {session.hasCustomPrompt && <span className="text-[10px] text-purple-400 bg-purple-950/40 px-1 rounded">prompt</span>}
                        {session.scriptMethod && !session.hasCustomPrompt && <span className="text-[10px] text-amber-400 bg-amber-950/40 px-1 rounded">approach</span>}
                      </div>
                      <p className="text-xs text-neutral-500 truncate">{session.scriptPreview}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-xs text-neutral-600">{session.wordCount}w</span>
                        {session.audioUrl && <span className="text-xs text-emerald-500">audio ✓</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
