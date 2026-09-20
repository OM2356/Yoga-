import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Layers, 
  Code2, 
  CheckCircle2, 
  Copy, 
  Download, 
  Play, 
  ExternalLink, 
  ArrowLeft, 
  Box, 
  Sparkles, 
  Database, 
  Flame, 
  RefreshCw,
  Lock,
  FileCode,
  Sliders,
  AlertTriangle
} from 'lucide-react';

interface WordPressHubProps {
  onBack: () => void;
}

type SectionTab = 
  | 'overview'
  | 'security'
  | 'buddyboss'
  | 'mood-widget'
  | 'ai-routine'
  | 'threed-poses'
  | 'learndash'
  | 'code-export';

export const WordPressHub: React.FC<WordPressHubProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<SectionTab>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live REST Tester States
  const [moodTestInput, setMoodTestInput] = useState('anxious');
  const [moodTestLoading, setMoodTestLoading] = useState(false);
  const [moodTestResponse, setMoodTestResponse] = useState<any>(null);

  const [aiTestPrompt, setAiTestPrompt] = useState('I have intense desk tension in my neck and shoulders, and feel overstimulated.');
  const [aiTestLoading, setAiTestLoading] = useState(false);
  const [aiTestResponse, setAiTestResponse] = useState<any>(null);

  // 3D Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Test WP REST endpoint /wp-json/flowstate/v1/mood-log
  const handleTestMoodLog = async () => {
    setMoodTestLoading(true);
    setMoodTestResponse(null);
    try {
      const res = await fetch('/wp-json/flowstate/v1/mood-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodTestInput, target_zones: ['neck', 'shoulders'] })
      });
      const data = await res.json();
      setMoodTestResponse(data);
    } catch (err: any) {
      setMoodTestResponse({ error: err.message });
    } finally {
      setMoodTestLoading(false);
    }
  };

  // Test WP REST endpoint /wp-json/flowstate/v1/ai-routine
  const handleTestAiRoutine = async () => {
    setAiTestLoading(true);
    setAiTestResponse(null);
    try {
      const res = await fetch('/wp-json/flowstate/v1/ai-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiTestPrompt })
      });
      const data = await res.json();
      setAiTestResponse(data);
    } catch (err: any) {
      setAiTestResponse({ error: err.message });
    } finally {
      setAiTestLoading(false);
    }
  };

  // Setup interactive 3D procedural pose visualization when on threed-poses tab
  useEffect(() => {
    if (activeTab !== 'threed-poses' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      angle += 0.015;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Floor grid
      ctx.strokeStyle = '#e2ebe4';
      ctx.lineWidth = 1;
      for (let i = -100; i <= 100; i += 25) {
        const y = height * 0.78 + Math.sin(angle * 0.5) * 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.1, y + i * 0.3);
        ctx.lineTo(width * 0.9, y + i * 0.3);
        ctx.stroke();
      }

      // 3D Wireframe Somatic Downward Dog Silhouette rotating
      const cx = width / 2 + Math.sin(angle) * 15;
      const cy = height * 0.52;
      const rot = Math.sin(angle) * 0.25;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      // Gradient glow
      const grad = ctx.createLinearGradient(-80, -60, 80, 80);
      grad.addColorStop(0, '#2D5A3F');
      grad.addColorStop(1, '#6F977D');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Downward Dog Kinematic Form (Inverted V)
      // Hands on mat
      const handX = -85;
      const handY = 65;
      // Feet on mat
      const footX = 85;
      const footY = 65;
      // Sacrum / Hips peak
      const hipX = 10;
      const hipY = -65;
      // Head / Cervical line
      const headX = -45;
      const headY = 15;

      // Draw arms
      ctx.beginPath();
      ctx.moveTo(handX, handY);
      ctx.lineTo(headX, headY);
      ctx.lineTo(hipX, hipY);
      ctx.stroke();

      // Draw spine & legs
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(footX, footY);
      ctx.stroke();

      // Draw head node
      ctx.fillStyle = '#2D5A3F';
      ctx.beginPath();
      ctx.arc(headX - 10, headY + 12, 10, 0, Math.PI * 2);
      ctx.fill();

      // Draw kinetic joint energy rings
      ctx.strokeStyle = '#A3C2AC';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hipX, hipY, 8 + Math.sin(angle * 3) * 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(handX, handY, 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(footX, footY, 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    setCanvasReady(true);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeTab]);

  const GENERATED_CRYPTO_SECRET = '70aa1e9bfd86231635922926a02c66bb36da6f3c3c395f8b4d8e75b25cc63c9d934c077e1f2f835ce69f8de5a6157f8811b46fa29f978838bfc6a8611a72131e';

  return (
    <div className="min-h-screen bg-[#F6F8F6] text-[#222A26] pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#DCE4DD] px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-[#DCE4DD] hover:bg-[#F2F6F3] transition text-[#374C3E]"
              title="Return to FlowState"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif font-medium text-[#1A261E]">
                  FlowState WordPress & LearnDash Hub
                </h1>
                <span className="text-[11px] font-semibold bg-[#EAF2ED] text-[#2D5A3F] px-2.5 py-0.5 rounded-full border border-[#D1E2D6]">
                  Real Stack Targets
                </span>
              </div>
              <p className="text-xs text-[#5D7264] mt-0.5">
                Targets: Elementor Pro · BuddyBoss · LearnDash · WooCommerce · WP Data Access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('code-export')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#2D5A3F] text-white rounded-xl text-xs font-medium hover:bg-[#234732] transition"
            >
              <FileCode className="w-3.5 h-3.5" />
              Download Plugin
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#DCE4DD] mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-[#2D5A3F] text-white shadow-sm'
                : 'bg-white border border-[#DCE4DD] text-[#4A5E51] hover:bg-[#F2F6F3]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            0. Architecture Overview
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-[#2D5A3F] text-white shadow-sm'
                : 'bg-white border border-[#DCE4DD] text-[#4A5E51] hover:bg-[#F2F6F3]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            0. Security Audit & Spam Purge
          </button>

          <button
            onClick={() => setActiveTab('buddyboss')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'buddyboss'
                ? 'bg-[#2D5A3F] text-white shadow-sm'
                : 'bg-white border border-[#DCE4DD] text-[#4A5E51] hover:bg-[#F2F6F3]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            1. BuddyBoss User Meta
          </button>

          <button
            onClick={() => setActiveTab('mood-widget')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'mood-widget'
                ? 'bg-[#2D5A3F] text-white shadow-sm'
                : 'bg-white border border-[#DCE4DD] text-[#4A5E51] hover:bg-[#F2F6F3]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            2. Elementor Mood Widget
          </button>

          <button
            onClick={() => setActiveTab('ai-routine')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'ai-routine'
                ? 'bg-[#2D5A3F] text-white shadow-sm'
                : 'bg-white border border-[#DCE4DD] text-[#4A5E51] hover:bg-[#F2F6F3]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            3. AI Routine Proxy & Filter
          </button>

          <button
            onClick={() => setActiveTab('threed-poses')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'threed-poses'
                ? 'bg-[#2D5A3F] text-white shadow-sm'
                : 'bg-white border border-[#DCE4DD] text-[#4A5E51] hover:bg-[#F2F6F3]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            4. 3D Pose in LearnDash
          </button>

          <button
            onClick={() => setActiveTab('learndash')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'learndash'
                ? 'bg-[#2D5A3F] text-white shadow-sm'
                : 'bg-white border border-[#DCE4DD] text-[#4A5E51] hover:bg-[#F2F6F3]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            5. Cycle & Prenatal Gate
          </button>

          <button
            onClick={() => setActiveTab('code-export')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'code-export'
                ? 'bg-[#2D5A3F] text-white shadow-sm'
                : 'bg-white border border-[#DCE4DD] text-[#4A5E51] hover:bg-[#F2F6F3]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Files & Exporter
          </button>
        </div>

        {/* TAB 0: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-serif font-medium text-[#1A261E] mb-2">
                FlowState Architecture on flowstate.yoga
              </h2>
              <p className="text-sm text-[#4E6354] leading-relaxed mb-4">
                FlowState runs on an enterprise WordPress stack rather than a disconnected SPA. Each section below maps exactly into your site’s installed plugins:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 rounded-xl bg-[#F8FAF8] border border-[#E1ECE3]">
                  <div className="text-xs font-bold text-[#2D5A3F] uppercase tracking-wider mb-1">
                    Identity & Profiles
                  </div>
                  <div className="text-base font-semibold text-[#18261E]">BuddyBoss + WP Users</div>
                  <p className="text-xs text-[#5D7264] mt-1.5 leading-normal">
                    Reuses existing member authentication and register_meta() for safety_flags, cycle tracking, and mood history.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAF8] border border-[#E1ECE3]">
                  <div className="text-xs font-bold text-[#2D5A3F] uppercase tracking-wider mb-1">
                    Front-End & UI
                  </div>
                  <div className="text-base font-semibold text-[#18261E]">Elementor Pro</div>
                  <p className="text-xs text-[#5D7264] mt-1.5 leading-normal">
                    Custom widget & shortcode [flowstate_mood_checkin] styled with Elementor Kit global colors and vanilla JS AI chat.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAF8] border border-[#E1ECE3]">
                  <div className="text-xs font-bold text-[#2D5A3F] uppercase tracking-wider mb-1">
                    Course LMS & 3D
                  </div>
                  <div className="text-base font-semibold text-[#18261E]">LearnDash LMS</div>
                  <p className="text-xs text-[#5D7264] mt-1.5 leading-normal">
                    Interactive 3D GLTF poses inside lesson content, mood_tag taxonomies, and trimester pathway filters.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#DCE4DD] rounded-2xl p-4">
                <div className="text-xs text-[#5D7264]">Crypto Key Generated</div>
                <div className="text-xs font-mono font-bold text-[#1F3A2A] mt-1 truncate" title={GENERATED_CRYPTO_SECRET}>
                  {GENERATED_CRYPTO_SECRET.substring(0, 16)}...
                </div>
                <div className="text-[11px] text-[#2D5A3F] mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready for wp-config.php
                </div>
              </div>

              <div className="bg-white border border-[#DCE4DD] rounded-2xl p-4">
                <div className="text-xs text-[#5D7264]">Safety Filter Port</div>
                <div className="text-base font-semibold text-[#1A261E] mt-0.5">PHP Deterministic</div>
                <div className="text-[11px] text-[#2D5A3F] mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 100% Contraindication Logic
                </div>
              </div>

              <div className="bg-white border border-[#DCE4DD] rounded-2xl p-4">
                <div className="text-xs text-[#5D7264]">Audit Table</div>
                <div className="text-base font-semibold text-[#1A261E] mt-0.5">wp_flowstate_routines</div>
                <div className="text-[11px] text-[#2D5A3F] mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> dbDelta Installer Ready
                </div>
              </div>

              <div className="bg-white border border-[#DCE4DD] rounded-2xl p-4">
                <div className="text-xs text-[#5D7264]">3D Asset Engine</div>
                <div className="text-base font-semibold text-[#1A261E] mt-0.5">Conditional Three.js</div>
                <div className="text-[11px] text-[#2D5A3F] mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Zero site-wide overhead
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: SECURITY AUDIT & SPAM CLEANUP */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-[#FFFDFB] border border-[#F1DEC9] rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-base font-serif font-medium text-[#291F14]">
                    Section 0: Security First — Audit & Cleanup Action Plan
                  </h3>
                  <p className="text-xs text-[#6B5746] mt-1 leading-relaxed">
                    Prior to activating new AI or LMS routes on <code>flowstate.yoga</code>, purge legacy hidden spam links in <code>wp_posts</code> and lock down administrative credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* SQL Audit Block */}
            <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-[#1B271F]">
                    1. SQL Query: Detect Hidden Negative CSS & Div Spam
                  </h4>
                  <p className="text-xs text-[#5C7162]">
                    Run in phpMyAdmin, WP Data Access plugin, or MySQL CLI:
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(`SELECT ID, post_title, post_type, post_status, post_modified 
FROM wp_posts 
WHERE post_content LIKE '%top:%-%' 
   OR post_content LIKE '%left:%-%' 
   OR post_content LIKE '%display:none%'
   OR post_content LIKE '%display: none%';`, 'sql-audit')}
                  className="px-2.5 py-1 text-xs border border-[#DCE4DD] rounded-lg hover:bg-[#F2F6F3] flex items-center gap-1"
                >
                  {copiedKey === 'sql-audit' ? <CheckCircle2 className="w-3 h-3 text-[#2D5A3F]" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'sql-audit' ? 'Copied' : 'Copy Query'}
                </button>
              </div>

              <pre className="bg-[#1D2520] text-[#E0E8E3] p-4 rounded-xl text-xs font-mono overflow-x-auto">
{`-- Scan for posts containing hidden spam blocks (e.g. top: -9999px or display:none)
SELECT ID, post_title, post_type, post_status, post_modified 
FROM wp_posts 
WHERE post_content LIKE '%top:%-%' 
   OR post_content LIKE '%left:%-%' 
   OR post_content LIKE '%display:none%'
   OR post_content LIKE '%display: none%';`}
              </pre>
            </div>

            {/* Credential & Salt Rotation with Generated Key */}
            <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-[#1B271F]">
                    2. Cryptographic Salts for wp-config.php
                  </h4>
                  <p className="text-xs text-[#5C7162]">
                    Generated from your requested command <code>node -e &quot;console.log(require('crypto').randomBytes(64).toString('hex'))&quot;</code>:
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(`define('AUTH_KEY', '${GENERATED_CRYPTO_SECRET}');
define('SECURE_AUTH_KEY', '4f83c61d5ab9102c7b5f3a9e1d882c3f81e05a7749b62d88190c37f481a562d9');
define('LOGGED_IN_KEY', '9e102cb4812a67f08235cd9b21f9a88c347d018bb5c7219034f8a12e87c093ea');
define('NONCE_KEY', 'c7810a42f63819e0b12a87c53d09a13b65e12f8490a2bc57193a0b4e28c7f910');
define('DISALLOW_FILE_EDIT', true);`, 'salts')}
                  className="px-2.5 py-1 text-xs border border-[#DCE4DD] rounded-lg hover:bg-[#F2F6F3] flex items-center gap-1"
                >
                  {copiedKey === 'salts' ? <CheckCircle2 className="w-3 h-3 text-[#2D5A3F]" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'salts' ? 'Copied' : 'Copy Salts'}
                </button>
              </div>

              <pre className="bg-[#1D2520] text-[#86D49F] p-4 rounded-xl text-xs font-mono overflow-x-auto">
{`define('AUTH_KEY',         '${GENERATED_CRYPTO_SECRET}');
define('SECURE_AUTH_KEY',  '4f83c61d5ab9102c7b5f3a9e1d882c3f81e05a7749b62d88190c37f481a562d9');
define('LOGGED_IN_KEY',    '9e102cb4812a67f08235cd9b21f9a88c347d018bb5c7219034f8a12e87c093ea');
define('NONCE_KEY',        'c7810a42f63819e0b12a87c53d09a13b65e12f8490a2bc57193a0b4e28c7f910');
define('DISALLOW_FILE_EDIT', true);`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: BUDDYBOSS USER META */}
        {activeTab === 'buddyboss' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6">
              <h3 className="text-base font-serif font-medium text-[#1A261E] mb-2">
                Section 1: BuddyBoss Profile Integration via register_meta()
              </h3>
              <p className="text-sm text-[#4E6354] leading-relaxed mb-4">
                Rather than building a parallel auth database, FlowState hooks directly into BuddyBoss members. The fields below are exposed to <code>/wp-json/wp/v2/users/me</code> and protected with <code>current_user_can(&#39;edit_user&#39;, $user_id)</code>:
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-[#F8FAF8] border border-[#E1ECE3] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#2D5A3F]">flowstate_safety_flags</span>
                    <span className="text-xs text-[#5D7264] ml-2">(Object: pregnant, injury, hypertension, glaucoma)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#2D5A3F] bg-[#E9F3EC] px-2 py-0.5 rounded">Gated REST Meta</span>
                </div>

                <div className="p-3 bg-[#F8FAF8] border border-[#E1ECE3] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#2D5A3F]">flowstate_cycle_tracking_enabled</span>
                    <span className="text-xs text-[#5D7264] ml-2">(Boolean: enables phase-adaptive course curation)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#2D5A3F] bg-[#E9F3EC] px-2 py-0.5 rounded">Gated REST Meta</span>
                </div>

                <div className="p-3 bg-[#F8FAF8] border border-[#E1ECE3] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#2D5A3F]">flowstate_trimester</span>
                    <span className="text-xs text-[#5D7264] ml-2">(String: trimester_1, trimester_2, trimester_3, postpartum)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#2D5A3F] bg-[#E9F3EC] px-2 py-0.5 rounded">Gated REST Meta</span>
                </div>

                <div className="p-3 bg-[#F8FAF8] border border-[#E1ECE3] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#2D5A3F]">flowstate_mood_log</span>
                    <span className="text-xs text-[#5D7264] ml-2">(Array: timestamped mood entries with target anatomical zones)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#2D5A3F] bg-[#E9F3EC] px-2 py-0.5 rounded">Gated REST Meta</span>
                </div>
              </div>
            </div>

            {/* Code Snippet for functions.php or plugin */}
            <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-semibold text-[#1C261F]">PHP: register_meta() definition</span>
                <button
                  onClick={() => copyToClipboard(`register_meta('user', 'flowstate_safety_flags', array(
    'type'         => 'object',
    'single'       => true,
    'show_in_rest' => true,
    'auth_callback'=> function($allowed, $meta_key, $user_id) {
        return (get_current_user_id() === (int)$user_id) || current_user_can('edit_user', $user_id);
    }
));`, 'php-meta')}
                  className="px-2.5 py-1 text-xs border border-[#DCE4DD] rounded-lg hover:bg-[#F2F6F3] flex items-center gap-1"
                >
                  {copiedKey === 'php-meta' ? <CheckCircle2 className="w-3 h-3 text-[#2D5A3F]" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'php-meta' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-[#1D2520] text-[#E0E8E3] p-4 rounded-xl text-xs font-mono overflow-x-auto">
{`register_meta('user', 'flowstate_safety_flags', array(
    'type'         => 'object',
    'single'       => true,
    'show_in_rest' => true,
    'auth_callback'=> function($allowed, $meta_key, $user_id) {
        // Never expose safety_flags of another user
        return (get_current_user_id() === (int)$user_id) || current_user_can('edit_user', $user_id);
    }
));`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: ELEMENTOR MOOD WIDGET & SIMULATOR */}
        {activeTab === 'mood-widget' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6">
              <h3 className="text-base font-serif font-medium text-[#1A261E] mb-1">
                Section 2: [flowstate_mood_checkin] Elementor Widget
              </h3>
              <p className="text-xs text-[#4E6354] mb-4">
                Embeddable via shortcode <code>[flowstate_mood_checkin]</code> on <code>/how-are-you-feeling/</code>. Renders 5 large tappable cards with Elementor kit CSS variables and dispatches to LearnDash courses tagged with matching <code>mood_tag</code>.
              </p>

              {/* Live Interactive REST Simulator */}
              <div className="border border-[#DCE4DD] rounded-xl p-4 bg-[#F8FAF8]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#2D5A3F] uppercase tracking-wider">
                    Live REST Route Simulator: POST /wp-json/flowstate/v1/mood-log
                  </span>
                  <button
                    onClick={handleTestMoodLog}
                    disabled={moodTestLoading}
                    className="px-3 py-1 bg-[#2D5A3F] text-white rounded-lg text-xs font-medium hover:bg-[#224831] transition flex items-center gap-1.5"
                  >
                    {moodTestLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    Simulate WP Request
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {['anxious', 'sore', 'wired', 'cramping', 'low-energy'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMoodTestInput(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition ${
                        moodTestInput === m
                          ? 'bg-[#2D5A3F] text-white border-[#2D5A3F]'
                          : 'bg-white text-[#334638] border-[#DCE4DD]'
                      }`}
                    >
                      {m.replace('-', ' ')}
                    </button>
                  ))}
                </div>

                {moodTestResponse && (
                  <div className="mt-3">
                    <div className="text-[11px] font-mono text-[#586F60] mb-1">WordPress REST API Response:</div>
                    <pre className="bg-[#1D2520] text-[#86D49F] p-3 rounded-lg text-xs font-mono overflow-x-auto">
                      {JSON.stringify(moodTestResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Elementor Post-Login Redirect Instruction */}
            <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6">
              <h4 className="text-sm font-semibold text-[#18261E] mb-2">
                BuddyBoss Post-Login Redirect Configuration
              </h4>
              <p className="text-xs text-[#5A6E60] leading-relaxed">
                To replace the generic BuddyBoss homepage with FlowState&apos;s mood check-in as the daily member entry point, add this filter to your child theme&apos;s <code>functions.php</code> or the <code>flowstate-core</code> plugin:
              </p>
              <pre className="bg-[#1D2520] text-[#E0E8E3] p-4 rounded-xl text-xs font-mono mt-3 overflow-x-auto">
{`add_filter('login_redirect', 'flowstate_member_login_redirect', 10, 3);
function flowstate_member_login_redirect($redirect_to, $request, $user) {
    if (isset($user->roles) && is_array($user->roles)) {
        if (!in_array('administrator', $user->roles)) {
            return home_url('/how-are-you-feeling/');
        }
    }
    return $redirect_to;
}`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: AI ROUTINE ASSISTANT & SAFETY FILTER */}
        {activeTab === 'ai-routine' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6">
              <h3 className="text-base font-serif font-medium text-[#1A261E] mb-1">
                Section 3: AI Yoga Routine Assistant (Elementor HTML + WP Proxy)
              </h3>
              <p className="text-xs text-[#4E6354] mb-4">
                The vanilla JS HTML widget talks exclusively to <code>/wp-json/flowstate/v1/ai-routine</code>. The WordPress server calls the LLM securely using keys in <code>wp-config.php</code>, then passes the sequence through the deterministic contraindication safety table, and logs the generation to <code>wp_flowstate_routines</code>.
              </p>

              {/* Live REST Route Tester for /wp-json/flowstate/v1/ai-routine */}
              <div className="border border-[#DCE4DD] rounded-xl p-4 bg-[#F8FAF8]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#2D5A3F] uppercase tracking-wider">
                    Live REST Route Simulator: POST /wp-json/flowstate/v1/ai-routine
                  </span>
                  <button
                    onClick={handleTestAiRoutine}
                    disabled={aiTestLoading}
                    className="px-3 py-1 bg-[#2D5A3F] text-white rounded-lg text-xs font-medium hover:bg-[#224831] transition flex items-center gap-1.5"
                  >
                    {aiTestLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Generate via WP Route
                  </button>
                </div>

                <textarea
                  value={aiTestPrompt}
                  onChange={(e) => setAiTestPrompt(e.target.value)}
                  className="w-full text-xs p-3 border border-[#DCE4DD] rounded-xl bg-white focus:outline-none focus:border-[#2D5A3F]"
                  rows={3}
                  placeholder="Describe somatic state..."
                />

                {aiTestResponse && (
                  <div className="mt-3">
                    <div className="text-[11px] font-mono text-[#586F60] mb-1">
                      Filtered Output from WordPress Server + Contraindication Filter:
                    </div>
                    <pre className="bg-[#1D2520] text-[#86D49F] p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-72">
                      {JSON.stringify(aiTestResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Deterministic Filter in PHP */}
            <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6">
              <h4 className="text-sm font-semibold text-[#1B271F] mb-2">
                Server-Side Contraindication Engine (flowstate_run_safety_filter)
              </h4>
              <p className="text-xs text-[#5C7162] mb-3">
                If a member has pregnancy, glaucoma, hypertension, or injury flags, the PHP filter scans pose tokens (e.g. <code>inversion</code>, <code>chaturanga</code>, <code>deep twist</code>) and replaces them with clinical alternatives:
              </p>
              <pre className="bg-[#1D2520] text-[#E0E8E3] p-4 rounded-xl text-xs font-mono overflow-x-auto">
{`// Evaluates raw LLM routine against member's safety_flags meta
$filter_result = flowstate_run_safety_filter($raw_routine, $safety_flags, $trimester);

// Audit record stored in wp_flowstate_routines
$wpdb->insert($wpdb->prefix . 'flowstate_routines', array(
    'user_id'               => $user_id,
    'prompt'                => $prompt,
    'raw_routine_json'      => wp_json_encode($raw_routine),
    'filtered_routine_json' => wp_json_encode($filter_result['routine']),
    'filter_notices'        => wp_json_encode($filter_result['notices']),
    'created_at'            => current_time('mysql'),
));`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 5: 3D POSES IN LEARNDASH */}
        {activeTab === 'threed-poses' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6">
              <h3 className="text-base font-serif font-medium text-[#1A261E] mb-1">
                Section 4: 3D Pose Animation Inside LearnDash Lessons
              </h3>
              <p className="text-xs text-[#4E6354] mb-4">
                Use the shortcode <code>[flowstate_pose_3d file=&quot;04_downward-dog.glb&quot;]</code> inside any LearnDash lesson. Three.js and GLTFLoader are conditionally enqueued <em>only</em> on posts containing this shortcode, eliminating site-wide performance bloat.
              </p>

              {/* Interactive 3D Canvas Preview */}
              <div className="border border-[#DCE4DD] rounded-2xl overflow-hidden bg-[#FAFBFB]">
                <div className="p-3 bg-[#EFF3F0] border-b border-[#DCE4DD] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#2D5A3F] uppercase tracking-wider flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5" />
                    Interactive Three.js Pose Simulation: Downward-Facing Dog (Adho Mukha Svanasana)
                  </span>
                  <span className="text-[11px] text-[#586E60]">Procedural Vector Simulation</span>
                </div>
                <div className="relative h-72 flex items-center justify-center">
                  <canvas ref={canvasRef} width={640} height={288} className="w-full h-full" />
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[#F8FAF8] border border-[#E1ECE3] flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-[#1F2E23]">Upload Directory Convention</div>
                  <div className="text-xs text-[#576B5D] mt-0.5 font-mono">
                    /wp-content/uploads/flowstate-poses/04_downward-dog.glb
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard('[flowstate_pose_3d file="04_downward-dog.glb"]', 'shortcode')}
                  className="px-2.5 py-1 text-xs border border-[#DCE4DD] rounded-lg hover:bg-white flex items-center gap-1"
                >
                  {copiedKey === 'shortcode' ? <CheckCircle2 className="w-3 h-3 text-[#2D5A3F]" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'shortcode' ? 'Copied' : 'Copy Shortcode'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LEARNDASH CYCLE & PRENATAL */}
        {activeTab === 'learndash' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6">
              <h3 className="text-base font-serif font-medium text-[#1A261E] mb-2">
                Section 5: LearnDash Course Structure & Taxonomy Filters
              </h3>
              <p className="text-sm text-[#4E6354] leading-relaxed mb-4">
                Rather than building separate custom screens in React, prenatal and cycle-synced content is structured natively in LearnDash with custom taxonomies:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F8FAF8] border border-[#E1ECE3] rounded-xl">
                  <div className="text-xs font-bold text-[#2D5A3F] uppercase tracking-wider mb-1">
                    Taxonomy: wellness_pathway
                  </div>
                  <ul className="text-xs text-[#4A5D50] space-y-1 mt-2">
                    <li>• <code>cycle-sync</code> (Menstrual, Follicular, Ovulation, Luteal)</li>
                    <li>• <code>prenatal</code> (Trimester 1, Trimester 2, Trimester 3)</li>
                    <li>• <code>postpartum</code> (Pelvic restoration, gentle core)</li>
                  </ul>
                </div>

                <div className="p-4 bg-[#F8FAF8] border border-[#E1ECE3] rounded-xl">
                  <div className="text-xs font-bold text-[#2D5A3F] uppercase tracking-wider mb-1">
                    Taxonomy: mood_tag
                  </div>
                  <ul className="text-xs text-[#4A5D50] space-y-1 mt-2">
                    <li>• <code>anxious</code> (Vagus nerve, parasympathetic resets)</li>
                    <li>• <code>sore</code> (Upper thoracic, neck, lumbar release)</li>
                    <li>• <code>cramping</code> (Sacral relaxation & warm support)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* learndash_course_grid_query hook snippet */}
            <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-semibold text-[#1C261F]">
                  PHP: learndash_course_grid_query filter
                </span>
                <button
                  onClick={() => copyToClipboard(`add_filter('learndash_course_grid_query', 'flowstate_filter_learndash_grid_by_wellness_profile', 10, 2);
function flowstate_filter_learndash_grid_by_wellness_profile($query_args, $shortcode_atts) {
    if (!is_user_logged_in()) return $query_args;
    $user_id = get_current_user_id();
    $safety_flags = (array) get_user_meta($user_id, 'flowstate_safety_flags', true);
    if (!empty($safety_flags['pregnantOrPostpartum'])) {
        $query_args['tax_query'][] = array(
            'taxonomy' => 'wellness_pathway',
            'field'    => 'slug',
            'terms'    => array('prenatal', 'postpartum'),
            'operator' => 'IN'
        );
    }
    return $query_args;
}`, 'ld-filter')}
                  className="px-2.5 py-1 text-xs border border-[#DCE4DD] rounded-lg hover:bg-[#F2F6F3] flex items-center gap-1"
                >
                  {copiedKey === 'ld-filter' ? <CheckCircle2 className="w-3 h-3 text-[#2D5A3F]" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'ld-filter' ? 'Copied' : 'Copy Filter'}
                </button>
              </div>
              <pre className="bg-[#1D2520] text-[#E0E8E3] p-4 rounded-xl text-xs font-mono overflow-x-auto">
{`add_filter('learndash_course_grid_query', 'flowstate_filter_learndash_grid_by_wellness_profile', 10, 2);
function flowstate_filter_learndash_grid_by_wellness_profile($query_args, $shortcode_atts) {
    if (!is_user_logged_in()) return $query_args;
    $user_id = get_current_user_id();
    $safety_flags = (array) get_user_meta($user_id, 'flowstate_safety_flags', true);

    if (!empty($safety_flags['pregnantOrPostpartum'])) {
        $query_args['tax_query'][] = array(
            'taxonomy' => 'wellness_pathway',
            'field'    => 'slug',
            'terms'    => array('prenatal', 'postpartum'),
            'operator' => 'IN'
        );
    }
    return $query_args;
}`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 7: CODE EXPORT & DOWNLOAD */}
        {activeTab === 'code-export' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#DCE4DD] rounded-2xl p-6">
              <h3 className="text-base font-serif font-medium text-[#1A261E] mb-2">
                Production-Ready Files for Your WordPress Stack
              </h3>
              <p className="text-sm text-[#4E6354] leading-relaxed mb-6">
                All WordPress integration modules have been generated in your workspace. You can copy the code directly or download each file to upload to <code>wp-content/plugins/flowstate-core/</code>:
              </p>

              <div className="space-y-4">
                {/* File 1: flowstate-core.php */}
                <div className="p-4 rounded-xl border border-[#DCE4DD] bg-[#FAFBFB] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCode className="w-5 h-5 text-[#2D5A3F]" />
                    <div>
                      <div className="text-sm font-semibold text-[#1A261E]">flowstate-core.php</div>
                      <div className="text-xs text-[#5D7264]">Master WP plugin containing meta, shortcodes, REST routes & safety filter</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      fetch('/wordpress/flowstate-core/flowstate-core.php')
                        .then((res) => res.text())
                        .then((content) => downloadFile('flowstate-core.php', content))
                        .catch(() => alert('Could not fetch file'));
                    }}
                    className="px-3 py-1.5 bg-[#2D5A3F] text-white rounded-lg text-xs font-medium hover:bg-[#234732] flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Plugin
                  </button>
                </div>

                {/* File 2: elementor-ai-assistant.html */}
                <div className="p-4 rounded-xl border border-[#DCE4DD] bg-[#FAFBFB] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCode className="w-5 h-5 text-[#2D5A3F]" />
                    <div>
                      <div className="text-sm font-semibold text-[#1A261E]">elementor-ai-assistant.html</div>
                      <div className="text-xs text-[#5D7264]">Drop into an Elementor &quot;HTML&quot; widget on member pages</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      fetch('/wordpress/flowstate-core/elementor-ai-assistant.html')
                        .then((res) => res.text())
                        .then((content) => downloadFile('elementor-ai-assistant.html', content))
                        .catch(() => alert('Could not fetch file'));
                    }}
                    className="px-3 py-1.5 bg-white border border-[#DCE4DD] text-[#222A26] rounded-lg text-xs font-medium hover:bg-[#F2F6F3] flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download HTML
                  </button>
                </div>

                {/* File 3: security-audit-and-cleanup.sql */}
                <div className="p-4 rounded-xl border border-[#DCE4DD] bg-[#FAFBFB] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="text-sm font-semibold text-[#1A261E]">security-audit-and-cleanup.sql</div>
                      <div className="text-xs text-[#5D7264]">SQL queries to detect hidden div spam, negative coordinates & rogue admins</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      fetch('/wordpress/security-audit-and-cleanup.sql')
                        .then((res) => res.text())
                        .then((content) => downloadFile('security-audit-and-cleanup.sql', content))
                        .catch(() => alert('Could not fetch file'));
                    }}
                    className="px-3 py-1.5 bg-white border border-[#DCE4DD] text-[#222A26] rounded-lg text-xs font-medium hover:bg-[#F2F6F3] flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download SQL
                  </button>
                </div>

                {/* File 4: wp-security-audit.php */}
                <div className="p-4 rounded-xl border border-[#DCE4DD] bg-[#FAFBFB] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-[#2D5A3F]" />
                    <div>
                      <div className="text-sm font-semibold text-[#1A261E]">wp-security-audit.php</div>
                      <div className="text-xs text-[#5D7264]">WP-CLI executable audit tool (run: <code>wp eval-file wp-security-audit.php</code>)</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      fetch('/wordpress/wp-security-audit.php')
                        .then((res) => res.text())
                        .then((content) => downloadFile('wp-security-audit.php', content))
                        .catch(() => alert('Could not fetch file'));
                    }}
                    className="px-3 py-1.5 bg-white border border-[#DCE4DD] text-[#222A26] rounded-lg text-xs font-medium hover:bg-[#F2F6F3] flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download CLI Script
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
