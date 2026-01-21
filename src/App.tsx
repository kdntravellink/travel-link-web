import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import 'leaflet/dist/leaflet.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import AddLocation from './pages/AddLocation';
import LocationDetail from './pages/LocationDetail';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Trending from './pages/Trending';
import Forum from './pages/Forum';
import ForumPostDetail from './pages/ForumPostDetail';
import NewForumPost from './pages/NewForumPost';
import MyTrips from './pages/MyTrips';
import NewTrip from './pages/NewTrip';
import Wishlist from './pages/Wishlist';
import Businesses from './pages/Businesses';
import BusinessDetail from './pages/BusinessDetail';
import AddBusiness from './pages/AddBusiness';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={<Explore />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/locations/:id" element={<LocationDetail />} />
        <Route
          path="/add-location"
          element={
            <ProtectedRoute>
              <AddLocation />
            </ProtectedRoute>
          }
        />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:id" element={<ForumPostDetail />} />
        <Route
          path="/forum/new"
          element={
            <ProtectedRoute>
              <NewForumPost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <MyTrips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/new"
          element={
            <ProtectedRoute>
              <NewTrip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route path="/businesses" element={<Businesses />} />
        <Route path="/businesses/:id" element={<BusinessDetail />} />
        <Route
          path="/businesses/new"
          element={
            <ProtectedRoute>
              <AddBusiness />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
