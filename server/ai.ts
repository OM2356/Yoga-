import { GoogleGenAI } from '@google/genai';
import { UserProfileRecord } from './db';
import { GeneratedRoutine } from './safetyFilter';

let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    try {
      genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn('Failed to initialize Gemini Client:', err);
    }
  }
  return genAIClient;
}

/**
 * Fallback deterministic routine generator when LLM API keys are unavailable.
 * Ensures the app never hangs or crashes, while matching clinical somatic principles.
 */
function getDeterministicRoutine(prompt: string, profile?: UserProfileRecord): GeneratedRoutine {
  const p = prompt.toLowerCase();

  if (p.includes('desk') || p.includes('shoulder') || p.includes('neck') || p.includes('tech')) {
    return {
      title: 'Targeted Tech-Neck & Shoulder Release',
      focusArea: 'Cervical Spine, Trapezius & Thoracic Extension',
      precautions: 'Avoid forcing head beyond gentle tension. Keep jaw unclenched.',
      poses: [
        {
          name: 'Seated Lateral Neck Stretch & SCM Release',
          duration: 60,
          visualCue: 'Lower right ear toward right shoulder, breathe into left trapezius line.',
          benefit: 'Relieves sternocleidomastoid stiffness from screen positioning.'
        },
        {
          name: 'Seated Eagle Arms (Garudasana)',
          duration: 75,
          visualCue: 'Cross elbows, wrap forearms, lift elbows to shoulder height while softening shoulder blades.',
          benefit: 'Spreads rhomboids and unglues tight interscapular fascia.'
        },
        {
          name: 'Thread the Needle Pose',
          duration: 90,
          visualCue: 'From all fours, thread arm under chest, resting side of head gently on mat.',
          benefit: 'Rotational thoracic decompression with gravity assisting.'
        },
        {
          name: 'Supported Fish Pose with Heart Opener',
          duration: 90,
          visualCue: 'Bolster or rolled towel vertically along spine, chest softly melting open.',
          benefit: 'Reverses forward slumped desk posture and expands rib capacity.'
        },
        {
          name: 'Supported Constructive Rest with Diaphragmatic Breath',
          duration: 120,
          visualCue: 'Lie on back, feet wide, knees resting together, hands resting on lower belly.',
          benefit: 'Integrates autonomic recovery and releases psoas tension.'
        }
      ]
    };
  }

  if (p.includes('back') || p.includes('lumbar') || p.includes('spine') || p.includes('sit')) {
    return {
      title: 'Gentle Lumbar & Sacroiliac Decompression',
      focusArea: 'Low Back, Hip Flexors & Spinal Length',
      precautions: 'Move slowly without bouncing. Never push into sharp pinching.',
      poses: [
        {
          name: 'Gentle Cat-Cow Mobility Flow',
          duration: 75,
          visualCue: 'Inhale gently lifting sternum, exhale rounding through spine from tailbone to crown.',
          benefit: 'Restores fluid movement to spinal discs without compressive shear.'
        },
        {
          name: 'Supported Wide Child’s Pose (Balasana)',
          duration: 90,
          visualCue: 'Knees apart, hips sinking back to heels, arms extended forward with soft elbows.',
          benefit: 'Gently distracts lumbar vertebrae and calms adrenal response.'
        },
        {
          name: 'Gentle Supine Figure-Four Hip Stretch',
          duration: 90,
          visualCue: 'Ankle crossed over opposite thigh, holding gently behind hamstring.',
          benefit: 'Releases piriformis and relieves sciatica-adjacent nerve pressure.'
        },
        {
          name: 'Legs-Up-The-Wall Restoration',
          duration: 120,
          visualCue: 'Hips close to wall or chair, legs resting vertical with heavy pelvis.',
          benefit: 'Drains venous pooling and completely unloads lower back disc gravity.'
        }
      ]
    };
  }

  if (p.includes('anx') || p.includes('stress') || p.includes('panic') || p.includes('overwhelm') || p.includes('nervous')) {
    return {
      title: 'Vagal Down-Regulation & Autonomic Ease',
      focusArea: 'Parasympathetic Activation & Nervous System Reset',
      precautions: 'Keep breath smooth and unforced. If eyes-closed feels uneasy, keep soft downward gaze.',
      poses: [
        {
          name: 'Box Breathing Pranayama (4-4-4-4)',
          duration: 90,
          visualCue: 'Inhale 4s, hold gently 4s, exhale 4s, pause 4s. Rhythmically steady.',
          benefit: 'Balances carbon dioxide and rapidly engages the vagus nerve.'
        },
        {
          name: 'Supported Child’s Pose with Forehead Grounding',
          duration: 90,
          visualCue: 'Rest forehead against block or mat to stimulate third-eye acupressure point.',
          benefit: 'Sends primal safety cues to the amygdala, reducing hypervigilance.'
        },
        {
          name: 'Reclined Bound Angle Pose (Supta Baddha Konasana)',
          duration: 100,
          visualCue: 'Soles of feet together, knees supported by cushions, hands on heart and belly.',
          benefit: 'Releases guarded abdominal breathing and softens somatic armoring.'
        },
        {
          name: 'Deep Guided Savasana with Somatic Body Scan',
          duration: 150,
          visualCue: 'Full body neutral release, noticing weight of back body sinking into ground.',
          benefit: 'Integrates autonomic recovery and restores grounded stillness.'
        }
      ]
    };
  }

  // Default custom routine
  return {
    title: 'Custom Somatic Reset & Realignment',
    focusArea: 'Full Body Equilibrium & Tension Dissolution',
    precautions: 'Honor your physical boundaries today. Modify any posture that causes sharp sensation.',
    poses: [
      {
        name: 'Seated Grounding & Centering Breath',
        duration: 60,
        visualCue: 'Tall easy sit, shoulders melting away from ears, slow nasal breath.',
        benefit: 'Establishes somatic baseline awareness and quiets mental chatter.'
      },
      {
        name: 'Gentle Cat-Cow Spinal Articulation',
        duration: 75,
        visualCue: 'Hands beneath shoulders, wave movement through the whole spinal column.',
        benefit: 'Increases synovial fluid in spinal facets and relieves stagnant stiffness.'
      },
      {
        name: 'Thread the Needle Thoracic Opener',
        duration: 90,
        visualCue: 'Slide arm through to opposite side, letting upper back broaden naturally.',
        benefit: 'Restores rotational mobility between shoulder blades.'
      },
      {
        name: 'Low Dragon or Supported Low Lunge',
        duration: 75,
        visualCue: 'Back knee cushioned, hips sinking gently forward to feel front hip flexor.',
        benefit: 'Lengthens chronically shortened iliopsoas muscles from sitting.'
      },
      {
        name: 'Restorative Savasana with Diaphragmatic Breath',
        duration: 120,
        visualCue: 'Completely unclamp jaw and forehead, allowing the floor to hold you.',
        benefit: 'Solidifies parasympathetic restorative state.'
      }
    ]
  };
}

