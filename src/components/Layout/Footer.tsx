import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-[#e5e5e5] bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <div>
              <p className="font-extrabold text-lg text-[#58CC02]">InterviewFlash</p>
              <p className="text-sm text-[#afafaf] font-bold">前端面试备考记忆卡片</p>
            </div>
          </div>
          <p className="text-sm text-[#afafaf] font-bold">
            专为谭成同学面试准备
          </p>
        </div>
      </div>
    </footer>
  );
}
