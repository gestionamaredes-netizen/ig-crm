import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/Shell";
import { PanelGate } from "@/components/dashboard/PanelGate";

export const metadata: Metadata = {
  title: "Panel interno",
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelGate>
      <DashboardShell>{children}</DashboardShell>
    </PanelGate>
  );
}
