"use client";

import { FontDemo } from "@/components/ui/font-demo";

export default function FontsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Font Configuration</h1>
      <p className="text-lg mb-8">
        This page demonstrates the local fonts configured in this application. 
        We're using Inter for sans-serif text and JetBrains Mono for code snippets.
      </p>
      <FontDemo />
    </div>
  );
}
