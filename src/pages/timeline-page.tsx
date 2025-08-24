import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, BarChart3, ChevronLeft, ChevronRight, Heart, Smile, Frown } from "lucide-react"

interface DiaryEntry {
  id: string
  date: Date
  content: string
  emotion: string
  emotionColor: string
  summary: string
  events: string[]
  reflections: string[]
}

const mockData: DiaryEntry[] = [
  {
    id: "1",
    date: new Date(2024, 7, 24),
    content: "今天工作很充实，完成了项目的重要里程碑，晚上和团队一起庆祝。感觉自己的努力得到了回报，很有成就感。",
    emotion: "开心",
    emotionColor: "bg-green-500",
    summary: "充满成就感的一天，工作生活平衡良好",
    events: ["完成项目里程碑", "团队庆祝晚餐", "收到领导表扬"],
    reflections: ["团队合作很重要", "适当的庆祝能提升士气", "努力终有回报"]
  },
  {
    id: "2",
    date: new Date(2024, 7, 23),
    content: "遇到了一些技术难题，但通过学习和请教同事最终解决了问题。虽然过程有些曲折，但学到了很多新知识。",
    emotion: "平静",
    emotionColor: "bg-blue-500",
    summary: "克服技术挑战，学习成长的一天",
    events: ["解决技术难题", "学习新技术", "与同事讨论方案"],
    reflections: ["遇到问题不要慌，方法总比困难多", "团队协作很重要", "持续学习是必要的"]
  },
  {
    id: "3",
    date: new Date(2024, 7, 22),
    content: "心情有些焦虑，项目 deadline 临近，感觉时间不够用。压力很大，担心不能按时完成任务。",
    emotion: "焦虑",
    emotionColor: "bg-yellow-500",
    summary: "压力较大，需要更好的时间管理",
    events: ["项目进度紧张", "加班工作", "紧急会议"],
    reflections: ["需要提前规划时间", "适当放松也很重要", "及时沟通进度问题"]
  },
  {
    id: "4",
    date: new Date(2024, 7, 21),
    content: "今天休息日，和家人一起去了公园散步，享受了美好的家庭时光。天气很好，心情也很放松。",
    emotion: "放松",
    emotionColor: "bg-purple-500",
    summary: "愉快的家庭日，享受生活美好时刻",
    events: ["公园散步", "家庭聚餐", "看电影"],
    reflections: ["工作生活平衡很重要", "家人陪伴很珍贵", "适当休息能提高工作效率"]
  },
  {
    id: "5",
    date: new Date(2024, 7, 20),
    content: "今天遇到了一些人际关系上的困扰，感觉有些委屈和不被理解。需要调整心态，学会更好地沟通。",
    emotion: "委屈",
    emotionColor: "bg-pink-500",
    summary: "人际关系挑战，需要更好的沟通方式",
    events: ["团队讨论", "意见分歧", "自我反思"],
    reflections: ["沟通需要技巧", "换位思考很重要", "情绪管理需要练习"]
  }
]

