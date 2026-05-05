import { FlashCard } from '@/types';

export interface TrendingProject {
  id: string;
  owner: string;
  repo: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  url: string;
  readme?: string;
  fetchedAt?: string;
}

// GitHub Trending 数据类型
export interface GithubTrendingData {
  weekly: TrendingProject[];
  monthly: TrendingProject[];
  lastFetched: string;
}

// 示例数据（用于演示）
export const sampleTrendingData: GithubTrendingData = {
  weekly: [
    {
      id: 'tw-001',
      owner: 'anthropic',
      repo: 'claude-code',
      name: 'anthropic/claude-code',
      description: 'Official CLI for Claude, your AI coding partner',
      stars: 15234,
      forks: 892,
      language: 'TypeScript',
      url: 'https://github.com/anthropic/claude-code',
    },
    {
      id: 'tw-002',
      owner: 'Vercel',
      repo: 'v0',
      name: 'vercel/v0',
      description: 'v0: Generative UI - Create beautiful UIs with a text prompt',
      stars: 8923,
      forks: 456,
      language: 'TypeScript',
      url: 'https://github.com/vercel/v0',
    },
    {
      id: 'tw-003',
      owner: 'open-webui',
      repo: 'open-webui',
      name: 'open-webui/open-webui',
      description: 'User-friendly WebUI for LLMs with full Ollama support',
      stars: 12567,
      forks: 2341,
      language: 'Python',
      url: 'https://github.com/open-webui/open-webui',
    },
  ],
  monthly: [
    {
      id: 'tm-001',
      owner: 'anthropic',
      repo: 'claude-code',
      name: 'anthropic/claude-code',
      description: 'Official CLI for Claude, your AI coding partner',
      stars: 15234,
      forks: 892,
      language: 'TypeScript',
      url: 'https://github.com/anthropic/claude-code',
    },
    {
      id: 'tm-002',
      owner: 'deepseek-ai',
      repo: 'deepseek-vl2',
      name: 'deepseek-ai/deepseek-vl2',
      description: 'DeepSeek VL2: Efficient and Powerful Vision-Language Model',
      stars: 4567,
      forks: 234,
      language: 'Python',
      url: 'https://github.com/deepseek-ai/deepseek-vl2',
    },
    {
      id: 'tm-003',
      owner: 'meta-llama',
      repo: 'llama4',
      name: 'meta-llama/llama4',
      description: 'Meta Llama 4: Open and efficient LLMs',
      stars: 8945,
      forks: 567,
      language: 'Python',
      url: 'https://github.com/meta-llama/llama4',
    },
  ],
  lastFetched: new Date().toISOString(),
};

// FlashCard 类型定义
const createTrendingCards = (projects: TrendingProject[], period: 'weekly' | 'monthly'): FlashCard[] => {
  return projects.map((project, index) => ({
    id: `${period === 'weekly' ? 'tw' : 'tm'}-card-${index + 1}`,
    module: 'ai',
    chapterId: 'github-trending',
    category: period === 'weekly' ? '每周Trending' : '每月Trending',
    question: `${project.name}\n${project.description}`,
    answer: `## ${project.name}\n\n**⭐ Stars:** ${project.stars.toLocaleString()}\n\n**🍴 Forks:** ${project.forks.toLocaleString()}\n\n**语言:** ${project.language}\n\n\n**链接:** ${project.url}`,
    tags: ['GitHub', 'Trending', project.language],
    status: 'unvisited' as const,
    difficulty: 'easy' as const,
  }));
};

export const githubTrendingCards: FlashCard[] = [
  ...createTrendingCards(sampleTrendingData.weekly, 'weekly'),
  ...createTrendingCards(sampleTrendingData.monthly, 'monthly'),
];

// AI项目定义
export interface AIProject {
  id: string;
  name: string;
  description: string;
  files?: {
    html?: string;
    pdf?: string;
    xlsx?: string;
  };
  cards?: FlashCard[];
}