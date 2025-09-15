export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-800 border-t border-gray-20 shadow-inner transition-colors duration-300 hover:bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        {/* Left: copyright */}
        <span className="text-sm">
          © {new Date().getFullYear()} My Admin Dashboard. All rights reserved.
        </span>

        {/* Right: links */}
        <div className="mt-2 md:mt-0 flex flex-wrap gap-4 text-sm">
          {["Developer"].map((link) => (
            <a
              key={link}
              href="#"
              className="hover:text-blue-500 hover:underline transition-all duration-300"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
