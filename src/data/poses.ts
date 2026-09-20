import { Pose } from '../types';

export const POSE_DATABASE: Pose[] = [
  {
    id: 'childs-pose',
    name: "Child's Pose",
    sanskritName: 'Balasana',
    duration: 60,
    target_zones: ['lower_back', 'hips', 'shoulders'],
    cycle_phase: ['menstrual', 'luteal'],
    trimester_safe: ['first', 'second', 'third', 'postpartum'],
    contraindications: [],
    illustration_2d: 'childs-pose',
    anatomicalFocus: 'Lengthens thoracolumbar fascia, softens pelvic floor, down-regulates vagus nerve.',
    alignmentCues: [
      'Widen knees to the outer edges of the mat, big toes touching.',
      'Walk fingertips forward and melt the forehead gently to the earth.',
      'Breathe deeply into the back ribs, allowing hips to sink toward heels.'
    ],
    easierVariation: {
      name: 'Supported Bolster Child’s Pose',
      description: 'Place a folded blanket or bolster lengthwise under torso and chest for zero joint load.'
    },
    category: 'restorative',
    noMatRequired: false
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow Flow',
    sanskritName: 'Marjaryasana-Bitilasana',
    duration: 60,
    target_zones: ['neck', 'upper_back', 'lower_back'],
    cycle_phase: ['menstrual', 'luteal', 'follicular'],
    trimester_safe: ['first', 'second', 'third', 'postpartum'],
    contraindications: [],
    illustration_2d: 'cat-cow',
    anatomicalFocus: 'Mobilizes cervical through lumbar spine, relieves desk-worker spinal compression.',
    alignmentCues: [
      'Wrists directly stacked under shoulders, knees hip-width apart.',
      'Inhale: Drop belly gently, draw chest through arm gateways, gaze soft.',
      'Exhale: Press floor away, dome the upper spine, tuck chin gently to chest.'
    ],
    easierVariation: {
      name: 'Seated Chair Cat-Cow',
      description: 'Perform spinal extension and flexion while seated upright with hands resting on knees.'
    },
    category: 'release',
    noMatRequired: true
  },
  {
    id: 'thread-the-needle',
    name: 'Thread the Needle',
    sanskritName: 'Parsva Balasana',
    duration: 60,
    target_zones: ['neck', 'shoulders', 'upper_back'],
    cycle_phase: ['luteal', 'follicular'],
    trimester_safe: ['first', 'second', 'third', 'postpartum'],
    contraindications: [],
    illustration_2d: 'thread-needle',
    anatomicalFocus: 'Decompresses rhomboids, posterior deltoids, and cervical-thoracic junction.',
    alignmentCues: [
      'From tabletop, slide right arm underneath chest with palm facing up.',
      'Rest right temple and right shoulder gently against the floor.',
      'Left hand can stay under shoulder or crawl forward to lengthen the side body.'
    ],
    easierVariation: {
      name: 'Supported Shoulder Release with Block',
      description: 'Rest head and shoulder on a yoga block or firm pillow to eliminate neck strain.'
    },
    category: 'release',
    noMatRequired: false
  },
  {
    id: 'seated-neck-trapezius-release',
    name: 'Seated Cervical & Trapezius Release',
    sanskritName: 'Griva Asana',
    duration: 50,
    target_zones: ['neck', 'shoulders'],
    cycle_phase: ['menstrual', 'luteal', 'follicular', 'ovulation'],
    trimester_safe: ['first', 'second', 'third', 'postpartum'],
    contraindications: [],
    illustration_2d: 'seated-neck',
    anatomicalFocus: 'Targeted myofascial release for upper trapezius and levator scapulae (tech-neck).',
    alignmentCues: [
      'Sit tall with spine erect, relax shoulder blades down the ribcage.',
      'Drop right ear toward right shoulder; extend left fingertips toward floor.',
      'Take 5 slow breaths, then gently angle chin down 45 degrees toward collarbone.'
    ],
    easierVariation: {
      name: 'Hands-Free Neutral Neck Drop',
      description: 'Do not use hand leverage; let gravity alone mobilize the neck.'
    },
    category: 'release',
    noMatRequired: true
  },
  {
    id: 'seated-eagle-arms',
    name: 'Seated Eagle Arms',
    sanskritName: 'Garudasana Arms',
    duration: 45,
    target_zones: ['neck', 'shoulders', 'upper_back'],
    cycle_phase: ['luteal', 'follicular'],
    trimester_safe: ['first', 'second', 'third', 'postpartum'],
    contraindications: [],
    illustration_2d: 'eagle-arms',
    anatomicalFocus: 'Protraction of scapulae; opens interscapular fascia and upper thoracic tension.',
    alignmentCues: [
      'Wrap right elbow over left elbow, bringing palms or backs of hands to press.',
      'Lift elbows level with collarbones and move forearms gently away from forehead.',
      'Breathe into the widened space between shoulder blades.'
    ],
    easierVariation: {
      name: 'Bear Hug Scapular Release',
      description: 'Cross arms across chest holding opposite shoulders and breathe into upper back.'
    },
    category: 'release',
    noMatRequired: true
  },
  {
    id: 'seated-spinal-twist',
    name: 'Gentle Seated Twist',
    sanskritName: 'Ardha Matsyendrasana Variant',
    duration: 50,
    target_zones: ['upper_back', 'lower_back', 'hips'],
    cycle_phase: ['follicular', 'ovulation'],
    trimester_safe: ['first'], // Avoid deep twists in 2nd, 3rd, postpartum
    contraindications: ['deep_twist'],
    illustration_2d: 'seated-twist',
    anatomicalFocus: 'Rotational mobility for thoracic spine while stabilizing the pelvis.',
    alignmentCues: [
      'Inhale to lengthen through crown of head.',
      'Exhale to initiate twist from navel and ribs, keeping neck soft and neutral.',
      'Never force leverage with hands; maintain upright axial posture.'
    ],
    easierVariation: {
      name: 'Open Seated Twist',
      description: 'Twist toward open space instead of crossing over thighs to keep abdomen unrestricted.'
    },
    category: 'release',
    noMatRequired: true
  },
  {
    id: 'supine-spinal-twist',
    name: 'Restorative Supine Twist',
    sanskritName: 'Supta Matsyendrasana',
    duration: 60,
    target_zones: ['lower_back', 'hips', 'upper_back'],
    cycle_phase: ['menstrual', 'luteal'],
    trimester_safe: ['first'], // Avoid prolonged supine/twists in late pregnancy
    contraindications: ['deep_twist', 'supine_late'],
    illustration_2d: 'supine-twist',
    anatomicalFocus: 'Relieves sacroiliac joint pressure, lumbar compression, and dysmenorrheal tension.',
    alignmentCues: [
      'Lie supine, draw right knee into chest, extend left leg long.',
      'Guide right knee across body toward left floor, open right arm wide to T-shape.',
      'Keep right shoulder grounded and soften the abdominal wall.'
    ],
    easierVariation: {
      name: 'Two-Knee Side-Lying Twist',
      description: 'Stack both knees together bent at 90 degrees with a pillow between knees.'
    },
    category: 'restorative',
    noMatRequired: false
  },
  {
    id: 'legs-up-the-wall',
    name: 'Legs-Up-the-Wall',
    sanskritName: 'Viparita Karani',
    duration: 90,
    target_zones: ['legs', 'hips', 'lower_back'],
    cycle_phase: ['menstrual', 'luteal'],
    trimester_safe: ['first', 'second'],
    contraindications: ['inversion', 'supine_late', 'high_bp'],
    illustration_2d: 'legs-up-wall',
    anatomicalFocus: 'Venous blood drainage, lymphatic circulation, parasympathetic nervous system activation.',
    alignmentCues: [
      'Sit sideways next to a wall, pivot hips and swing legs up the wall simultaneously.',
      'Let arms rest open alongside body with palms facing upward.',
      'Close eyes, relax jaw and tongue, allow breath to slow effortlessly.'
    ],
    easierVariation: {
      name: 'Chair Elevated Legs',
      description: 'Rest lower legs bent over the seat of a couch or chair.'
    },
    category: 'grounding',
    noMatRequired: false
  },
  {
    id: 'sun-salutation-flow',
    name: 'Gentle Sun Salutation Flow',
    sanskritName: 'Surya Namaskar A',
    duration: 75,
    target_zones: ['legs', 'upper_back', 'lower_back', 'shoulders'],
    cycle_phase: ['follicular'],
    trimester_safe: ['first'],
    contraindications: ['intense_core'],
    illustration_2d: 'sun-salutation',
    anatomicalFocus: 'Cardiovascular warming, full kinetic chain mobilization, somatic energy rekindling.',
    alignmentCues: [
      'Inhale arms sweep overhead to Mountain upward salute.',
      'Exhale forward fold with soft knees, hinging from the hips.',
      'Inhale halfway lift with flat spine, exhale step back to gentle plank or knees-chest-chin.',
      'Inhale baby cobra or sphinx pose, exhale press back to downward dog or child’s pose.'
    ],
    easierVariation: {
      name: 'Sun Breath Half-Flow',
      description: 'Flow between upright standing, overhead reach, and forward fold without floor transitions.'
    },
    category: 'gentle_flow',
    noMatRequired: false
  },
  {
    id: 'warrior-two',
    name: 'Warrior II',
    sanskritName: 'Virabhadrasana II',
    duration: 55,
    target_zones: ['legs', 'hips', 'shoulders'],
    cycle_phase: ['follicular', 'ovulation'],
    trimester_safe: ['first', 'second'],
    contraindications: ['asymmetrical_lunge'],
    illustration_2d: 'warrior-two',
    anatomicalFocus: 'Quadriceps and gluteal endurance, hip adductor opening, mental grit and stability.',
    alignmentCues: [
      'Step feet wide, front heel intersecting back arch; bend front knee to 90 degrees.',
      'Extend arms parallel to floor, reach fingertip to fingertip.',
      'Gaze softly over front middle finger; tuck tailbone under and crown high.'
    ],
    easierVariation: {
      name: 'Narrow Stance Warrior II',
      description: 'Shorten distance between feet and reduce front knee bend to 45 degrees.'
    },
    category: 'stabilize',
    noMatRequired: false
  },
  {
    id: 'tree-pose',
    name: 'Tree Pose',
    sanskritName: 'Vrksasana',
    duration: 50,
    target_zones: ['legs', 'hips'],
    cycle_phase: ['follicular', 'ovulation'],
    trimester_safe: ['first', 'second', 'third', 'postpartum'],
    contraindications: [],
    illustration_2d: 'tree-pose',
    anatomicalFocus: 'Proprioception, ankle stabilizers, pelvic floor alignment, mindful single-point focus.',
    alignmentCues: [
      'Ground through base of standing foot; place sole of other foot to inner ankle, calf, or inner thigh (never on knee).',
      'Hands join at heart center in Anjali Mudra.',
      'Fix gaze on an unmoving visual point (Drishti) at eye level.'
    ],
    easierVariation: {
      name: 'Kickstand Tree Pose by Wall',
      description: 'Keep ball of foot grounded on floor as a kickstand while touching a wall for support.'
    },
    category: 'stabilize',
    noMatRequired: true
  },
  {
    id: 'camel-pose',
    name: 'Camel Pose (Supported)',
    sanskritName: 'Ustrasana',
    duration: 50,
    target_zones: ['upper_back', 'shoulders', 'hips'],
    cycle_phase: ['ovulation'],
    trimester_safe: ['first'],
    contraindications: ['high_bp', 'deep_twist'],
    illustration_2d: 'camel-pose',
    anatomicalFocus: 'Pectoral opening, anterior kinetic chain release, heart chakra expansion.',
    alignmentCues: [
      'Kneel with hips stacked over knees, hands supporting lower back with fingers pointing down.',
      'Draw elbows toward each other, lift breastbone toward ceiling.',
      'Keep cervical spine long without letting head collapse backward.'
    ],
    easierVariation: {
      name: 'Standing Backbend with Hands on Sacrum',
      description: 'Perform supported chest elevation from a stable standing stance.'
    },
    category: 'release',
    noMatRequired: false
  },
  {
    id: 'supported-bridge',
    name: 'Supported Bridge Pose',
    sanskritName: 'Setu Bandhasana',
    duration: 60,
    target_zones: ['lower_back', 'hips', 'legs'],
    cycle_phase: ['ovulation', 'luteal'],
    trimester_safe: ['first', 'second'],
    contraindications: ['supine_late'],
    illustration_2d: 'bridge-pose',
    anatomicalFocus: 'Glute bridge activation, thoracic extension, lumbar stabilization.',
    alignmentCues: [
      'Lie on back, bend knees with feet hip-width flat on floor close to sitting bones.',
      'Press feet down to lift hips, slide a yoga block or firm cushion under sacrum.',
      'Rest weight onto block; relax arms and breathe into belly and ribs.'
    ],
    easierVariation: {
      name: 'Pelvic Lift with Bolster',
      description: 'Keep block at lowest horizontal height for restorative decompression.'
    },
    category: 'restorative',
    noMatRequired: false
  },
  {
    id: 'goddess-pose',
    name: 'Goddess Pose',
    sanskritName: 'Utkata Konasana',
    duration: 50,
    target_zones: ['hips', 'legs'],
    cycle_phase: ['ovulation'],
    trimester_safe: ['first', 'second', 'third', 'postpartum'],
    contraindications: [],
    illustration_2d: 'goddess-pose',
    anatomicalFocus: 'Pelvic floor toning and opening, hip abductor engagement, grounded root vitality.',
    alignmentCues: [
      'Take wide stance, turn toes outward at 45 degrees.',
      'Bend knees deeply directly track over ankles; maintain upright neutral torso.',
      'Cactus arms at shoulder height, drawing shoulder blades gently back.'
    ],
    easierVariation: {
      name: 'Supported Chair Goddess',
      description: 'Sit on front edge of a chair with wide legs and open hips.'
    },
    category: 'stabilize',
    noMatRequired: true
  },
  {
    id: 'reclined-bound-angle',
    name: 'Reclined Bound Angle Pose',
    sanskritName: 'Supta Baddha Konasana',
    duration: 80,
    target_zones: ['hips', 'lower_back'],
    cycle_phase: ['menstrual', 'luteal'],
    trimester_safe: ['first', 'second', 'third', 'postpartum'],
    contraindications: ['supine_late'],
    illustration_2d: 'bound-angle',
    anatomicalFocus: 'Deep pelvic floor release, adductor relaxation, soothing menstrual cramps.',
    alignmentCues: [
      'Lie back with soles of feet together, knees splaying outward like butterfly wings.',
      'Place one hand on belly and one on heart.',
      'Allow gravity to naturally open the inner groins without pushing or forcing.'
    ],
    easierVariation: {
      name: 'Incline Supported Bound Angle',
      description: 'Prop back and head up at 30-degree incline using cushions or bolsters.'
    },
    category: 'restorative',
    noMatRequired: false
  },
  {
    id: 'seated-forward-fold',
    name: 'Gentle Seated Forward Fold',
    sanskritName: 'Paschimottanasana',
    duration: 60,
    target_zones: ['lower_back', 'legs', 'upper_back'],
    cycle_phase: ['luteal'],
    trimester_safe: ['first'],
    contraindications: ['deep_twist'],
    illustration_2d: 'forward-fold',
    anatomicalFocus: 'Hamstring lengthener, spinal decompression, introspective parasympathetic soothing.',
    alignmentCues: [
      'Extend legs forward with generous soft bend in knees.',
      'Inhale to lift spine tall; exhale to fold torso over thighs with soft relaxed back.',
      'Rest hands on shins, ankles, or feet. Release any grip or striving.'
    ],
    easierVariation: {
      name: 'Supported Fold with Pillow on Lap',
      description: 'Place a large pillow over thighs and rest chest and forehead over pillow.'
    },
    category: 'grounding',
    noMatRequired: false
  },
  {
    id: 'supported-pigeon-figure-four',
    name: 'Figure-Four Hip Decompression',
    sanskritName: 'Supta Kapotasana',
    duration: 60,
    target_zones: ['hips', 'lower_back'],
    cycle_phase: ['luteal', 'menstrual'],
    trimester_safe: ['first', 'second', 'third', 'postpartum'],
    contraindications: [],
    illustration_2d: 'figure-four',
    anatomicalFocus: 'Piriformis, outer gluteus medius, and sciatic nerve decompression.',
    alignmentCues: [
      'Lie on back with knees bent, cross right ankle over left thigh just above knee.',
      'Reach hands through to clasp behind left hamstring; gently draw left knee toward chest.',
      'Keep right foot flexed to protect knee joint.'
    ],
    easierVariation: {
      name: 'Seated Chair Figure-Four',
      description: 'Perform ankle-over-knee stretch while seated upright in a chair.'
    },
    category: 'release',
    noMatRequired: true
  },
  {
    id: 'pelvic-tilts-transverse',
    name: 'Gentle Pelvic Tilts & Core Reset',
    sanskritName: 'Tadasana Sthiti Variant',
    duration: 60,
    target_zones: ['lower_back', 'hips'],
    cycle_phase: ['menstrual', 'luteal', 'follicular'],
    trimester_safe: ['first', 'second', 'third', 'postpartum'],
    contraindications: ['intense_core'], // postpartum and safe
    illustration_2d: 'pelvic-tilt',
    anatomicalFocus: 'Transverse abdominis and pelvic floor coordination; safe for diastasis recti.',
    alignmentCues: [
      'Lie comfortably on back with knees bent, feet flat on floor hip-width apart.',
      'Inhale: Allow natural slight arch in lower back.',
      'Exhale: Gently draw navel inward, press lower back flush into mat without clenching glutes.'
    ],
    easierVariation: {
      name: 'Standing Wall Pelvic Tilt',
      description: 'Lean against a flat wall with knees soft, tilting pelvis against the wall.'
    },
    category: 'stabilize',
    noMatRequired: false
  },
  {
    id: 'box-breath-pranayama',
    name: 'Box Breathing Somatic Reset',
    sanskritName: 'Sama Vritti Pranayama',
    duration: 90,
    target_zones: ['neck', 'shoulders', 'upper_back'],
    cycle_phase: ['menstrual', 'luteal', 'follicular', 'ovulation'],
    trimester_safe: ['first', 'second', 'third', 'postpartum'],
    contraindications: [],
    illustration_2d: 'box-breath',
    anatomicalFocus: 'Vagus nerve stimulation, autonomic balance, lowering cortisol & blood pressure.',
    alignmentCues: [
      'Sit comfortably upright, relax shoulders down away from ears.',
      'Inhale for 4 counts, expand the lower ribcage laterally.',
      'Hold breath smoothly for 4 counts without straining.',
      'Exhale slowly for 4 counts through nose or pursed lips.',
      'Hold empty for 4 counts, finding stillness.'
    ],
    easierVariation: {
      name: 'Extended Exhale 4:6 Breath',
      description: 'Skip breath retention; inhale for 4 seconds, exhale smoothly for 6 seconds.'
    },
    category: 'breath',
    noMatRequired: true
  },
  {
    id: 'savasana-guided-rest',
    name: 'Corpse Pose / Side-Lying Rest',
    sanskritName: 'Savasana',
    duration: 90,
    target_zones: ['lower_back', 'upper_back', 'neck', 'hips', 'legs', 'shoulders'],
    cycle_phase: ['menstrual', 'luteal', 'follicular', 'ovulation'],
    trimester_safe: ['first', 'second', 'third', 'postpartum'],
    contraindications: [],
    illustration_2d: 'savasana',
    anatomicalFocus: 'Full somatic integration, nervous system restoration, mental silence.',
    alignmentCues: [
      'Lie flat on back (or left side-lying if 20+ weeks pregnant), feet falling naturally open.',
      'Arms alongside body, palms resting gently toward sky.',
      'Unclench jaw, soften space between eyebrows, surrender body weight to the ground.'
    ],
    easierVariation: {
      name: 'Left-Side Prop Supported Rest',
      description: 'Lie on left side with bolster between knees and pillow under head.'
    },
    category: 'restorative',
    noMatRequired: false
  }
];
