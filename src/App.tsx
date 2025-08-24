import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/login-page"
import ChatPage from "./pages/chat-page"
import TimelinePage from "./pages/timeline-page"
import SettingsPage from "./pages/settings-page"
import { BottomNavigation } from "./components/bottom-navigation"
import { MessageSquare, Calendar, Settings } from "lucide-react"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // 从localStorage检查登录状态
    return !!localStorage.getItem('wechat_auth_token') || !!localStorage.getItem('wechat_user_info')
  })

  // 处理登录成功
  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    console.log("登录成功，跳转到主页面")
  }

  // 检查登录状态
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <Router>
      <div className="flex flex-col h-screen">
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <BottomNavigation />
      </div>
    </Router>
  )
}

export default App