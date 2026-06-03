"use client";

import React from "react";
import { useToast } from "@/context/ToastContext";

/**
 * Toast notification container.
 * Renders all active toasts with enter/exit animations.
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  /** Get icon SVG for toast type */
  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        );
      case "error":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case "warning":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  /** Get color styles for toast type */
  const getStyles = (type: string) => {
    switch (type) {
      case "success":
        return {
          bg: "rgba(34, 197, 94, 0.12)",
          border: "rgba(34, 197, 94, 0.25)",
          color: "#4ade80",
        };
      case "error":
        return {
          bg: "rgba(239, 68, 68, 0.12)",
          border: "rgba(239, 68, 68, 0.25)",
          color: "#fca5a5",
        };
      case "warning":
        return {
          bg: "rgba(234, 179, 8, 0.12)",
          border: "rgba(234, 179, 8, 0.25)",
          color: "#fde047",
        };
      default:
        return {
          bg: "rgba(79, 140, 255, 0.12)",
          border: "rgba(79, 140, 255, 0.25)",
          color: "#93c5fd",
        };
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        pointerEvents: "none",
        width: "100%",
        maxWidth: "500px",
        padding: "0 16px",
      }}
    >
      {toasts.map((toast) => {
        const styles = getStyles(toast.type);
        return (
          <div
            key={toast.id}
            role="alert"
            aria-live="polite"
            style={{
              background: styles.bg,
              border: `1px solid ${styles.border}`,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              padding: "14px 20px",
              borderRadius: "12px",
              color: styles.color,
              fontSize: "0.9rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              pointerEvents: "auto",
              animation: "toast-in 0.3s ease forwards",
              cursor: "pointer",
              width: "100%",
            }}
            onClick={() => removeToast(toast.id)}
          >
            <span style={{ flexShrink: 0 }}>{getIcon(toast.type)}</span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                opacity: 0.6,
                padding: "4px",
                flexShrink: 0,
              }}
              aria-label="Dismiss notification"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
