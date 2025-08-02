import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Profile from './Profile';
import AddFood from './AddFood';
import FoodDetail from './FoodDetail';
import Chat from './Chat';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full max-w-md mx-auto bg-white text-black">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add" element={<AddFood />} />
          <Route path="/food/:id" element={<FoodDetail />} />
          <Route path="/chat/:chatId" element={<Chat />} />
          <Route path="/chats" element={<ChatList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;