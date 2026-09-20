import fs from 'fs';
import path from 'path';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  salt?: string;
  isGuest?: boolean;
  createdAt: string;
}

export interface UserSafetyFlags {
  completed: boolean;
  skipped: boolean;
  pregnantOrPostpartum: boolean;
  recentInjury: boolean;
  highBloodPressure: boolean;
  glaucomaOrEye: boolean;
}

export interface UserProfileRecord {
  userId: string;
  safetyFlags: UserSafetyFlags;
  cycleTrackingEnabled: boolean;
  trimester?: 'first' | 'second' | 'third' | 'postpartum' | null;
  updatedAt: string;
}

export interface MoodLogRecord {
  id: string;
  userId: string;
  mood: string;
  targetZones?: string[];
  createdAt: string;
}

export interface SessionCompletedRecord {
  id: string;
  userId: string;
  sessionId: string;
  sessionTitle: string;
  sessionType: string;
  durationMinutes: number;
  rating?: string;
  completedAt: string;
}

export interface GeneratedRoutineRecord {
  id: string;
  userId: string;
  prompt: string;
  rawRoutineJson: any;
  filteredRoutineJson: any;
  filterNotices: string[];
  createdAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  userProfiles: UserProfileRecord[];
  moodLogs: MoodLogRecord[];
  sessionsCompleted: SessionCompletedRecord[];
  routinesGenerated: GeneratedRoutineRecord[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'flowstate_db.json');

const INITIAL_DB: DatabaseSchema = {
  users: [],
  userProfiles: [],
  moodLogs: [],
  sessionsCompleted: [],
  routinesGenerated: []
};

class Database {
  private data: DatabaseSchema = { ...INITIAL_DB };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = { ...INITIAL_DB, ...JSON.parse(raw) };
      } else {
        this.persist();
      }
    } catch (err) {
      console.warn('Could not read DB file, using memory storage:', err);
      this.data = { ...INITIAL_DB };
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  // Users
  findUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): UserRecord | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(user: UserRecord): UserRecord {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  // Profile
  getProfile(userId: string): UserProfileRecord | undefined {
    return this.data.userProfiles.find((p) => p.userId === userId);
  }

  upsertProfile(userId: string, partial: Partial<UserProfileRecord>): UserProfileRecord {
    const existingIndex = this.data.userProfiles.findIndex((p) => p.userId === userId);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existing = this.data.userProfiles[existingIndex];
      const updated: UserProfileRecord = {
        ...existing,
        ...partial,
        safetyFlags: {
          ...existing.safetyFlags,
          ...(partial.safetyFlags || {})
        },
        updatedAt: now
      };
      this.data.userProfiles[existingIndex] = updated;
      this.persist();
      return updated;
    } else {
      const created: UserProfileRecord = {
        userId,
        safetyFlags: {
          completed: false,
          skipped: false,
          pregnantOrPostpartum: false,
          recentInjury: false,
          highBloodPressure: false,
          glaucomaOrEye: false,
          ...(partial.safetyFlags || {})
        },
        cycleTrackingEnabled: partial.cycleTrackingEnabled || false,
        trimester: partial.trimester || null,
        updatedAt: now
      };
      this.data.userProfiles.push(created);
      this.persist();
      return created;
    }
  }

  // Mood Logs
  addMoodLog(log: Omit<MoodLogRecord, 'id' | 'createdAt'>): MoodLogRecord {
    const newLog: MoodLogRecord = {
      id: `mood-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...log,
      createdAt: new Date().toISOString()
    };
    this.data.moodLogs.unshift(newLog);
    this.persist();
    return newLog;
  }

  getUserMoodLogs(userId: string, limit = 20): MoodLogRecord[] {
    return this.data.moodLogs.filter((m) => m.userId === userId).slice(0, limit);
  }

  // Sessions Completed
  addCompletedSession(session: Omit<SessionCompletedRecord, 'id' | 'completedAt'>): SessionCompletedRecord {
    const newRecord: SessionCompletedRecord = {
      id: `sess-comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...session,
      completedAt: new Date().toISOString()
    };
    this.data.sessionsCompleted.unshift(newRecord);
    this.persist();
    return newRecord;
  }

  getUserCompletedSessions(userId: string, limit = 25): SessionCompletedRecord[] {
    return this.data.sessionsCompleted.filter((s) => s.userId === userId).slice(0, limit);
  }

  // Generated Routines
  addGeneratedRoutine(routine: Omit<GeneratedRoutineRecord, 'id' | 'createdAt'>): GeneratedRoutineRecord {
    const record: GeneratedRoutineRecord = {
      id: `routine-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...routine,
      createdAt: new Date().toISOString()
    };
    this.data.routinesGenerated.unshift(record);
    this.persist();
    return record;
  }

  getUserGeneratedRoutines(userId: string, limit = 10): GeneratedRoutineRecord[] {
    return this.data.routinesGenerated.filter((r) => r.userId === userId).slice(0, limit);
  }

  // Dashboard Stats Aggregator
  getDashboardStats(userId: string) {
    const userSessions = this.data.sessionsCompleted.filter((s) => s.userId === userId);
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sessionsThisWeek = userSessions.filter((s) => new Date(s.completedAt) >= oneWeekAgo);
    const totalMinutes = userSessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const recentMoods = this.data.moodLogs.filter((m) => m.userId === userId).slice(0, 5);

    return {
      completedCountTotal: userSessions.length,
      completedCountThisWeek: sessionsThisWeek.length,
      totalMinutes,
      recentSessions: userSessions.slice(0, 5),
      recentMoods,
      routinesCount: this.data.routinesGenerated.filter((r) => r.userId === userId).length
    };
  }
}

export const db = new Database();
