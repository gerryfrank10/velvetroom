import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import '@/App.css';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import PostListing from './pages/PostListing';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Messages from './pages/Messages';
import About from './pages/About';
import Contact from './pages/Contact';
import Support from './pages/Support';
import UserProfile from './pages/UserProfile';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App min-h-screen bg-[#050505]">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/post" element={<PostListing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
          <Toaster position="top-right" theme="dark" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
