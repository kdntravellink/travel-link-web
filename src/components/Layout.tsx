import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, LogOut, User, PlusCircle, Map, TrendingUp, MessageSquare, Heart, Compass, Building2 } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <MapPin className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">TravelLink</span>
              </Link>
              
              <div className="hidden md:flex space-x-4">
                <Link
                  to="/explore"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                >
                  <Map className="w-4 h-4" />
                  <span>Explore</span>
                </Link>
                
                <Link
                  to="/trending"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending</span>
                </Link>
                
                <Link
                  to="/businesses"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Businesses</span>
                </Link>
                
                <Link
                  to="/forum"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Forum</span>
                </Link>
                
                {user && (
                  <>
                    <Link
                      to="/trips"
                      className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    >
                      <Compass className="w-4 h-4" />
                      <span>My Trips</span>
                    </Link>
                    
                    <Link
                      to="/wishlist"
                      className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Wishlist</span>
                    </Link>
                    
                    <Link
                      to="/add-location"
                      className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Location</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{user.full_name}</span>
                  </Link>
                  
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
