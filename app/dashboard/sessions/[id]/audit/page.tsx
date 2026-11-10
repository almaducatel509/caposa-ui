import type { Metadata } from 'next';
import AuditPage from '@/app/components/sessions/audit/AuditPage';

export const metadata: Metadata = {
  title: "Audit de Session",
  description: "Rapprochement et audit détaillé de la session de caisse",
};

export default async function SessionAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AuditPage sessionId={id} />;
}