import { Button } from "/components/ui/button"
import { Link } from "react-router-dom"

export function FoodCard({ imageSrc, label, id, onClick }) {
  return (
    <Button asChild variant="ghost" className="p-0 rounded-xl overflow-hidden bg-[#C5BAFF] h-34 w-42 flex-shrink-0 shadow">
      <Link to={`/food/${id}`} onClick={onClick} className="flex flex-col items-center">
        <img
          src={imageSrc}
          alt={label}
          className="w-full h-24 object-cover"
        />
        <div className="p-2 font-semibold text-black text-center">{label}</div>
      </Link>
    </Button>
  )
}
