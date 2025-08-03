import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import SignUp from './SignUp';
import Profile from './Profile';
import AddFood from './AddFood';
import FoodDetail from './FoodDetail';
import Chat from './Chat';
import ChatList from './ChatList';
import { HeaderBar } from '/components/ui/header-bar';
import { UserProvider } from './UserContext';
import { NotificationProvider } from '../contexts/NotificationContext';

function AppContent() {
  const location = useLocation();
  const excludedHeaderPaths = ['/login', '/signup'];
  const showHeader = !excludedHeaderPaths.includes(location.pathname);

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-white text-black">
      {showHeader && <HeaderBar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
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
    <UserProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </UserProvider>
  );
}

export default App;