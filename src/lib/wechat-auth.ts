// 微信授权登录服务
// 注意：在实际微信小程序环境中，这些API需要替换为微信官方SDK

export interface WechatAuthConfig {
  appId: string;
  scope?: 'snsapi_base' | 'snsapi_userinfo';
}

export interface WechatUserInfo {
  openId: string;
  nickName: string;
  avatarUrl: string;
  gender: number; // 1:男, 2:女, 0:未知
  province: string;
  city: string;
  country: string;
}

export interface WechatPhoneInfo {
  phoneNumber: string;
  purePhoneNumber: string;
  countryCode: string;
}

class WechatAuthService {
  private appId: string;
  private scope: string;

  constructor(config: WechatAuthConfig) {
    this.appId = config.appId;
    this.scope = config.scope || 'snsapi_userinfo';
  }

  // 检查是否在微信环境中
  isWechatEnvironment(): boolean {
    return typeof wx !== 'undefined' && typeof wx.login === 'function';
  }

  // 静默登录，获取openId
  async silentLogin(): Promise<string> {
    if (!this.isWechatEnvironment()) {
      throw new Error('不在微信环境中');
    }

    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 这里应该将code发送到后端服务器，换取openId
            // 模拟返回openId
            resolve(`mock_openid_${Date.now()}`);
          } else {
            reject(new Error('微信登录失败：' + res.errMsg));
          }
        },
        fail: (err) => {
          reject(new Error('微信登录失败：' + err.errMsg));
        }
      });
    });
  }

  // 获取用户信息（需要用户授权）
  async getUserInfo(): Promise<WechatUserInfo> {
    if (!this.isWechatEnvironment()) {
      // 模拟用户信息
      return {
        openId: 'mock_openid_123456',
        nickName: '微信用户',
        avatarUrl: '/placeholder.svg?height=100&width=100',
        gender: 0,
        province: '北京市',
        city: '北京市',
        country: '中国'
      };
    }

    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        lang: 'zh_CN',
        success: (res) => {
          const userInfo = res.userInfo;
          resolve({
            openId: res.userInfo.openId || 'mock_openid',
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            province: userInfo.province,
            city: userInfo.city,
            country: userInfo.country
          });
        },
        fail: (err) => {
          reject(new Error('获取用户信息失败：' + err.errMsg));
        }
      });
    });
  }

  // 获取手机号（需要用户主动触发）
  async getPhoneNumber(): Promise<WechatPhoneInfo> {
    if (!this.isWechatEnvironment()) {
      // 模拟手机号信息
      return {
        phoneNumber: '138****1234',
        purePhoneNumber: '13800123456',
        countryCode: '86'
      };
    }

    return new Promise((resolve, reject) => {
      // 在微信小程序中，获取手机号需要用户主动点击按钮触发
      // 这里模拟一个弹窗请求
      wx.showModal({
        title: '获取手机号',
        content: '请授权获取您的手机号',
        success: (res) => {
          if (res.confirm) {
            resolve({
              phoneNumber: '138****1234',
              purePhoneNumber: '13800123456',
              countryCode: '86'
            });
          } else {
            reject(new Error('用户拒绝授权手机号'));
          }
        }
      });
    });
  }

  // 检查登录状态
  async checkSession(): Promise<boolean> {
    if (!this.isWechatEnvironment()) {
      return true; // 非微信环境始终返回true
    }

    return new Promise((resolve) => {
      wx.checkSession({
        success: () => resolve(true),
        fail: () => resolve(false)
      });
    });
  }

  // 退出登录
  async logout(): Promise<void> {
    // 清除本地存储的登录状态
    localStorage.removeItem('wechat_auth_token');
    localStorage.removeItem('wechat_user_info');
    localStorage.removeItem('wechat_phone_info');
    
    if (this.isWechatEnvironment()) {
      // 在微信环境中，可以调用相关清理方法
      console.log('微信环境退出登录');
    }
  }
}

// 创建默认的微信授权服务实例
export const wechatAuth = new WechatAuthService({
  appId: 'wx_your_app_id_here', // 需要替换为实际的AppID
  scope: 'snsapi_userinfo'
});

export default wechatAuth;