export default function TimelinePage() {
  const [timeView, setTimeView] = useState<"day" | "week" | "month" | "year">("day")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)

  const getTimeRangeText = () => {
    switch (timeView) {
      case "day":
        return currentDate.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      case "week":
        return `第${getWeekNumber(currentDate)}周`
      case "month":
        return currentDate.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long"
        })
      case "year":
        return currentDate.getFullYear().toString()
      default:
        return ""
    }
  }

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  const navigateTime = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    switch (timeView) {
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
        break
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
        break
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
        break
      case "year":
        newDate.setFullYear(newDate.getFullYear() + (direction === "next" ? 1 : -1))
        break
    }
    setCurrentDate(newDate)
  }

  const getSummaryForTimeRange = () => {
    let entries: DiaryEntry[] = []
    
    switch (timeView) {
      case "day":
        entries = mockData.filter(entry => 
          entry.date.toDateString() === currentDate.toDateString()
        )
        break
      case "week":
        const weekStart = new Date(currentDate)
        weekStart.setDate(currentDate.getDate() - currentDate.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        
        entries = mockData.filter(entry => 
          entry.date >= weekStart && entry.date <= weekEnd
        )
        break
      case "month":
        entries = mockData.filter(entry => 
          entry.date.getMonth() === currentDate.getMonth() && 
          entry.date.getFullYear() === currentDate.getFullYear()
        )
        break
      case "year":
        entries = mockData.filter(entry => 
          entry.date.getFullYear() === currentDate.getFullYear()
        )
        break
    }

    if (entries.length === 0) {
      return `本${timeView === "day" ? "日" : timeView === "week" ? "周" : timeView === "month" ? "月" : "年"}还没有记录，去倾诉页面开始记录吧！`
    }

    const emotions = entries.map(entry => entry.emotion)
    const uniqueEmotions = [...new Set(emotions)]
    const emotionCounts: Record<string, number> = {}
    
    emotions.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
    })

    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0][0]

    const totalEvents = entries.reduce((acc, entry) => acc + entry.events.length, 0)
    const totalReflections = entries.reduce((acc, entry) => acc + entry.reflections.length, 0)

    return `本${timeView === "day" ? "日" : timeView === "week" ? "周" : timeView === "month" ? "月" : "年"}记录了${entries.length}条日记，主要情绪：${uniqueEmotions.join("、")}。共记录${totalEvents}个事件和${totalReflections}条反思。主导情绪是${dominantEmotion}。`
  }

  const getFilteredEntries = () => {
    return mockData.filter(entry => {
      switch (timeView) {
        case "day":
          return entry.date.toDateString() === currentDate.toDateString()
        case "week":
          const weekStart = new Date(currentDate)
          weekStart.setDate(currentDate.getDate() - currentDate.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          return entry.date >= weekStart && entry.date <= weekEnd
        case "month":
          return entry.date.getMonth() === currentDate.getMonth() && 
                 entry.date.getFullYear() === currentDate.getFullYear()
        case "year":
          return entry.date.getFullYear() === currentDate.getFullYear()
        default:
          return true
      }
    }).sort((a, b) => b.date.getTime() - a.date.getTime())
  }


  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case "开心": return <Smile className="h-4 w-4 text-green-600" />
      case "平静": return <Heart className="h-4 w-4 text-blue-600" />
      case "焦虑": return <Frown className="h-4 w-4 text-yellow-600" />
      case "放松": return <Heart className="h-4 w-4 text-purple-600" />
      case "委屈": return <Frown className="h-4 w-4 text-pink-600" />
      default: return <Heart className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部控制栏 */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-purple-500" />
                <h1 className="text-2xl font-bold text-gray-800">日迹时光</h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTime("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-lg font-semibold text-gray-700">
                  {getTimeRangeText()}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTime("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 时间视图切换 */}
            <Tabs value={timeView} onValueChange={(v) => setTimeView(v as any)}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="day" className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  日
                </TabsTrigger>
                <TabsTrigger value="week" className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  周
                </TabsTrigger>
                <TabsTrigger value="month" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  月
                </TabsTrigger>
                <TabsTrigger value="year" className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  年
                </TabsTrigger>
              </TabsList>
            </Tabs>

          </CardContent>
        </Card>

        {/* 时间段摘要 */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-purple-100 to-blue-100">
          <CardContent className="p-6">
            <CardDescription className="text-sm text-gray-600 mb-2">
              时段摘要 · {timeView === "day" ? "今日" : `本${timeView === "week" ? "周" : timeView === "month" ? "月" : "年"}`}
            </CardDescription>
            <p className="text-gray-800 leading-relaxed">
              {getSummaryForTimeRange()}
            </p>
          </CardContent>
        </Card>

        {/* 时间轴内容 */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="w-2 h-6 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full mr-2"></div>
              时间河流
            </CardTitle>
            <CardDescription>
              沿着时间线回顾你的心路历程 · {getFilteredEntries().length} 条记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {getFilteredEntries().length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>当前时间段暂无记录</p>
                  <p className="text-sm">去倾诉页面开始记录吧</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredEntries().map((entry, index, array) => (
                    <div key={entry.id} className="flex group">
                      {/* 时间线标记 */}
                      <div className="flex flex-col items-center mr-4">
                        <div 
                          className={`w-6 h-6 rounded-full ${entry.emotionColor} border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
                          onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                        >
                          {getEmotionIcon(entry.emotion)}
                        </div>
                        {index < array.length - 1 && (
                          <div className="w-1 h-16 bg-gradient-to-b from-gray-300 to-gray-100 my-1"></div>
                        )}
                      </div>
                      
                      {/* 日记卡片 */}
                      <Card className={`flex-1 border-0 shadow-md hover:shadow-lg transition-all duration-300 ${
                        selectedEntry?.id === entry.id ? 'ring-2 ring-purple-400 bg-purple-50' : 'bg-white'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700">
                                {entry.date.toLocaleDateString("zh-CN", {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              <span className="text-xs text-gray-500">
                                {entry.date.toLocaleTimeString("zh-CN", {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              entry.emotionColor.replace("bg-", "text-").split(" ")[0]
                            } bg-opacity-20 border ${
                              entry.emotionColor.replace("bg-", "border-").split(" ")[0]
                            }`}>
                              {entry.emotion}
                            </span>
                          </div>
                          
                          <p className="text-gray-800 mb-3 leading-relaxed">{entry.content}</p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <span className="font-medium text-blue-700">📝 事件：</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {entry.events.map((event, i) => (
                                  <span key={i} className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs border border-blue-200">
                                    {event}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="bg-green-50 p-3 rounded-lg">
                              <span className="font-medium text-green-700">💭 反思：</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {entry.reflections.map((reflection, i) => (
                                  <span key={i} className="bg-white text-green-600 px-2 py-1 rounded-full text-xs border border-green-200">
                                    {reflection}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {selectedEntry?.id === entry.id && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                              <h4 className="font-medium text-purple-700 mb-2">✨ AI摘要</h4>
                              <p className="text-sm text-purple-600">{entry.summary}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}