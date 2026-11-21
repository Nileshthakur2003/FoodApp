// app/global-error.tsx
'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f5f7] dark:bg-black text-black dark:text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-sm text-gray-500 mt-2">An error occurred while loading this page.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 px-6 py-2.5 rounded-full bg-[#007aff] text-white text-xs font-semibold cursor-pointer"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
