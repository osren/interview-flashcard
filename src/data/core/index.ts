import { javascriptCards, javascriptChapter } from './javascript';
import { htmlCards, htmlChapter } from './html';
import { cssCards, cssChapter } from './css';
import { vueCards, vueChapter } from './vue';
import { nextjsCards, nextjsChapter } from './nextjs';
import { reactCards, reactChapter } from './react';
import { typescriptCards, typescriptChapter } from './typescript';
import { browserfeaturesCards, browserfeaturesChapter } from './browser-features';
import { browsersecurityCards, browsersecurityChapter } from './browser-security';
import { webpackCards, webpackChapter } from './webpack';
import {
  performanceCards,
  performanceChapter,
  engineeringCards,
  engineeringChapter,
  aiEngineeringCards,
  aiEngineeringChapter,
  systemDesignCards,
  systemDesignChapter,
  reactHooksCards,
  reactHooksChapter,
} from './extra-chapters';
import { Chapter, FlashCard } from '@/types';

export const coreChapters: Chapter[] = [
  javascriptChapter,
  htmlChapter,
  cssChapter,
  vueChapter,
  nextjsChapter,
  reactChapter,
  typescriptChapter,
  browserfeaturesChapter,
  browsersecurityChapter,
  webpackChapter,
  reactHooksChapter,
  engineeringChapter,
  performanceChapter,
  aiEngineeringChapter,
  systemDesignChapter,
];

export const coreCards: FlashCard[] = [
  ...javascriptCards,
  ...htmlCards,
  ...cssCards,
  ...vueCards,
  ...nextjsCards,
  ...reactCards,
  ...typescriptCards,
  ...browserfeaturesCards,
  ...browsersecurityCards,
  ...webpackCards,
  ...reactHooksCards,
  ...engineeringCards,
  ...performanceCards,
  ...aiEngineeringCards,
  ...systemDesignCards,
];
