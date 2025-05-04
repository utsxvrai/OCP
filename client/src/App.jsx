import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ComplaintForm from './pages/ComplaintForm';
import ComplaintDetails from './pages/ComplaintDetails';
import TrackComplaint from './pages/TrackComplaint';
import OfficerDashboard from './pages/OfficerDashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ProjectReport from './pages/ProjectReport';

function App() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="track" element={<TrackComplaint />} />
        <Route path="project-report" element={<ProjectReport />} />
        
        {/* Protected Routes */}
        <Route path="dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route 
          path="complaints/new" 
          element={
            isAuthenticated && user?.role === 'citizen' 
              ? <ComplaintForm /> 
              : isAuthenticated && user?.role !== 'citizen'
                ? <Navigate to="/officer" />
                : <Navigate to="/login" />
          } 
        />
        <Route path="complaints/:id" element={isAuthenticated ? <ComplaintDetails /> : <Navigate to="/login" />} />
        <Route path="profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        
        {/* Officer Routes */}
        <Route 
          path="officer/*" 
          element={
            isAuthenticated && (user?.role === 'officer' || user?.role === 'admin') 
              ? <OfficerDashboard /> 
              : <Navigate to="/login" />
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="admin/*" 
          element={
            isAuthenticated && user?.role === 'admin' 
              ? <AdminDashboard /> 
              : <Navigate to="/login" />
          } 
        />
        
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
