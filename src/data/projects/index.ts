/*
 * @Author: tancheng
 * @Date: 2026-03-30 09:59:18
 * @LastEditors: tancheng
 * @LastEditTime: 2026-03-31 18:29:38
 * @FilePath: /interview-flashcard/src/data/projects/index.ts
 * @Description: 
 */
// import { didiCards, didiChapter } from './didi';
import { didiCards, didiChapter } from './didi_new';
import { gresumeCards, gresumeChapter } from './gresume';
import { Chapter, FlashCard } from '@/types';

export const projectChapters: Chapter[] = [didiChapter, gresumeChapter];
export const projectCards: FlashCard[] = [...didiCards, ...gresumeCards];
