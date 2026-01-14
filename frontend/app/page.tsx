import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          HRIS Cloud
        </h1>
        <p className="text-xl text-gray-600">
          The Vercel for AI-Powered HR Systems.
        </p>
        <div className="pt-4">
          <Link
            href="/dashboard"
            className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Start Building
          </Link>
        </div>
      </div>
    </div>
  );
}
