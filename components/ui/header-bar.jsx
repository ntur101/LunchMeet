import { Input } from "/components/ui/input"
import { Button } from "/components/ui/button"
import { House, MessageCircle, Search } from "lucide-react"
import { Link } from "react-router-dom"

export function HeaderBar() {
  return (
    <div className="w-full flex items-center justify-between bg-[#C5BAFF] px-4 py-3 space-x-2">
      {/* Left icon */}
      <Link to="/">
        <div className="rounded-xl p-2 hover:bg-gray-100 transition">
          <House className="h-5 w-5 text-gray-500" />
        </div>
      </Link>

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
        <div className="rounded-xl p-2 hover:bg-gray-100 transition">
          <MessageCircle className="h-5 w-5 text-gray-500" />
        </div>
      </Link>
    </div>
  )
}