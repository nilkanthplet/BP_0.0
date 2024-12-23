import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function ExpandableNavLayout({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen">
      {/* Navbar */}
      <nav
        className={`bg-transparent backdrop-blur-sm bg-opacity-20 text-gray-700 h-screen transition-all duration-300 ease-in-out border-r border-gray-200 sticky top-0
          ${isExpanded ? 'w-64' : 'w-16'}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <ul className="flex flex-col h-full pt-4">
          {[
            { to: "/", label: "Home", icon: "🏠", hoverColor: "hover:bg-blue-300 hover:text-blue-700" },
            { to: "/udharchallan", label: "ઉધાર ચલણ", icon: "📝", hoverColor: "hover:bg-purple-300 hover:text-purple-700" },
            { to: "/jamachallan", label: "જમા ચલણ", icon: "💰", hoverColor: "hover:bg-green-300 hover:text-green-700" },
            { to: "/khatawahi", label: "ખાતાવહી", icon: "📊", hoverColor: "hover:bg-orange-300 hover:text-orange-700" },
            { to: "/rojmel", label: "રોજમેલ(સ્ટોક)", icon: "📦", hoverColor: "hover:bg-pink-300 hover:text-pink-700" },
            { to: "/bills", label: "બિલ", icon: "💳", hoverColor: "hover:bg-teal-300 hover:text-teal-700" }
          ].map((item, index) => (
            <li key={index} className="w-full">
              <Link
                to={item.to}
                className={`
                  flex items-center
                  ${isExpanded ? 'justify-start px-6' : 'justify-center'}
                  py-3
                  ${item.hoverColor}
                  transition-all duration-300 ease-in-out
                  relative
                  rounded-l-full
                  my-1
                  mx-2
                  ${isActive(item.to) ? 'bg-gray-100 font-semibold' : ''}
                  ${isActive(item.to) ? item.hoverColor.split(' ')[1] : ''}
                `}
              >
                <span className={`text-xl mr-3 transition-transform duration-300 ${isActive(item.to) ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span
                  className={`
                    whitespace-nowrap
                    overflow-hidden
                    transition-all duration-300 ease-in-out
                    ${isExpanded ? 'max-w-full opacity-100' : 'max-w-0 opacity-0'}
                  `}
                >
                  {item.label}
                </span>
                {!isExpanded && isActive(item.to) && (
                  <div className="absolute left-14 bg-white px-3 py-1 rounded-md shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.label}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ease-in-out`}>
        {children}
      </main>
    </div>
  );
}

export default ExpandableNavLayout;