/**
 * Generates an AI routine via Gemini (or Anthropic fallback), or deterministic fallback.
 */
export async function generateAIRoutine(
  prompt: string,
  profile?: UserProfileRecord
): Promise<GeneratedRoutine> {
  const safetyFlagsJson = JSON.stringify(profile?.safetyFlags || {});
  const trimester = profile?.trimester || 'none';

  const systemInstruction = `You are an expert AI Yoga Instructor specializing in posture alignment, mobility, and gentle therapy.
Known safety flags for this user: ${safetyFlagsJson}, trimester: ${trimester}. If any flag is present, do not include inversions, deep twists, or deep backbends — substitute gentler alternatives automatically.

Instructions:
1. Safety Protocols:
   - For back pain: avoid deep forward folds or sudden twisting. Focus on spinal decompression, core stability, and hip openers.
   - For posture: focus on chest openers, upper back strengthening, and pelvic alignment.
   - Always include a concise safety note to consult a medical professional if pain is acute or severe.
2. Response Structure: return ONLY a valid, parseable JSON object with title (string), focusArea (string), precautions (string), and poses (array of objects with name, duration in seconds as number between 45 and 150, visualCue, benefit). No prose, markdown ticks, or text outside the JSON.`;

  // 1. Try Gemini API
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\nUser request: "${prompt}"\n\nGenerate the custom yoga routine JSON:`
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed && parsed.title && Array.isArray(parsed.poses) && parsed.poses.length > 0) {
        return parsed as GeneratedRoutine;
      }
    } catch (err) {
      console.warn('Gemini API routine generation error, attempting fallback:', err);
    }
  }

  // 2. Try Anthropic API if key is set
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          system: systemInstruction,
          messages: [{ role: 'user', content: `User request: "${prompt}". Return JSON only.` }]
        })
      });

      if (anthropicRes.ok) {
        const data = await anthropicRes.json();
        const rawContent = data.content?.[0]?.text || '';
        const cleanJson = rawContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed && parsed.title && Array.isArray(parsed.poses)) {
          return parsed as GeneratedRoutine;
        }
      }
    } catch (err) {
      console.warn('Anthropic API call error:', err);
    }
  }

  // 3. Fallback deterministic generator
  return getDeterministicRoutine(prompt, profile);
}

/**
 * Conversational guide assistant ("Ask FlowState")
 */
export async function getGuideAdvice(
  message: string,
  userContext: { safetyFlags?: any; currentScreen?: string }
): Promise<string> {
  const safetyText = JSON.stringify(userContext.safetyFlags || {});

  const systemPrompt = `You are FlowState's gentle somatic guide. You help users pick a session based on how they feel. Never give medical diagnoses. If a user describes symptoms that sound serious (chest pain, severe acute injury, heavy bleeding, loss of sensation), tell them clearly to seek immediate medical care instead of a yoga session.
Known safety flags for this user: ${safetyText}.
Keep responses strictly under 3 sentences, empathetic, and recommend one specific FlowState focus (e.g. 12-Minute SOS Reset, Vagal Grounding, Tech-Neck Decompression, or Gentle Restorative).`;

  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser message: "${message}"` }]
          }
        ]
      });
      const text = response.text?.trim();
      if (text) return text;
    } catch (err) {
      console.warn('Gemini guide error, falling back:', err);
    }
  }

  // Fallback gentle response
  const msgLower = message.toLowerCase();
  if (msgLower.includes('chest') || msgLower.includes('severe') || msgLower.includes('bleed')) {
    return 'Please seek prompt evaluation from a medical professional, as severe or sudden symptoms require clinical care rather than yoga. Your safety comes first.';
  }
  if (msgLower.includes('neck') || msgLower.includes('desk') || msgLower.includes('shoulder')) {
    return 'Desk posture often triggers protective tension in the trapezius and suboccipitals. We recommend the 12-Minute Postural Decompression routine or our Tech-Neck custom flow to decompress your cervical spine.';
  }
  if (msgLower.includes('anxious') || msgLower.includes('overwhelm') || msgLower.includes('panic') || msgLower.includes('tired')) {
    return 'When the nervous system is in fight-or-flight, your breath and vagus nerve are your fastest anchor. Try our 12-Minute Anxious Mind Reset with box breathing to gently down-regulate your cortisol.';
  }

  return 'Take one deep breath and notice where you hold tension right now. We recommend checking into the 12-Minute SOS Reset or tapping the Body Map to release your exact pressure zones.';
}
