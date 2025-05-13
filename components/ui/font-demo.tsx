import React from 'react';

export function FontDemo() {
  return (
    <div className="p-6 space-y-8 bg-card rounded-lg shadow-md">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Font Demonstration</h2>
        <p className="text-muted-foreground text-sm">
          This component demonstrates the custom fonts configured in this application.
        </p>
      </div>

      {/* Sans-serif Font Demo (Inter) */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium border-b pb-2">Inter Font (Sans-serif)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-normal mb-2">Regular (400)</p>
            <p className="font-sans font-normal">The quick brown fox jumps over the lazy dog.</p>
          </div>
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-normal mb-2">Medium (500)</p>
            <p className="font-sans font-medium">The quick brown fox jumps over the lazy dog.</p>
          </div>
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-normal mb-2">Semi-bold (600)</p>
            <p className="font-sans font-semibold">The quick brown fox jumps over the lazy dog.</p>
          </div>
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-normal mb-2">Bold (700)</p>
            <p className="font-sans font-bold">The quick brown fox jumps over the lazy dog.</p>
          </div>
        </div>
      </div>

      {/* Monospace Font Demo (JetBrains Mono) */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium border-b pb-2">JetBrains Mono (Monospace)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-normal mb-2">Regular (400)</p>
            <p className="font-mono font-normal">const greeting = "Hello, world!";</p>
          </div>
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-normal mb-2">Medium (500)</p>
            <p className="font-mono font-medium">const greeting = "Hello, world!";</p>
          </div>
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-normal mb-2">Bold (700)</p>
            <p className="font-mono font-bold">const greeting = "Hello, world!";</p>
          </div>
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-normal mb-2">Code Sample</p>
            <pre className="bg-background text-foreground p-2 rounded text-sm overflow-x-auto">
              <code className="font-mono">
{`function greet() {
  return "Hello, world!";
}`}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Font combinations demo */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium border-b pb-2">Font Combinations</h3>
        <div className="bg-card border rounded-md p-6">
          <h4 className="font-sans font-bold text-xl mb-2">Article Heading</h4>
          <p className="font-sans mb-4">
            This is a paragraph with <strong>strong emphasis</strong> and <em>italicized text</em>. 
            The body copy uses the Inter font while code snippets use JetBrains Mono.
          </p>
          <pre className="bg-muted p-3 rounded my-4">
            <code className="font-mono text-sm">
              console.log("This uses the monospace font");
            </code>
          </pre>
          <p className="font-sans text-sm text-muted-foreground">
            Article footer information using a smaller font size
          </p>
        </div>
      </div>
    </div>
  );
}
