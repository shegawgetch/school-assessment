export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 shadow-inner mt-2 rounded-lg mb-1">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        <span>© {new Date().getFullYear()} My Admin Dashboard</span>
        <div className="mt-2 md:mt-0 space-x-4">
          <a href="#" className="hover:text-indigo-600">
            developer
          </a>
        </div>
      </div>
    </footer>
  );
}
