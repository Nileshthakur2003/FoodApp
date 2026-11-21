// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black text-black dark:text-white flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold">Page Not Found</h2>
      <p className="text-sm text-gray-500 mt-2">The food spot or page requested could not be found.</p>
      <Link
        href="/"
        className="mt-4 px-6 py-2.5 rounded-full bg-[#007aff] text-white text-xs font-semibold"
      >
        Return to EatRight
      </Link>
    </div>
  );
}
