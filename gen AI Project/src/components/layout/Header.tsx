"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, LogOut, User as UserIcon } from "lucide-react";
import styles from "./Header.module.css";
import { useSession } from "next-auth/react";

interface SearchResult {
  _id: string;
  title: string;
  type: "material" | "flashcard" | "quiz" | "notes";
  href: string;
}

export function Header() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const initials = session?.user?.name 
    ? session.user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data.results);
        setIsOpen(true);
      }
    } catch {
      // Silently fail on search errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(value), 300);
  };

  const handleResultClick = (href: string) => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    router.push(href);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const typeLabel: Record<string, string> = {
    material: "Material",
    flashcard: "Flashcards",
    quiz: "Quiz",
    notes: "Notes",
  };

  const typeColor: Record<string, string> = {
    material: "#0EA5E9",
    flashcard: "#10B981",
    quiz: "#8B5CF6",
    notes: "#F59E0B",
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
      </div>
      <div className={styles.right}>
        <div className={styles.searchContainer} ref={searchContainerRef}>
          <Search size={16} className={styles.searchIcon} style={{ position: "absolute", left: "12px", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input 
            type="text" 
            placeholder="Search materials, flashcards, quizzes..." 
            className={styles.searchInput} 
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          {query && (
            <button 
              onClick={clearSearch}
              style={{ position: "absolute", right: "8px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "4px" }}
            >
              <X size={14} />
            </button>
          )}

          {isOpen && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "var(--space-2)",
              backgroundColor: "var(--surface-raised)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
              zIndex: 100,
              maxHeight: "320px",
              overflowY: "auto",
            }}>
              {isLoading ? (
                <div style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <div style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                  No results found for &quot;{query}&quot;
                </div>
              ) : (
                results.map((result) => (
                  <button
                    key={`${result.type}-${result._id}`}
                    onClick={() => handleResultClick(result.href)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "var(--space-3) var(--space-4)",
                      background: "none",
                      border: "none",
                      borderBottom: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "var(--text-primary)",
                      fontSize: "var(--text-sm)",
                      transition: "background-color var(--dur-fast) var(--ease-out)",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {result.title}
                    </span>
                    <span style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: "var(--weight-medium)",
                      color: typeColor[result.type],
                      backgroundColor: `${typeColor[result.type]}15`,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      marginLeft: "var(--space-3)",
                      flexShrink: 0,
                    }}>
                      {typeLabel[result.type]}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div className={styles.userProfile} ref={profileRef} onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ position: "relative" }}>
          <div className={styles.avatar}>{initials}</div>
          
          {isProfileOpen && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "var(--space-2)",
              backgroundColor: "var(--surface-raised)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-lg)",
              width: "160px",
              zIndex: 100,
              overflow: "hidden",
            }}>
              <div style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--border-subtle)", fontSize: "var(--text-xs)", color: "var(--text-muted)", backgroundColor: "var(--surface)" }}>
                {session?.user?.email}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); router.push("/settings"); setIsProfileOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  width: "100%",
                  padding: "var(--space-3) var(--space-4)",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "var(--text-sm)",
                  color: "var(--text-primary)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <UserIcon size={16} />
                Profile
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); router.push("/api/auth/signout"); setIsProfileOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  width: "100%",
                  padding: "var(--space-3) var(--space-4)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "var(--text-sm)",
                  color: "#DC2626",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
