'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

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
  durationSeconds: number;
  audioUrl: string | null;
  starred: boolean;
  contextString: string;
  createdAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

// ─── Tag parsing ────────────────────────────────────────────────────────────

interface ParsedBlock {
  type: 'text' | 'script' | 'approach';
  content: string;
}

function parseMessageContent(content: string): ParsedBlock[] {
  const parts = content.split(/(\[SCRIPT\][\s\S]*?\[\/SCRIPT\]|\[APPROACH\][\s\S]*?\[\/APPROACH\])/g);
  return parts
    .filter((p) => p.length > 0)
    .map((part) => {
      const scriptMatch = part.match(/^\[SCRIPT\]([\s\S]*?)\[\/SCRIPT\]$/);
      if (scriptMatch) return { type: 'script' as const, content: scriptMatch[1].trim() };
      const approachMatch = part.match(/^\[APPROACH\]([\s\S]*?)\[\/APPROACH\]$/);
      if (approachMatch) return { type: 'approach' as const, content: approachMatch[1].trim() };
      return { type: 'text' as const, content: part };
    });
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ScriptBlock({
  scriptText,
  isStreaming,
  onUseScript,
}: {
  scriptText: string;
  isStreaming: boolean;
  onUseScript: (text: string) => void;
}) {
  return (
    <div className="my-2 rounded-lg border border-neutral-600 bg-neutral-900 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Script Variant</span>
        <button
          onClick={() => onUseScript(scriptText)}
          disabled={isStreaming}
          className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
        >
          Use this version
        </button>
      </div>
      <pre className="whitespace-pre-wrap text-sm text-neutral-200 font-sans leading-relaxed">{scriptText}</pre>
    </div>
  );
}

function ApproachBlock({
  approachText,
  isStreaming,
  onTryApproach,
}: {
  approachText: string;
  isStreaming: boolean;
  onTryApproach: (text: string) => void;
}) {
  return (
    <div className="my-2 rounded-lg border border-amber-600/50 bg-amber-950/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Structural Approach</span>
        <button
          onClick={() => onTryApproach(approachText)}
          disabled={isStreaming}
          className="rounded bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
        >
          Try this approach
        </button>
      </div>
      <p className="text-sm text-amber-100 leading-relaxed">{approachText}</p>
    </div>
  );
}

function ChatMessageBubble({
  message,
  isStreaming,
  streamingContent,
  onUseScript,
  onTryApproach,
}: {
  message: ChatMessage;
  isStreaming: boolean;
  streamingContent: string;
  onUseScript: (text: string) => void;
  onTryApproach: (text: string) => void;
}) {
  const displayContent = message.isStreaming ? streamingContent : message.content;
  const isUser = message.role === 'user';

  if (isUser) {
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
          if (block.type === 'script') {
            return (
              <ScriptBlock
                key={i}
                scriptText={block.content}
                isStreaming={isStreaming && message.isStreaming === true}
                onUseScript={onUseScript}
              />
            );
          }
          if (block.type === 'approach') {
            return (
              <ApproachBlock
                key={i}
                approachText={block.content}
                isStreaming={isStreaming && message.isStreaming === true}
                onTryApproach={onTryApproach}
              />
            );
          }
          return (
            <div key={i} className="rounded-2xl rounded-tl-sm bg-neutral-800 px-4 py-3">
              <p className="text-sm text-neutral-100 whitespace-pre-wrap leading-relaxed">{block.content}</p>
            </div>
          );
        })}
        {message.isStreaming && (
          <span className="inline-block h-4 w-2 animate-pulse bg-neutral-400 rounded-sm ml-1" />
        )}
      </div>
    </div>
  );
}

// ─── Main Client Component ──────────────────────────────────────────────────

