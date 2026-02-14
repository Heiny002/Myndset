import Link from 'next/link';

export default function TestLinkPage() {
  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <h1 className="text-white text-2xl mb-4">Link Test Page</h1>
      <div className="space-y-4">
        <Link
          href="/admin"
          className="block rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-neutral-950 hover:bg-primary/90"
        >
          This is a Link component
        </Link>
        <a
          href="/admin"
          className="block rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-red-700"
        >
          This is an anchor tag (should cause full reload)
        </a>
        <p className="text-white text-sm mt-4">
          Inspect these elements in browser devtools. The first should render as &lt;a&gt; with Next.js client-side routing.
          The second is a regular anchor.
        </p>
        <div className="mt-8 p-4 bg-neutral-900 rounded">
          <pre className="text-white text-xs">
            Build time: {new Date().toISOString()}
          </pre>
        </div>
      </div>
    </div>
  );
}
