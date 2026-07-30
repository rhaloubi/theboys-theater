import { Header } from "@/components/layout/header";
import { ActivityFeed } from "@/components/community/activity-feed";

export default function CommunityPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8 md:px-12">
        <h1 className="text-2xl font-bold">Community</h1>
        <p className="text-muted mt-1 mb-6 text-sm">
          Everything you and your friend watch — one shared timeline.
        </p>
        <ActivityFeed />
      </main>
    </>
  );
}
