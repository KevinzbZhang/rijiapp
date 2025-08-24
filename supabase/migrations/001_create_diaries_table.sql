-- 创建日记表
CREATE TABLE IF NOT EXISTS diaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  emotion VARCHAR(50) NOT NULL,
  sentiment VARCHAR(10) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);
CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON diaries(created_at);
CREATE INDEX IF NOT EXISTS idx_diaries_emotion ON diaries(emotion);
CREATE INDEX IF NOT EXISTS idx_diaries_sentiment ON diaries(sentiment);

-- 启用行级安全
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的日记
CREATE POLICY "用户只能访问自己的日记" ON diaries
  FOR ALL USING (auth.uid() = user_id);

-- 创建策略：用户可以插入自己的日记
CREATE POLICY "用户可以插入自己的日记" ON diaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户可以更新自己的日记
CREATE POLICY "用户可以更新自己的日记" ON diaries
  FOR UPDATE USING (auth.uid() = user_id);

-- 创建策略：用户可以删除自己的日记
CREATE POLICY "用户可以删除自己的日记" ON diaries
  FOR DELETE USING (auth.uid() = user_id);

-- 创建更新时间的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_diaries_updated_at
  BEFORE UPDATE ON diaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建统计视图
CREATE OR REPLACE VIEW diary_stats AS
SELECT 
  user_id,
  COUNT(*) as total_entries,
  COUNT(DISTINCT DATE(created_at)) as active_days,
  AVG(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive_ratio,
  AVG(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_ratio,
  AVG(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral_ratio,
  MAX(created_at) as last_entry
FROM diaries
GROUP BY user_id;

-- 创建情绪统计视图
CREATE OR REPLACE VIEW emotion_stats AS
SELECT 
  user_id,
  emotion,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY user_id), 2) as percentage
FROM diaries
GROUP BY user_id, emotion;

COMMENT ON TABLE diaries IS '用户日记表';
COMMENT ON COLUMN diaries.content IS '日记内容';
COMMENT ON COLUMN diaries.emotion IS '情绪标签';
COMMENT ON COLUMN diaries.sentiment IS '情感极性';
COMMENT ON COLUMN diaries.summary IS 'AI生成的摘要';
COMMENT ON COLUMN diaries.tags IS '标签数组';