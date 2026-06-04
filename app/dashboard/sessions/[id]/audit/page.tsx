'use client';
import { useParams } from 'next/navigation';
import AuditPage from '@/app/components/sessions/audit/AuditPage';

export default function SessionAuditPage() {
  const sessionId = useParams()?.id as string;
  return <AuditPage sessionId={sessionId} />;
}