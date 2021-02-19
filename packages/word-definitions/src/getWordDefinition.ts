import { Locale, WordDefinition } from '@scrabble-solver/types';

import { crawl } from './crawl';
import { normalizeDefinition, unique } from './lib';
import { parse } from './parse';

const getWordDefinition = async (locale: Locale, word: string): Promise<WordDefinition> => {
  const html = await crawl(locale, word);
  const { definitions, isAllowed } = parse(locale, html);
  const wordDefinition = new WordDefinition({
    definitions: unique(Array.from(definitions).map(normalizeDefinition).filter(Boolean)),
    isAllowed,
    word,
  });
  return wordDefinition;
};

export default getWordDefinition;
