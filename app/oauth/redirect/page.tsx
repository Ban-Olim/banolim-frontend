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

    console.log("[OAuth] URL params:", {
      accessToken: accessToken ? accessToken.slice(0, 20) + "..." : null,
      needsOnboarding,
      fullUrl: window.location.href,
    });

    if (!accessToken) {
      console.log("[OAuth] accessToken 없음 → 홈으로 이동");
      router.replace("/");
      return;
    }

    setAccessToken(accessToken);

    if (needsOnboarding === "true") {
      console.log("[OAuth] 온보딩 필요 → /signup");
      router.replace("/signup");
    } else {
      console.log("[OAuth] 온보딩 불필요 → /main");
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
