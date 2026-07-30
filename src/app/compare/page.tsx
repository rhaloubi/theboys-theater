import { Header } from "@/components/layout/header";

export default function ComparePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1920px] flex-1 px-4 py-8 md:px-12">
        <h1 className="text-2xl font-bold">Compare</h1>
        <p className="text-muted mt-2">
          IMDb ratings & watchlist comparison — coming in the next step.
        </p>
      </main>
    </>
  );
}
