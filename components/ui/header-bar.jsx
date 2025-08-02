import { Input } from "/components/ui/input"
import { House, MessageCircle, Search } from "lucide-react" // Example icon

export function HeaderBar() {
  return (
    <div className="w-full flex items-center justify-end space-x-2 bg-[#C5BAFF] p-4">
      <button className="p-1 rounded-md hover:bg-gray-100">
        <House className="h-full text-gray-500" />
      </button>
      <div className="relative w-full bg-white">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for food"
          className="pl-8 h-7 text-sm text-gray-600 placeholder:text-gray-400 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {/* Icon to the right */}
      <button className="p-1 rounded-md hover:bg-gray-100">
        <MessageCircle className="h-full text-gray-500" />
      </button>
    </div>
  )
}
