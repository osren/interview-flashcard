import { didiCards, didiChapter } from './didi';
import { gresumeCards, gresumeChapter } from './gresume';
import { Chapter, FlashCard } from '@/types';

export const projectChapters: Chapter[] = [didiChapter, gresumeChapter];
export const projectCards: FlashCard[] = [...didiCards, ...gresumeCards];
