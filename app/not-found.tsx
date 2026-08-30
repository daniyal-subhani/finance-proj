// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-6xl font-extrabold text-slate-900">404</h1>
      <h2 className="text-2xl font-semibold text-slate-700 mt-2">
        Page Not Found
      </h2>
      <p className="text-gray-500 mt-1">
        The resource you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800"
      >
        Return Home
      </Link>
    </div>
  );
}
