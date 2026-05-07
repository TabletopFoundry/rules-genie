import 'server-only';

import fs from 'fs';
import path from 'path';

import Database from 'better-sqlite3';

import { initializeDatabase } from './schema';
import { seedDatabase } from './seed';

const DEFAULT_DB_FILENAME = 'rulesgenie.db';
const configuredDbPath = process.env.RULESGENIE_DB_PATH?.trim();
const DB_PATH = configuredDbPath ? path.resolve(configuredDbPath) : path.join(process.cwd(), DEFAULT_DB_FILENAME);

export const DEMO_USER_ID = 'demo-user';

declare global {
  // eslint-disable-next-line no-var
  var __rulesGenieDb: Database.Database | undefined;
  // eslint-disable-next-line no-var
  var __rulesGenieDbInitialized: boolean | undefined;
}

function openDatabase(): Database.Database {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const instance = new Database(DB_PATH);
    instance.pragma('journal_mode = WAL');
    instance.pragma('foreign_keys = ON');
    return instance;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[RulesGenie] Failed to open database at ${DB_PATH}: ${message}\n` +
      'Check that the directory exists and the process has read/write permissions.'
    );
    throw new Error(`Cannot initialize RulesGenie database — ${message}`);
  }
}

const db = global.__rulesGenieDb ?? openDatabase();

if (process.env.NODE_ENV !== 'production') {
  global.__rulesGenieDb = db;
}

let initialized = global.__rulesGenieDbInitialized ?? false;

/** Lazy-initialized database accessor. Runs DDL + seed on first call only. */
export function getDb() {
  if (!initialized) {
    try {
      initializeDatabase(db);
      seedDatabase(db);
      initialized = true;
      if (process.env.NODE_ENV !== 'production') {
        global.__rulesGenieDbInitialized = true;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[RulesGenie] Database initialization failed: ${message}\n` +
        'The database file may be locked, corrupt, or the disk may be full.'
      );
      throw new Error(`Cannot initialize RulesGenie database — ${message}`);
    }
  }
  return db;
}
