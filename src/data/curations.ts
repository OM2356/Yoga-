import { POSE_DATABASE } from './poses';
import { BodyZoneId, CyclePhaseId, MoodId, Pose, SafetyProfile, Session, TrimesterStageId } from '../types';

export function filterSafePoses(poses: Pose[], safety: SafetyProfile): Pose[] {
  return poses.filter((pose) => {
    // If high blood pressure or glaucoma, avoid inversions
    if ((safety.highBloodPressure || safety.glaucomaOrEye) && pose.contraindications.includes('inversion')) {
      return false;
    }
    // If high BP, avoid intense backbends or heart-strain
    if (safety.highBloodPressure && pose.contraindications.includes('high_bp')) {
      return false;
    }
    // If recent injury, avoid intense core and deep twists
    if (safety.recentInjury && (pose.contraindications.includes('deep_twist') || pose.contraindications.includes('intense_core'))) {
      return false;
    }
    // If pregnant/postpartum, verify trimester safety
    if (safety.pregnantOrPostpartum && pose.contraindications.includes('deep_twist')) {
      return false;
    }
    return true;
  });
}

export function getSosSessionForMood(mood: MoodId, safety: SafetyProfile): Session {
  let poseIds: string[] = [];
  let title = '12-Minute SOS Reset';
  let subtitle = 'Quick outcome-based relief · No mat required variants';
  let tag = 'Vagus Nerve Reset';

  switch (mood) {
    case 'anxious':
      title = '12-Minute Anxious Mind Reset';
      subtitle = 'Down-regulate the autonomic nervous system & lower elevated cortisol';
      tag = 'Parasympathetic Calm';
      poseIds = ['box-breath-pranayama', 'childs-pose', 'cat-cow', 'reclined-bound-angle', 'savasana-guided-rest'];
      break;

    case 'wired':
      title = '15-Minute Wired & Overstimulated Reset';
      subtitle = 'Decompress mental noise, screen fatigue, and somatic hyperactivity';
      tag = 'Evening De-escalation';
      poseIds = ['seated-neck-trapezius-release', 'seated-eagle-arms', 'thread-the-needle', 'legs-up-the-wall', 'box-breath-pranayama'];
      break;

    case 'low-energy':
      title = '10-Minute Somatic Energy Rekindle';
      subtitle = 'Gentle oxygenation and circulation without draining adrenal reserves';
      tag = 'Zero Fatigue Flow';
      poseIds = ['seated-neck-trapezius-release', 'cat-cow', 'sun-salutation-flow', 'tree-pose', 'childs-pose'];
      break;

    case 'cramping':
      title = '15-Minute Dysmenorrhea & Pelvic Ease';
      subtitle = 'Targeted release for pelvic floor tension, sacrum compression, and cramps';
      tag = 'Gentle Pelvic Relief';
      poseIds = ['childs-pose', 'reclined-bound-angle', 'supine-spinal-twist', 'legs-up-the-wall', 'savasana-guided-rest'];
      break;

    case 'sore':
    default:
      title = '12-Minute Postural Decompression';
      subtitle = 'Alleviate tech-neck and desk-bound stiffness';
      tag = 'Myofascial Release';
      poseIds = ['seated-neck-trapezius-release', 'seated-eagle-arms', 'cat-cow', 'thread-the-needle', 'childs-pose'];
      break;
  }

  const poses = poseIds
    .map((id) => POSE_DATABASE.find((p) => p.id === id))
    .filter((p): p is Pose => Boolean(p));

  const safePoses = filterSafePoses(poses, safety);

  const totalDuration = safePoses.reduce((acc, curr) => acc + curr.duration, 0);
  const minutes = Math.ceil(totalDuration / 60);

  return {
    id: `sos-${mood}`,
    title,
    subtitle,
    tag,
    type: 'sos',
    durationMinutes: Math.max(10, minutes),
    poses: safePoses
  };
}

