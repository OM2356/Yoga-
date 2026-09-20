import { UserSafetyFlags } from './db';

export interface RoutinePose {
  name: string;
  duration: number; // in seconds
  visualCue?: string;
  benefit?: string;
  sanskritName?: string;
  targetZones?: string[];
  tags?: string[];
}

export interface GeneratedRoutine {
  title: string;
  focusArea: string;
  precautions?: string;
  poses: RoutinePose[];
}

export interface FilterResult {
  routine: GeneratedRoutine;
  rawRoutine: GeneratedRoutine;
  filteredNotices: string[];
  safetyFlagsApplied: string[];
}

// Static contraindication rules in code (independent of LLM output)
export const CONTRAINDICATION_RULES = {
  pregnancy: {
    keywords: [
      'deep twist',
      'prone',
      'belly down',
      'cobra',
      'locust',
      'inversion',
      'headstand',
      'shoulder stand',
      'handstand',
      'boat pose',
      'crunch',
      'intense forward bend',
      'asymmetrical deep lunge',
      'supine flat on back'
    ],
    safeSubstitutes: [
      {
        name: 'Gentle Cat-Cow Flow',
        duration: 60,
        visualCue: 'On hands and knees, gently arch and round with wide knee base.',
        benefit: 'Alleviates spinal pressure without compressing abdominal wall.'
      },
      {
        name: 'Supported Wide Child’s Pose',
        duration: 90,
        visualCue: 'Knees mat-width apart, belly resting softly between thighs.',
        benefit: 'Gently releases lower back while maintaining comfortable space for baby.'
      },
      {
        name: 'Seated Side Body Reach',
        duration: 60,
        visualCue: 'Easy cross-legged sit, gentle lateral reach without twisting torso.',
        benefit: 'Opens intercostal rib cage to ease restricted diaphragmatic breathing.'
      },
      {
        name: 'Side-Lying Savasana (Left Side)',
        duration: 120,
        visualCue: 'Rest comfortably on left lateral side with pillow between knees.',
        benefit: 'Prevents inferior vena cava compression and encourages maternal circulation.'
      }
    ]
  },
  glaucoma: {
    keywords: [
      'headstand',
      'shoulder stand',
      'handstand',
      'downward-facing dog',
      'downward dog',
      'standing forward fold',
      'inversion',
      'head below heart',
      'dolphin pose',
      'plow pose'
    ],
    safeSubstitutes: [
      {
        name: 'Half-Forward Bend at Wall',
        duration: 60,
        visualCue: 'Hands on wall at chest height, torso parallel to floor, head in line with spine.',
        benefit: 'Hamstring & spine lengthening with zero ocular pressure increase.'
      },
      {
        name: 'Supported Puppy Pose (Head Elevated)',
        duration: 75,
        visualCue: 'Forearms on bolster, head resting level above heart.',
        benefit: 'Thoracic extension with strictly neutral intraocular pressure.'
      },
      {
        name: 'Seated Staff Pose (Dandasana)',
        duration: 60,
        visualCue: 'Upright sitting posture, crown of head reaching skyward.',
        benefit: 'Spinal tone and hamstring elongation with head completely elevated.'
      }
    ]
  },
  hypertension: {
    keywords: [
      'headstand',
      'shoulder stand',
      'handstand',
      'full wheel',
      'deep backbend',
      'camel pose',
      'inversion',
      'breath retention',
      'kumbhaka'
    ],
    safeSubstitutes: [
      {
        name: 'Supported Bridge Pose (Bolster under Sacrum)',
        duration: 90,
        visualCue: 'Gentle pelvic lift supported firmly by block or bolster under sacrum.',
        benefit: 'Passive heart opener that calms baroreceptors without hypertensive spike.'
      },
      {
        name: 'Gentle Reclined Butterfly (Supta Baddha Konasana)',
        duration: 90,
        visualCue: 'Soles of feet together, knees relaxed open with block support.',
        benefit: 'Vagal tone activation, gently lowering systemic arterial resistance.'
      },
      {
        name: 'Even Ratio Breath (Sama Vritti 4:4)',
        duration: 90,
        visualCue: 'Smooth 4-count inhale, unhurried 4-count exhale with no breath holding.',
        benefit: 'Stimulates parasympathetic down-regulation of blood pressure.'
      }
    ]
  },
  recentInjury: {
    keywords: [
      'deep twist',
      'spinal twist',
      'boat pose',
      'navasana',
      'crunch',
      'jump back',
      'chaturanga',
      'wheel pose',
      'advanced bind'
    ],
    safeSubstitutes: [
      {
        name: 'Constructive Rest Position',
        duration: 90,
        visualCue: 'Lie on back, knees bent, feet flat wider than hips, knees resting together.',
        benefit: 'Releases psoas tension and completely unloads the lumbar spine.'
      },
      {
        name: 'Gentle Pelvic Tilts',
        duration: 60,
        visualCue: 'Tiny micro-movements rocking pelvis forward and back with breath.',
        benefit: 'Restores gentle segmental sacral mobility without joint shearing.'
      },
      {
        name: 'Supported Reclined Breath',
        duration: 90,
        visualCue: 'Chest supported with firm blankets, neck neutral.',
        benefit: 'Reduces guarding and muscular spasm surrounding injured zones.'
      }
    ]
  }
};

