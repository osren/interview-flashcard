/** 供卡片 AI 讲解/追问注入：InterviewFlash 本项目可映射的技术案例 */
export const INTERVIEWFLASH_CONTEXT = `**InterviewFlash（本项目，当前运行的面试备战 Web App）**
定位：秋招一站式闭环——刷题、投递、简历、复盘。
技术栈：Vite 5 + React 18 + TypeScript + Tailwind + Zustand + React Router 6 + Framer Motion + Supabase。

关键实现（讲解时可当作真实代码案例）：
1. **闪卡学习**：FlashCard 翻转与状态标记；useCardStore + persist；CardAIPanel 流式 AI 讲解/追问（llm-proxy）
2. **秋招投递**：useCampusJobStore 投递状态机；ProgressRaceChart 进度可视化；docs/秋招岗位 JSON lazy glob + 远程 catalog 同步
3. **性能优化**：App.tsx 路由 lazy + Suspense；Core/Projects 章节按需 import；Campus Tab keep-alive；iframe 双实例缓存防重复加载；vite manualChunks 拆 vendor
4. **云端同步**：CampusJobSyncProvider / LearningSyncProvider 登录后 pull-merge-push，debounce push
5. **AI 能力**：JD 解析（JdParseModal）、简历优化（optimize-resume Edge Function）、卡片讲解，JWT 鉴权 + 每日额度

映射提示（举例方向，勿捏造未实现功能）：
- React 原理 → FlashCard 状态更新、Suspense 懒路由、Provider 按需加载
- 工程化 → Vite 拆包、import.meta.glob 懒加载岗位 JSON、TypeScript strict
- 状态管理 → Zustand persist、多 store 分工（card/campus/resume/streak）
- 网络/性能 → 同步 debounce、catalog 远程优先 + 本地 fallback、SSE 流式 LLM
- 浏览器 → iframe keep-alive、localStorage 持久化、Auth session`;
