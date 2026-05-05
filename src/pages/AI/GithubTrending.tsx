import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingList } from '@/components/AI/TrendingList';
import { fetchTrending, getLastFetchedTime, refreshTrending } from '@/utils/github-api';
import { TrendingProject } from '@/data/ai/github-trending';
import { ArrowLeft, Github } from 'lucide-react';
import { motion } from 'framer-motion';

export function GithubTrending() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [projects, setProjects] = useState<TrendingProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 加载数据
  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTrending(period);
      setProjects(data);
      setLastUpdated(getLastFetchedTime());
      if (data.length === 0) {
        setError('无法获取Trending数据，请检查网络后重试');
      }
    } catch (err) {
      console.error('Failed to load trending:', err);
      setError('加载失败，请点击刷新重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshTrending();
      await loadData();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: 'weekly' | 'monthly') => {
    setPeriod(newPeriod);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/ai')}
            className="p-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-900 rounded-lg">
              <Github size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">GitHub Trending</h1>
              <p className="text-sm text-gray-500">热门开源项目追踪</p>
            </div>
          </div>
        </div>

        {/* Trending列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TrendingList
            projects={projects}
            period={period}
            onPeriodChange={handlePeriodChange}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            lastUpdated={lastUpdated}
            error={error}
          />
        </motion.div>
      </div>
    </div>
  );
}