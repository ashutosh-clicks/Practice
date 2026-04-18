"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Study Materials", path: "/study-materials" },
    { name: "Flashcards", path: "/flashcards" },
    { name: "Quizzes", path: "/quizzes" },
    { name: "Revision Notes", path: "/notes" },
    { name: "AI Tutor Session", path: "/tutor" },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.logo}>GenAI Tutor</h1>
      </div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={styles.navItem} 
              data-active={isActive ? "true" : undefined}
            >
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className={styles.footer}>
        <Link 
          href="/settings" 
          className={styles.navItem}
          data-active={pathname === "/settings" ? "true" : undefined}
        >
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
