"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  sidebarProps?: any;
  navbarProps?: any;
}

const Layout = ({
  children,
  showSidebar = true,
  sidebarProps = {},
  navbarProps = {},
}: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to false (hidden)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[var(--color-neutral-dark)] text-[var(--color-tertiary)]">
      {/* Sidebar - Only shows when sidebarOpen is true */}
      {showSidebar && (
        <div className={`${sidebarOpen ? "block" : "hidden"}`}>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={closeSidebar}
            {...sidebarProps}
          />
        </div>
      )}

      {/* Main Content - Takes full width when sidebar is hidden */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar onMenuClick={toggleSidebar} {...navbarProps} />

        {/* Page Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
