import { Input } from "/components/ui/input"
import { Button } from "/components/ui/button"
import { CircleUserRound, House, MessageCircle, Search } from "lucide-react"
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom";


export function HeaderBar() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 space-x-2">
      
      {isHome ? (
        // Show Profile icon on Home
        <Link to="/profile">
          <div className="rounded-xl p-2 hover:bg-white transition">
            <CircleUserRound className="h-7 w-7 " />
          </div>
        </Link>
      ) : (
        // Show Home icon on other pages
        <Link to="/">
          <div className="rounded-xl p-2 hover:bg-white transition">
            <House className="h-7 w-7 " />
          </div>
        </Link>
      )}


      {/* Search bar */}
      <div className="relative flex-1 bg-white rounded-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for food"
          className="pl-8 h-9 text-sm text-gray-600 placeholder:text-gray-400 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {/* Right icon */}
      <Link to="/chats">
        <div className="rounded-xl p-2 hover:bg-white transition">
          <MessageCircle className="h-7 w-7 " />
        </div>
      </Link>
    </div>
  )
}