import { Header } from "@/components/layout/header";

export const dynamic = "force-dynamic";

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
    </>
  );
}
