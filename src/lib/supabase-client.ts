import { createClient } from '@supabase/supabase-js'

// Supabase配置 - 需要替换为您的实际配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 用户相关操作
export const authService = {
  // 获取当前用户
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // 注册新用户
  signUp: async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    if (error) throw error
    return data
  },

  // 登录
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  // 退出登录
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}

// 日记相关操作
export const diaryService = {
  // 获取用户的所有日记
  getDiaries: async (userId: string) => {
    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // 创建新日记
  createDiary: async (diaryData: {
    user_id: string
    content: string
    emotion: string
    sentiment: 'positive' | 'negative' | 'neutral'
    summary?: string
    tags?: string[]
  }) => {
    const { data, error } = await supabase
      .from('diaries')
      .insert([diaryData])
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // 更新日记
  updateDiary: async (id: string, updates: Partial<{
    content: string
    emotion: string
    sentiment: string
    summary: string
    tags: string[]
  }>) => {
    const { data, error } = await supabase
      .from('diaries')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data?.[0]
  },

  // 删除日记
  deleteDiary: async (id: string) => {
    const { error } = await supabase
      .from('diaries')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // 按情绪筛选日记
  getDiariesByEmotion: async (userId: string, emotion: string) => {
    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', userId)
      .eq('emotion', emotion)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // 按日期范围获取日记
  getDiariesByDateRange: async (userId: string, startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// 实时订阅功能
export const realtimeService = {
  // 订阅日记变化
  subscribeToDiaries: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('diaries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diaries',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}

// 统计和分析功能
export const analyticsService = {
  // 获取情绪统计
  getEmotionStats: async (userId: string) => {
    const { data, error } = await supabase
      .from('diaries')
      .select('emotion, sentiment, created_at')
      .eq('user_id', userId)
    
    if (error) throw error
    
    const stats = data.reduce((acc, diary) => {
      acc[diary.emotion] = (acc[diary.emotion] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return stats
  },

  // 获取月度统计
  getMonthlyStats: async (userId: string) => {
    const { data, error } = await supabase
      .from('diaries')
      .select('emotion, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    
    if (error) throw error
    
    return data.reduce((acc, diary) => {
      const date = new Date(diary.created_at).toLocaleDateString('zh-CN')
      if (!acc[date]) acc[date] = {}
      acc[date][diary.emotion] = (acc[date][diary.emotion] || 0) + 1
      return acc
    }, {} as Record<string, Record<string, number>>)
  }
}