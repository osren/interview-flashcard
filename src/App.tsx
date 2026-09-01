import { Routes, Route, Link } from 'react-router-dom';
import { AppShell, Footer } from '@/components/Layout';
import { Favorites } from '@/pages/Favorites';
import { Home } from '@/pages/Home';
import { CoreIndex, CoreChapter } from '@/pages/Core';
import { ProjectsIndex, ProjectDetail } from '@/pages/Projects';
import { MpxIndex, MpxChapter } from '@/pages/Mpx';
import { CustomCardsPage } from '@/pages/Custom';
import { ResumePage } from '@/pages/Resume/ResumePage';
import { FloatingResumeButton } from '@/components/Resume/FloatingResumeButton';
import { InterviewIndex, InterviewDetail } from '@/pages/Interview';
import { CampusIndex } from '@/pages/Campus';
import { AIIndex, AIDetail } from '@/pages/AI';
import { RJSFDemo } from '@/pages/RJSF';
import { GithubTrending } from '@/pages/AI/GithubTrending';
import { LLMHandbookPage } from '@/pages/LLMHandbook';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CampusJobSyncProvider } from '@/hooks/useCampusJobSync';
import { Button } from '@/components/ui';

function App() {
  return (
    <ThemeProvider>
      <CampusJobSyncProvider>
        <AppShell>
        <FloatingResumeButton />
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/core" element={<CoreIndex />} />
          <Route path="/core/:chapterId" element={<CoreChapter />} />

          <Route path="/projects" element={<ProjectsIndex />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />

          <Route path="/mpx" element={<MpxIndex />} />
          <Route path="/mpx/:chapterId" element={<MpxChapter />} />

          <Route path="/llm-handbook" element={<LLMHandbookPage />} />

          <Route path="/custom" element={<CustomCardsPage />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/resume" element={<ResumePage />} />

          <Route path="/interview" element={<InterviewIndex />} />
          <Route path="/interview/:companyId/:departmentId/:sessionId" element={<InterviewDetail />} />

          <Route path="/campus" element={<CampusIndex />} />

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
        <Footer />
      </AppShell>
      </CampusJobSyncProvider>
    </ThemeProvider>
  );
}

export default App;
