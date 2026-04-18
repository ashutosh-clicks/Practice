import styles from "./Header.module.css";
import Link from "next/link";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {/* We can place contextual breadcrumbs or page title here dynamically later */}
      </div>
      <div className={styles.right}>
        <div className={styles.searchContainer}>
          {/* Magnifying glass icon placeholder */}
          <span className={styles.searchIcon}>🔍</span>
          <input 
            type="text" 
            placeholder="Search materials or flashcards..." 
            className={styles.searchInput} 
          />
        </div>
        <div className={styles.userProfile}>
          {/* Avatar Placeholder */}
          <div className={styles.avatar}>A</div>
        </div>
      </div>
    </header>
  );
}
