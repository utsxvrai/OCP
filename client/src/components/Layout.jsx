import { Outlet, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';

function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Base navigation for all users
  const baseNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Project Report', href: '/project-report' },
  ];
  
  // Add Track Complaint for public and citizens, but keep it simpler for officers
  const navigation = [
    ...baseNavigation,
    ...(user?.role === 'officer' 
      ? [] // Officers don't need this link, privacy concerns
      : user?.role === 'admin'
        ? [{ name: 'All Complaints', href: '/admin/complaints' }]
        : [{ name: 'Track Complaint', href: '/track' }])
  ];

  // Define navigation based on user role
  let authenticatedNavigation = [];
  
  if (user?.role === 'citizen') {
    authenticatedNavigation = [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'File Complaint', href: '/complaints/new' },
      { name: 'Profile', href: '/profile' },
    ];
  } else if (user?.role === 'officer') {
    authenticatedNavigation = [
      { name: 'Officer Dashboard', href: '/officer' },
      { name: 'My Assigned Complaints', href: '/officer/my-complaints' },
      { name: 'Profile', href: '/profile' },
    ];
  } else if (user?.role === 'admin') {
    authenticatedNavigation = [
      { name: 'Admin Dashboard', href: '/admin' },
      { name: 'All Complaints', href: '/admin/complaints' },
      { name: 'Manage Officers', href: '/admin/officers' },
      { name: 'Profile', href: '/profile' },
    ];
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-white shadow-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Online Complaint Portal
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-primary-700"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-white hover:text-gray-300"
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated &&
              authenticatedNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-white hover:text-gray-300"
                >
                  {item.name}
                </Link>
              ))}
          </nav>

          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <span>{user?.name || 'User'}</span>
                </div>
                <button 
                  onClick={logout} 
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="bg-white text-primary hover:bg-gray-100 px-3 py-1 rounded"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-secondary hover:bg-secondary-700 text-white px-3 py-1 rounded"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-primary-700"
                  onClick={toggleMobileMenu}
                >
                  {item.name}
                </Link>
              ))}
              {isAuthenticated &&
                authenticatedNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-primary-700"
                    onClick={toggleMobileMenu}
                  >
                    {item.name}
                  </Link>
                ))}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-white hover:bg-red-700 bg-red-600"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block rounded-md px-3 py-2 text-base font-medium bg-white text-primary"
                    onClick={toggleMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block rounded-md px-3 py-2 text-base font-medium bg-secondary text-white"
                    onClick={toggleMobileMenu}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Online Complaint Portal</h3>
              <p className="text-gray-300">
                A platform to bridge the gap between citizens and government officials.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/project-report" className="text-gray-300 hover:text-white">
                    Project Report
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="text-gray-300 hover:text-white">
                    Track Complaint
                  </Link>
                </li>
                {isAuthenticated && (
                  <li>
                    <Link to="/dashboard" className="text-gray-300 hover:text-white">
                      Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-300">
                Email: support@ocportal.com
                <br />
                Phone: +91 1234567890
                <br />
                Address: 123 Main Street, City
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-center text-gray-300">
              © {new Date().getFullYear()} Online Complaint Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout; 