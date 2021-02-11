export type Comparator<T> = (a: T, B: T) => number;

export enum SortDirection {
  Ascending = 'ascending',
  Descending = 'descending',
}

export enum ResultColumn {
  BlanksCount = 'blanks-count',
  Points = 'points',
  TilesCount = 'tiles-count',
  Word = 'word',
  WordsCount = 'words-count',
}

export type TranslationKey =
  | 'cell.set-blank'
  | 'cell.set-not-blank'
  | 'cell.toggle-direction'
  | 'clear'
  | 'close'
  | 'dictionary.empty-state.no-definitions'
  | 'dictionary.empty-state.no-results'
  | 'dictionary.empty-state.not-allowed'
  | 'dictionary.empty-state.uninitialized'
  | 'empty-state.error'
  | 'empty-state.info'
  | 'empty-state.success'
  | 'empty-state.warning'
  | 'github'
  | 'keyMap'
  | 'keyMap.board'
  | 'keyMap.board.toggle-blank'
  | 'keyMap.board.toggle-direction'
  | 'keyMap.board-and-rack'
  | 'keyMap.board-and-rack.navigate'
  | 'keyMap.board-and-rack.remove-tile'
  | 'keyMap.board-and-rack.submit'
  | 'keyMap.rack'
  | 'keyMap.rack.insert-blank'
  | 'loading'
  | 'rack.placeholder'
  | 'remaining-tiles'
  | 'results.empty-state.outdated'
  | 'results.empty-state.no-results'
  | 'results.empty-state.uninitialized'
  | 'results.header.blanks'
  | 'results.header.blanks.short'
  | 'results.header.points'
  | 'results.header.tiles'
  | 'results.header.tiles.short'
  | 'results.header.word'
  | 'results.header.words'
  | 'results.header.words.short'
  | 'results.solve'
  | 'settings'
  | 'settings.autoGroupTiles'
  | 'settings.autoGroupTiles.left'
  | 'settings.autoGroupTiles.right'
  | 'settings.autoGroupTiles.null'
  | 'settings.game'
  | 'settings.language';

export type Translate = (key: TranslationKey) => string;

export type Translations = Record<TranslationKey, string>;
