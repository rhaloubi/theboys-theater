import { Header } from "@/components/layout/header";
import { CompareView } from "@/components/compare/compare-view";

export default function ComparePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl flex-1 px-4 py-8 md:px-12">
        <h1 className="text-2xl font-bold">Compare</h1>
        <p className="text-muted mt-1 mb-6 text-sm">
          IMDb ratings and watchlists — who rated what, and where you disagree.
        </p>
        <CompareView />
      </main>
    </>
  );
}
