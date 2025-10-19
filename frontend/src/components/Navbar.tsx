"use client";

import { Home, Bell, UserCircle, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onMenuClick?: () => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  className?: string;
}

const Navbar = ({
  onMenuClick,
  searchPlaceholder = "Search for questions...",
  showSearch = true,
  className = "",
}: NavbarProps) => {
  const router = useRouter();

  return (
    <header
      className={`flex items-center justify-between px-6 py-4 bg-[var(--color-neutral)] shadow-sm border-b border-[var(--color-neutral-dark)] ${className}`}
    >
      {/* Menu button on the left */}
      <div className="flex items-center">
        {onMenuClick && (
          <Menu 
            className="w-6 h-6 text-[var(--color-tertiary-light)] cursor-pointer hover:text-[var(--color-primary)] transition mr-4" 
            onClick={onMenuClick}
          />
        )}
      </div>

      {/* Navigation icons on the right */}
      <div className="flex items-center gap-5">
        <button
          className="text-sm font-medium text-[var(--color-tertiary-light)] hover:text-[var(--color-primary)] transition"
          onClick={() => router.push('/chatbot')}
        >
          AI Chat
        </button>
        <Home className="w-6 h-6 text-[var(--color-tertiary-light)] cursor-pointer hover:text-[var(--color-primary)] transition" />
        <Bell className="w-6 h-6 text-[var(--color-tertiary-light)] cursor-pointer hover:text-[var(--color-primary)] transition" />
        <UserCircle
          className="w-7 h-7 text-[var(--color-tertiary-light)] cursor-pointer hover:text-[var(--color-primary)] transition" 
          onClick={() => router.push('/profile')}
        />
      </div>
    </header>
  );
};

export default Navbar;
