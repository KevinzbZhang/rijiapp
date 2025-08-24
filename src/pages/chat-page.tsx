import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, Send, Square, Brain, User, Bot, Sparkles, Play, Pause, Volume2, Keyboard, MicOff } from "lucide-react"
import { sendMessageToAI, speechToText, type UserMessage, type ChatResponse } from "@/lib/siliconflow-api"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  emotion?: string
  emotionAnalysis?: {
    emotion: string
    confidence: number
    sentiment: 'positive' | 'negative' | 'neutral'
  }
  summary?: string
  suggestions?: string[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    // 从localStorage加载聊天记录
    const savedMessages = localStorage.getItem('chat-messages')
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages)
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }
    return [
      {
        id: "1",
        content: "你好！今天有什么特别的事想聊聊吗？",
        sender: "ai",
        timestamp: new Date(),
        emotion: "friendly"
      }
    ]
  })
  const [inputText, setInputText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice") // 默认语音模式
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 保存聊天记录到localStorage
  useEffect(() => {
    const messagesToSave = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }))
    localStorage.setItem('chat-messages', JSON.stringify(messagesToSave))
  }, [messages])

  // 初始化语音识别
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'zh-CN'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputText(transcript)
        handleSendMessage(transcript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('语音识别错误:', event.error)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    }
  }, [])

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('您的浏览器不支持语音识别功能')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  const handleSendMessage = async (text?: string) => {
    const messageContent = text || inputText.trim()
    if (!messageContent) return

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText("")
    setIsAIThinking(true)

    try {
      // 发送到AI
      const response = await sendMessageToAI({
        message: messageContent,
        conversationHistory: messages.slice(-10).map(msg => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.content
        }))
      })

      // 添加AI回复
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        sender: "ai",
        timestamp: new Date(),
        emotionAnalysis: response.emotionAnalysis,
        summary: response.summary,
        suggestions: response.suggestions
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('发送消息失败:', error)
      // 添加错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "抱歉，我暂时无法处理您的请求，请稍后再试。",
        sender: "ai",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsAIThinking(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'happy': return 'text-green-500'
      case 'sad': return 'text-blue-500'
      case 'angry': return 'text-red-500'
      case 'surprised': return 'text-yellow-500'
      case 'neutral': return 'text-gray-500'
      default: return 'text-gray-400'
    }
  }

  const getEmotionIcon = (emotion?: string) => {
    switch (emotion) {
      case 'happy': return '😊'
      case 'sad': return '😢'
      case 'angry': return '😠'
      case 'surprised': return '😲'
      case 'neutral': return '😐'
      default: return '💭'
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* 头部标题 */}
      <div className="p-4 bg-white dark:bg-gray-900 border-b">
        <div className="flex items-center justify-center">
          <Brain className="h-6 w-6 text-purple-500 mr-2" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">倾诉</h1>
        </div>
      </div>

      {/* 消息区域 */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white border"
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.sender === "ai" && (
                    <div className="flex-shrink-0">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-purple-500 text-white">
                          <Bot className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    
                    {message.emotionAnalysis && (
                      <div className="flex items-center mt-1 text-xs opacity-75">
                        <span className={getEmotionColor(message.emotionAnalysis.emotion)}>
                          {getEmotionIcon(message.emotionAnalysis.emotion)}
                        </span>
                        <span className="ml-1 text-gray-500">
                          {message.emotionAnalysis.emotion}
                        </span>
                      </div>
                    )}
                  </div>

                  {message.sender === "user" && (
                    <div className="flex-shrink-0">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-blue-500 text-white">
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
                
                <div className="text-xs opacity-50 mt-1 text-right">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isAIThinking && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl border">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">思考中...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 输入区域 - 修复底部遮挡问题 */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t pb-20"> {/* 添加底部内边距避免被导航栏遮挡 */}
        {/* 语音输入为主的设计 */}
        {inputMode === 'voice' ? (
          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={handleVoiceInput}
              className={`rounded-full h-24 w-24 transition-all duration-300 ${
                isRecording 
                  ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-xl" 
                  : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg"
              }`}
            >
              {isRecording ? (
                <Square className="h-10 w-10 text-white" />
              ) : (
                <Mic className="h-10 w-10 text-white" />
              )}
            </Button>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isRecording ? "正在录音中..." : "点击开始语音倾诉"}
            </p>
            
            {/* 切换到文字输入 */}
            <Button
              onClick={() => setInputMode('text')}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Keyboard className="h-4 w-4 mr-1" />
              切换到文字输入
            </Button>
          </div>
        ) : (
          /* 文字输入模式 */
          <div className="flex flex-col space-y-3">
            <div className="flex space-x-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入你想说的话..."
                className="flex-1 h-12 rounded-full"
              />
              
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="rounded-full h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            
            {/* 切换到语音输入 */}
            <div className="flex justify-center">
              <Button
                onClick={() => setInputMode('voice')}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Mic className="h-4 w-4 mr-1" />
                切换到语音输入
              </Button>
            </div>
          </div>
        )}
        
        {isRecording && (
          <div className="text-center mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${Math.random() * 60 + 40}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">正在聆听...</p>
          </div>
        )}
      </div>
    </div>
  )
}