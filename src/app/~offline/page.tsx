'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="text-6xl mb-6" aria-hidden="true">✈</div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">You&apos;re offline</h1>
      <p className="text-slate-500 max-w-xs">
        SkyRoute Finder needs an internet connection to search for flights and hotels.
        Please check your connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
