// 硅基流动API配置
const SILICONFLOW_CONFIG = {
  API_BASE_URL: "https://api.siliconflow.cn",
  MODEL_NAME: "Qwen/Qwen3-Coder-30B-A3B-Instruct",
  API_KEY: "sk-yiwbqopzfznaxddvhcvtsxhqjneyjbighrnoklayqvmwajjv"
}

// 情感分析类型
export interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

// 对话响应类型
export interface ChatResponse {
  id: string;
  content: string;
  emotionAnalysis: EmotionAnalysis;
  summary?: string;
  suggestions?: string[];
  timestamp: Date;
}

// 用户消息类型
export interface UserMessage {
  id: string;
  content: string;
  type: 'text' | 'voice';
  timestamp: Date;
  emotion?: string;
}

// 错误处理
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// 发送消息到AI
export async function sendMessageToAI(params: {
  message: string;
  conversationHistory: Array<{ role: string; content: string }>;
}): Promise<ChatResponse> {
  const { message, conversationHistory = [] } = params;
  try {
    console.log('发送API请求到硅基流动...');
    const requestBody = {
      model: SILICONFLOW_CONFIG.MODEL_NAME,
      messages: [
        {
          role: "system",
          content: `你是一个温暖贴心的日记助手"日迹"。请用简洁自然的语言与用户交流：
1. 保持回复简短（1-2句话）
2. 先情感认同，再适当提问引导
3. 避免长篇大论和复杂句式
4. 语气温暖自然，像朋友聊天一样

示例：
用户："今天工作压力好大"
你："听起来很辛苦呢。具体是什么让你感到压力？"

用户："和朋友们玩得很开心"
你："真为你高兴！是什么样的活动这么有趣？"`
        },
        ...conversationHistory.map(msg => ({
          role: "user",
          content: msg.content
        })),
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    };

    console.log('请求体:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${SILICONFLOW_CONFIG.API_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SILICONFLOW_CONFIG.API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误详情:', response.status, response.statusText, errorText);
      throw new APIError(response.status, `API请求失败: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API响应数据:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new APIError(500, 'API响应格式错误');
    }
    
    const aiResponse = data.choices[0].message.content;

    // 情感分析（简化版）
    const emotionAnalysis = analyzeEmotion(message);
    
    // 生成摘要和建议
    const summary = generateSummary(aiResponse);
    const suggestions = generateSuggestions(emotionAnalysis);

    return {
      id: Date.now().toString(),
      content: aiResponse,
      emotionAnalysis,
      summary,
      suggestions,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('AI对话API错误:', error);
    
    // 根据错误类型返回不同的回退响应
    let fallbackResponse = "";
    if (error instanceof APIError && error.status === 401) {
      fallbackResponse = "API认证失败，请检查配置";
    } else if (error instanceof APIError && error.status === 429) {
      fallbackResponse = "请求过于频繁，请稍后再试";
    } else if (error instanceof Error && error.message.includes('network')) {
      fallbackResponse = "网络连接出现问题，请检查网络";
    } else {
      // 随机选择不同的回退响应避免重复
      const fallbackResponses = [
        "我在这里倾听，想和我聊聊发生了什么吗？",
        "听起来你有很多想法，愿意分享更多吗？",
        "我注意到你的情绪变化，想多谈谈吗？",
        "今天过得怎么样？有什么想记录的吗？",
        "我感受到你的心情，愿意多说一些吗？"
      ];
      fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
    
    return {
      id: Date.now().toString(),
      content: fallbackResponse,
      emotionAnalysis: {
        emotion: "关心",
        confidence: 0.6,
        keywords: ["倾听", "分享", "心情"],
        sentiment: 'neutral'
      },
      timestamp: new Date()
    };
  }
}

// 简化版情感分析
function analyzeEmotion(text: string): EmotionAnalysis {
  const positiveWords = ['开心', '高兴', '幸福', '快乐', '满意', '兴奋', '激动', '欣慰'];
  const negativeWords = ['难过', '悲伤', '焦虑', '紧张', '压力', '烦恼', '失望', '委屈'];
  const neutralWords = ['思考', '计划', '工作', '学习', '日常', '普通', '一般'];

  const words = text.toLowerCase().split(/\s+/);
  let emotion = '平静';
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  let confidence = 0.5;
  const keywords: string[] = [];

  // 检测关键词
  words.forEach(word => {
    if (positiveWords.includes(word)) {
      emotion = '开心';
      sentiment = 'positive';
      confidence = 0.9;
      keywords.push(word);
    } else if (negativeWords.includes(word)) {
      emotion = '焦虑';
      sentiment = 'negative';
      confidence = 0.8;
      keywords.push(word);
    } else if (neutralWords.includes(word)) {
      emotion = '平静';
      sentiment = 'neutral';
      confidence = 0.6;
      keywords.push(word);
    }
  });

  // 如果没有匹配到关键词，尝试基于文本内容判断
  if (keywords.length === 0) {
    if (text.includes('!') || text.includes('开心') || text.includes('高兴') || text.includes('快乐')) {
      emotion = '开心';
      sentiment = 'positive';
      confidence = 0.7;
    } else if (text.includes('难过') || text.includes('压力') || text.includes('焦虑') || text.includes('伤心')) {
      emotion = '焦虑';
      sentiment = 'negative';
      confidence = 0.7;
    } else if (text.includes('平静') || text.includes('日常') || text.includes('普通')) {
      emotion = '平静';
      sentiment = 'neutral';
      confidence = 0.6;
    } else {
      // 默认情绪基于AI回复内容而不是用户输入
      emotion = '思考中';
      sentiment = 'neutral';
      confidence = 0.5;
    }
  }

  return {
    emotion,
    confidence,
    keywords: keywords.length > 0 ? keywords : ['对话'],
    sentiment
  };
}

// 生成摘要
function generateSummary(response: string): string {
  // 简化版摘要生成
  const sentences = response.split(/[.!?。！？]/).filter(s => s.trim().length > 0);
  return sentences.length > 0 ? sentences[0] + '。' : '这是一次有意义的交流。';
}

// 生成建议
function generateSuggestions(emotionAnalysis: EmotionAnalysis): string[] {
  const suggestions: string[] = [];
  
  if (emotionAnalysis.sentiment === 'positive') {
    suggestions.push('继续保持这种积极的心态');
    suggestions.push('记录下这个美好的时刻');
    suggestions.push('可以和朋友分享这份喜悦');
  } else if (emotionAnalysis.sentiment === 'negative') {
    suggestions.push('尝试深呼吸放松一下');
    suggestions.push('写下来可以帮助理清思绪');
    suggestions.push('明天会更好的，保持希望');
  } else {
    suggestions.push('日常的记录也很重要');
    suggestions.push('保持思考是成长的一部分');
  }

  return suggestions;
}

// 语音转文字（模拟）
export async function speechToText(audioBlob: Blob): Promise<string> {
  // 这里应该是真实的语音识别API调用
  // 目前先返回模拟数据
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResponses = [
        "今天工作很充实，完成了重要项目",
        "心情有些焦虑，感觉压力很大",
        "和家人一起度过了愉快的周末",
        "学习到了新的知识，很有收获"
      ];
      resolve(mockResponses[Math.floor(Math.random() * mockResponses.length)]);
    }, 1000);
  });
}

// 文字转语音（模拟）
export async function textToSpeech(text: string): Promise<string> {
  // 这里应该是真实的TTS API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`data:audio/wav;base64,${btoa(text)}`);
    }, 500);
  });
}