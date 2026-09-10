import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, Sparkles, MessageCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  sender: "user" | "agent";
  text: string;
  createdAt: string;
}

interface AISupportAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AISupportAssistant({ isOpen, onClose }: AISupportAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "agent",
      text: "👋 Hello! Welcome to EarnPay Smart Support. I can help answer questions about our Offerwalls, Advertiser Tasks, Savings Vaults, standard 3-Level Referral bonuses, or safe instant Bank & USDT payouts! How can I assist you today?",
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMsg: Message = {
      sender: "user",
      text: prompt.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const currentPrompt = prompt;
    setPrompt("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentPrompt,
          history: messages.slice(-5) // Send last 5 messages as context
        })
      });

      const data = await response.json();
      
      const agentMsg: Message = {
        sender: "agent",
        text: data.reply,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: Message = {
        sender: "agent",
        text: "My apologies, I had trouble connecting to the network. Currently, you earn 50% commission on all completed surveys/installs, and your earnings are safely visible inside the Wallet tab. Let me know if I can detail anything else!",
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const PRESET_QUESTIONS = [
    "How do I complete tasks to earn ₦?",
    "What are the benefits of Diamond Tier?",
    "How does the 3-Level Referral work?",
    "What are the daily withdrawal limits?"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop screen mask */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-100 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500 rounded-lg">
                  <Bot size={22} className="text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight flex items-center gap-1.5">
                    EarnPay AI Chatbot <Sparkles size={14} className="text-yellow-350 fill-yellow-350" />
                  </h3>
                  <p className="text-[11px] text-emerald-100">Intelligent Platform Guide</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-emerald-700/50 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Banner Info */}
            <div className="px-4 py-2 bg-emerald-50 text-[11px] text-emerald-800 border-b border-emerald-100 flex items-center gap-1.5 font-medium">
              <Info size={13} className="shrink-0" />
              <span>EarnPay and Gemini AI will never request your login PIN.</span>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] flex gap-2 items-start ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {msg.sender === "agent" && (
                      <div className="p-1 bg-emerald-100 text-emerald-700 rounded-full shrink-0">
                        <Bot size={15} />
                      </div>
                    )}
                    <div>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        msg.sender === "user" 
                          ? "bg-emerald-650 text-white rounded-br-none" 
                          : "bg-white text-slate-800 rounded-bl-none border border-slate-100"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block px-1 text-right">
                        {msg.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] flex gap-2 items-start">
                    <div className="p-1 bg-emerald-100 text-emerald-700 rounded-full shrink-0">
                      <Bot size={15} />
                    </div>
                    <div className="p-3 bg-white text-slate-500 rounded-2xl rounded-bl-none border border-slate-100 text-xs flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span>EarnPay AI system reading criteria...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Sticky Prompt Helpers if chat is fresh */}
            {messages.length <= 2 && (
              <div className="p-3 bg-slate-50 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Preset Questions</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(q)}
                      className="p-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-250 text-[11px] text-slate-700 text-left rounded-lg transition-all line-clamp-1 cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Ask instructions, cashbacks, withdrawals..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 rounded-xl border border-transparent focus:border-emerald-600 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:bg-slate-150 disabled:text-slate-400 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
