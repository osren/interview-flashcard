import { Suspense, lazy, type ComponentType, type ReactNode } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AppShell, Footer } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { CampusIndex } from '@/pages/Campus';
import { FloatingResumeButton } from '@/components/Resume/FloatingResumeButton';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CampusJobSyncProvider } from '@/hooks/useCampusJobSync';
import { LearningSyncProvider } from '@/hooks/useLearningSync';
import { ResumeSyncProvider } from '@/hooks/useResumeSync';
import { Button, PageLoadingSkeleton } from '@/components/ui';

function lazyPage<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T } | Record<string, T>>,
  exportName?: string
) {
  return lazy(async () => {
    const mod = await factory();
    if (exportName && exportName in mod) {
      return { default: (mod as Record<string, T>)[exportName] };
    }
    if ('default' in mod && mod.default) {
      return { default: mod.default as T };
    }
    throw new Error(`Lazy page export missing: ${exportName ?? 'default'}`);
  });
}

const Favorites = lazyPage(() => import('@/pages/Favorites'), 'Favorites');
const CoreIndex = lazyPage(() => import('@/pages/Core'), 'CoreIndex');
const CoreChapter = lazyPage(() => import('@/pages/Core'), 'CoreChapter');
const ProjectsIndex = lazyPage(() => import('@/pages/Projects'), 'ProjectsIndex');
const ProjectDetail = lazyPage(() => import('@/pages/Projects'), 'ProjectDetail');
const MpxIndex = lazyPage(() => import('@/pages/Mpx'), 'MpxIndex');
const MpxChapter = lazyPage(() => import('@/pages/Mpx'), 'MpxChapter');
const CustomCardsPage = lazyPage(() => import('@/pages/Custom'), 'CustomCardsPage');
const ResumePage = lazyPage(() => import('@/pages/Resume/ResumePage'), 'ResumePage');
const InterviewIndex = lazyPage(() => import('@/pages/Interview'), 'InterviewIndex');
const InterviewDetail = lazyPage(() => import('@/pages/Interview'), 'InterviewDetail');
const AIIndex = lazyPage(() => import('@/pages/AI'), 'AIIndex');
const AIDetail = lazyPage(() => import('@/pages/AI'), 'AIDetail');
const GithubTrending = lazyPage(() => import('@/pages/AI/GithubTrending'), 'GithubTrending');
const LLMHandbookPage = lazyPage(() => import('@/pages/LLMHandbook'), 'LLMHandbookPage');
const RJSFDemo = lazyPage(() => import('@/pages/RJSF'), 'RJSFDemo');
const CardImagePreview = lazyPage(() => import('@/pages/Preview/CardImagePreview'), 'CardImagePreview');

function RouteFallback() {
  return <PageLoadingSkeleton />;
}

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

function App() {
  return (
    <ThemeProvider>
      <CampusJobSyncProvider>
        <LearningSyncProvider>
          <ResumeSyncProvider>
          <AppShell>
            <FloatingResumeButton />
            <Routes>
              <Route path="/" element={<Home />} />

              <Route
                path="/core"
                element={
                  <LazyRoute>
                    <CoreIndex />
                  </LazyRoute>
                }
              />
              <Route
                path="/core/:chapterId"
                element={
                  <LazyRoute>
                    <CoreChapter />
                  </LazyRoute>
                }
              />

              <Route
                path="/projects"
                element={
                  <LazyRoute>
                    <ProjectsIndex />
                  </LazyRoute>
                }
              />
              <Route
                path="/projects/:projectId"
                element={
                  <LazyRoute>
                    <ProjectDetail />
                  </LazyRoute>
                }
              />

              <Route
                path="/mpx"
                element={
                  <LazyRoute>
                    <MpxIndex />
                  </LazyRoute>
                }
              />
              <Route
                path="/mpx/:chapterId"
                element={
                  <LazyRoute>
                    <MpxChapter />
                  </LazyRoute>
                }
              />

              <Route
                path="/llm-handbook"
                element={
                  <LazyRoute>
                    <LLMHandbookPage />
                  </LazyRoute>
                }
              />

              <Route
                path="/custom"
                element={
                  <LazyRoute>
                    <CustomCardsPage />
                  </LazyRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <LazyRoute>
                    <Favorites />
                  </LazyRoute>
                }
              />
              <Route
                path="/resume"
                element={
                  <LazyRoute>
                    <ResumePage />
                  </LazyRoute>
                }
              />

              <Route
                path="/interview"
                element={
                  <LazyRoute>
                    <InterviewIndex />
                  </LazyRoute>
                }
              />
              <Route
                path="/interview/:companyId/:departmentId/:sessionId"
                element={
                  <LazyRoute>
                    <InterviewDetail />
                  </LazyRoute>
                }
              />

              <Route path="/campus" element={<CampusIndex />} />

              <Route
                path="/ai"
                element={
                  <LazyRoute>
                    <AIIndex />
                  </LazyRoute>
                }
              />
              <Route
                path="/ai/github-trending"
                element={
                  <LazyRoute>
                    <GithubTrending />
                  </LazyRoute>
                }
              />
              <Route
                path="/ai/:projectId"
                element={
                  <LazyRoute>
                    <AIDetail />
                  </LazyRoute>
                }
              />

              <Route
                path="/rjsf"
                element={
                  <LazyRoute>
                    <RJSFDemo />
                  </LazyRoute>
                }
              />
              <Route
                path="/preview/card-image"
                element={
                  <LazyRoute>
                    <CardImagePreview />
                  </LazyRoute>
                }
              />

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
          </ResumeSyncProvider>
        </LearningSyncProvider>
      </CampusJobSyncProvider>
    </ThemeProvider>
  );
}

export default App;
