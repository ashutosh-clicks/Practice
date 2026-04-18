"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styles from '../Auth.module.css';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.message || 'Something went wrong');
            setLoading(false);
            return;
        }

        // Successfully created account, now sign them in
        const signInRes = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (signInRes?.error) {
            setError(signInRes.error);
            setLoading(false);
            return;
        }

        router.push('/');
        router.refresh();
    } catch (err) {
        setError('An unexpected error occurred.');
        setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h1 className={styles.title}>Create Account</h1>
      <p className="text-muted" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        Join the smart learning platform today
      </p>

      {error && (
        <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
          {error}
        </div>
      )}
      
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            placeholder="Alex Student" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
            disabled={loading}
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            placeholder="student@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            disabled={loading}
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            minLength={8}
            disabled={loading}
          />
          <p className="text-xs text-muted" style={{ marginTop: 'var(--space-1)' }}>Must be at least 8 characters.</p>
        </div>
        
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      
      <div className={styles.footer}>
        <span className="text-muted">Already have an account?</span>
        <Link href="/login" className={styles.link}>Sign in</Link>
      </div>
    </div>
  );
}
