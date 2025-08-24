"use client";

import { Home, Bell, UserCircle, Menu, Search } from "lucide-react";

const Navbar = ({
  onMenuClick,
  searchPlaceholder = "Search for questions...",
  showSearch = true,
  className = "",
}) => {
  return (
    <header
      className={`flex items-center justify-between px-6 py-4 bg-[var(--color-neutral)] shadow-sm border-b border-[var(--color-neutral-dark)] ${className}`}
    >
      <div className="flex items-center gap-3">
        <Menu
          className="w-6 h-6 text-[var(--color-tertiary-light)] cursor-pointer hover:text-[var(--color-primary)] transition"
          onClick={onMenuClick}
        />
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-tertiary-light)]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="border border-[var(--color-surface-dark)] rounded-lg pl-10 pr-4 py-2 text-sm w-72 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none transition-all"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        <Home className="w-6 h-6 text-[var(--color-tertiary-light)] cursor-pointer hover:text-[var(--color-primary)] transition" />
        <Bell className="w-6 h-6 text-[var(--color-tertiary-light)] cursor-pointer hover:text-[var(--color-primary)] transition" />
        <UserCircle className="w-7 h-7 text-[var(--color-tertiary-light)] cursor-pointer hover:text-[var(--color-primary)] transition" />
      </div>
    </header>
  );
};

export default Navbar;