export default function ScriptLabClient({ userId }: { userId: string }) {
  // Generation controls
  const [contextString, setContextString] = useState('');
  const [sessionLength, setSessionLength] = useState<'ultra_quick' | 'quick'>('ultra_quick');
  const [voiceType, setVoiceType] = useState('default');
  const [approach, setApproach] = useState('');
  const [isControlsOpen, setIsControlsOpen] = useState(true);

  // Current script
  const [currentScript, setCurrentScript] = useState<CurrentScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Audio
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Text selection (floating button)
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

  // Approach field pulse animation
  const [approachPulse, setApproachPulse] = useState(false);
  const approachRef = useRef<HTMLTextAreaElement>(null);

  // ─── Text selection handler ───────────────────────────────────────────────

  const handleScriptMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || '';
    if (text.length >= 20) {
      const range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setSelectionPos({
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY - 8,
      });
    } else {
      setSelectionPos(null);
    }
  }, []);

  // Clear selection pos when clicking elsewhere
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-floating-btn]') && !target.closest('[data-script-div]')) {
        setSelectionPos(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingContent]);

  // ─── Generate script ──────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!contextString.trim()) return;
    setIsGenerating(true);
    setGenerateError(null);
    setAudioUrl(null);

    try {
      const res = await fetch('/api/admin/script-lab/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextString, sessionLength, voiceType, approach: approach || undefined, userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      const newScript: CurrentScript = {
        text: data.scriptText,
        wordCount: data.wordCount,
        durationSeconds: data.durationSeconds,
        meditationId: data.meditationId,
      };

      setCurrentScript(newScript);
      setIsControlsOpen(false);
      setActiveSessionId(data.meditationId);

      const newSession: LabSession = {
        id: data.meditationId,
        meditationId: data.meditationId,
        scriptPreview: data.scriptText.substring(0, 80) + '...',
        wordCount: data.wordCount,
        durationSeconds: data.durationSeconds,
        audioUrl: null,
        starred: false,
        contextString,
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => [newSession, ...prev]);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Use script from chat [SCRIPT] block ─────────────────────────────────

  const handleUseScript = async (scriptText: string) => {
    if (!contextString.trim()) return;
    setIsGenerating(true);
    setGenerateError(null);
    setAudioUrl(null);

    try {
      const res = await fetch('/api/admin/script-lab/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextString, sessionLength, voiceType, approach: `USE_PROVIDED_SCRIPT: ${scriptText}`, userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save script variant');

      const newScript: CurrentScript = {
        text: scriptText,
        wordCount: data.wordCount,
        durationSeconds: data.durationSeconds,
        meditationId: data.meditationId,
      };

      setCurrentScript(newScript);
      setActiveSessionId(data.meditationId);

      const newSession: LabSession = {
        id: data.meditationId,
        meditationId: data.meditationId,
        scriptPreview: scriptText.substring(0, 80) + '...',
        wordCount: data.wordCount,
        durationSeconds: data.durationSeconds,
        audioUrl: null,
        starred: false,
        contextString,
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => [newSession, ...prev]);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Try approach from chat [APPROACH] block ──────────────────────────────

  const handleTryApproach = (approachText: string) => {
    setApproach(approachText);
    setIsControlsOpen(true);
    setApproachPulse(true);
    setTimeout(() => setApproachPulse(false), 1200);
    setTimeout(() => approachRef.current?.focus(), 100);
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
        prev.map((s) =>
          s.meditationId === currentScript.meditationId ? { ...s, audioUrl: data.audioUrl } : s
        )
      );
    } catch (err) {
      setAudioError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // ─── Star/unstar session ──────────────────────────────────────────────────

  const handleToggleStar = async (meditationId: string) => {
    const session = sessions.find((s) => s.meditationId === meditationId);
    if (!session) return;
    const newStarred = !session.starred;

    // Optimistic update
    setSessions((prev) => prev.map((s) => (s.meditationId === meditationId ? { ...s, starred: newStarred } : s)));

    try {
      await fetch('/api/admin/script-lab/star', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meditationId, starred: newStarred }),
      });
    } catch {
      // Revert on failure
      setSessions((prev) => prev.map((s) => (s.meditationId === meditationId ? { ...s, starred: !newStarred } : s)));
    }
  };

  // ─── Load session ─────────────────────────────────────────────────────────

  const handleLoadSession = (session: LabSession) => {
    setActiveSessionId(session.meditationId);
    setAudioUrl(session.audioUrl);
    // Note: we don't reload full script text from the session list preview
    // The user can see the full script in the left panel from the current active generation
  };

  // ─── Chat: floating button → pendingQuote ────────────────────────────────

  const handleChatAboutSelection = () => {
    setPendingQuote(selectedText);
    setSelectionPos(null);
    window.getSelection()?.removeAllRanges();
    setTimeout(() => chatInputRef.current?.focus(), 50);
  };

  // ─── Chat: send message ───────────────────────────────────────────────────

  const handleSendChat = async () => {
    const rawInput = chatInput.trim();
    if (!rawInput && !pendingQuote) return;
    if (isStreaming) return;

    const messageContent = pendingQuote
      ? `Regarding this section:\n\n"${pendingQuote}"\n\n${rawInput}`
      : rawInput;

    const userMessage: ChatMessage = { role: 'user', content: messageContent };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatInput('');
    setPendingQuote(null);
    setIsStreaming(true);
    setStreamingContent('');

    // Add placeholder assistant message
    const assistantPlaceholder: ChatMessage = { role: 'assistant', content: '', isStreaming: true };
    setChatMessages([...updatedMessages, assistantPlaceholder]);

    try {
      const res = await fetch('/api/admin/script-lab/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
          currentScript: currentScript?.text || '',
          contextString,
          sessionLength,
          voiceType,
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
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);
            if (event.type === 'text') {
              accumulated += event.delta;
              setStreamingContent(accumulated);
            } else if (event.type === 'done' || event.type === 'error') {
              break;
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      const finalMessage: ChatMessage = { role: 'assistant', content: accumulated };
      setChatMessages((prev) => [...prev.slice(0, -1), finalMessage]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      const errorMessage: ChatMessage = { role: 'assistant', content: `Error: ${errMsg}` };
      setChatMessages((prev) => [...prev.slice(0, -1), errorMessage]);
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

  // ─── Render ───────────────────────────────────────────────────────────────

  const wordCount = currentScript?.wordCount ?? 0;
  const durationMin = currentScript ? Math.floor(currentScript.durationSeconds / 60) : 0;
  const durationSec = currentScript ? currentScript.durationSeconds % 60 : 0;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-white">
      {/* Nav */}
      <nav className="border-b border-neutral-800 bg-neutral-900 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm transition-colors">
            ← Admin
          </Link>
          <span className="text-neutral-600">/</span>
          <h1 className="text-sm font-semibold text-white">Script Lab</h1>
        </div>
        <span className="text-xs text-neutral-500">High-velocity script iteration</span>
      </nav>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL (55%) ── */}
        <div className="flex w-[55%] flex-col border-r border-neutral-800 overflow-y-auto">
          {/* Context Card */}
          <div className="border-b border-neutral-800 bg-neutral-900">
            <button
              onClick={() => setIsControlsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-neutral-800/50 transition-colors"
            >
              <span className="text-sm font-medium text-white">
                {contextString || 'Context'}
                {!isControlsOpen && contextString && (
                  <span className="ml-2 text-xs text-neutral-500">
                    {sessionLength === 'ultra_quick' ? 'Ultra Quick' : 'Quick'} · {voiceType}
                  </span>
                )}
              </span>
              <span className="text-neutral-500 text-xs">{isControlsOpen ? '▲' : '▼'}</span>
            </button>

            {isControlsOpen && (
              <div className="px-5 pb-5 space-y-4">
                {/* Context string */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Context</label>
                  <input
                    type="text"
                    value={contextString}
                    onChange={(e) => setContextString(e.target.value)}
                    placeholder="entrepreneur, pitching in 10 min, scared"
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Duration + Voice */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Duration</label>
                    <select
                      value={sessionLength}
                      onChange={(e) => setSessionLength(e.target.value as 'ultra_quick' | 'quick')}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    >
                      <option value="ultra_quick">Ultra Quick (~2 min)</option>
                      <option value="quick">Quick (~4 min)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Voice</label>
                    <select
                      value={voiceType}
                      onChange={(e) => setVoiceType(e.target.value)}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    >
                      <option value="default">Coach (default)</option>
                      <option value="sarge">Sarge (intense)</option>
                      <option value="professional">Adam (professional)</option>
                      <option value="calm">Sarah (calm)</option>
                      <option value="energizing">Antoni (energizing)</option>
                    </select>
                  </div>
                </div>

                {/* Approach override */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Approach Override <span className="text-neutral-600">(optional)</span>
                  </label>
                  <textarea
                    ref={approachRef}
                    value={approach}
                    onChange={(e) => setApproach(e.target.value)}
                    placeholder="e.g. structure this as a film mirror scene, ignore the Self-Rally Arc"
                    rows={2}
                    className={`w-full rounded-lg border bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none transition-all duration-300 ${
                      approachPulse
                        ? 'border-amber-400 bg-amber-950/20 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                        : 'border-neutral-700 focus:border-primary'
                    }`}
                  />
                </div>

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !contextString.trim()}
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-neutral-950 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  {isGenerating ? 'Generating…' : 'Generate Script'}
                </button>

                {generateError && (
                  <p className="text-xs text-red-400">{generateError}</p>
                )}
              </div>
            )}
          </div>

          {/* Script Display */}
          {currentScript ? (
            <div className="flex-1 p-5 relative">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">{wordCount} words</span>
                  <span className="text-xs text-neutral-600">·</span>
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
                  style={{
                    position: 'fixed',
                    top: selectionPos.y - 36,
                    left: selectionPos.x,
                    transform: 'translateX(-50%)',
                  }}
                  className="z-50 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-neutral-950 shadow-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  Chat about this →
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-600 text-sm p-8 text-center">
              {isGenerating ? (
                <div className="space-y-2">
                  <div className="animate-pulse text-primary text-base font-medium">Generating script…</div>
                  <p className="text-xs text-neutral-600">This takes 10–15 seconds</p>
                </div>
              ) : (
                <p>Enter a context string above and click Generate Script</p>
              )}
            </div>
          )}

          {/* Audio Section */}
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
        <div className="flex w-[45%] flex-col">
          {/* Chat Panel */}
          <div className="flex flex-1 flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-500">AI Consultant — Opus 4.6</p>
                    <p className="text-xs text-neutral-600 max-w-xs">
                      Generate a script, then highlight any section and click "Chat about this →" to start discussing.
                      Or ask anything directly.
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
                  onTryApproach={handleTryApproach}
                />
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Pending quote box */}
            {pendingQuote && (
              <div className="mx-4 mb-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-primary/80 italic line-clamp-2">"{pendingQuote}"</p>
                  <button
                    onClick={() => setPendingQuote(null)}
                    className="text-xs text-neutral-500 hover:text-neutral-300 shrink-0"
                  >
                    ✕
                  </button>
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
                placeholder={pendingQuote ? 'What do you want to explore about this section?' : 'Ask anything…'}
                rows={2}
                disabled={isStreaming}
                className="flex-1 resize-none rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-primary focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSendChat}
                disabled={isStreaming || (!chatInput.trim() && !pendingQuote)}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-neutral-950 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 transition-colors self-end"
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
                    onClick={() => handleLoadSession(session)}
                    className={`flex items-start gap-2 px-4 py-3 cursor-pointer transition-colors ${
                      activeSessionId === session.meditationId
                        ? 'bg-neutral-800'
                        : 'hover:bg-neutral-900'
                    } ${session.starred ? 'bg-yellow-500/5 border-l-2 border-l-yellow-500/50' : ''}`}
                  >
                    {/* Star button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(session.meditationId);
                      }}
                      className={`mt-0.5 text-sm shrink-0 transition-colors ${
                        session.starred ? 'text-yellow-400' : 'text-neutral-600 hover:text-yellow-400'
                      }`}
                    >
                      {session.starred ? '★' : '☆'}
                    </button>

                    {/* Session info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-300 truncate">{session.scriptPreview}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-neutral-600">{session.wordCount}w</span>
                        {session.audioUrl && (
                          <span className="text-xs text-emerald-500">audio ✓</span>
                        )}
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
