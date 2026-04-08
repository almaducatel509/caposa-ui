"use client";

import React from 'react';

interface UserAvatarProps {
  user: {
    first_name: string;
    last_name: string;
    photo_profil?: string | null;
    photo_url?: string | null;
  };
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  className?: string;
  showBorder?: boolean;
  borderColor?: string;
  type?: 'employee' | 'member';
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-lg',
  xxl:'w-22 h22 text-2xl'
};

const COLORS = [
  'bg-[#2E7D32]',   // vert principal
  'bg-[#1e7367]',   // teal
  'bg-[#355C7D]',   // bleu ardoise
  'bg-[#558B2F]',   // vert olive
  'bg-[#00796B]',   // teal foncé
  'bg-[#388E3C]',   // vert moyen
  'bg-[#4527A0]',   // violet sobre
  'bg-[#6D4C41]',   // brun
];

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  showBorder = false,
  borderColor = 'ring-[#34963d]',
  type = 'employee',
}) => {
  
  const photoUrl = type === 'employee' ? user.photo_profil : user.photo_url;
  const initials = [user.first_name, user.last_name]
    .map(n => n?.charAt(0) ?? '')
    .join('')
    .toUpperCase();

  const charSum = initials.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const gradient = COLORS[charSum % COLORS.length];

  const sizeClass  = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const borderClass = showBorder ? `ring-2 ring-offset-2 ${borderColor}` : '';

  const base = `relative inline-flex items-center justify-center rounded-lg shrink-0 overflow-hidden
  ${sizeClass} ${borderClass} ${className}`;

  if (photoUrl) {
    return (
      <div className={base}>
        <img
          src={photoUrl}
          alt={`${user.first_name} ${user.last_name}`}
          className="w-full h-full object-cover"
          onError={e => {
            // Si l'image plante, on bascule sur les initiales
            const target = e.currentTarget;
            target.style.display = 'none';
            target.nextElementSibling?.removeAttribute('hidden');
          }}
        />
        {/* Fallback initiales caché par défaut */}
        <div hidden className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradient}`}>
          <span className="font-semibold text-white">{initials}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${base} bg-gradient-to-br ${gradient}`}>
      <span className="font-semibold text-white">{initials}</span>
    </div>
  );
};

export default UserAvatar;