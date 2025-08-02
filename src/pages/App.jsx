import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Profile from './Profile';
import AddFood from './AddFood';
import FoodDetail from './FoodDetail';
import Chat from './Chat';
import ChatList from './ChatList';
import { HeaderBar } from '/components/ui/header-bar';

function AppContent() {
  const location = useLocation();
  const showHeader = location.pathname !== '/login';

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-white text-black">
      {showHeader && <HeaderBar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add" element={<AddFood />} />
        <Route path="/food/:id" element={<FoodDetail />} />
        <Route path="/chat/:chatId" element={<Chat />} />
        <Route path="/chats" element={<ChatList />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;