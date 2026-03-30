import { Routes, Route } from 'react-router-dom';
import { Header, Footer } from '@/components/Layout';
import { Favorites } from '@/pages/Favorites';
import { Home } from '@/pages/Home';
import { CoreIndex, CoreChapter } from '@/pages/Core';
import { ProjectsIndex, ProjectDetail } from '@/pages/Projects';
import { AlgorithmsIndex, AlgorithmDetail } from '@/pages/Algorithms';
import { CustomCardsPage } from '@/pages/Custom';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* 核心考点 */}
          <Route path="/core" element={<CoreIndex />} />
          <Route path="/core/:chapterId" element={<CoreChapter />} />

          {/* 项目复盘 */}
          <Route path="/projects" element={<ProjectsIndex />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />

          {/* 刷题模块 */}
          <Route path="/algorithms" element={<AlgorithmsIndex />} />
          <Route path="/algorithms/:type" element={<AlgorithmDetail />} />

          {/* 自定义卡片 */}
          <Route path="/custom" element={<CustomCardsPage />} />

          {/* 收藏 */}
          <Route path="/favorites" element={<Favorites />} />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <p className="text-gray-500 mb-4">页面不存在</p>
                  <a
                    href="/"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    返回首页
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
