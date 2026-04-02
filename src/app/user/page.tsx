import { SearchContainer } from '@/features/search/SearchContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Flights — SkyRoute Finder',
};

export default function UserPage() {
  return (
    <>
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-sky-700 tracking-tight leading-tight mb-3">
          Find Your <span className="text-orange-500">Cheapest</span> Flight
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">
          Search trusted airlines, compare prices, and book directly. No hidden fees. No suspicious sites.
        </p>
      </div>

      <SearchContainer />
    </>
  );
}
