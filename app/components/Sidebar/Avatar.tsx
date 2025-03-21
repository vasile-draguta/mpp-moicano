'use client';

import Image from 'next/image';

interface AvatarProps {
  src: string;
  alt?: string;
  username?: string;
}

export default function Avatar({
  src,
  alt = 'User Avatar',
  username = 'user',
}: AvatarProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Image
        src={src}
        alt={alt}
        className="rounded-full object-cover"
        width={150}
        height={150}
      />
      <p className="text-2xl font-medium">{username}</p>
    </div>
  );
}
