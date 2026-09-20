import React, { useState } from 'react';
import { BookOpen, Clock, Tag, ArrowRight, X, Bookmark, Share2 } from 'lucide-react';

interface Article {
  id: string;
  category: string;
  title: string;
  sanskritSubtitle?: string;
  excerpt: string;
  readingTime: string;
  author: string;
  date: string;
  content: string[];
  keyTakeaway: string;
}

const KNOWLEDGE_ARTICLES: Article[] = [
  {
    id: 'vagal-brake-screen-fatigue',
    category: 'Yoga & Wellness',
    title: 'The Vagal Brake: Why 12 Minutes of Somatic Yoga Dissolves Desk Exhaustion',
    sanskritSubtitle: 'Sthira Sukham Asanam — Posture is steadiness and ease',
    excerpt: 'Continuous screen engagement keeps the autonomic nervous system in low-grade sympathetic fight-or-flight. Here is the neurobiology behind downward spinal traction and diaphragmatic vagus nerve stimulation.',
    readingTime: '5 min read',
    author: 'FlowState Research Group',
    date: 'Autumn 2026',
    keyTakeaway: 'Extending the exhalation by 2 seconds activates the parasympathetic ventral vagal complex, slowing heart rate within 90 seconds.',
    content: [
      'For knowledge workers and competitive examination candidates, exhaustion is rarely muscular in origin. Rather, it is the metabolic consequence of a sympathetic nervous system running continuously without reset intervals.',
      'When gazing fixedly at a screen for hours, your blink rate drops by 60%, the sub-occipital muscles at the base of the skull chronically contract, and the thoracic diaphragm becomes braced. The brain interprets this braced posture as an environmental threat, releasing sustained baseline cortisol.',
      'Classical yoga asana addresses this directly. In postures such as Balasana (Child’s Pose) and Viparita Karani (Legs Up the Wall), the head rests below the heart or the abdominal wall is gently compressed against the thighs. Baroreceptors in the carotid sinuses sense an increase in arterial pressure and signal the vagus nerve to apply what physiologists call the "vagal brake".',
      'Within three to five breath cycles, acetylcholine is released directly onto the cardiac pacemaker cells, reducing pulse rate and allowing the prefrontal cortex to regain clarity. You do not need ninety minutes of vigorous vinyasa when mental burnout strikes; you need targeted vagal down-regulation.'
    ]
  },
  {
    id: 'patanjali-ahimsa-recovery',
    category: 'Philosophy & Wisdom',
    title: 'Ahimsa on the Mat: Overcoming Academic & Career Burnout with Non-Violence',
    sanskritSubtitle: 'Yoga Sutra 2.35: Ahimsa Pratishthayam',
    excerpt: 'Modern ambition often treats the human body as an engine to be coerced. Patanjali’s first ethical restraint offers a pragmatic antidote to competitive exhaustion.',
    readingTime: '6 min read',
    author: 'Classical Sutra Study',
    date: 'Autumn 2026',
    keyTakeaway: 'True discipline in yoga is not pushing through pain, but maintaining awareness without self-aggression.',
    content: [
      'In competitive environments—from IIT JAM and UPSC preparation to technology sprint cycles—the prevailing ethos is aggressive self-maximization. We force late hours, ignore cervical tension, and consume caffeine to mute physiological fatigue.',
      'Patanjali places Ahimsa (non-harm or radical non-violence) as the cornerstone of the entire eight-limbed yogic tree. On the mat, violence does not simply mean physical injury; it manifests as forcing a hamstring to lengthen past its defensive stretch-reflex, or holding your breath through an unsustainable posture to look accomplished.',
      'When you practice outcome-based yoga, Ahimsa transforms into clinical intelligence. You recognize that tight shoulders are not an obstacle to conquer, but an anatomical signal requesting release. By choosing gentle somatic variations over performative shapes, the nervous system drops its defensive armor.'
    ]
  },
  {
    id: 'pranayama-co2-tolerance',
    category: 'Practices & Techniques',
    title: 'The Physiology of Nadi Shodhana: Restoring Hemispheric Balance',
    sanskritSubtitle: 'Nadi Shodhana Pranayama — Alternate Nostril Breathing',
    excerpt: 'Why alternate nostril breathing shifts autonomic tone and stabilizes cognitive bandwidth before high-stakes cognitive tasks.',
    readingTime: '4 min read',
    author: 'Somatic Physiology Note',
    date: 'Autumn 2026',
    keyTakeaway: 'Nadi Shodhana improves carbon dioxide tolerance and balances left and right frontal lobe EEG patterns.',
    content: [
      'The nasal cycle is a rhythm governed by the hypothalamus, alternating airflow dominance between the left and right nostrils every 90 to 180 minutes. The right nostril correlates with sympathetic dominance, elevated metabolic rate, and analytical focus; the left corresponds to parasympathetic calm, spatial reasoning, and restorative physiology.',
      'Nadi Shodhana (channel-purification breathing) uses physical occlusion of alternate nostrils with a gentle Vishnu mudra. Breathing deliberately through the left nostril (Ida nadi) activates the contralateral right hemisphere and dampens autonomic reactivity.',
      'Practicing five rounds of 1:1 ratio breathing (4 seconds in, 4 seconds out) before opening a textbook or entering a high-stakes review instantly restores mental equilibrium.'
    ]
  },
  {
    id: 'dinacharya-circadian-rhythm',
    category: 'Yogic Lifestyle',
    title: 'Dinacharya for Desk Workers: Aligning Circadian Rhythms with Daily Movement',
    sanskritSubtitle: 'Ayurvedic Daily Routine for Cognitive Stamina',
    excerpt: 'Simple, non-dogmatic daily adjustments rooted in traditional routines that protect the eyes, spine, and sleep architecture.',
    readingTime: '7 min read',
    author: 'Traditional Ayurvedic Texts',
    date: 'Autumn 2026',
    keyTakeaway: 'Morning hydration, midday spinal decompression, and an evening screen curfew preserve somatic vitality.',
    content: [
      'In classical Ayurvedic thought, physical health is not episodic; it is the natural byproduct of Dinacharya (daily rhythm). For sedentary modern workers, the disconnect between natural daylight and blue-light exposure produces circadian misalignment.',
      'Small, consistent rituals yield outsized somatic returns: drinking warm water upon waking, resting the eyes on a distant horizon every 45 minutes, performing two minutes of cervical traction at midday, and ending the day with five minutes in Viparita Karani before sleep.',
      'These practices require no studio membership and no exotic equipment—only an intentional relationship with your bodily state.'
    ]
  },
  {
    id: 'sanskrit-roots-of-asana',
    category: 'Sanskrit & Terminology',
    title: 'A Glossary of Classical Sanskrit Asana Roots: Language as Somatic Insight',
    sanskritSubtitle: 'Vyakarana — The Science of Sacred Root Words',
    excerpt: 'Deconstruct the linguistic architecture of asana names: Bala, Svan, Vriksha, Marjary, and what each root conveys about body state.',
    readingTime: '4 min read',
    author: 'Linguistic Archives',
    date: 'Autumn 2026',
    keyTakeaway: 'Sanskrit posture names describe psychological states and somatic qualities, not merely physical angles.',
    content: [
      'Sanskrit names for yoga postures are neither arbitrary nor merely ornamental. Each name contains a verbal root (dhatu) that instructs the practitioner on internal energetic alignment.',
      'Consider "Sukhasana" (Easy Pose). The root "Kha" originally referred to the axle-hole of a chariot wheel; "Su" denotes good or smooth. Sukhasana literally means "a state where the axle turns freely without grinding." When you sit properly, your hip joints and spine experience zero friction.',
      'Similarly, "Balasana" draws from "Bala" (infant or innocence), directing the body to release competitive tension and surrender back into embryonic safety on the earth.'
    ]
  },
  {
    id: 'fascia-thoracolumbar-decompression',
    category: 'Yoga Foundations',
    title: 'The Thoracolumbar Fascia: How Lower Back Compression Develops and Heals',
    sanskritSubtitle: 'Anatomy of Spinal Health in Hatha Yoga',
    excerpt: 'An evidence-grounded look at why prolonged sitting tightens the thoracolumbar diamond and which micro-movements restore hydration.',
    readingTime: '5 min read',
    author: 'Anatomy & Biomechanics',
    date: 'Autumn 2026',
    keyTakeaway: 'Fascia requires slow, gentle, sustained elongation rather than ballistic stretching to rehydrate.',
    content: [
      'The thoracolumbar fascia is a dense, diamond-shaped connective tissue sheath spanning the lower spine, anchoring the latissimus dorsi, gluteus maximus, and deep erector spinae muscles.',
      'When seated for hours with posterior pelvic tilt, this tissue becomes dehydrated and adhesive. Ballistic or aggressive stretching only triggers muscle spindle contraction to protect the spine.',
      'Gentle passive postures held for 60 to 90 seconds—such as Supported Child’s Pose or Sphinx Pose with relaxed glutes—allow viscoelastic creep. Water molecules flow back into the proteoglycan ground substance, relieving stubborn lower back ache without joint irritation.'
    ]
  }
];

