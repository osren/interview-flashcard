// import { didiCards, didiChapter } from './didi';
import { didiCards, didiChapter } from './didi_new';
import { gresumeCards, gresumeChapter } from './gresume';
import { aiMonitorCards, aiMonitorChapter } from './ai-monitor';
import { Chapter, FlashCard } from '@/types';

export const projectChapters: Chapter[] = [didiChapter, aiMonitorChapter, gresumeChapter];
export const projectCards: FlashCard[] = [...didiCards, ...aiMonitorCards, ...gresumeCards];
