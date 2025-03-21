'use client';

import Avatar from './Avatar';
import SidebarMenu from './SidebarMenu';

export default function Sidebar() {
  return (
    <div className="flex flex-col h-screen w-64">
      <div className="pt-6 px-4">
        <Avatar src="/johndoe.png" alt="JohnDoe" username="John Doe" />
      </div>

      <div className="flex-1 flex flex-col">
        <SidebarMenu />
      </div>
    </div>
  );
}
