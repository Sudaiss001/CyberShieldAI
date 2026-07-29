"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, MessageSquare, Plus, Search, Trash2, User,
  Shield, Lightbulb, Brain, Zap, MoreHorizontal, Copy, ThumbsUp,
  ThumbsDown, ChevronDown,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { CyberButton } from "@/components/shared/CyberButton";
import { BackButton } from "@/components/shared/BackButton";
import {
  CHAT_CONVERSATIONS, SUGGESTED_QUESTIONS, getMockChatResponse,
} from "@/lib/mock-data";
import { navigate, goBack } from "@/hooks/use-router";
import { ROUTES } from "@/lib/routes";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

const WELCOME_CARDS = [
  {
    icon: Shield,
    title: "Analyze a threat",
    desc: "Paste a suspicious email or URL — I'll tell you if it's phishing.",
    color: "#ef4444",
    prompt: "How can I identify a phishing email?",
  },
  {
    icon: Brain,
    title: "Explain a concept",
    desc: "Ask me anything about cybersecurity, threats, or defenses.",
    color: "#a855f7",
    prompt: "Explain the difference between phishing and spear phishing",
  },
  {
    icon: Lightbulb,
    title: "Get prevention tips",
    desc: "Practical, actionable advice to harden your security posture.",
    color: "#10b981",
    prompt: "What are the signs of a deepfake video?",
  },
  {
    icon: Zap,
    title: "Quick recommendations",
    desc: "Personalized security recommendations based on your activity.",
    color: "#00d4ff",
    prompt: "How do I secure my home Wi-Fi network?",
  },
];

