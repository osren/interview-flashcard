const INTRO_SEEN_KEY = 'if-intro-seen';

/** 是否已经看过使用介绍；localStorage 不可用时按已看过处理，避免反复跳转 */
export function hasSeenIntro(): boolean {
  try {
    return localStorage.getItem(INTRO_SEEN_KEY) === '1';
  } catch {
    return true;
  }
}

export function markIntroSeen(): void {
  try {
    localStorage.setItem(INTRO_SEEN_KEY, '1');
  } catch {
    // 存储被禁用时忽略，不影响进入工作台
  }
}
