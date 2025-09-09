import { UserGroupIcon, EnvelopeIcon, HomeIcon } from "@heroicons/react/24/solid";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const handleLinkClick = () => {
    if (window.innerWidth < 768) setIsOpen(false);
  };

  const links = [
    { to: "/", label: "Dashboard", icon: HomeIcon },
    { to: "/manage-candidate", label: "Candidates", icon: UserGroupIcon },
    { to: "/manage-invitations", label: "Invitations", icon: EnvelopeIcon },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 md:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-[#1B1F2A] text-gray-200 border-r border-gray-700
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:inset-0`}
      >
        <div className="h-full flex flex-col">
          {/* Logo / Header */}
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-indigo-400 tracking-wide">
              Admin Panel
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {links.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