export function getRoutineForBodyZones(zones: BodyZoneId[], safety: SafetyProfile): Session {
  // Score poses by match with selected zones
  const matchingPoses = POSE_DATABASE.filter((pose) =>
    pose.target_zones.some((z) => zones.includes(z))
  ).sort((a, b) => {
    const aMatches = a.target_zones.filter((z) => zones.includes(z)).length;
    const bMatches = b.target_zones.filter((z) => zones.includes(z)).length;
    return bMatches - aMatches;
  });

  const safePoses = filterSafePoses(matchingPoses, safety);
  // Pick a cohesive set of 5-7 poses
  const selectedPoses = safePoses.slice(0, 6);

  // If list is small, add child's pose and box breath
  if (selectedPoses.length < 4) {
    const fallbackIds = ['childs-pose', 'box-breath-pranayama', 'cat-cow'];
    for (const id of fallbackIds) {
      const p = POSE_DATABASE.find((item) => item.id === id);
      if (p && !selectedPoses.some((s) => s.id === p.id)) {
        selectedPoses.push(p);
      }
    }
  }

  const zoneNames = zones.map((z) => z.replace('_', ' ')).join(' & ');
  const totalDuration = selectedPoses.reduce((acc, curr) => acc + curr.duration, 0);
  const minutes = Math.ceil(totalDuration / 60);

  return {
    id: `body-target-${zones.join('-')}`,
    title: `${minutes}-Minute Targeted Relief: ${zoneNames}`,
    subtitle: `Anatomical decompression targeting your exact flagged tension points`,
    tag: 'Outcome Curated',
    type: 'body_target',
    durationMinutes: minutes,
    poses: selectedPoses
  };
}

export function getCycleSyncedSession(phase: CyclePhaseId, safety: SafetyProfile): Session {
  let poseIds: string[] = [];
  let title = '';
  let subtitle = '';
  let tag = '';

  switch (phase) {
    case 'menstrual':
      title = 'Menstrual Phase: Surrender & Rest';
      subtitle = 'Low energy · Down-regulate and alleviate uterine cramping without joint strain';
      tag = 'Restorative Flow';
      poseIds = ['childs-pose', 'reclined-bound-angle', 'supine-spinal-twist', 'legs-up-the-wall', 'savasana-guided-rest'];
      break;

    case 'follicular':
      title = 'Follicular Phase: Rising Energy & Expansion';
      subtitle = 'Estrogen rising · Build mobility, dynamic stabilization, and mental focus';
      tag = 'Dynamic Reset';
      poseIds = ['cat-cow', 'sun-salutation-flow', 'warrior-two', 'tree-pose', 'seated-neck-trapezius-release'];
      break;

    case 'ovulation':
      title = 'Ovulation Phase: Peak Vitality & Heart Opening';
      subtitle = 'Peak hormonal energy · Expansive postures, backbends, and pelvic stability';
      tag = 'Expansive Flow';
      poseIds = ['goddess-pose', 'camel-pose', 'supported-bridge', 'warrior-two', 'tree-pose'];
      break;

    case 'luteal':
      title = 'Luteal Phase: Grounding & Inward Calm';
      subtitle = 'Progesterone dominance · Slow somatic holds, deep hip release, and mood stabilization';
      tag = 'Grounding Ritual';
      poseIds = ['reclined-bound-angle', 'seated-forward-fold', 'supported-pigeon-figure-four', 'cat-cow', 'box-breath-pranayama'];
      break;
  }

  const poses = poseIds
    .map((id) => POSE_DATABASE.find((p) => p.id === id))
    .filter((p): p is Pose => Boolean(p));

  const safePoses = filterSafePoses(poses, safety);
  const totalDuration = safePoses.reduce((acc, curr) => acc + curr.duration, 0);

  return {
    id: `cycle-${phase}`,
    title,
    subtitle,
    tag,
    type: 'cycle',
    durationMinutes: Math.ceil(totalDuration / 60),
    poses: safePoses
  };
}

