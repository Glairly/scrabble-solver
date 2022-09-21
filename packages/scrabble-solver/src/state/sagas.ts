import { PayloadAction } from '@reduxjs/toolkit';
import { Result } from '@scrabble-solver/types';
import { call, delay, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import { memoize } from 'lib';
import { findWordDefinition, solve, visit } from 'sdk';

import { initialize, reset } from './actions';
import {
  selectAutoGroupTiles,
  selectBoard,
  selectCharacters,
  selectConfig,
  selectDictionary,
  selectLocale,
} from './selectors';
import { boardSlice, dictionarySlice, rackSlice, resultsSlice, settingsSlice, solveSlice } from './slices';

const SUBMIT_DELAY = 150;

const memoizedFindWordDefinition = memoize(findWordDefinition);

export function* rootSaga(): Generator<any, any, any> {
  yield takeEvery(resultsSlice.actions.applyResult.type, onApplyResult);
  yield takeEvery(resultsSlice.actions.changeResultCandidate.type, onResultCandidateChange);
  yield takeEvery(settingsSlice.actions.changeConfigId.type, onConfigIdChange);
  yield takeEvery(settingsSlice.actions.changeLocale.type, onLocaleChange);
  yield takeLatest(dictionarySlice.actions.submit.type, onDictionarySubmit);
  yield takeLatest(initialize.type, onInitialize);
  yield takeLatest(reset.type, onReset);
  yield takeLatest(solveSlice.actions.submit.type, onSubmit);
}

function* onApplyResult({ payload: result }: PayloadAction<Result>): Generator<any, any, any> {
  const autoGroupTiles = yield select(selectAutoGroupTiles);
  yield put(boardSlice.actions.applyResult(result));
  yield put(rackSlice.actions.removeTiles(result.tiles));
  yield put(rackSlice.actions.groupTiles(autoGroupTiles));
}

function* onConfigIdChange(): Generator<any, any, any> {
  yield put(resultsSlice.actions.reset());
  yield put(solveSlice.actions.submit());
  yield* ensureProperTilesCount();
}

function* onDictionarySubmit(): Generator<any, any, any> {
  const { input: word } = yield select(selectDictionary);
  const locale = yield select(selectLocale);

  if (!memoizedFindWordDefinition.hasCache(locale, word)) {
    yield delay(SUBMIT_DELAY);
  }

  try {
    const wordDefinition = yield call(memoizedFindWordDefinition, locale, word);
    yield put(dictionarySlice.actions.submitSuccess(wordDefinition));
  } catch (error) {
    yield put(dictionarySlice.actions.submitFailure());
  }
}

function* onInitialize(): Generator<any, any, any> {
  yield call(visit);
  yield* ensureProperTilesCount();
}

function* onReset(): Generator<any, any, any> {
  yield put(boardSlice.actions.reset());
  yield put(dictionarySlice.actions.reset());
  yield put(rackSlice.actions.reset());
  yield put(resultsSlice.actions.reset());
}

function* onLocaleChange(): Generator<any, any, any> {
  yield put(solveSlice.actions.submit());
  yield put(resultsSlice.actions.changeResultCandidate(null));
  yield put(dictionarySlice.actions.reset());
}

function* onResultCandidateChange({ payload: result }: PayloadAction<Result | null>): Generator<any, any, any> {
  if (result) {
    yield put(dictionarySlice.actions.changeInput(result.word));
    yield put(dictionarySlice.actions.submit());
  }
}

function* onSubmit(): Generator<any, any, any> {
  const board = yield select(selectBoard);
  const { config } = yield select(selectConfig);
  const locale = yield select(selectLocale);
  const characters = yield select(selectCharacters);

  if (characters.length === 0) {
    yield put(solveSlice.actions.submitSuccess({ board, characters }));
    yield put(resultsSlice.actions.changeResults([]));
    return;
  }

  try {
    const results = yield call(solve, {
      board: board.toJson(),
      characters,
      configId: config.id,
      locale,
    });
    yield put(solveSlice.actions.submitSuccess({ board, characters }));
    yield put(resultsSlice.actions.changeResults(results.map(Result.fromJson)));
  } catch (error) {
    yield put(resultsSlice.actions.changeResults([]));
    yield put(solveSlice.actions.submitFailure());
  }
}

function* ensureProperTilesCount(): Generator<any, any, any> {
  const { config } = yield select(selectConfig);
  const characters = yield select(selectCharacters);

  if (config.maximumNumberOfCharacters > characters.length) {
    const differenceCount = Math.abs(config.maximumNumberOfCharacters - characters.length);
    yield put(rackSlice.actions.init([...characters, ...Array(differenceCount).fill(null)]));
  } else if (config.maximumNumberOfCharacters < characters.length) {
    const nonNulls = characters.filter(Boolean).slice(0, config.maximumNumberOfCharacters);
    const differenceCount = Math.abs(config.maximumNumberOfCharacters - nonNulls.length);
    const autoGroupTiles = yield select(selectAutoGroupTiles);
    yield put(rackSlice.actions.init([...nonNulls, ...Array(differenceCount).fill(null)]));
    yield put(rackSlice.actions.groupTiles(autoGroupTiles));
  }
}
