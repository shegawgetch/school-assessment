import { DocumentArrowUpIcon, HomeIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

export default function Sidebar({ isOpen, setIsOpen }) {
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay on small screens */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden ${isOpen ? "block" : "hidden"}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-slate-800 text-white transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:inset-0`}
      >
        <div className="h-full p-4 space-y-4">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <nav className="space-y-2">
            <Link
              to="/"
              onClick={handleLinkClick}
              className="flex items-center py-2 px-4 rounded hover:bg-slate-700"
            >
              <HomeIcon className="h-5 w-5 mr-2 text-white" />
              Dashboard
            </Link>
            <Link
              to="/candidate-upload"
              onClick={handleLinkClick}
              className="flex items-center py-2 px-4 rounded hover:bg-slate-700"
            >
              <DocumentArrowUpIcon className="h-6 w-6 text-white mr-2" />
              Candidate Upload
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
