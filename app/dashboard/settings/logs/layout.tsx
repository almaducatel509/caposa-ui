import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Logs & Audit Système",
  description: "Traçabilité complète des actions, connexions et modifications sur la plateforme",
};

export default function LogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
