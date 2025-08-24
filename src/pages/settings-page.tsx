import { useState } from "react"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  User, 
  Bell, 
  Shield, 
  Brain, 
  Palette, 
  LogOut,
  Moon,
  Cloud,
  Edit,
  Check,
  X
} from "lucide-react"

export default function SettingsPage() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [voiceSpeed, setVoiceSpeed] = useState([50])
  const [privacyLevel, setPrivacyLevel] = useState("medium")
  const [aiPersonality, setAiPersonality] = useState("friendly")
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("138****1234")

  const handleLogout = () => {
    console.log("用户退出登录")
    // 实际项目中这里会调用退出登录API
  }

  const handleSavePhone = () => {
    console.log("保存手机号:", phoneNumber)
    setIsEditingPhone(false)
  }

  const handleCancelEdit = () => {
    setIsEditingPhone(false)
    setPhoneNumber("138****1234")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="max-w-2xl mx-auto pb-20">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">设置</h1>
          
          {/* 账户设置 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                账户设置
              </CardTitle>
              <CardDescription>管理您的账户信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="phone-edit">手机号码</Label>
                {isEditingPhone ? (
                  <div className="flex items-center gap-2">
                    <Input
                      id="phone-edit"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-32"
                    />
                    <Button size="sm" onClick={handleSavePhone}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{phoneNumber}</span>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingPhone(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 通知设置 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                通知设置
              </CardTitle>
              <CardDescription>管理应用通知偏好</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">启用通知</Label>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* 隐私设置 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                隐私设置
              </CardTitle>
              <CardDescription>管理您的数据隐私</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>隐私保护级别</Label>
                <Select value={privacyLevel} onValueChange={setPrivacyLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择隐私级别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">基础保护</SelectItem>
                    <SelectItem value="medium">标准保护</SelectItem>
                    <SelectItem value="high">增强保护</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="icloud">iCloud 同步</Label>
                <Switch id="icloud" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* AI助手设置 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI助手设置
              </CardTitle>
              <CardDescription>个性化您的AI助手</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>AI个性风格</Label>
                <Select value={aiPersonality} onValueChange={setAiPersonality}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择AI风格" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">友好亲切</SelectItem>
                    <SelectItem value="professional">专业严谨</SelectItem>
                    <SelectItem value="casual">轻松随意</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>语音语速: {voiceSpeed[0]}%</Label>
                <Slider
                  value={voiceSpeed}
                  onValueChange={setVoiceSpeed}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* 外观设置 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                外观设置
              </CardTitle>
              <CardDescription>自定义应用外观</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="flex items-center">
                  <Moon className="h-4 w-4 mr-2" />
                  深色模式
                </Label>
                <Switch 
                  id="dark-mode" 
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* 退出登录 */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}