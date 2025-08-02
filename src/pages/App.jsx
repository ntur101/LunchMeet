import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import ProfilePage from './ProfilePage';
import AddFoodPage from './AddFoodPage';
import FoodDetailPage from './FoodDetailPage';
import ChatPage from './ChatPage';
import Navbar from '../components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full max-w-md mx-auto bg-white text-black">
        <Navbar />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/add" element={<AddFoodPage />} />
          <Route path="/food/:id" element={<FoodDetailPage />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;