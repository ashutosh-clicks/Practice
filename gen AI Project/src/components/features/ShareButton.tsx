"use client";

import { useState, useEffect, useRef } from "react";
import { Share2, Loader2, Check } from "lucide-react";

interface ShareButtonProps {
  resourceId: string;
  resourceType: "material" | "flashcard" | "quiz" | "notes";
  variant?: "full" | "icon";
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
}

export function ShareButton({ resourceId, resourceType, variant = "full" }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharingTo, setSharingTo] = useState<string | null>(null);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    if (isOpen && friends.length === 0) {
      setLoading(true);
      fetch("/api/friends")
        .then(res => res.json())
        .then(data => {
          if (data.friends) setFriends(data.friends);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, friends.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = async (friendId: string) => {
    setSharingTo(friendId);
    setStatus(null);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId, resourceType, friendId }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setSharedWith(prev => [...prev, friendId]);
        setStatus({ type: "success", message: "Shared successfully!" });
      } else {
        setStatus({ type: "error", message: data.error || "Failed to share" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network error. Try again." });
      console.error("Failed to share", err);
    } finally {
      setSharingTo(null);
    }
  };

  return (
    <div style={{ position: "relative" }} ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        title={variant === "icon" ? "Share with a friend" : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: variant === "icon" ? "0" : "8px",
          padding: variant === "icon" ? "6px" : "8px 16px",
          backgroundColor: isOpen ? "var(--primary-color)" : "transparent",
          color: isOpen ? "white" : "var(--primary-color)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          fontWeight: "var(--weight-medium)",
          cursor: "pointer",
          transition: "all 0.2s"
        }}
      >
        <Share2 size={variant === "icon" ? 18 : 16} />
        {variant !== "icon" && (isOpen ? "Close" : "Share")}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: "8px",
          width: "280px",
          backgroundColor: "var(--surface-raised)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          zIndex: 50,
          padding: "var(--space-4)"
        }}>
          <h3 style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", marginBottom: "var(--space-1)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Share2 size={14} /> Send to a Friend
          </h3>
          
          {status && (
            <div style={{ 
              fontSize: "11px", 
              padding: "4px 8px", 
              borderRadius: "4px", 
              marginBottom: "var(--space-3)",
              backgroundColor: status.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(220, 38, 38, 0.1)",
              color: status.type === "success" ? "#10B981" : "#DC2626",
              border: `1px solid ${status.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(220, 38, 38, 0.2)"}`
            }}>
              {status.message}
            </div>
          )}
          
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-4)" }}>
              <Loader2 className="animate-spin text-muted" size={20} />
            </div>
          ) : friends.length === 0 ? (
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
              You don't have any friends yet to share this with. Add network connections in the Friends tab!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {friends.map(friend => {
                const isShared = sharedWith.includes(friend._id);
                const isCurrentlySharing = sharingTo === friend._id;

                return (
                  <div key={friend._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-2)", backgroundColor: "var(--surface)", borderRadius: "var(--radius-md)" }}>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{friend.name}</span>
                    <button
                      disabled={isShared || isCurrentlySharing}
                      onClick={() => handleShare(friend._id)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "var(--text-xs)",
                        borderRadius: "var(--radius-sm)",
                        border: "none",
                        backgroundColor: isShared ? "rgba(16, 185, 129, 0.1)" : "var(--primary-color)",
                        color: isShared ? "#10B981" : "white",
                        cursor: isShared || isCurrentlySharing ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      {isCurrentlySharing ? <Loader2 className="animate-spin" size={12} /> : isShared ? <Check size={12} /> : "Send"}
                      {isShared && "Shared"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
