import { FlashCard } from './card';
import { ModuleType } from './card';

export interface Chapter {
  id: string;
  module: ModuleType;
  title: string;
  description?: string;
  cardCount: number;
  icon?: string;
}

export interface ChapterWithCards extends Chapter {
  cards: FlashCard[];
}
