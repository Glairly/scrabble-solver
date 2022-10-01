import { Trie } from 'trie';
import { Board, Config, Pattern, Result, Tile } from '@scrabble-solver/types';
import uniqBy from 'lodash/uniqBy';

import PatternsFiller from './PatternsFiller';
import PatternsGenerator from './PatternsGenerator';
import ScoresCalculator from './ScoresCalculator';

class Solver {
  private readonly patternsFiller: PatternsFiller;

  private readonly patternsGenerator: PatternsGenerator;

  private readonly scoresCalculator: ScoresCalculator;

  constructor(config: Config, trie: Trie) {
    this.patternsFiller = new PatternsFiller(config, trie);
    this.patternsGenerator = new PatternsGenerator(config);
    this.scoresCalculator = new ScoresCalculator(config);
  }

  public solve(board: Board, tiles: Tile[]): Result[] {
    const patterns = this.patternsGenerator
      .generate(board)
      .reduce<Pattern[]>(
        (filledPatterns, pattern) => filledPatterns.concat(this.patternsFiller.fill(pattern, tiles)),
        [],
      );
    const uniquePatterns = uniqBy(patterns, (pattern) => JSON.stringify(pattern.toJson()));
    const results = uniquePatterns.map(
      (pattern, index) =>
        new Result({
          cells: pattern.cells,
          id: index,
          numberOfCollisions: pattern.getCollisions().length,
          points: this.scoresCalculator.calculate(pattern),
        }),
    );
    const getBestResult = ([firstResult, ...results]: Result[]): Result => {
      return results.reduce(
        (bestResultCandidate, result) => (result.points > bestResultCandidate.points ? result : bestResultCandidate),
        firstResult,
      );
    };
    const bestResult = getBestResult(results);
    return [bestResult];
  }
}

export default Solver;
