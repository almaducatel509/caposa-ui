// 📁 components/OpeningHours/ScheduleCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button, Tooltip, Chip, Badge } from '@nextui-org/react';
import { FiEdit, FiInfo } from 'react-icons/fi';
import { FaRegTrashCan } from 'react-icons/fa6';
import { LuPrinter } from 'react-icons/lu';
import { BsCalendarWeek, BsGeoAlt, BsClockHistory } from 'react-icons/bs';
import { OpeningHrs } from '@/app/dashboard/opening_hours/columns';

interface Holiday {
  id: string;
  date: string;
  description: string;
}
interface Branch {
  id: string;
  branch_name: string;
  holidays: string[];
}

const extractMetadata = (monday: string) => {
  const parts = monday.split('|');
  return parts.length >= 3 ? {
    title: parts[0],
    validFrom: parts[1],
    validTo: parts[2],
    hours: parts[3] || ""
  } : null;
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR');
const getDayOfWeek = (dateStr: string) => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(dateStr).getDay()];

const getPeriodHolidays = (item: OpeningHrs, holidays: Holiday[]) => {
  const metadata = extractMetadata(item.monday);
  if (!metadata) return [];
  const start = new Date(metadata.validFrom);
  const end = new Date(metadata.validTo);
  return holidays.filter(h => {
    const d = new Date(h.date);
    return d >= start && d <= end;
  });
};

const getDayStatus = (item: OpeningHrs, day: string, holidays: Holiday[]) => {
  const value = item[day as keyof OpeningHrs] as string;
  if (!value || value === '' || value === '00:00-00:00') return { status: 'closed', message: 'Fermé' };
  const metadata = extractMetadata(item.monday);
  if (metadata) {
    const periodHolidays = getPeriodHolidays(item, holidays);
    for (const holiday of periodHolidays) {
      if (getDayOfWeek(holiday.date) === day) return { status: 'holiday', message: `Jour férié: ${holiday.description}` };
    }
  }
  return { status: 'open', message: value.toString() };
};

const ScheduleCard = ({ item, holidays, branches, onEdit, onDelete }: {
  item: OpeningHrs;
  holidays: Holiday[];
  branches: Branch[];
  onEdit: (item: OpeningHrs) => void;
  onDelete: (item: OpeningHrs) => void;
}) => {
  const metadata = extractMetadata(item.monday);
  const periodHolidays = getPeriodHolidays(item, holidays);
  const branch = branches[0] || { branch_name: 'Principale', id: '1' };

  const [status, setStatus] = useState('unknown');

  useEffect(() => {
    if (!metadata) return;
    const now = new Date();
    const from = new Date(metadata.validFrom);
    const to = new Date(metadata.validTo);
    const result = now < from ? 'upcoming' : now > to ? 'expired' : 'current';
    setStatus(result);
  }, [metadata]);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition hover:shadow-md">
      <div className={`bg-gradient-to-r ${status === 'upcoming' ? 'from-blue-500 to-indigo-600' : status === 'expired' ? 'from-gray-500 to-gray-600' : 'from-emerald-500 to-teal-600'} text-white p-4`}>
        <div className="flex justify-between">
          <div>
            <h3 className="font-bold text-lg">{metadata?.title || 'Horaires standard'}</h3>
            <div className="flex items-center text-sm mt-1">
              <BsCalendarWeek className="mr-1" />
              {metadata ? `Du ${formatDate(metadata.validFrom)} au ${formatDate(metadata.validTo)}` : `Créé le ${formatDate(item.created_at)}`}
            </div>
          </div>
          <div>
            {status === 'current' && <Badge color="success">Actif</Badge>}
            {status === 'upcoming' && <Badge color="primary">À venir</Badge>}
            {status === 'expired' && <Badge>Expiré</Badge>}
          </div>
        </div>
        <div className="flex items-center mt-2 text-xs">
          <BsGeoAlt className="mr-1" /> Succursale: {branch.branch_name}
        </div>
      </div>

      <div className="p-4">
        <Chip startContent={<BsClockHistory />} variant="flat" color="success" className="mb-3">Horaires hebdomadaires</Chip>
        <div className="grid grid-cols-7 gap-1 text-center mb-4">
          {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => {
            const ds = getDayStatus(item, day, holidays);
            const chipColor = ds.status === 'closed' ? 'danger' : ds.status === 'holiday' ? 'warning' : day === 'saturday' || day === 'sunday' ? 'secondary' : 'success';
            return (
              <Tooltip key={day} content={ds.status === 'holiday' ? ds.message : undefined}>
                <Chip size="sm" color={chipColor as any} className="w-full text-xs" variant={ds.status === 'open' ? 'flat' : 'solid'}>
                  {typeof ds.message === 'string'
                    ? (ds.status === 'closed' || ds.status === 'holiday' ? 'Fermé' : ds.message.split('-')[0])
                    : 'Fermé'}
                </Chip>
              </Tooltip>
            );
          })}
        </div>
        <div className="flex justify-between px-1 text-xs text-gray-500">
          <span>ID: {item.id.substring(0, 8)}...</span>
          <div className="flex gap-2">
            <Tooltip content="Modifier">
              <Button isIconOnly size="sm" variant="light" onPress={() => onEdit(item)}><FiEdit /></Button>
            </Tooltip>
            <Tooltip content="Supprimer">
              <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onDelete(item)}><FaRegTrashCan /></Button>
            </Tooltip>
            <Tooltip content="Imprimer">
              <Button isIconOnly size="sm" variant="light"><LuPrinter /></Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;
