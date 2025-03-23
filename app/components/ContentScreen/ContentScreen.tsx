'use client';

import { ContentScreenProps } from '@/app/types/Component';

export default function ContentScreen({ children }: ContentScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="bg-black rounded-lg h-[95vh] w-[95%] p-6">{children}</div>
    </div>
  );
}
