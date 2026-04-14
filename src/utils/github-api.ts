import { TrendingProject, GithubTrendingData } from '@/data/ai/github-trending';

const STORAGE_KEY = 'github-trending-cache';
// 使用 GitHub 官方搜索 API
const GITHUB_API_BASE = 'https://api.github.com/search/repositories';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7天
const MAX_ITEMS = 10; // 限制返回10条

// GitHub API 返回的仓库类型
interface GithubSearchRepo {
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  owner: {
    login: string;
  };
}

// 获取缓存数据（检查是否过期）
export const getCachedTrending = (): GithubTrendingData | null => {
  if (typeof window === 'undefined') return null;

  const cached = localStorage.getItem(STORAGE_KEY);
  if (!cached) return null;

  try {
    const data = JSON.parse(cached) as GithubTrendingData;
    // 检查缓存是否过期
    const lastFetched = new Date(data.lastFetched).getTime();
    const now = Date.now();
    if (now - lastFetched > CACHE_DURATION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

// 保存到缓存
export const saveTrendingCache = (data: GithubTrendingData): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// 获取Trending数据（优先缓存，后真实API）
export const fetchTrending = async (since: 'weekly' | 'monthly'): Promise<TrendingProject[]> => {
  // 尝试从缓存获取
  const cached = getCachedTrending();
  if (cached && cached[since]?.length > 0) {
    return cached[since];
  }

  // 从真实API获取
  try {
    // 计算日期范围：weekly = 7天前，monthly = 30天前
    const days = since === 'weekly' ? 7 : 30;
    const date = new Date();
    date.setDate(date.getDate() - days);
    const dateStr = date.toISOString().split('T')[0];

    // GitHub API 查询
    const query = encodeURIComponent(`created:>${dateStr} stars:>100`);
    const response = await fetch(
      `${GITHUB_API_BASE}?q=${query}&sort=stars&order=desc&per_page=${MAX_ITEMS}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const repos = data.items as GithubSearchRepo[];

    const projects: TrendingProject[] = repos.slice(0, MAX_ITEMS).map((repo, index) => {
      const [owner, repoName] = repo.full_name.split('/');
      return {
        id: `${since === 'weekly' ? 'tw' : 'tm'}-${index + 1}`,
        owner,
        repo: repoName,
        name: repo.full_name,
        description: repo.description || '',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language || 'Unknown',
        url: repo.html_url,
      };
    });

    // 缓存数据
    const dataToCache: GithubTrendingData = {
      weekly: since === 'weekly' ? projects : cached?.weekly || [],
      monthly: since === 'monthly' ? projects : cached?.monthly || [],
      lastFetched: new Date().toISOString(),
    };
    saveTrendingCache(dataToCache);

    return projects;
  } catch (error) {
    console.error('Failed to fetch trending:', error);
    // API失败时返回空数组
    return [];
  }
};

// 获取单个项目的README
export const fetchReadme = async (owner: string, repo: string): Promise<string> => {
  try {
    // 尝试从GitHub Raw获取README
    const response = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`
    );

    if (!response.ok) {
      // 尝试 master 分支
      const masterResponse = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`
      );
      if (!masterResponse.ok) {
        return '';
      }
      return await masterResponse.text();
    }

    return await response.text();
  } catch {
    return '';
  }
};

// 提取README摘要（工作流、解决的问题）
export const extractReadmeSummary = (readme: string): { workflow?: string; solveProblem?: string } => {
  if (!readme) return {};

  const summary: { workflow?: string; solveProblem?: string } = {};

  // 简单提取：查找 "##" 开头的标题后的内容
  const lines = readme.split('\n');
  let currentSection = '';
  const sections: string[] = [];

  for (const line of lines) {
    if (line.startsWith('##')) {
      currentSection = line.replace(/^##+\s*/, '').toLowerCase();
      sections.push(currentSection);
    }
  }

  // 提取工作流相关章节
  const workflowKeywords = ['workflow', 'usage', 'how to use', 'quick start', 'getting started'];
  const problemKeywords = ['problem', 'why', 'motivation', 'background'];

  for (const section of sections) {
    let matchedWorkflow = workflowKeywords.some(kw => section.includes(kw));
    let matchedProblem = problemKeywords.some(kw => section.includes(kw));

    if (matchedWorkflow) {
      summary.workflow = section;
    }
    if (matchedProblem) {
      summary.solveProblem = section;
    }
  }

  return summary;
};

// 刷新Trending数据（强制从API获取）
export const refreshTrending = async (): Promise<GithubTrendingData> => {
  // 清除旧缓存
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }

  // 并行获取每周和每月数据
  const [weeklyProjects, monthlyProjects] = await Promise.all([
    fetchTrendingFromApi('weekly'),
    fetchTrendingFromApi('monthly'),
  ]);

  const data: GithubTrendingData = {
    weekly: weeklyProjects,
    monthly: monthlyProjects,
    lastFetched: new Date().toISOString(),
  };

  saveTrendingCache(data);
  return data;
};

// 从API获取数据（使用GitHub官方搜索API）
const fetchTrendingFromApi = async (since: 'weekly' | 'monthly'): Promise<TrendingProject[]> => {
  try {
    // 计算日期范围：weekly = 7天前，monthly = 30天前
    const days = since === 'weekly' ? 7 : 30;
    const date = new Date();
    date.setDate(date.getDate() - days);
    const dateStr = date.toISOString().split('T')[0];

    // GitHub API 查询：按 stars 排序，创建时间在指定日期之后
    const query = encodeURIComponent(`created:>${dateStr} stars:>100`);
    const response = await fetch(
      `${GITHUB_API_BASE}?q=${query}&sort=stars&order=desc&per_page=${MAX_ITEMS}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const repos = data.items as GithubSearchRepo[];

    return repos.slice(0, MAX_ITEMS).map((repo, index) => {
      const [owner, repoName] = repo.full_name.split('/');
      return {
        id: `${since === 'weekly' ? 'tw' : 'tm'}-${index + 1}`,
        owner,
        repo: repoName,
        name: repo.full_name,
        description: repo.description || '',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language || 'Unknown',
        url: repo.html_url,
      };
    });
  } catch (error) {
    console.error(`Failed to fetch ${since} trending:`, error);
    return [];
  }
};

// 获取最后更新时间
export const getLastFetchedTime = (): string | null => {
  const cached = getCachedTrending();
  return cached?.lastFetched || null;
};