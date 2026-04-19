"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MaterialOption {
  _id: string;
  title: string;
}

interface TutorChatProps {
  materials: MaterialOption[];
  initialSessionId?: string;
  initialMaterialId?: string;
  initialMessages?: Message[];
}

export function TutorChat({ materials, initialSessionId, initialMaterialId, initialMessages = [] }: TutorChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string>(initialMaterialId || "all");
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage }
    ];
    
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          materialId: selectedMaterial,
          sessionId: sessionId
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to get response");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply }
      ]);
      
      // If this was the first message, the API just created a real session in MongoDB.
      // Update our state and the URL so a refresh correctly loads the historical chat.
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
        router.replace(`/tutor/${data.sessionId}`);
      }
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `**Error:** ${error.message || "Failed to communicate with tutor. Please try again."}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 200px)", // Appropriate height to fit within the viewport layout
      backgroundColor: "var(--surface-raised)",
      border: "1px solid var(--border-color)",
      borderRadius: "var(--radius-xl)",
      overflow: "hidden",
      boxShadow: "var(--shadow-sm)"
    }}>
      
      {/* Header / Material Selector */}
      <div style={{
        padding: "var(--space-4) var(--space-6)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "var(--surface)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div style={{ padding: "var(--space-2)", backgroundColor: "rgba(14, 165, 233, 0.1)", color: "var(--primary-color)", borderRadius: "var(--radius-md)" }}>
            <Bot size={20} />
          </div>
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", margin: 0 }}>AI Tutor Live Session</h2>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <BookOpen size={16} className="text-muted" />
          <select 
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            style={{
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-color)",
              color: "var(--text-primary)",
              fontSize: "var(--text-sm)",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="all">All Documents</option>
            {materials.map(m => (
              <option key={m._id} value={m._id}>{m.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)"
      }}>
        {messages.length === 0 ? (
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center",
            height: "100%",
            color: "var(--text-muted)",
            textAlign: "center"
          }}>
            <Bot size={48} style={{ opacity: 0.2, marginBottom: "var(--space-4)" }} />
            <h3 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-medium)", color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>How can I help you study?</h3>
            <p style={{ maxWidth: "400px" }}>Select a specific document or ask a general question across all your uploaded materials.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              gap: "var(--space-4)",
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              flexDirection: msg.role === "user" ? "row-reverse" : "row"
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-full)",
                backgroundColor: msg.role === "user" ? "var(--primary-color)" : "var(--surface)",
                color: msg.role === "user" ? "white" : "var(--text-primary)",
                border: msg.role === "assistant" ? "1px solid var(--border-color)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
              </div>
              
              <div style={{
                backgroundColor: msg.role === "user" ? "var(--primary-color)" : "var(--surface)",
                color: msg.role === "user" ? "white" : "var(--text-primary)",
                padding: "var(--space-3) var(--space-5)",
                borderRadius: "var(--radius-lg)",
                borderTopRightRadius: msg.role === "user" ? 0 : "var(--radius-lg)",
                borderTopLeftRadius: msg.role === "assistant" ? 0 : "var(--radius-lg)",
                border: msg.role === "assistant" ? "1px solid var(--border-color)" : "none",
                fontSize: "var(--text-base)",
                lineHeight: "var(--leading-relaxed)",
                overflowWrap: "break-word"
              }}>
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div style={{
            display: "flex",
            gap: "var(--space-4)",
            alignSelf: "flex-start",
            maxWidth: "80%"
          }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <Bot size={18} />
            </div>
            <div style={{
              backgroundColor: "var(--surface)",
              padding: "var(--space-4) var(--space-5)",
              borderRadius: "var(--radius-lg)",
              borderTopLeftRadius: 0,
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <span className="dot-typing"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: "var(--space-4)",
        borderTop: "1px solid var(--border-color)",
        backgroundColor: "var(--surface)"
      }}>
        <form 
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "var(--space-3)",
            position: "relative"
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your materials..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-color)",
              color: "var(--text-primary)",
              fontSize: "var(--text-base)",
              outline: "none",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--primary-color)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-full)",
              backgroundColor: input.trim() && !isLoading ? "var(--primary-color)" : "var(--surface-raised)",
              color: input.trim() && !isLoading ? "white" : "var(--text-disabled)",
              border: input.trim() && !isLoading ? "none" : "1px solid var(--border-color)",
              cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              transition: "all 0.2s"
            }}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} style={{ marginLeft: "2px" }} />}
          </button>
        </form>
      </div>
    </div>
  );
}
