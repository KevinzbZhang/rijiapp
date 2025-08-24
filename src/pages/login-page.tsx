import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Shield, Smartphone, User } from "lucide-react"
import { wechatAuth } from "@/lib/wechat-auth"

interface LoginPageProps {
  onLoginSuccess: () => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleWechatLogin = async () => {
    setIsLoading(true)
    try {
      console.log("开始微信登录授权")
      
      // 检查微信环境
      if (wechatAuth.isWechatEnvironment()) {
        // 在真实微信环境中执行完整登录流程
        const openId = await wechatAuth.silentLogin()
        const userInfo = await wechatAuth.getUserInfo()
        
        console.log("微信登录成功", { openId, userInfo })
        
        // 保存用户信息到localStorage
        localStorage.setItem('wechat_user_info', JSON.stringify(userInfo))
        localStorage.setItem('wechat_auth_token', openId)
      } else {
        // 非微信环境使用模拟登录
        console.log("非微信环境，使用模拟登录")
        const userInfo = await wechatAuth.getUserInfo()
        localStorage.setItem('wechat_user_info', JSON.stringify(userInfo))
        localStorage.setItem('wechat_auth_token', 'mock_token_' + Date.now())
      }
      
      setIsLoading(false)
      onLoginSuccess() // 调用登录成功回调
    } catch (error) {
      console.error("微信登录失败:", error)
      setIsLoading(false)
      // 这里可以添加错误提示
    }
  }

  const handlePhoneAuth = async () => {
    setIsLoading(true)
    try {
      console.log("开始手机号授权")
      
      const phoneInfo = await wechatAuth.getPhoneNumber()
      console.log("手机号授权成功", phoneInfo)
      
      // 保存手机号信息
      localStorage.setItem('wechat_phone_info', JSON.stringify(phoneInfo))
      
      setIsLoading(false)
      onLoginSuccess() // 调用登录成功回调
    } catch (error) {
      console.error("手机号授权失败:", error)
      setIsLoading(false)
      // 这里可以添加错误提示
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">日迹</CardTitle>
          <CardDescription className="text-gray-600">
            记录生活点滴，倾听内心声音
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 微信授权按钮 */}
          <Button
            onClick={handleWechatLogin}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            <User className="w-5 h-5 mr-2" />
            {isLoading ? "授权中..." : "微信一键登录"}
          </Button>

          {/* 手机号快速授权按钮 */}
          <Button
            onClick={handlePhoneAuth}
            disabled={isLoading}
            variant="outline"
            className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Smartphone className="w-5 h-5 mr-2" />
            {isLoading ? "授权中..." : "手机号快速授权"}
          </Button>

          {/* 隐私协议说明 */}
          <div className="text-center text-xs text-gray-500 flex items-center justify-center flex-wrap">
            <Shield className="w-3 h-3 mr-1" />
            登录即表示您同意
            <button className="text-blue-500 hover:underline mx-1">用户协议</button>
            和
            <button className="text-blue-500 hover:underline mx-1">隐私政策</button>
          </div>

          {/* 小程序特色说明 */}
          <div className="text-center text-sm text-gray-400 mt-4">
            <p>· 微信内打开，无需下载安装</p>
            <p>· 一键授权，快速开始记录</p>
            <p>· 数据加密，隐私安全有保障</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