export function AiChatPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState(CHAT_CONVERSATIONS);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: getMockChatResponse(text),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const newChat = () => {
    setMessages([]);
    setActiveConv(null);
    setSidebarOpen(false);
  };

  const copyMessage = (content: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(content);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] flex gap-4 -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      {/* Sidebar — conversation history */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 glass-strong border-r border-white/5 p-3"
          >
            <ChatSidebar
              conversations={conversations}
              activeConv={activeConv}
              onSelect={(id) => { setActiveConv(id); setSidebarOpen(false); }}
              onNew={newChat}
              onDelete={(id) => setConversations((prev) => prev.filter((c) => c.id !== id))}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex w-72 shrink-0">
        <div className="w-full glass-strong rounded-2xl border border-white/5 overflow-hidden">
          <ChatSidebar
            conversations={conversations}
            activeConv={activeConv}
            onSelect={setActiveConv}
            onNew={newChat}
            onDelete={(id) => setConversations((prev) => prev.filter((c) => c.id !== id))}
          />
        </div>
      </aside>

      {/* Main chat */}
      <div className="flex-1 min-w-0">
        <GlassCard variant="strong" className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-white/5 flex items-center gap-3">
            <BackButton fallback={ROUTES.dashboard} variant="icon" size="sm" />
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Open conversations"
            >
              <MessageSquare size={18} />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm">CyberShield AI Assistant</h2>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online • Powered by Gemma
              </p>
            </div>
            <button
              onClick={() => navigate(ROUTES.aiScanner)}
              className="text-xs text-[#00d4ff] hover:underline hidden sm:block"
            >
              Switch to scanner →
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-5">
            {messages.length === 0 ? (
              <WelcomeScreen onSelect={sendMessage} />
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} onCopy={copyMessage} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-white/5">
            {messages.length === 0 && (
              <div className="max-w-3xl mx-auto mb-3 flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-[#00d4ff] hover:border-[#00d4ff]/30 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a threat, request a scan, or get security advice..."
                className="w-full pl-4 pr-12 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm outline-none focus:border-[#00d4ff]/50 focus:bg-[#00d4ff]/5 transition-all"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0099cc] text-[#0a0e1a] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-[0_4px_12px_rgba(0,212,255,0.4)]"
              >
                <Send size={15} strokeWidth={2.4} />
              </button>
            </form>
            <p className="mt-2 text-[10px] text-center text-muted-foreground">
              ⚠️ CyberShield AI can make mistakes. Always verify critical security decisions through independent means.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function ChatSidebar({
  conversations, activeConv, onSelect, onNew, onDelete,
}: {
  conversations: typeof CHAT_CONVERSATIONS;
  activeConv: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <CyberButton fullWidth size="sm" onClick={onNew} icon={<Plus size={14} />}>
          New chat
        </CyberButton>
      </div>
      <div className="px-3 pb-2">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs outline-none focus:border-[#00d4ff]/50"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 space-y-0.5">
        <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
          Recent conversations
        </p>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={cn(
              "group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all",
              activeConv === conv.id ? "bg-[#00d4ff]/10 text-[#00d4ff]" : "hover:bg-white/5 text-muted-foreground"
            )}
            onClick={() => onSelect(conv.id)}
          >
            <MessageSquare size={13} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{conv.title}</p>
              <p className="text-[10px] truncate opacity-70">{conv.lastMessage}</p>
            </div>
            {conv.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] shrink-0" />}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conv.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 hover:text-red-400 transition-all shrink-0"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => navigate(ROUTES.profile)}
          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center text-xs font-bold text-[#0a0e1a] shrink-0">
            AM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">Alex Morgan</p>
            <p className="text-[10px] text-muted-foreground truncate">Enterprise plan</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function WelcomeScreen({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(0,212,255,0.3)]"
      >
        <Sparkles size={36} className="text-white" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl sm:text-3xl font-bold tracking-tight text-center"
      >
        How can I <span className="gradient-text">defend you</span> today?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-2 text-sm text-muted-foreground text-center max-w-md"
      >
        Ask me about phishing, deepfakes, malware, or any cybersecurity concern.
        I can analyze threats and provide actionable recommendations.
      </motion.p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {WELCOME_CARDS.map((card, i) => (
          <motion.button
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            whileHover={{ y: -2 }}
            onClick={() => onSelect(card.prompt)}
            className="text-left p-4 rounded-2xl glass glass-hover"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
              style={{ background: `${card.color}15`, border: `1px solid ${card.color}30` }}
            >
              <card.icon size={16} style={{ color: card.color }} strokeWidth={2.2} />
            </div>
            <p className="text-sm font-semibold mb-0.5">{card.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message, onCopy }: { message: ChatMessage; onCopy: (c: string) => void }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
          isUser
            ? "bg-gradient-to-br from-[#00d4ff] to-[#a855f7] text-[#0a0e1a]"
            : "bg-gradient-to-br from-[#a855f7] to-[#8b5cf6] text-white"
        )}
      >
        {isUser ? <User size={15} /> : <Sparkles size={15} />}
      </div>

      <div className={cn("flex-1 min-w-0 max-w-[85%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 inline-block",
            isUser
              ? "bg-gradient-to-br from-[#00d4ff]/15 to-[#a855f7]/10 border border-[#00d4ff]/20"
              : "glass border border-white/10"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        {!isUser && (
          <div className="flex items-center gap-1 mt-1.5 ml-1">
            <button
              onClick={() => onCopy(message.content)}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              title="Copy"
            >
              <Copy size={12} />
            </button>
            <button className="p-1 rounded text-muted-foreground hover:text-emerald-400 hover:bg-white/5 transition-colors" title="Helpful">
              <ThumbsUp size={12} />
            </button>
            <button className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-white/5 transition-colors" title="Not helpful">
              <ThumbsDown size={12} />
            </button>
            <span className="text-[10px] text-muted-foreground ml-1">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#8b5cf6] flex items-center justify-center shrink-0">
        <Sparkles size={15} className="text-white" />
      </div>
      <div className="glass border border-white/10 rounded-2xl px-4 py-3 inline-flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-[#00d4ff] typing-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </motion.div>
  );
}
