"use client";

import React from 'react';
import { Avatar } from "@nextui-org/react";

interface UserAvatarProps {
  user: {
    first_name: string;
    last_name: string;
    photo_profil?: string | null; // Pour Employee
    photo_url?: string | null;     // Pour Member
  };
  size?: "sm" | "md" | "lg" | "xl"; // ✅ Ajout de "xl"
  className?: string;
  showBorder?: boolean;
  borderColor?: string;
  type?: 'employee' | 'member';
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "md",
  className = "",
  showBorder = false,
  borderColor = "border-[#34963d]",
  type = 'employee'
}) => {
  // Gérer les différents noms de champs selon le type
  const photoUrl = type === 'employee' ? user.photo_profil : user.photo_url;
  
  // Générer les initiales
  const getInitials = (firstName: string, lastName: string): string => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };
  
  const initials = getInitials(user.first_name, user.last_name);
  const fullName = `${user.first_name} ${user.last_name}`;
  
  // Générer une couleur basée sur les initiales pour consistency
  const getAvatarColor = (initials: string): string => {
    const colors = [
      "bg-gradient-to-br from-[#34963d] to-[#1e7367]",
      "bg-gradient-to-br from-blue-500 to-blue-700",
      "bg-gradient-to-br from-purple-500 to-purple-700",
      "bg-gradient-to-br from-orange-500 to-orange-700",
      "bg-gradient-to-br from-pink-500 to-pink-700",
      "bg-gradient-to-br from-indigo-500 to-indigo-700",
      "bg-gradient-to-br from-teal-500 to-teal-700",
      "bg-gradient-to-br from-cyan-500 to-cyan-700",
    ];
    
    // Utiliser la somme des codes ASCII pour plus de variété
    const charSum = initials.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const index = charSum % colors.length;
    return colors[index];
  };
  
  const avatarColor = getAvatarColor(initials);
  
  // ✅ Gérer la taille XL manuellement avec CSS
  const getAvatarSize = (size: string) => {
    if (size === 'xl') {
      return 'lg'; // Utiliser 'lg' pour NextUI mais on va override avec CSS
    }
    return size as "sm" | "md" | "lg";
  };

  // ✅ Classes CSS pour la taille XL
  const getCustomSizeClasses = (size: string): string => {
    if (size === 'xl') {
      return 'w-20 h-20'; // 80px - plus grand que lg
    }
    return '';
  };

  // ✅ Ajustement de la taille de la police selon la taille de l'avatar
  const getFontSizeClass = (size: string): string => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-sm';
      case 'lg': return 'text-base';
      case 'xl': return 'text-lg'; // ✅ Taille de police pour XL
      default: return 'text-sm';
    }
  };
  
  const fontSizeClass = getFontSizeClass(size);
  const avatarSize = getAvatarSize(size);
  const customSizeClasses = getCustomSizeClasses(size);
  
  return (
    <Avatar
      src={photoUrl || undefined}
      name={fullName}
      size={avatarSize} // ✅ Utilise la taille compatible NextUI
      className={`
        ${className}
        ${customSizeClasses} // ✅ Classes CSS custom pour XL
        ${showBorder ? `ring-2 ring-offset-2 ${borderColor}` : ''}
        ${!photoUrl ? avatarColor : ''}
      `}
      classNames={{
        base: !photoUrl ? avatarColor : '',
        name: `font-medium text-white ${fontSizeClass}` // ✅ Font adaptatif
      }}
      showFallback
      fallback={
        <span className={`text-white font-semibold ${fontSizeClass}`}>
          {initials}
        </span>
      }
    />
  );
};

export default UserAvatar;