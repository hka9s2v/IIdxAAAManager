'use client';

import Image from 'next/image';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  username?: string;
  avatarUrl?: string;
  className?: string;
}

export function UserAvatar({ 
  size = 'md', 
  username = 'User', 
  avatarUrl,
  className = '' 
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl'
  };

  const displayAvatarUrl = avatarUrl || '/images/default-avatar.svg';

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <Image
        src={displayAvatarUrl}
        alt={`${username}のアバター`}
        fill
        className="rounded-full object-cover border-2 border-gray-200"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
} 