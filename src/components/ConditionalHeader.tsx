"use client";

import { usePathname } from "next/navigation";
import { HeaderSection } from "@/components/HeaderSection";

export function ConditionalHeader() {
  const pathname = usePathname();
  const isSignupPage = pathname.startsWith("/signup");

  if (isSignupPage) {
    return null;
  }

  return <HeaderSection />;
}
