"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck, UserX, Users, Search, Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
}

interface FriendshipReq {
  _id: string;
  status: string;
  requesterId: UserProfile;
  recipientId: UserProfile;
}

export default function FriendsDashboard() {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [incoming, setIncoming] = useState<FriendshipReq[]>([]);
  const [outgoing, setOutgoing] = useState<FriendshipReq[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const fetchNetwork = async () => {
    try {
      const res = await fetch("/api/friends");
      const data = await res.json();
      if (res.ok) {
        setFriends(data.friends);
        setIncoming(data.incomingRequests);
        setOutgoing(data.outgoingRequests);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim() || isSearching) return;
    
    setIsSearching(true);
    setSearchMessage("");
    setSearchResults([]);

    try {
      const res = await fetch("/api/friends/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: searchEmail }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      if (data.results.length === 0) {
        setSearchMessage("No user found with that exact email address.");
      } else {
        setSearchResults(data.results);
      }
    } catch (err: any) {
      setSearchMessage(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const sendRequest = async (recipientId: string) => {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSearchMessage("Friend request sent!");
        fetchNetwork(); // Refresh active lists
      } else {
        setSearchMessage(data.error || "Failed to send request.");
      }
    } catch (err) {
      setSearchMessage("An error occurred.");
    }
  };

  const respondToRequest = async (requestId: string, action: "accepted" | "declined") => {
    try {
      const res = await fetch("/api/friends/respond", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      if (res.ok) fetchNetwork(); // Refresh lists
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-10)" }}><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div>
      <header style={{ marginBottom: "var(--space-8)" }}>
        <h1>Friends & Collaboration</h1>
        <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
          Connect with peers to share study materials, notes, and flashcards.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)", alignItems: "start" }}>
        
        {/* LEFT COLUMN: Add Friend & Incoming Requests */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
          
          <section style={{
            backgroundColor: "var(--surface-raised)",
            padding: "var(--space-6)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <UserPlus size={20} /> Add a Friend
            </h2>
            
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input 
                  type="email" 
                  placeholder="Friend's exact email address" 
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "var(--space-2) var(--space-4) var(--space-2) var(--space-8)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-color)",
                    color: "var(--text-primary)"
                  }}
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isSearching}
                style={{
                  padding: "0 var(--space-4)",
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontWeight: "var(--weight-medium)",
                  cursor: isSearching ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : "Lookup"}
              </button>
            </form>

            {searchMessage && (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>{searchMessage}</p>
            )}

            {searchResults.map(user => (
              <div key={user._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-3)", backgroundColor: "var(--surface)", borderRadius: "var(--radius-md)" }}>
                <div>
                  <p style={{ fontWeight: "var(--weight-medium)", margin: 0 }}>{user.name}</p>
                  <p className="text-muted" style={{ fontSize: "var(--text-sm)", margin: 0 }}>{user.email}</p>
                </div>
                <button 
                  onClick={() => sendRequest(user._id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "var(--surface-raised)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    fontSize: "var(--text-xs)",
                    fontWeight: "var(--weight-medium)"
                  }}
                >
                  Send Request
                </button>
              </div>
            ))}
          </section>

          {incoming.length > 0 && (
            <section style={{
              backgroundColor: "var(--surface-raised)",
              padding: "var(--space-6)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)"
            }}>
              <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)" }}>Incoming Requests</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {incoming.map(req => (
                  <div key={req._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-3)", backgroundColor: "var(--surface)", borderRadius: "var(--radius-md)" }}>
                    <div>
                      <p style={{ fontWeight: "var(--weight-medium)", margin: 0 }}>{req.requesterId.name}</p>
                      <p className="text-muted" style={{ fontSize: "var(--text-sm)", margin: 0 }}>{req.requesterId.email}</p>
                    </div>
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                      <button 
                        onClick={() => respondToRequest(req._id, "accepted")}
                        style={{ padding: "6px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10B981", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
                      >
                        <UserCheck size={16} />
                      </button>
                      <button 
                        onClick={() => respondToRequest(req._id, "declined")}
                        style={{ padding: "6px", backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#DC2626", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
                      >
                        <UserX size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: My Network */}
        <section style={{
          backgroundColor: "var(--surface-raised)",
          padding: "var(--space-6)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          height: "100%",
          minHeight: "400px"
        }}>
          <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Users size={20} /> My Network
          </h2>
          
          {friends.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--space-10) 0", color: "var(--text-muted)" }}>
              <p>You don't have any friends yet.</p>
              <p style={{ fontSize: "var(--text-sm)" }}>Add someone using their email address to start sharing notes and study materials!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {friends.map(friend => (
                <Link 
                  href={`/friends/${friend._id}`} 
                  key={friend._id} 
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="hover-card" style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    padding: "var(--space-3)", 
                    backgroundColor: "var(--surface)", 
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    transition: "all 0.2s ease"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-full)", backgroundColor: "var(--primary-color)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--weight-bold)", flexShrink: 0 }}>
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: "var(--weight-medium)", margin: 0 }}>{friend.name}</p>
                        <p className="text-muted" style={{ fontSize: "var(--text-sm)", margin: 0 }}>{friend.email}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: "var(--text-muted)" }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
