'use client';

import Sidebar from '@/app/components/Sidebar/Sidebar';
import ContentScreen from '@/app/components/ContentScreen/ContentScreen';

export default function Contact() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ContentScreen>
        <h1 className="text-3xl font-bold text-gray-300">Contact</h1>

        <hr className="my-4 border-gray-300" />
      </ContentScreen>
    </div>
  );
}
