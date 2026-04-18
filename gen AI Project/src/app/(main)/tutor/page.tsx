export default function TutorPage() {
  return (
    <div>
      <header style={{ marginBottom: "var(--space-8)" }}>
        <h1>AI Tutor Session</h1>
        <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
          Have a conversation with an AI tutor that knows all your uploaded study materials.
        </p>
      </header>

      <section style={{
        backgroundColor: "var(--surface-raised)",
        padding: "var(--space-10)",
        borderRadius: "var(--radius-xl)",
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "1px dashed var(--border-color)",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)", fontWeight: "var(--weight-semibold)" }}>
          Tutor Area Coming Soon
        </h2>
        <p className="text-muted" style={{ maxWidth: "500px", margin: "0 auto" }}>
          This will be the main conversational interface where you can ask complex questions and get answers grounded entirely in the context of the PDFs you've uploaded.
        </p>
      </section>
    </div>
  );
}
