import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, Search, Heart, X, User } from 'lucide-react';

interface NavbarProps {
  cartItemsCount: number;
  wishlistCount: number;
  onCartClick: () => void;
  onWishlistClick: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  isAuthenticated: boolean;
  userRole: 'user' | 'admin' | 'branch' | 'company';
  onSignOut: () => void;
  currentUser: { firstName: string; lastName: string } | null;
}

export default function Navbar({
  cartItemsCount,
  wishlistCount,
  onCartClick,
  onWishlistClick,
  onSearch,
  searchQuery,
  isAuthenticated,
  userRole,
  onSignOut,
  currentUser
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Categories', href: '/categories' },
    { name: 'Prescriptions', href: '/prescriptions' },
    { name: 'My Orders', href: '/orders' },
    { name: 'Contact Us', href: '/contact' },
  ];

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin':
        return { name: 'Admin Dashboard', href: '/admin' };
      case 'branch':
        return { name: 'Branch Dashboard', href: '/branch' };
      case 'company':
        return { name: 'Company Dashboard', href: '/company' };
      default:
        return null;
    }
  };

  const dashboardLink = getDashboardLink();

  return (
    <>
      <nav className="bg-white shadow-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <Link to="/" className="text-2xl font-bold text-blue-600 ml-4">MedCare</Link>
            </div>
            
            <div className="hidden md:flex items-center flex-1 mx-8">
              <div className="relative flex-1 max-w-xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search medicines..."
                  className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {dashboardLink && (
                    <Link
                      to={dashboardLink.href}
                      className="hidden md:block text-sm font-medium text-gray-700 hover:text-blue-600"
                    >
                      {dashboardLink.name}
                    </Link>
                  )}
                  {userRole === 'admin' && (
                    <Link
                      to="/admin/manage-companies"
                      className="hidden md:block text-sm font-medium text-gray-700 hover:text-blue-600"
                    >
                      Manage Companies
                    </Link>
                  )}
                  <Link to="/profile" className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Profile'}
                    </span>
                  </Link>
                  <button
                    onClick={onSignOut}
                    className="hidden md:block text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/signin"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Sign In
                </Link>
              )}
              <div className="relative cursor-pointer" onClick={onWishlistClick}>
                <Heart className="h-6 w-6 text-gray-600" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <div className="relative cursor-pointer" onClick={onCartClick}>
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity duration-300 z-40 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />
      
      {/* Mobile menu panel */}
      <div
        className={`fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Mobile search */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search medicines..."
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <nav className="px-2 py-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`block px-4 py-3 rounded-md ${
                location.pathname === item.href
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {dashboardLink && (
            <Link
              to={dashboardLink.href}
              className={`block px-4 py-3 rounded-md ${
                location.pathname === dashboardLink.href
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {dashboardLink.name}
            </Link>
          )}
          {userRole === 'admin' && (
            <Link
              to="/admin/manage-companies"
              className={`block px-4 py-3 rounded-md ${
                location.pathname === '/admin/manage-companies'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Manage Companies
            </Link>
          )}

          {isAuthenticated ? (
            <button
              onClick={() => { onSignOut(); setIsMenuOpen(false); }}
              className="block px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/signin"
              className="block px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}