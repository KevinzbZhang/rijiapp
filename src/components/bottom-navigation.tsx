import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { MessageSquare, Calendar, Settings } from "lucide-react"

export function BottomNavigation() {
  const location = useLocation()

  const navItems = [
    {
      path: "/chat",
      icon: MessageSquare,
      label: "倾诉",
      active: location.pathname === "/chat"
    },
    {
      path: "/timeline",
      icon: Calendar,
      label: "日迹",
      active: location.pathname === "/timeline"
    },
    {
      path: "/settings",
      icon: Settings,
      label: "设置",
      active: location.pathname === "/settings"
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Button
            key={item.path}
            asChild
            variant={item.active ? "default" : "ghost"}
            className={`flex flex-col items-center h-14 w-20 ${
              item.active
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Link to={item.path}>
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  )
}