"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-display font-bold text-xl">Something went wrong</h1>
        <p className="text-sm text-muted">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-accent text-background text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