const CATEGORIES = [
  'All',
  'Yoga Foundations',
  'Practices & Techniques',
  'Philosophy & Wisdom',
  'Yoga & Wellness',
  'Yogic Lifestyle',
  'Sanskrit & Terminology'
];

interface KnowledgeHubProps {
  onBackToHome: () => void;
}

export const KnowledgeHub: React.FC<KnowledgeHubProps> = ({ onBackToHome }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

  const featuredArticle = KNOWLEDGE_ARTICLES[0];

  const filteredArticles = KNOWLEDGE_ARTICLES.filter((a) => {
    if (selectedCategory === 'All') return true;
    return a.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#252825] px-4 sm:px-6 py-8 sm:py-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E8E2D8] pb-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#52715E] font-semibold">
              EDITORIAL PUBLICATION · SOMATIC RESEARCH & TRADITION
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif-display font-medium text-[#1A3123] tracking-tight mt-1">
              FlowState Knowledge Hub
            </h1>
            <p className="text-sm text-[#5D6B60] mt-1.5 max-w-xl">
              Thoughtful inquiries into the neurobiology of somatic yoga, Sanskrit philosophy, and daily rituals for cognitive workers.
            </p>
          </div>

          <button
            onClick={onBackToHome}
            className="self-start sm:self-auto text-xs text-[#526356] hover:text-[#1E3326] underline transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {/* Category Navigation */}
        <div className="mt-6 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1E3527] text-white font-medium'
                  : 'bg-[#EFECE5] text-[#556358] hover:bg-[#E4DFD6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Editorial Article (High Impact Layout) */}
      {selectedCategory === 'All' && (
        <div 
          onClick={() => setReadingArticle(featuredArticle)}
          className="mb-10 p-6 sm:p-8 rounded-2xl bg-white border border-[#DDD6CA] hover:border-[#1E3527] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center gap-2 text-xs text-[#7A8A7D] mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B85C38] bg-[#FBF0EA] px-2 py-0.5 rounded">
              FEATURED ESSAY
            </span>
            <span>·</span>
            <span>{featuredArticle.category}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {featuredArticle.readingTime}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif-display font-medium text-[#1A3123] group-hover:text-[#285739] transition-colors leading-tight">
            {featuredArticle.title}
          </h2>

          <div className="text-xs italic font-serif text-[#785E48] mt-1">
            {featuredArticle.sanskritSubtitle}
          </div>

          <p className="text-sm text-[#506054] mt-3.5 leading-relaxed max-w-3xl">
            {featuredArticle.excerpt}
          </p>

          <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#EFECE6] text-xs">
            <span className="text-[#78887B]">By {featuredArticle.author} · {featuredArticle.date}</span>
            <span className="text-[#1E3527] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Read Essay <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      )}

      {/* Editorial Article Grid (Different Layouts, Not Identical Cards) */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#54685A] mb-2">
          {selectedCategory === 'All' ? 'Recent Articles & Inquiries' : `${selectedCategory} Articles`}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((article, idx) => (
            <article
              key={article.id}
              onClick={() => setReadingArticle(article)}
              className="p-5 rounded-xl bg-white border border-[#E3DCD1] hover:border-[#1E3527] transition-all cursor-pointer flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#718274] mb-2">
                  <span className="font-medium text-[#46574B]">{article.category}</span>
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Clock className="w-3 h-3" />
                    {article.readingTime}
                  </span>
                </div>

                <h4 className="font-serif-display font-medium text-lg text-[#1A2E21] group-hover:text-[#285739] transition-colors leading-snug">
                  {article.title}
                </h4>

                {article.sanskritSubtitle && (
                  <div className="text-xs italic font-serif text-[#785E48] mt-1">
                    {article.sanskritSubtitle}
                  </div>
                )}

                <p className="text-xs text-[#526356] mt-2.5 leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F2ECE3] flex items-center justify-between text-[11px]">
                <span className="text-[#7D8E81]">{article.date}</span>
                <span className="text-[#1E3527] font-medium group-hover:underline">Read Article →</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* In-Place Editorial Reader Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[#D5CDC0] shadow-xl p-6 sm:p-10 relative">
            <button
              onClick={() => setReadingArticle(null)}
              className="absolute top-4 right-4 p-2 text-[#56685B] hover:text-[#1A2E21] rounded-lg hover:bg-[#EFECE5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Article Top Meta */}
            <div className="text-xs text-[#6F8273] flex items-center gap-2 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[#2D5A3F]">{readingArticle.category}</span>
              <span>·</span>
              <span>{readingArticle.readingTime}</span>
              <span>·</span>
              <span>{readingArticle.date}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif-display font-medium text-[#1A2E21] leading-tight">
              {readingArticle.title}
            </h2>

            {readingArticle.sanskritSubtitle && (
              <div className="text-sm italic font-serif text-[#785E48] mt-1.5 pb-4 border-b border-[#E7E0D4]">
                {readingArticle.sanskritSubtitle}
              </div>
            )}

            {/* Key Takeaway Banner */}
            <div className="my-5 p-4 rounded-xl bg-[#EFF4F0] border-l-4 border-[#20382B] text-xs sm:text-sm text-[#23422F]">
              <span className="font-semibold uppercase text-[10px] tracking-wider block text-[#1E3527] mb-1">
                Clinical & Somatic Takeaway
              </span>
              {readingArticle.keyTakeaway}
            </div>

            {/* Full Body Content */}
            <div className="space-y-4 text-sm sm:text-base text-[#303832] leading-relaxed font-sans">
              {readingArticle.content.map((paragraph, idx) => (
                <p key={idx} className={idx === 0 ? 'first-letter:text-3xl first-letter:font-serif first-letter:mr-1 first-letter:float-left first-letter:text-[#1E3527]' : ''}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-[#E8E1D5] flex items-center justify-between text-xs text-[#6C7D70]">
              <span>Contributed by {readingArticle.author}</span>
              <button
                onClick={() => setReadingArticle(null)}
                className="px-4 py-2 rounded-lg bg-[#20382B] text-white text-xs font-medium hover:bg-[#2D4E3C] transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
