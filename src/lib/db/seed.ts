import type Database from 'better-sqlite3';

import {
  SEED_BOOKMARKS,
  SEED_COLLECTIONS,
  SEED_FEEDBACK,
  SEED_QA_PAIRS,
  SEED_SESSIONS,
  SEED_USERS
} from '@/data/dev-seed';
import { GAMES } from '@/data/games';

import { GAME_COLUMNS } from './shared';

export function seedDatabase(db: Database.Database) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Development seed data must not run in production.');
  }

  const insertGame = db.prepare(`
    INSERT INTO games (${GAME_COLUMNS})
    VALUES (
      @id, @name, @tagline, @description, @player_min, @player_max,
      @play_time, @complexity, @year, @category, @mechanics_json,
      @highlights_json, @quick_start_json, @setup_guide_json,
      @example_questions_json, @edition_label, @palette_json, @icon
    )
  `);

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, mode, created_at)
    VALUES (@id, @name, @email, @mode, @created_at)
  `);

  const insertCollection = db.prepare(`
    INSERT INTO collections (user_id, game_id, created_at)
    VALUES (@user_id, @game_id, @created_at)
  `);

  const insertSession = db.prepare(`
    INSERT INTO sessions (id, user_id, game_id, created_at, updated_at)
    VALUES (@id, @user_id, @game_id, @created_at, @updated_at)
  `);

  const insertQaPair = db.prepare(`
    INSERT INTO qa_pairs (
      id, session_id, user_id, game_id, question, answer, citations_json,
      confidence, status, mode, created_at
    ) VALUES (
      @id, @session_id, @user_id, @game_id, @question, @answer, @citations_json,
      @confidence, @status, @mode, @created_at
    )
  `);

  const insertBookmark = db.prepare(`
    INSERT INTO bookmarks (user_id, qa_pair_id, created_at)
    VALUES (@user_id, @qa_pair_id, @created_at)
  `);

  const insertFeedback = db.prepare(`
    INSERT INTO feedback (session_id, qa_pair_id, rating, reason, created_at)
    VALUES (@session_id, @qa_pair_id, @rating, @reason, @created_at)
  `);

  const reseed = db.transaction(() => {
    db.exec(`
      DELETE FROM feedback;
      DELETE FROM bookmarks;
      DELETE FROM qa_pairs;
      DELETE FROM sessions;
      DELETE FROM collections;
      DELETE FROM users;
      DELETE FROM games;
    `);

    for (const game of GAMES) {
      insertGame.run({
        id: game.id,
        name: game.name,
        tagline: game.tagline,
        description: game.description,
        player_min: game.playerMin,
        player_max: game.playerMax,
        play_time: game.playTime,
        complexity: game.complexity,
        year: game.year,
        category: game.category,
        mechanics_json: JSON.stringify(game.mechanics),
        highlights_json: JSON.stringify(game.highlights),
        quick_start_json: JSON.stringify(game.quickStart),
        setup_guide_json: JSON.stringify(game.setupGuide),
        example_questions_json: JSON.stringify(game.exampleQuestions),
        edition_label: game.editionLabel ?? null,
        palette_json: JSON.stringify(game.palette),
        icon: game.icon
      });
    }

    for (const user of SEED_USERS) {
      insertUser.run({
        id: user.id,
        name: user.name,
        email: user.email,
        mode: user.mode,
        created_at: user.createdAt
      });
    }

    for (const collection of SEED_COLLECTIONS) {
      insertCollection.run({
        user_id: collection.userId,
        game_id: collection.gameId,
        created_at: collection.createdAt
      });
    }

    for (const session of SEED_SESSIONS) {
      insertSession.run({
        id: session.id,
        user_id: session.userId,
        game_id: session.gameId,
        created_at: session.createdAt,
        updated_at: session.updatedAt
      });
    }

    for (const qaPair of SEED_QA_PAIRS) {
      insertQaPair.run({
        id: qaPair.id,
        session_id: qaPair.sessionId,
        user_id: qaPair.userId,
        game_id: qaPair.gameId,
        question: qaPair.question,
        answer: qaPair.answer,
        citations_json: JSON.stringify(qaPair.citations),
        confidence: qaPair.confidence,
        status: qaPair.status,
        mode: qaPair.mode,
        created_at: qaPair.createdAt
      });
    }

    for (const bookmark of SEED_BOOKMARKS) {
      insertBookmark.run({
        user_id: bookmark.userId,
        qa_pair_id: bookmark.qaPairId,
        created_at: bookmark.createdAt
      });
    }

    for (const feedback of SEED_FEEDBACK) {
      insertFeedback.run({
        session_id: feedback.sessionId,
        qa_pair_id: feedback.qaPairId,
        rating: feedback.rating,
        reason: feedback.reason ?? null,
        created_at: feedback.createdAt
      });
    }
  });

  reseed();
}
