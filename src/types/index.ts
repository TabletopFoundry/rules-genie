export type Citation = {
  source: string;
  page: string;
  section: string;
  note?: string;
};

export type AiStatus = 'grounded' | 'low-confidence' | 'conflicting' | 'strategy';

export type GameRecord = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  playerMin: number;
  playerMax: number;
  playTime: string;
  complexity: number;
  year: number;
  category: string;
  mechanics: string[];
  highlights: string[];
  quickStart: string[];
  setupGuide: string[];
  exampleQuestions: string[];
  editionLabel?: string;
  palette: [string, string, string];
  icon: string;
};

export type MockQa = {
  id: string;
  gameId: string;
  questionPatterns: string[];
  keywords: string[];
  answer: string;
  citations: Citation[];
  confidence: number;
  status: AiStatus;
  suggestions?: string[];
};

export type AiAnswer = {
  answer: string;
  citations: Citation[];
  confidence: number;
  status: AiStatus;
  suggestions: string[];
  mode: 'demo' | 'openai';
};

export type QaRecord = {
  id: string;
  sessionId: string;
  userId: string;
  gameId: string;
  question: string;
  answer: string;
  citations: Citation[];
  confidence: number;
  status: AiStatus;
  mode: 'demo' | 'openai';
  createdAt: string;
  bookmarked: boolean;
  feedbackRating?: 'up' | 'down' | null;
  feedbackReason?: string | null;
};

export type DashboardSnapshot = {
  profile: {
    id: string;
    name: string;
    email: string;
    mode: string;
  };
  collection: GameRecord[];
  recentQuestions: QaRecord[];
  bookmarks: QaRecord[];
};
