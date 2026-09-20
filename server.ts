import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import {
  checkLoginRateLimit,
  clearLoginRateLimit,
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
  optionalAuth,
  AuthRequest
} from './server/auth';
import { filterRoutineForUser, runSafetyFilterSelfTest } from './server/safetyFilter';
import { generateAIRoutine, getGuideAdvice } from './server/ai';

dotenv.config();

// Run safety filter integrity self-test
const filterSelfTestPassed = runSafetyFilterSelfTest();
console.log(`[FlowState Safety Engine] Static contraindication self-test: ${filterSelfTestPassed ? 'PASSED' : 'FAILED'}`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // API ROUTES FIRST (before Vite middleware)
  
  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'FlowState Somatic Dynamic Engine',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      safetyFilterActive: true
    });
  });

  // 2. Authentication: Sign Up
  app.post('/api/auth/signup', (req, res) => {
    try {
      const { email, password, name, safetyFlags } = req.body;

      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      if (!password || password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters for security.' });
      }

      const existing = db.findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
      }

      const { hash, salt } = hashPassword(password);
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const newUser = db.createUser({
        id: userId,
        email,
        name: name || email.split('@')[0],
        passwordHash: hash,
        salt,
        createdAt: new Date().toISOString()
      });

      const profile = db.upsertProfile(userId, {
        safetyFlags: safetyFlags || {
          completed: false,
          skipped: false,
          pregnantOrPostpartum: false,
          recentInjury: false,
          highBloodPressure: false,
          glaucomaOrEye: false
        }
      });

      const token = signToken({ userId: newUser.id, email: newUser.email });

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          isGuest: false
        },
        profile
      });
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ error: 'Failed to create account. Please try again.' });
    }
  });

  // 3. Authentication: Login with rate limiting
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'ip';
      const rateLimitKey = `${clientIp}_${email || ''}`;

      const rateCheck = checkLoginRateLimit(rateLimitKey);
      if (!rateCheck.allowed) {
        return res.status(429).json({
          error: `Too many login attempts. Please try again in ${rateCheck.resetMinutes} minutes to protect your account.`
        });
      }

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = db.findUserByEmail(email);
      if (!user || !user.passwordHash || !user.salt) {
        return res.status(401).json({
          error: 'Invalid email or password.',
          remainingAttempts: rateCheck.remaining
        });
      }

      const valid = verifyPassword(password, user.passwordHash, user.salt);
      if (!valid) {
        return res.status(401).json({
          error: 'Invalid email or password.',
          remainingAttempts: rateCheck.remaining
        });
      }

      // Clear failed count upon successful login
      clearLoginRateLimit(rateLimitKey);

      const profile = db.getProfile(user.id) || db.upsertProfile(user.id, {});
      const token = signToken({ userId: user.id, email: user.email });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isGuest: Boolean(user.isGuest)
        },
        profile
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login service encountered an issue.' });
    }
  });

  // 4. Instant Guest / Demo Session (zero friction)
  app.post('/api/auth/guest', (req, res) => {
    try {
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const guestEmail = `${guestId}@guest.flowstate.app`;

      const guestUser = db.createUser({
        id: guestId,
        email: guestEmail,
        name: 'Guest Explorer',
        isGuest: true,
        createdAt: new Date().toISOString()
      });

      const profile = db.upsertProfile(guestId, {
        safetyFlags: req.body.safetyFlags || {
          completed: false,
          skipped: false,
          pregnantOrPostpartum: false,
          recentInjury: false,
          highBloodPressure: false,
          glaucomaOrEye: false
        }
      });

      const token = signToken({ userId: guestUser.id, email: guestUser.email });

      res.json({
        token,
        user: {
          id: guestUser.id,
          email: guestUser.email,
          name: guestUser.name,
          isGuest: true
        },
        profile
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to initialize guest session' });
    }
  });

  // 5. Auth Me (Fetch current session)
  app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
    const user = req.user!;
    const profile = db.getProfile(user.id) || db.upsertProfile(user.id, {});

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isGuest: Boolean(user.isGuest)
      },
      profile
    });
  });

  // 6. Update User Profile & Safety Flags
  app.put('/api/user/profile', requireAuth, (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { safetyFlags, cycleTrackingEnabled, trimester } = req.body;

      const updated = db.upsertProfile(user.id, {
        safetyFlags,
        cycleTrackingEnabled,
        trimester
      });

      res.json({ profile: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // 7. User Dashboard / Stats & History
  app.get('/api/user/dashboard', requireAuth, (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const stats = db.getDashboardStats(user.id);
      const profile = db.getProfile(user.id);
      const generatedRoutines = db.getUserGeneratedRoutines(user.id, 5);

      res.json({
        stats,
        profile,
        generatedRoutines
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to load dashboard data' });
    }
  });

  // 8. Log Mood Check-in
  app.post('/api/mood/log', optionalAuth, (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id || req.body.userId || 'anonymous';
      const { mood, targetZones } = req.body;

      if (!mood) {
        return res.status(400).json({ error: 'Mood is required' });
      }

      const log = db.addMoodLog({
        userId,
        mood,
        targetZones: targetZones || []
      });

      res.status(201).json({ log });
    } catch (err) {
      res.status(500).json({ error: 'Failed to log mood' });
    }
  });

  // 9. Fetch Mood History
  app.get('/api/mood/history', requireAuth, (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const logs = db.getUserMoodLogs(user.id, 25);
      res.json({ logs });
    } catch (err) {
      res.status(500).json({ error: 'Failed to load mood history' });
    }
  });

  // 10. Complete Session
  app.post('/api/sessions/complete', optionalAuth, (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id || req.body.userId || 'anonymous';
      const { sessionId, sessionTitle, sessionType, durationMinutes, rating } = req.body;

      const record = db.addCompletedSession({
        userId,
        sessionId: sessionId || 'custom-session',
        sessionTitle: sessionTitle || 'FlowState Session',
        sessionType: sessionType || 'sos',
        durationMinutes: Number(durationMinutes) || 12,
        rating: rating || 'helped'
      });

      res.status(201).json({ completedSession: record });
    } catch (err) {
      res.status(500).json({ error: 'Failed to record completed session' });
    }
  });

  // 11. Fetch Completed Sessions History
  app.get('/api/sessions/history', requireAuth, (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const history = db.getUserCompletedSessions(user.id, 30);
      res.json({ history });
    } catch (err) {
      res.status(500).json({ error: 'Failed to load session history' });
    }
  });

  // 12. AI Routine Generator (POST /api/chat) with Deterministic Safety Filtering
  app.post('/api/chat', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { prompt, userId: bodyUserId, safetyFlags: passedSafetyFlags } = req.body;
      const targetUserId = req.user?.id || bodyUserId || 'anonymous';

      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ error: 'Please enter a description of how you feel or what you need.' });
      }

      // Retrieve user profile safety flags
      const storedProfile = targetUserId !== 'anonymous' ? db.getProfile(targetUserId) : undefined;
      const activeSafetyFlags = passedSafetyFlags || storedProfile?.safetyFlags || {
        completed: false,
        skipped: false,
        pregnantOrPostpartum: false,
        recentInjury: false,
        highBloodPressure: false,
        glaucomaOrEye: false
      };
      const trimester = storedProfile?.trimester;

      // 1. Generate Raw Routine via LLM (or fallback)
      const rawRoutine = await generateAIRoutine(prompt.trim(), storedProfile);

      // 2. Run Deterministic Post-LLM Safety Filter (Crucial security boundary)
      const filteredResult = filterRoutineForUser(rawRoutine, activeSafetyFlags, trimester);

      // 3. Audit Logging (records prompt, raw LLM JSON, filtered JSON, notices)
      if (targetUserId !== 'anonymous') {
        db.addGeneratedRoutine({
          userId: targetUserId,
          prompt: prompt.trim(),
          rawRoutineJson: rawRoutine,
          filteredRoutineJson: filteredResult.routine,
          filterNotices: filteredResult.filteredNotices
        });
      }

      // 4. Return sanitized routine & notices
      res.json({
        routine: filteredResult.routine,
        filteredNotices: filteredResult.filteredNotices,
        safetyFlagsApplied: filteredResult.safetyFlagsApplied
      });
    } catch (err) {
      console.error('AI chat endpoint error:', err);
      res.status(500).json({ error: 'Could not generate custom routine at this moment.' });
    }
  });

  // 13. Conversational Guide ("Ask FlowState")
  app.post('/api/guide', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { message, userContext } = req.body;
      const targetUserId = req.user?.id;
      const storedProfile = targetUserId ? db.getProfile(targetUserId) : undefined;

      const mergedContext = {
        safetyFlags: storedProfile?.safetyFlags || userContext?.safetyFlags || {},
        currentScreen: userContext?.currentScreen
      };

      const reply = await getGuideAdvice(message || '', mergedContext);
      res.json({ reply });
    } catch (err) {
      console.error('Guide API error:', err);
      res.status(500).json({ reply: 'We recommend trying the 12-Minute SOS Reset or resting in Child’s Pose.' });
    }
  });

  // 14. Get User's Past Generated Routines
  app.get('/api/routines/saved', requireAuth, (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const routines = db.getUserGeneratedRoutines(user.id, 10);
      res.json({ routines });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch saved routines' });
    }
  });

  // =========================================================================
  // WORDPRESS REST API ROUTE EMULATION (/wp-json/...)
  // Directly mirrors the WordPress flowstate-core plugin endpoints
  // =========================================================================

  // WP REST: Mood Check-in & LearnDash routing
  app.post('/wp-json/flowstate/v1/mood-log', optionalAuth, (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id || 'wp_member_current';
      const { mood, target_zones, targetZones } = req.body;

      if (!mood) {
        return res.status(400).json({ code: 'rest_invalid_param', message: 'Mood is required' });
      }

      const log = db.addMoodLog({
        userId,
        mood,
        targetZones: target_zones || targetZones || []
      });

      const moodSlug = String(mood).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const mapping: Record<string, string> = {
        'anxious': '/courses/anxious-mind-reset/',
        'sore': '/courses/body-restoration-release/',
        'wired': '/courses/down-regulation-vagus/',
        'cramping': '/courses/pelvic-sacral-ease/',
        'low-energy': '/courses/gentle-vitality-flow/'
      };

      const redirect_url = mapping[moodSlug] || `/courses/?mood=${moodSlug}`;

      res.status(200).json({
        success: true,
        logged_entry: log,
        redirect_url
      });
    } catch (err) {
      res.status(500).json({ code: 'flowstate_error', message: 'Failed to record mood log in WordPress user meta' });
    }
  });

  // WP REST: AI Routine Generator with Server-Side Safety Filter
  app.post('/wp-json/flowstate/v1/ai-routine', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { prompt } = req.body;
      const targetUserId = req.user?.id || 'wp_member_current';

      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ code: 'rest_invalid_param', message: 'Please provide a valid prompt' });
      }

      const storedProfile = targetUserId !== 'anonymous' ? db.getProfile(targetUserId) : undefined;
      const activeSafetyFlags = storedProfile?.safetyFlags || {
        completed: true,
        skipped: false,
        pregnantOrPostpartum: false,
        recentInjury: false,
        highBloodPressure: false,
        glaucomaOrEye: false
      };

      const rawRoutine = await generateAIRoutine(prompt.trim(), storedProfile);
      const filteredResult = filterRoutineForUser(rawRoutine, activeSafetyFlags, storedProfile?.trimester);

      if (targetUserId !== 'anonymous') {
        db.addGeneratedRoutine({
          userId: targetUserId,
          prompt: prompt.trim(),
          rawRoutineJson: rawRoutine,
          filteredRoutineJson: filteredResult.routine,
          filterNotices: filteredResult.filteredNotices
        });
      }

      res.status(200).json({
        success: true,
        routine: filteredResult.routine,
        filteredNotices: filteredResult.filteredNotices,
        safetyFlagsApplied: filteredResult.safetyFlagsApplied
      });
    } catch (err) {
      console.error('WP REST AI error:', err);
      res.status(500).json({ code: 'flowstate_ai_error', message: 'Could not generate routine at this time' });
    }
  });

  // WP REST: Current User Info (/wp-json/wp/v2/users/me)
  app.get('/wp-json/wp/v2/users/me', optionalAuth, (req: AuthRequest, res) => {
    const user = req.user || {
      id: 'wp_member_current',
      email: 'member@flowstate.yoga',
      name: 'FlowState Member',
      isGuest: false
    };
    const profile = db.getProfile(user.id) || {
      safetyFlags: {
        completed: true,
        skipped: false,
        pregnantOrPostpartum: false,
        recentInjury: false,
        highBloodPressure: false,
        glaucomaOrEye: false
      },
      cycleTrackingEnabled: true,
      trimester: null
    };

    res.json({
      id: 101,
      name: user.name,
      slug: 'flowstate-member',
      email: user.email,
      meta: {
        flowstate_safety_flags: profile.safetyFlags,
        flowstate_cycle_tracking_enabled: profile.cycleTrackingEnabled,
        flowstate_trimester: profile.trimester,
        flowstate_mood_log: db.getUserMoodLogs(user.id, 10)
      }
    });
  });

  // VITE MIDDLEWARE SETUP (Development vs Production)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FlowState Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
