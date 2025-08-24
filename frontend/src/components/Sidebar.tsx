"use client";

import Link from "next/link";

const Sidebar = ({
  isOpen = true,
  onClose,
  className = "",
  menuItems = [
    "Home",
    "Questions",
    "Chats",
    "Community",
    "Tags",
    "Articles",
    "Bookmarks",
    "About Us",
    "Contact",
    "Help",
  ],
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        fixed lg:static inset-y-0 left-0 z-50 w-64 h-full
        bg-[var(--color-secondary)] text-[var(--color-neutral)] 
        p-6 flex flex-col gap-6 shadow-lg 
        transition-transform duration-300 ease-in-out
        ${className}
      `}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-wide">
            Mentor
            <span className="text-[var(--color-surface-dark)]">Stack</span>
          </h1>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-[var(--color-neutral)] hover:text-[var(--color-surface-dark)]"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <Link
              key={item}
              href="#"
              className="px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-secondary-light)]"
              onClick={onClose} // Close sidebar when clicking a link on mobile
            >
              {item}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
