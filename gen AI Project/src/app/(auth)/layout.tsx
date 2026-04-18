export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'var(--surface-color)' 
    }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: 'var(--space-4)' }}>
        {children}
      </div>
    </div>
  );
}
