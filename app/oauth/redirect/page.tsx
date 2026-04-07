"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../../lib/store";

function OAuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const needsOnboarding = searchParams.get("needsOnboarding");

    if (!accessToken) {
      router.replace("/");
      return;
    }

    setAccessToken(accessToken);

    if (needsOnboarding === "true") {
      router.replace("/signup");
    } else {
      router.replace("/main");
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">로그인 처리 중...</p>
    </main>
  );
}

export default function OAuthRedirectPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-gray-500">로그인 처리 중...</p>
        </main>
      }
    >
      <OAuthHandler />
    </Suspense>
  );
}