export function getPrenatalSession(stage: TrimesterStageId, safety: SafetyProfile): Session {
  let poseIds: string[] = [];
  let title = '';
  let subtitle = '';

  switch (stage) {
    case 'first':
      title = '1st Trimester: Gentle Cellular Grounding';
      subtitle = 'No overheating, zero intense core, supporting early gestation stabilization.';
      // Filter out overheating, intense core
      poseIds = ['cat-cow', 'childs-pose', 'seated-neck-trapezius-release', 'tree-pose', 'box-breath-pranayama'];
      break;

    case 'second':
      title = '2nd Trimester: Symmetrical Pelvic Balance';
      subtitle = 'Relaxin awareness: Symmetrical stances, no deep asymmetrical lunges, prop-supported.';
      poseIds = ['cat-cow', 'childs-pose', 'goddess-pose', 'tree-pose', 'thread-the-needle', 'box-breath-pranayama'];
      break;

    case 'third':
      title = '3rd Trimester: Space Creation & Pelvic Opening';
      subtitle = 'Zero prolonged supine postures (vena cava safety); prop-assisted breathing & hip opening.';
      poseIds = ['childs-pose', 'goddess-pose', 'cat-cow', 'seated-neck-trapezius-release', 'savasana-guided-rest'];
      break;

    case 'postpartum':
      title = 'Postpartum: Transverse Abdominis & Pelvic Floor Recovery';
      subtitle = 'Diastasis recti safe: zero crunches or boat pose; rebuild core stability & chest opening.';
      poseIds = ['pelvic-tilts-transverse', 'cat-cow', 'seated-eagle-arms', 'seated-neck-trapezius-release', 'childs-pose', 'box-breath-pranayama'];
      break;
  }

  const poses = poseIds
    .map((id) => POSE_DATABASE.find((p) => p.id === id))
    .filter((p): p is Pose => Boolean(p));

  // Verify trimester tags
  const validPoses = poses.filter((p) => !p.trimester_safe || p.trimester_safe.includes(stage));
  const safePoses = filterSafePoses(validPoses, safety);
  const totalDuration = safePoses.reduce((acc, curr) => acc + curr.duration, 0);

  return {
    id: `prenatal-${stage}`,
    title,
    subtitle,
    tag: 'Trimester-Aware Sequence',
    type: 'prenatal',
    durationMinutes: Math.ceil(totalDuration / 60),
    poses: safePoses
  };
}

export function getDeepDiveSession(safety: SafetyProfile): Session {
  const warmUp = ['box-breath-pranayama', 'seated-neck-trapezius-release', 'cat-cow', 'thread-the-needle']
    .map((id) => POSE_DATABASE.find((p) => p.id === id))
    .filter((p): p is Pose => Boolean(p));

  const structuralSequencing = ['sun-salutation-flow', 'warrior-two', 'tree-pose', 'supported-pigeon-figure-four', 'supported-bridge']
    .map((id) => POSE_DATABASE.find((p) => p.id === id))
    .filter((p): p is Pose => Boolean(p));

  const breathwork = ['box-breath-pranayama', 'reclined-bound-angle']
    .map((id) => POSE_DATABASE.find((p) => p.id === id))
    .filter((p): p is Pose => Boolean(p));

  const coolDown = ['legs-up-the-wall', 'childs-pose', 'savasana-guided-rest']
    .map((id) => POSE_DATABASE.find((p) => p.id === id))
    .filter((p): p is Pose => Boolean(p));

  const safeWarmUp = filterSafePoses(warmUp, safety);
  const safeStructural = filterSafePoses(structuralSequencing, safety);
  const safeBreath = filterSafePoses(breathwork, safety);
  const safeCoolDown = filterSafePoses(coolDown, safety);

  const allPoses = [...safeWarmUp, ...safeStructural, ...safeBreath, ...safeCoolDown];

  return {
    id: 'deep-dive-weekend-reset',
    title: 'Weekend Somatic Deep Dive',
    subtitle: '75-Minute comprehensive restoration · Evening or weekend ritual for complete nervous system recalibration',
    tag: 'Total System Reset',
    type: 'deep_dive',
    durationMinutes: 75,
    poses: allPoses,
    segments: [
      {
        name: 'Somatic Grounding & Warm-up',
        durationMinutes: 15,
        description: 'Diaphragmatic alignment and gentle spinal decompression',
        poses: safeWarmUp
      },
      {
        name: 'Structural Sequencing',
        durationMinutes: 30,
        description: 'Hip, hamstring, and thoracic release targeting desk-bound compression',
        poses: safeStructural
      },
      {
        name: 'Breathwork & Vagal Tuning',
        durationMinutes: 15,
        description: 'Autonomic nervous system down-regulation',
        poses: safeBreath
      },
      {
        name: 'Restorative Cool-down & Savasana',
        durationMinutes: 15,
        description: 'Total fascial integration and mental stillness',
        poses: safeCoolDown
      }
    ]
  };
}
