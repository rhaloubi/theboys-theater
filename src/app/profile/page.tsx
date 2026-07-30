import { Header } from "@/components/layout/header";
import { ProfileImdbImport } from "@/components/profile/profile-imdb-import";

export default function ProfilePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-8 md:px-12">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted mt-1 mb-6 text-sm">
          Import your IMDb data and manage your side of the comparison.
        </p>
        <ProfileImdbImport />
      </main>
    </>
  );
}
