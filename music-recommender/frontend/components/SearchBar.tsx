"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Music, User, Layers } from "lucide-react";
import styles from "./SearchBar.module.css";

interface Props {
  onSearch: (query: string, searchBy: string) => void;
  isLoading: boolean;
}

const POPULAR_SUGGESTIONS = [
  { name: "Bohemian Rhapsody", by: "Queen" },
  { name: "Blinding Lights", by: "The Weeknd" },
  { name: "Karma Police", by: "Radiohead" },
  { name: "Instant Crush", by: "Daft Punk" },
  { name: "Creep", by: "Radiohead" },
  { name: "Levels", by: "Avicii" },
  { name: "Hotel California", by: "Eagles" },
  { name: "Lose Yourself", by: "Eminem" },
];

export default function SearchBar({ onSearch, isLoading }: Props) {
  const [value, setValue] = useState("");
  const [searchBy, setSearchBy] = useState<"all" | "track" | "artist">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim()) onSearch(value.trim(), searchBy);
    },
    [value, searchBy, onSearch]
  );

  const handleChipClick = (songName: string) => {
    setValue(songName);
    onSearch(songName, "track");
  };

  const getPlaceholder = () => {
    if (searchBy === "track") return "Type a song name (e.g. Bohemian Rhapsody, Creep, Levels)...";
    if (searchBy === "artist") return "Type an artist name (e.g. Queen, Radiohead, Daft Punk)...";
    return "Search by song name or artist...";
  };

  return (
    <div className={styles.searchContainer}>
      {/* Scope Selector Pills */}
      <div className={styles.scopeBar} role="group" aria-label="Search Scope">
        <span className={styles.scopeLabel}>Search scope:</span>
        <button
          type="button"
          className={`${styles.scopePill} ${searchBy === "all" ? styles.scopePillActive : ""}`}
          onClick={() => setSearchBy("all")}
        >
          <Layers size={13} className={styles.pillIcon} />
          <span>All</span>
        </button>
        <button
          type="button"
          className={`${styles.scopePill} ${searchBy === "track" ? styles.scopePillActive : ""}`}
          onClick={() => setSearchBy("track")}
        >
          <Music size={13} className={styles.pillIcon} />
          <span>Song Name</span>
        </button>
        <button
          type="button"
          className={`${styles.scopePill} ${searchBy === "artist" ? styles.scopePillActive : ""}`}
          onClick={() => setSearchBy("artist")}
        >
          <User size={13} className={styles.pillIcon} />
          <span>Artist</span>
        </button>
      </div>

      {/* Main Search Input Form */}
      <form className={styles.form} onSubmit={handleSubmit} role="search">
        <div className={styles.inputWrapper}>
          <span className={styles.icon} aria-hidden="true">
            {searchBy === "track" ? (
              <Music size={16} className={styles.inputIcon} />
            ) : searchBy === "artist" ? (
              <User size={16} className={styles.inputIcon} />
            ) : (
              <Search size={16} className={styles.inputIcon} />
            )}
          </span>
          <input
            id="search-input"
            ref={inputRef}
            className={styles.input}
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={getPlaceholder()}
            aria-label="Search for a song or artist"
            autoComplete="off"
            spellCheck="false"
            disabled={isLoading}
          />
          {isLoading && <span className={styles.spinner} aria-label="Searching…" />}
        </div>
        <button
          id="search-submit"
          className={styles.button}
          type="submit"
          disabled={isLoading || !value.trim()}
          aria-label="Search"
        >
          Search
        </button>
      </form>

      {/* Quick Suggestions Chips */}
      <div className={styles.suggestionsRow}>
        <span className={styles.suggestLabel}>Try song:</span>
        <div className={styles.chipsScroll}>
          {POPULAR_SUGGESTIONS.map((s) => (
            <button
              key={s.name}
              type="button"
              className={styles.suggestChip}
              onClick={() => handleChipClick(s.name)}
              title={`${s.name} by ${s.by}`}
            >
              <Music size={11} className={styles.chipNoteIcon} />
              <span className={styles.chipName}>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
