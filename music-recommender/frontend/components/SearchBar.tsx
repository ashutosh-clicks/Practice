"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./SearchBar.module.css";

interface Props {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: Props) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  }, [value, onSearch]);

  return (
    <form className={styles.form} onSubmit={handleSubmit} role="search">
      <div className={styles.inputWrapper}>
        <span className={styles.icon} aria-hidden="true">🔍</span>
        <input
          id="search-input"
          ref={inputRef}
          className={styles.input}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search for a song or artist…"
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
  );
}
