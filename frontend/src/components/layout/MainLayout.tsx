/**
 * Main Layout Component - Cyber Dark Aesthetic
 */
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      <Topbar />
      <main
        className="pt-20 transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? 80 : 240,
        }}
      >
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
};
