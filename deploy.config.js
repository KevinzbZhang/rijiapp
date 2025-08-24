// 部署配置文件
export default {
  // 构建配置
  build: {
    outputDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild'
  },

  // 服务器配置
  server: {
    port: 3000,
    host: '0.0.0.0'
  },

  // 环境变量
  env: {
    NODE_ENV: 'production',
    VITE_APP_TITLE: '日迹日记',
    VITE_APP_VERSION: '1.0.0'
  },

  // CDN配置
  cdn: {
    enabled: false,
    domain: 'https://cdn.yourdomain.com'
  },

  // 监控配置
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN
    }
  },

  // 数据库配置
  database: {
    // Supabase配置
    supabase: {
      url: process.env.VITE_SUPABASE_URL,
      key: process.env.VITE_SUPABASE_ANON_KEY
    },

    // 备份配置
    backup: {
      enabled: true,
      schedule: '0 2 * * *', // 每天凌晨2点
      retention: 30 // 保留30天
    }
  },

  // 安全配置
  security: {
    cors: {
      origin: ['https://yourdomain.com'],
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100 // 每个IP最多100个请求
    }
  },

  // 性能优化
  performance: {
    compression: true,
    cache: {
      static: '1 year',
      dynamic: '1 hour'
    }
  }
}