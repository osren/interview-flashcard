import { Routes, Route } from 'react-router-dom';
import { Header, Footer } from '@/components/Layout';
import { Favorites } from '@/pages/Favorites';
import { Home } from '@/pages/Home';
import { CoreIndex, CoreChapter } from '@/pages/Core';
import { ProjectsIndex, ProjectDetail } from '@/pages/Projects';
import { AlgorithmsIndex, AlgorithmDetail } from '@/pages/Algorithms';
import { MpxIndex, MpxChapter } from '@/pages/Mpx';
import { CustomCardsPage } from '@/pages/Custom';
import { ResumePage } from '@/pages/Resume/ResumePage';
import { FloatingResumeButton } from '@/components/Resume/FloatingResumeButton';
import { InterviewIndex, InterviewDetail } from '@/pages/Interview';
import { AIIndex, AIDetail } from '@/pages/AI';
import { RJSFDemo } from '@/pages/RJSF';
import { GithubTrending } from '@/pages/AI/GithubTrending';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Button } from '@/components/ui';
import { Link } from 'react-router-dom';

function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen app-bg">
        <Header />
        <main className="flex-1">
          <FloatingResumeButton />
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/core" element={<CoreIndex />} />
            <Route path="/core/:chapterId" element={<CoreChapter />} />

            <Route path="/projects" element={<ProjectsIndex />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />

            <Route path="/algorithms" element={<AlgorithmsIndex />} />
            <Route path="/algorithms/:type" element={<AlgorithmDetail />} />

            <Route path="/mpx" element={<MpxIndex />} />
            <Route path="/mpx/:chapterId" element={<MpxChapter />} />

            <Route path="/custom" element={<CustomCardsPage />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/resume" element={<ResumePage />} />

            <Route path="/interview" element={<InterviewIndex />} />
            <Route path="/interview/:companyId/:departmentId/:sessionId" element={<InterviewDetail />} />

            <Route path="/ai" element={<AIIndex />} />
            <Route path="/ai/github-trending" element={<GithubTrending />} />
            <Route path="/ai/:projectId" element={<AIDetail />} />

            <Route path="/rjsf" element={<RJSFDemo />} />

            <Route
              path="*"
              element={
                <div className="min-h-[60vh] flex items-center justify-center px-4">
                  <div className="text-center surface-panel p-12 max-w-md">
                    <div className="text-7xl font-display font-bold text-gradient-brand mb-4">404</div>
                    <p className="text-ink-secondary mb-6">这个页面好像还没准备好</p>
                    <Link to="/">
                      <Button>返回首页</Button>
                    </Link>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
