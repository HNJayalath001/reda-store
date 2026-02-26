import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-bold text-blue-600">404</h1>
      <p className="mt-4 text-2xl font-semibold text-gray-800">Page Not Found</p>
      <p className="mt-2 text-gray-500">The page you are looking for doesn&apos;t exist.</p>
      <Link href="/" className="mt-6 btn-primary inline-block">
        Back to Home
      </Link>
    </div>
  );
}
