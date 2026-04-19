import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div>
      <header style={{ marginBottom: "var(--space-8)" }}>
        <h1>Settings</h1>
        <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
          Manage your account and preferences.
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "var(--container-md)" }}>
        
        {/* Profile Section */}
        <section style={{
          backgroundColor: "var(--surface-raised)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "var(--space-4) var(--space-6)",
            borderBottom: "1px solid var(--border-color)",
          }}>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", margin: 0 }}>Profile</h2>
          </div>
          <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--primary-color)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--text-2xl)",
                fontWeight: "var(--weight-bold)",
                flexShrink: 0,
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", margin: 0 }}>
                  {user.name || "Student"}
                </p>
                <p className="text-muted" style={{ fontSize: "var(--text-sm)", margin: 0, marginTop: "2px" }}>
                  {user.email}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)", backgroundColor: "var(--surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <User size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                <div>
                  <p className="text-muted" style={{ fontSize: "var(--text-xs)", margin: 0 }}>Name</p>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", margin: 0 }}>{user.name || "—"}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)", backgroundColor: "var(--surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <Mail size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                <div>
                  <p className="text-muted" style={{ fontSize: "var(--text-xs)", margin: 0 }}>Email</p>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", margin: 0 }}>{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sign Out Section */}
        <section style={{
          backgroundColor: "var(--surface-raised)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "var(--space-4) var(--space-6)",
            borderBottom: "1px solid var(--border-color)",
          }}>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", margin: 0 }}>Account</h2>
          </div>
          <div style={{ padding: "var(--space-6)" }}>
            <Link
              href="/api/auth/signout"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-3) var(--space-5)",
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                color: "#DC2626",
                border: "1px solid rgba(220, 38, 38, 0.3)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-medium)",
                textDecoration: "none",
                transition: "all var(--dur-normal) var(--ease-out)",
              }}
            >
              <LogOut size={16} />
              Sign Out
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
