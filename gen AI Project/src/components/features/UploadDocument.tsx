"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, AlertCircle, Loader2, CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadDocument() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadIndex, setUploadIndex] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFiles(prev => [...prev, ...acceptedFiles]);
      setError("");
      setSuccess(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    // maxFiles removed to allow multiple
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please select files before uploading.");
      return;
    }

    setIsUploading(true);
    setError("");
    setUploadIndex(0);

    let hasError = false;

    for (let i = 0; i < files.length; i++) {
      setUploadIndex(i + 1);
      const currentFile = files[i];
      const formData = new FormData();
      formData.append("file", currentFile);
      formData.append("title", currentFile.name.replace(/\.[^/.]+$/, ""));

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `Failed to upload ${currentFile.name}`);
        }
      } catch (err: any) {
        setError(err.message);
        hasError = true;
        break; // Stop uploading the rest if one fails
      }
    }

    setIsUploading(false);

    if (!hasError) {
      setSuccess(true);
      setFiles([]);
      setUploadIndex(0);
      
      // Refresh the page data after a slight delay to show success state
      setTimeout(() => {
        router.refresh();
      }, 2000);
    }
  };

  return (
    <div style={{
      backgroundColor: "var(--surface-raised)",
      padding: "var(--space-6)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-lg)",
      border: "1px solid var(--border-color)",
      maxWidth: "var(--container-md)",
      margin: "0 auto"
    }}>
      <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-2)", fontWeight: "var(--weight-semibold)" }}>
        Upload Study Materials
      </h2>
      <p className="text-muted" style={{ marginBottom: "var(--space-6)" }}>
        Upload multiple PDF textbooks, past exam papers, or lecture notes. We'll extract the text and get ready to generate your flashcards and quizzes.
      </p>

      {error && (
        <div style={{
          padding: "var(--space-3)",
          backgroundColor: "#FEF2F2",
          border: "1px solid #FECACA",
          color: "#DC2626",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          marginBottom: "var(--space-4)"
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          padding: "var(--space-3)",
          backgroundColor: "#F0FDF4",
          border: "1px solid #BBF7D0",
          color: "#16A34A",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          marginBottom: "var(--space-4)"
        }}>
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>All documents uploaded and parsed successfully!</span>
        </div>
      )}

      <div 
        {...getRootProps()} 
        style={{
          border: `2px dashed ${isDragReject ? '#DC2626' : isDragActive ? 'var(--primary-color)' : 'var(--border-color)'}`,
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-8) var(--space-4)",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: isDragActive ? "rgba(14, 165, 233, 0.05)" : "transparent",
          transition: "all var(--dur-normal) var(--ease-out)",
          marginBottom: files.length > 0 ? "var(--space-4)" : 0
        }}
      >
        <input {...getInputProps()} />
        <div style={{ 
          width: "48px", 
          height: "48px", 
          borderRadius: "50%", 
          backgroundColor: "var(--surface-color)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          margin: "0 auto var(--space-4)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <UploadCloud size={24} color={isDragReject ? '#DC2626' : "var(--primary-color)"} />
        </div>
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-medium)", marginBottom: "var(--space-1)" }}>
          {isDragActive ? "Drop your PDFs here..." : "Click or drag to upload PDFs"}
        </h3>
        <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
          You can select multiple files at once. (Max 10MB each)
        </p>
      </div>

      {files.length > 0 && (
        <form onSubmit={handleUpload}>
          <div style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {files.map((file, idx) => (
              <div key={`${file.name}-${idx}`} style={{
                 display: "flex", 
                 alignItems: "center", 
                 gap: "var(--space-3)", 
                 padding: "var(--space-3)", 
                 border: "1px solid var(--border-color)", 
                 borderRadius: "var(--radius-md)",
                 backgroundColor: "var(--surface-color)",
              }}>
                <FileText size={24} style={{ color: "var(--primary-color)", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {file.name}
                  </p>
                  <p className="text-muted" style={{ fontSize: "var(--text-xs)" }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!isUploading && (
                  <button 
                    type="button" 
                    onClick={() => removeFile(idx)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: "var(--space-1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "var(--radius-sm)",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--border-subtle)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isUploading}
            style={{
              width: "100%",
              backgroundColor: "var(--primary-color)",
              color: "white",
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-md)",
              border: "none",
              fontSize: "var(--text-base)",
              fontWeight: "var(--weight-medium)",
              cursor: isUploading ? "not-allowed" : "pointer",
              opacity: isUploading ? 0.7 : 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "var(--space-2)",
              transition: "background-color var(--dur-fast) var(--ease-out)"
            }}
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                <span>Processing... ({uploadIndex}/{files.length})</span>
              </>
            ) : (
              <span>Upload {files.length} Document{files.length > 1 ? 's' : ''}</span>
            )}
          </button>
        </form>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