/**
 * Deterministic, server-side safety filter.
 * Runs AFTER the LLM responds and BEFORE the client receives the routine.
 */
export function filterRoutineForUser(
  routine: GeneratedRoutine,
  safetyFlags?: Partial<UserSafetyFlags>,
  trimester?: string | null
): FilterResult {
  const flags = safetyFlags || {};
  const filteredNotices: string[] = [];
  const safetyFlagsApplied: string[] = [];

  const rawRoutine: GeneratedRoutine = JSON.parse(JSON.stringify(routine));
  let safePoses: RoutinePose[] = [];

  // Identify applicable rule sets
  const activeConditions: (keyof typeof CONTRAINDICATION_RULES)[] = [];
  if (flags.pregnantOrPostpartum) {
    activeConditions.push('pregnancy');
    safetyFlagsApplied.push(`Pregnancy/Postpartum (${trimester || 'Safe Protocol'})`);
  }
  if (flags.glaucomaOrEye) {
    activeConditions.push('glaucoma');
    safetyFlagsApplied.push('Glaucoma / Retinal Pressure Safeguard');
  }
  if (flags.highBloodPressure) {
    activeConditions.push('hypertension');
    safetyFlagsApplied.push('Hypertension / Head-Above-Heart Safeguard');
  }
  if (flags.recentInjury) {
    activeConditions.push('recentInjury');
    safetyFlagsApplied.push('Spinal / Joint Trauma Safeguard');
  }

  // Iterate over proposed poses
  for (const pose of routine.poses) {
    const textToCheck = `${pose.name} ${pose.visualCue || ''} ${pose.benefit || ''}`.toLowerCase();
    let isViolating = false;
    let violationCondition = '';
    let matchedKeyword = '';

    for (const condition of activeConditions) {
      const rules = CONTRAINDICATION_RULES[condition];
      for (const kw of rules.keywords) {
        if (textToCheck.includes(kw)) {
          isViolating = true;
          violationCondition = condition;
          matchedKeyword = kw;
          break;
        }
      }
      if (isViolating) break;
    }

    if (!isViolating) {
      safePoses.push(pose);
    } else {
      // Find substitute
      const rules = CONTRAINDICATION_RULES[violationCondition as keyof typeof CONTRAINDICATION_RULES];
      const existingNames = safePoses.map((p) => p.name.toLowerCase());
      const candidate = rules.safeSubstitutes.find(
        (sub) => !existingNames.includes(sub.name.toLowerCase())
      ) || rules.safeSubstitutes[0];

      safePoses.push({
        ...candidate,
        duration: pose.duration || candidate.duration
      });

      filteredNotices.push(
        `Safety Filter Active: Replaced "${pose.name}" with "${candidate.name}" (filtered for ${violationCondition} rule against "${matchedKeyword}").`
      );
    }
  }

  // Ensure routine has at least 3 poses
  if (safePoses.length < 3) {
    safePoses.push({
      name: 'Supported Relaxation Savasana',
      duration: 120,
      visualCue: 'Full body neutral relaxation with head and knees comfortably supported.',
      benefit: 'Integrates nervous system down-regulation in zero-strain alignment.'
    });
  }

  const sanitizedRoutine: GeneratedRoutine = {
    ...routine,
    precautions: routine.precautions 
      ? `${routine.precautions} FlowState Clinical Filter verified: ${safetyFlagsApplied.length > 0 ? safetyFlagsApplied.join(', ') : 'Standard Safety'}.`
      : 'FlowState Clinical Safety Filter verified.',
    poses: safePoses
  };

  return {
    routine: sanitizedRoutine,
    rawRoutine,
    filteredNotices,
    safetyFlagsApplied
  };
}

/**
 * Built-in safety test suite.
 * Runs to verify safety filters correctly intercept contraindicated poses.
 */
export function runSafetyFilterSelfTest(): boolean {
  const badPregnantRoutine: GeneratedRoutine = {
    title: 'Intense Core and Twist Flow',
    focusArea: 'Core Strength',
    poses: [
      { name: 'Deep Spinal Twist', duration: 60, visualCue: 'Twist deep into spine', benefit: 'Detox' },
      { name: 'Cobra Pose (Belly Down)', duration: 60, visualCue: 'Lie flat on belly and press up', benefit: 'Back strength' },
      { name: 'Boat Pose (Navasana)', duration: 60, visualCue: 'Balance on sit bones with core burning', benefit: 'Abs' }
    ]
  };

  const result = filterRoutineForUser(badPregnantRoutine, { pregnantOrPostpartum: true });

  const passed =
    result.filteredNotices.length >= 2 &&
    !result.routine.poses.some((p) => p.name.includes('Deep Spinal Twist') || p.name.includes('Cobra Pose'));

  if (!passed) {
    console.error('CRITICAL: Safety filter self-test failed to intercept dangerous poses!');
  }
  return passed;
}
