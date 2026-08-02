import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/Shell";

export const metadata: Metadata = {
  title: "Panel interno",
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
