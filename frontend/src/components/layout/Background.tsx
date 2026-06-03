"use client";

import React from "react";

/**
 * Animated background with floating orbs and grid overlay.
 * Creates the signature glassmorphism ambient effect.
 */
export default function Background() {
  return (
    <>
      {/* Floating gradient orbs */}
      <div className="bg-animation">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>
      {/* Subtle grid pattern overlay */}
      <div className="bg-grid" />
    </>
  );
}
