import { Suspense } from "react";
import { ProfilePicker } from "@/components/gate/profile-picker";

export default function SelectUserPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted text-sm">Loading…</p>
        </div>
      }
    >
      <ProfilePicker />
    </Suspense>
  );
}
