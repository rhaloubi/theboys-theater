"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/client";

const NAV = [
  { href: "/browse", label: "Browse" },
  { href: "/community", label: "Community" },
  { href: "/compare", label: "Compare" },
  { href: "/profile", label: "Profile" },
];

export function Header() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
  });

  async function logout() {
    await authApi.logout();
    router.push("/");
  }

  async function switchProfile() {
    await authApi.switchProfile();
    void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    router.push("/gate/select-user?switch=1");
  }

  const user = data?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-4 md:px-12">
        <div className="flex items-center gap-8">
          <Link href="/browse" className="text-lg font-bold tracking-tight">
            <span className="text-primary">TBT</span>
            <span className="hidden sm:inline"> The Boys Theater</span>
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted text-sm transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={switchProfile}
              className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-surface"
              title="Switch profile"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold text-white"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-sm sm:inline">{user.displayName}</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="text-muted text-sm transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
