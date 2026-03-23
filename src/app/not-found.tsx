import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f100d] px-4 py-10 text-[#ece9df]">
      <div className="w-full max-w-xl rounded-3xl border border-[#d4af37]/25 bg-[#161711] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">404</p>
        <h1 className="mt-3 text-4xl font-semibold">Page Not Found</h1>
        <p className="mt-4 text-sm leading-7 text-[#c4c6b9]">
          The page you requested does not exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#11120e]">
            Back to Home
          </Link>
          <Link href="/collections" className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] hover:bg-white hover:text-[#11120e]">
            Browse Collections
          </Link>
        </div>
      </div>
    </main>
  );
}
