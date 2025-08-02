import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Profile from './Profile';
import AddFood from './AddFood';
import FoodDetail from './FoodDetail';
import Chat from './Chat';
import Navbar from '../components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full max-w-md mx-auto bg-white text-black">
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add" element={<AddFood />} />
          <Route path="/food/:id" element={<FoodDetail />} />
          <Route path="/chat/:chatId" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;