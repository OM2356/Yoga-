<?php
/**
 * Plugin Name: FlowState Core — Somatic LMS & AI Engine
 * Plugin URI: https://flowstate.yoga
 * Description: Real-stack WordPress plugin for FlowState: BuddyBoss user wellness meta, Elementor mood check-in widget, LearnDash 3D pose integration, cycle & prenatal filtering, and server-side AI routine generator with deterministic safety contraindication filtering.
 * Version: 2.0.0
 * Author: FlowState Engineering
 * Text Domain: flowstate
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

define('FLOWSTATE_VERSION', '2.0.0');
define('FLOWSTATE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FLOWSTATE_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * --------------------------------------------------------------------------
 * 0. DATABASE SETUP: Audit Table for AI Routines
 * --------------------------------------------------------------------------
 */
register_activation_hook(__FILE__, 'flowstate_install_tables');

function flowstate_install_tables() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'flowstate_routines';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        prompt text NOT NULL,
        raw_routine_json longtext NOT NULL,
        filtered_routine_json longtext NOT NULL,
        filter_notices text DEFAULT NULL,
        safety_flags_json text DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY created_at (created_at)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}

/**
 * --------------------------------------------------------------------------
 * 1. BUDDYBOSS & WORDPRESS USER META EXTENSION
 * Exposes safety_flags, cycle_tracking_enabled, trimester, mood_log to WP REST API.
 * Gated strictly with current_user_can() checks.
 * --------------------------------------------------------------------------
 */
add_action('init', 'flowstate_register_user_meta');

function flowstate_register_user_meta() {
    // 1. Safety Flags (JSON object)
    register_meta('user', 'flowstate_safety_flags', array(
        'type'         => 'object',
        'description'  => 'Clinical safety profile: pregnancy, injury, hypertension, glaucoma',
        'single'       => true,
        'show_in_rest' => array(
            'schema' => array(
                'type'       => 'object',
                'properties' => array(
                    'completed'            => array('type' => 'boolean'),
                    'skipped'              => array('type' => 'boolean'),
                    'pregnantOrPostpartum' => array('type' => 'boolean'),
                    'recentInjury'         => array('type' => 'boolean'),
                    'highBloodPressure'    => array('type' => 'boolean'),
                    'glaucomaOrEye'        => array('type' => 'boolean'),
                ),
            ),
        ),
        'auth_callback' => function($allowed, $meta_key, $user_id) {
            return (get_current_user_id() === (int)$user_id) || current_user_can('edit_user', $user_id);
        }
    ));

    // 2. Cycle Tracking Enabled (Boolean)
    register_meta('user', 'flowstate_cycle_tracking_enabled', array(
        'type'         => 'boolean',
        'description'  => 'Whether member enables hormonal cycle phase curation',
        'single'       => true,
        'show_in_rest' => true,
        'auth_callback' => function($allowed, $meta_key, $user_id) {
            return (get_current_user_id() === (int)$user_id) || current_user_can('edit_user', $user_id);
        }
    ));

    // 3. Trimester Stage (String or null)
    register_meta('user', 'flowstate_trimester', array(
        'type'         => 'string',
        'description'  => 'Current trimester: trimester_1, trimester_2, trimester_3, postpartum, or none',
        'single'       => true,
        'show_in_rest' => true,
        'auth_callback' => function($allowed, $meta_key, $user_id) {
            return (get_current_user_id() === (int)$user_id) || current_user_can('edit_user', $user_id);
        }
    ));

    // 4. Mood Log History (Array of objects: {mood, target_zones, timestamp})
    register_meta('user', 'flowstate_mood_log', array(
        'type'         => 'array',
        'description'  => 'Chronological mood check-in entries',
        'single'       => true,
        'show_in_rest' => array(
            'schema' => array(
                'type'  => 'array',
                'items' => array(
                    'type'       => 'object',
                    'properties' => array(
                        'mood'        => array('type' => 'string'),
                        'target_zones'=> array('type' => 'array', 'items' => array('type' => 'string')),
                        'timestamp'   => array('type' => 'string'),
                    ),
                ),
            ),
        ),
        'auth_callback' => function($allowed, $meta_key, $user_id) {
            return (get_current_user_id() === (int)$user_id) || current_user_can('edit_user', $user_id);
        }
    ));
}

/**
 * --------------------------------------------------------------------------
 * 2. CUSTOM TAXONOMIES: LearnDash Mood Tags & Wellness Pathways
 * --------------------------------------------------------------------------
 */
add_action('init', 'flowstate_register_taxonomies', 0);

function flowstate_register_taxonomies() {
    // Taxonomy for LearnDash courses & lessons: mood_tag
    register_taxonomy('mood_tag', array('sfwd-courses', 'sfwd-lessons', 'sfwd-topic'), array(
        'labels' => array(
            'name'          => __('Mood Tags', 'flowstate'),
            'singular_name' => __('Mood Tag', 'flowstate'),
        ),
        'hierarchical'      => true,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'rewrite'           => array('slug' => 'mood'),
    ));

    // Taxonomy for LearnDash courses: wellness_pathway (cycle-sync, prenatal, postpartum)
    register_taxonomy('wellness_pathway', array('sfwd-courses', 'sfwd-lessons'), array(
        'labels' => array(
            'name'          => __('Wellness Pathways', 'flowstate'),
            'singular_name' => __('Wellness Pathway', 'flowstate'),
        ),
        'hierarchical'      => true,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'rewrite'           => array('slug' => 'pathway'),
    ));
}

/**
 * --------------------------------------------------------------------------
 * 3. REST API ENDPOINTS: Mood Log & AI Routine Proxy
 * --------------------------------------------------------------------------
 */
add_action('rest_api_init', function () {
    // Route 1: Record Mood Check-in
    register_rest_route('flowstate/v1', '/mood-log', array(
        'methods'             => 'POST',
        'callback'            => 'flowstate_rest_log_mood',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
        'args' => array(
            'mood' => array(
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'target_zones' => array(
                'required' => false,
                'type'     => 'array',
            ),
        ),
    ));

    // Route 2: Generate AI Routine with Server-Side Safety Filter
    register_rest_route('flowstate/v1', '/ai-routine', array(
        'methods'             => 'POST',
        'callback'            => 'flowstate_rest_generate_ai_routine',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
        'args' => array(
            'prompt' => array(
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_textarea_field',
            ),
        ),
    ));
});

/**
 * Callback: POST /wp-json/flowstate/v1/mood-log
 */
function flowstate_rest_log_mood($request) {
    $user_id = get_current_user_id();
    $mood = $request->get_param('mood');
    $target_zones = (array) $request->get_param('target_zones');

    $existing_log = get_user_meta($user_id, 'flowstate_mood_log', true);
    if (!is_array($existing_log)) {
        $existing_log = array();
    }

    $entry = array(
        'mood'         => $mood,
        'target_zones' => $target_zones,
        'timestamp'    => current_time('mysql'),
    );

    // Keep the last 50 entries
    array_unshift($existing_log, $entry);
    $existing_log = array_slice($existing_log, 0, 50);

    update_user_meta($user_id, 'flowstate_mood_log', $existing_log);

    // Resolve target LearnDash course or lesson URL tagged with this mood
    $redirect_url = flowstate_get_mood_destination_url($mood);

    return rest_ensure_response(array(
        'success'      => true,
        'logged_entry' => $entry,
        'redirect_url' => $redirect_url,
    ));
}

function flowstate_get_mood_destination_url($mood) {
    // 1. Check if a LearnDash course has been tagged with this mood
    $courses = get_posts(array(
        'post_type'      => 'sfwd-courses',
        'posts_per_page' => 1,
        'tax_query'      => array(
            array(
                'taxonomy' => 'mood_tag',
                'field'    => 'slug',
                'terms'    => sanitize_title($mood),
            ),
        ),
    ));

    if (!empty($courses)) {
        return get_permalink($courses[0]->ID);
    }

    // 2. Default fallback mapping
    $mapping = array(
        'anxious'    => '/courses/anxious-mind-reset/',
        'sore'       => '/courses/body-restoration-release/',
        'wired'      => '/courses/down-regulation-vagus/',
        'cramping'   => '/courses/pelvic-sacral-ease/',
        'low-energy' => '/courses/gentle-vitality-flow/',
    );

    $slug = sanitize_title($mood);
    return isset($mapping[$slug]) ? home_url($mapping[$slug]) : home_url('/courses/?mood=' . $slug);
}

/**
 * --------------------------------------------------------------------------
 * 4. DETERMINISTIC CLINICAL CONTRAINDICATION SAFETY FILTER (PHP Port)
 * --------------------------------------------------------------------------
 */
function flowstate_get_contraindication_table() {
    return array(
        'pregnancy' => array(
            'forbidden_tokens' => array('inversion', 'headstand', 'shoulderstand', 'handstand', 'belly', 'prone', 'cobra', 'bow pose', 'deep twist', 'breath retention', 'kumbhaka', 'kapalbhati'),
            'substitutes' => array(
                array(
                    'name' => 'Supported Butterfly with Bolster (Baddha Konasana)',
                    'duration' => 90,
                    'visualCue' => 'Feet together, knees open, upper body resting against angled bolster.',
                    'benefit' => 'Gentle pelvic floor release without intra-abdominal compression.'
                ),
                array(
                    'name' => 'Side-Lying Rest with Pelvic Pillow',
                    'duration' => 120,
                    'visualCue' => 'Lie on left side, pillow between knees and under head.',
                    'benefit' => 'Optimizes uterine blood flow and rests lumbar spine.'
                )
            )
        ),
        'high_blood_pressure' => array(
            'forbidden_tokens' => array('inversion', 'headstand', 'handstand', 'full shoulderstand', 'vigorous vinyasa', 'rapid breath'),
            'substitutes' => array(
                array(
                    'name' => 'Supported Legs on Bolster / Chair Rest',
                    'duration' => 90,
                    'visualCue' => 'Calves resting gently on chair or bolster, head elevated on folded blanket.',
                    'benefit' => 'Passive venous return without increasing cranial vascular pressure.'
                )
            )
        ),
        'glaucoma' => array(
            'forbidden_tokens' => array('inversion', 'headstand', 'handstand', 'shoulderstand', 'deep forward fold', 'uttanasana', 'downward-facing dog', 'downward dog'),
            'substitutes' => array(
                array(
                    'name' => 'Upright Seated Heart Opener',
                    'duration' => 75,
                    'visualCue' => 'Sit tall with head above heart, hands clasped behind back gently.',
                    'benefit' => 'Expands chest capacity while preventing intraocular pressure spikes.'
                )
            )
        ),
        'recent_injury' => array(
            'forbidden_tokens' => array('chaturanga', 'jump back', 'full wheel', 'deep backbend', 'intense twist', 'arm balance'),
            'substitutes' => array(
                array(
                    'name' => 'Supported Constructive Rest',
                    'duration' => 90,
                    'visualCue' => 'Lie on back, feet flat on floor wider than hips, knees resting together.',
                    'benefit' => 'Neutralizes spinal sheer forces and releases psoas tension.'
                )
            )
        )
    );
}

function flowstate_run_safety_filter($routine, $user_flags, $trimester = null) {
    $table = flowstate_get_contraindication_table();
    $poses = isset($routine['poses']) && is_array($routine['poses']) ? $routine['poses'] : array();
    $filtered_poses = array();
    $notices = array();
    $flags_applied = array();

    $is_pregnant = !empty($user_flags['pregnantOrPostpartum']) || (!empty($trimester) && $trimester !== 'none');
    $is_hbp = !empty($user_flags['highBloodPressure']);
    $is_glaucoma = !empty($user_flags['glaucomaOrEye']);
    $is_injury = !empty($user_flags['recentInjury']);

    if ($is_pregnant) $flags_applied[] = 'pregnancy';
    if ($is_hbp) $flags_applied[] = 'high_blood_pressure';
    if ($is_glaucoma) $flags_applied[] = 'glaucoma';
    if ($is_injury) $flags_applied[] = 'recent_injury';

    foreach ($poses as $pose) {
        $pose_text = strtolower(($pose['name'] ?? '') . ' ' . ($pose['visualCue'] ?? '') . ' ' . ($pose['benefit'] ?? ''));
        $contraindicated = false;
        $replacement = null;
        $reason = '';

        // Check against active flags
        if ($is_pregnant && !$contraindicated) {
            foreach ($table['pregnancy']['forbidden_tokens'] as $tok) {
                if (strpos($pose_text, $tok) !== false) {
                    $contraindicated = true;
                    $replacement = $table['pregnancy']['substitutes'][0];
                    $reason = "Replaced '{$pose['name']}' with pregnancy-safe '{$replacement['name']}' to avoid compression/inversion.";
                    break;
                }
            }
        }

        if ($is_glaucoma && !$contraindicated) {
            foreach ($table['glaucoma']['forbidden_tokens'] as $tok) {
                if (strpos($pose_text, $tok) !== false) {
                    $contraindicated = true;
                    $replacement = $table['glaucoma']['substitutes'][0];
                    $reason = "Replaced '{$pose['name']}' with '{$replacement['name']}' to avoid elevated intraocular pressure.";
                    break;
                }
            }
        }

        if ($is_hbp && !$contraindicated) {
            foreach ($table['high_blood_pressure']['forbidden_tokens'] as $tok) {
                if (strpos($pose_text, $tok) !== false) {
                    $contraindicated = true;
                    $replacement = $table['high_blood_pressure']['substitutes'][0];
                    $reason = "Replaced '{$pose['name']}' with '{$replacement['name']}' to maintain safe blood pressure alignment.";
                    break;
                }
            }
        }

        if ($is_injury && !$contraindicated) {
            foreach ($table['recent_injury']['forbidden_tokens'] as $tok) {
                if (strpos($pose_text, $tok) !== false) {
                    $contraindicated = true;
                    $replacement = $table['recent_injury']['substitutes'][0];
                    $reason = "Replaced '{$pose['name']}' with supported alternative due to active injury caution.";
                    break;
                }
            }
        }

        if ($contraindicated && $replacement) {
            $filtered_poses[] = $replacement;
            $notices[] = $reason;
        } else {
            $filtered_poses[] = $pose;
        }
    }

    $routine['poses'] = $filtered_poses;
    return array(
        'routine'        => $routine,
        'notices'        => $notices,
        'flags_applied'  => $flags_applied,
    );
}

/**
 * Callback: POST /wp-json/flowstate/v1/ai-routine
 * Calls Anthropic (or Gemini/deterministic fallback) using wp-config.php keys.
 */
function flowstate_rest_generate_ai_routine($request) {
    global $wpdb;
    $user_id = get_current_user_id();
    $prompt = trim($request->get_param('prompt'));

    // Retrieve user safety profile
    $safety_flags = (array) get_user_meta($user_id, 'flowstate_safety_flags', true);
    $trimester = get_user_meta($user_id, 'flowstate_trimester', true);

    // Call server-side LLM provider (Anthropic, Gemini, or deterministic fallback)
    $raw_routine = flowstate_call_ai_service($prompt, $safety_flags, $trimester);

    // Execute the deterministic clinical contraindication safety filter
    $filter_result = flowstate_run_safety_filter($raw_routine, $safety_flags, $trimester);

    // Audit log to wp_flowstate_routines
    $wpdb->insert(
        $wpdb->prefix . 'flowstate_routines',
        array(
            'user_id'               => $user_id,
            'prompt'                => $prompt,
            'raw_routine_json'      => wp_json_encode($raw_routine),
            'filtered_routine_json' => wp_json_encode($filter_result['routine']),
            'filter_notices'        => wp_json_encode($filter_result['notices']),
            'safety_flags_json'     => wp_json_encode($safety_flags),
            'created_at'            => current_time('mysql'),
        ),
        array('%d', '%s', '%s', '%s', '%s', '%s', '%s')
    );

    return rest_ensure_response(array(
        'success'               => true,
        'routine'               => $filter_result['routine'],
        'filteredNotices'       => $filter_result['notices'],
        'safetyFlagsApplied'    => $filter_result['flags_applied'],
    ));
}

function flowstate_call_ai_service($prompt, $safety_flags, $trimester) {
    $system_instruction = "You are FlowState's expert somatic yoga instructor. User safety flags: " . wp_json_encode($safety_flags) . ". Trimester: " . ($trimester ?: 'none') . ". Return ONLY a valid JSON object with keys: title (string), focusArea (string), precautions (string), and poses (array of objects with name, duration in seconds between 45 and 150, visualCue, benefit). No markdown code blocks, no extraneous text.";

    // 1. Check Anthropic API Key in wp-config.php or environment
    $anthropic_key = defined('ANTHROPIC_API_KEY') ? ANTHROPIC_API_KEY : getenv('ANTHROPIC_API_KEY');
    if (!empty($anthropic_key)) {
        $response = wp_remote_post('https://api.anthropic.com/v1/messages', array(
            'timeout' => 20,
            'headers' => array(
                'x-api-key'         => $anthropic_key,
                'content-type'      => 'application/json',
                'anthropic-version' => '2023-06-01',
            ),
            'body' => wp_json_encode(array(
                'model'      => 'claude-3-5-sonnet-20241022',
                'max_tokens' => 1000,
                'system'     => $system_instruction,
                'messages'   => array(
                    array('role' => 'user', 'content' => "User request: \"$prompt\". Output JSON only.")
                )
            ))
        ));

        if (!is_wp_error($response)) {
            $body = json_decode(wp_remote_retrieve_body($response), true);
            $text = $body['content'][0]['text'] ?? '';
            $clean_json = trim(preg_replace('/```(?:json)?\s*/i', '', $text), " \t\n\r\0\x0B`");
            $decoded = json_decode($clean_json, true);
            if ($decoded && !empty($decoded['poses'])) {
                return $decoded;
            }
        }
    }

    // 2. Fallback: Gemini API Key
    $gemini_key = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : getenv('GEMINI_API_KEY');
    if (!empty($gemini_key)) {
        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $gemini_key;
        $response = wp_remote_post($endpoint, array(
            'timeout' => 20,
            'headers' => array('Content-Type' => 'application/json'),
            'body'    => wp_json_encode(array(
                'contents' => array(
                    array('parts' => array(array('text' => "$system_instruction\n\nUser request: \"$prompt\"")))
                ),
                'generationConfig' => array('responseMimeType' => 'application/json')
            ))
        ));

        if (!is_wp_error($response)) {
            $body = json_decode(wp_remote_retrieve_body($response), true);
            $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? '';
            $decoded = json_decode($text, true);
            if ($decoded && !empty($decoded['poses'])) {
                return $decoded;
            }
        }
    }

    // 3. Guaranteed Deterministic Clinical Fallback (never fails or hangs)
    return array(
        'title'       => 'Somatic Postural Decompression Flow',
        'focusArea'   => 'Thoracic Spine, Trapezius & Pelvic Equilibrium',
        'precautions' => 'Maintain steady nasal diaphragmatic breathing. Avoid forcing any joint beyond gentle stretch.',
        'poses'       => array(
            array(
                'name'      => 'Seated Lateral Neck & Trapezius Release',
                'duration'  => 60,
                'visualCue' => 'Tilt ear gently toward shoulder, breathe into opposite clavicle line.',
                'benefit'   => 'Relieves sternocleidomastoid stiffness and screen forward-head angle.'
            ),
            array(
                'name'      => 'Seated Eagle Arms (Garudasana)',
                'duration'  => 75,
                'visualCue' => 'Cross elbows, lift forearms to chin level while dropping shoulder blades.',
                'benefit'   => 'Decompresses rhomboids and broadens interscapular fascia.'
            ),
            array(
                'name'      => 'Supported Wide Child’s Pose (Balasana)',
                'duration'  => 90,
                'visualCue' => 'Knees apart, hips back to heels, arms reaching forward with soft elbows.',
                'benefit'   => 'Lengthens lumbar spine and signals safety to adrenal axis.'
            ),
            array(
                'name'      => 'Supported Constructive Rest with Diaphragmatic Breath',
                'duration'  => 120,
                'visualCue' => 'Lie on back, feet wide, knees falling inward to touch, hands on belly.',
                'benefit'   => 'Releases deep psoas hyper-tonicity and integrates autonomic recovery.'
            )
        )
    );
}

/**
 * --------------------------------------------------------------------------
 * 5. SHORTCODE: [flowstate_mood_checkin]
 * Renders the 5 mood cards using Elementor Kit CSS variables and client fetch.
 * --------------------------------------------------------------------------
 */
add_shortcode('flowstate_mood_checkin', 'flowstate_render_mood_checkin_shortcode');

function flowstate_render_mood_checkin_shortcode($atts) {
    ob_start();
    ?>
    <div class="flowstate-mood-container" id="flowstate-mood-widget">
        <style>
            .flowstate-mood-container {
                max-width: 680px;
                margin: 0 auto;
                padding: 24px 16px;
                font-family: inherit;
                color: var(--e-global-color-text, #222a26);
            }
            .flowstate-header {
                text-align: center;
                margin-bottom: 28px;
            }
            .flowstate-title {
                font-family: var(--e-global-typography-primary-font-family, serif);
                font-size: 32px;
                line-height: 1.2;
                margin: 0 0 8px 0;
                font-weight: 500;
                color: var(--e-global-color-primary, #1b261f);
            }
            .flowstate-subtitle {
                font-size: 14px;
                color: #5c7062;
                margin: 0;
            }
            .flowstate-grid {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .flowstate-card {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                background: #ffffff;
                border: 1px solid #dce5df;
                border-radius: 16px;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                text-align: left;
                width: 100%;
                box-sizing: border-box;
            }
            .flowstate-card:hover {
                border-color: var(--e-global-color-accent, #2d5a3f);
                background: #f7faf7;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(45, 90, 63, 0.08);
            }
            .flowstate-card-left {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            .flowstate-card-icon {
                width: 44px;
                height: 44px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                background: #eef4f0;
                color: var(--e-global-color-accent, #2d5a3f);
            }
            .flowstate-card-name {
                font-size: 16px;
                font-weight: 600;
                color: #1a251e;
                margin-bottom: 2px;
            }
            .flowstate-card-desc {
                font-size: 12px;
                color: #5e7264;
            }
            .flowstate-card-time {
                font-size: 11px;
                font-weight: 600;
                background: #edf3ee;
                color: var(--e-global-color-accent, #2d5a3f);
                padding: 4px 10px;
                border-radius: 20px;
                white-space: nowrap;
            }
            .flowstate-status-msg {
                text-align: center;
                margin-top: 14px;
                font-size: 12px;
                color: var(--e-global-color-accent, #2d5a3f);
                display: none;
            }
        </style>

        <div class="flowstate-header">
            <h2 class="flowstate-title"><?php _e('How are you feeling right now?', 'flowstate'); ?></h2>
            <p class="flowstate-subtitle"><?php _e('Select your current state. We curate your session instantly.', 'flowstate'); ?></p>
        </div>

        <div class="flowstate-grid">
            <button type="button" class="flowstate-card" data-mood="anxious">
                <div class="flowstate-card-left">
                    <div class="flowstate-card-icon">🌊</div>
                    <div>
                        <div class="flowstate-card-name"><?php _e('Anxious & Overwhelmed', 'flowstate'); ?></div>
                        <div class="flowstate-card-desc"><?php _e('Vagus nerve calming, box breathing & grounding', 'flowstate'); ?></div>
                    </div>
                </div>
                <div class="flowstate-card-time">12 min</div>
            </button>

            <button type="button" class="flowstate-card" data-mood="sore">
                <div class="flowstate-card-left">
                    <div class="flowstate-card-icon">🎯</div>
                    <div>
                        <div class="flowstate-card-name"><?php _e('Physically Sore or Tight', 'flowstate'); ?></div>
                        <div class="flowstate-card-desc"><?php _e('Neck, shoulders, lumbar & hip joint release', 'flowstate'); ?></div>
                    </div>
                </div>
                <div class="flowstate-card-time">12 min</div>
            </button>

            <button type="button" class="flowstate-card" data-mood="wired">
                <div class="flowstate-card-left">
                    <div class="flowstate-card-icon">⚡</div>
                    <div>
                        <div class="flowstate-card-name"><?php _e('Wired But Tired', 'flowstate'); ?></div>
                        <div class="flowstate-card-desc"><?php _e('Adrenal soothing, parasympathetic down-regulation', 'flowstate'); ?></div>
                    </div>
                </div>
                <div class="flowstate-card-time">12 min</div>
            </button>

            <button type="button" class="flowstate-card" data-mood="cramping">
                <div class="flowstate-card-left">
                    <div class="flowstate-card-icon">🌸</div>
                    <div>
                        <div class="flowstate-card-name"><?php _e('Cramping & Pelvic Tension', 'flowstate'); ?></div>
                        <div class="flowstate-card-desc"><?php _e('Sacral ease, supported butterfly & gentle warmth', 'flowstate'); ?></div>
                    </div>
                </div>
                <div class="flowstate-card-time">12 min</div>
            </button>

            <button type="button" class="flowstate-card" data-mood="low-energy">
                <div class="flowstate-card-left">
                    <div class="flowstate-card-icon">🕯️</div>
                    <div>
                        <div class="flowstate-card-name"><?php _e('Low Energy & Depleted', 'flowstate'); ?></div>
                        <div class="flowstate-card-desc"><?php _e('Restorative supported floor flow without adrenal strain', 'flowstate'); ?></div>
                    </div>
                </div>
                <div class="flowstate-card-time">12 min</div>
            </button>
        </div>

        <div class="flowstate-status-msg" id="flowstate-status-msg"></div>

        <script>
            (function() {
                var container = document.getElementById('flowstate-mood-widget');
                var statusMsg = document.getElementById('flowstate-status-msg');
                if (!container) return;

                var cards = container.querySelectorAll('.flowstate-card');
                cards.forEach(function(card) {
                    card.addEventListener('click', function() {
                        var mood = this.getAttribute('data-mood');
                        card.style.opacity = '0.6';
                        if (statusMsg) {
                            statusMsg.style.display = 'block';
                            statusMsg.textContent = 'Curating your reset...';
                        }

                        // Send REST request to FlowState endpoint
                        fetch('<?php echo esc_url_raw(rest_url('flowstate/v1/mood-log')); ?>', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
                            },
                            body: JSON.stringify({ mood: mood })
                        })
                        .then(function(res) { return res.json(); })
                        .then(function(data) {
                            if (data && data.redirect_url) {
                                window.location.href = data.redirect_url;
                            } else {
                                window.location.href = '<?php echo home_url('/courses/?mood='); ?>' + encodeURIComponent(mood);
                            }
                        })
                        .catch(function(err) {
                            // Offline or unauthenticated fallback
                            window.location.href = '<?php echo home_url('/courses/?mood='); ?>' + encodeURIComponent(mood);
                        });
                    });
                });
            })();
        </script>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * --------------------------------------------------------------------------
 * 6. SHORTCODE: [flowstate_pose_3d file="04_downward-dog.glb" height="400px"]
 * Enqueues Three.js + GLTFLoader only on pages containing the shortcode.
 * --------------------------------------------------------------------------
 */
add_shortcode('flowstate_pose_3d', 'flowstate_render_pose_3d_shortcode');

function flowstate_render_pose_3d_shortcode($atts) {
    $atts = shortcode_atts(array(
        'file'   => '04_downward-dog.glb',
        'height' => '420px',
        'title'  => 'Interactive Anatomical Pose Viewer',
    ), $atts, 'flowstate_pose_3d');

    $file_url = content_url('/uploads/flowstate-poses/' . sanitize_file_name($atts['file']));
    $container_id = 'pose-3d-' . wp_rand(1000, 9999);

    ob_start();
    ?>
    <div class="flowstate-pose-3d-wrapper" style="margin: 20px 0; border: 1px solid #dce5df; border-radius: 16px; overflow: hidden; background: #fafbfa;">
        <div style="padding: 10px 16px; background: #f0f4f1; border-bottom: 1px solid #e1ebe3; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12px; font-weight: 600; color: #2d5a3f; text-transform: uppercase; letter-spacing: 0.5px;">
                ✦ <?php echo esc_html($atts['title']); ?>
            </span>
            <span style="font-size: 11px; color: #5f7466;">Drag to rotate · Scroll to zoom</span>
        </div>
        <div id="<?php echo esc_attr($container_id); ?>" style="width: 100%; height: <?php echo esc_attr($atts['height']); ?>; position: relative;">
            <div class="pose-3d-loading" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #526759;">
                Loading somatic pose geometry...
            </div>
        </div>
        <script>
            (function() {
                function initViewer() {
                    var container = document.getElementById('<?php echo esc_js($container_id); ?>');
                    if (!container || !window.THREE || !window.THREE.GLTFLoader) return;

                    var loadingEl = container.querySelector('.pose-3d-loading');
                    var width = container.clientWidth;
                    var height = container.clientHeight;

                    var scene = new THREE.Scene();
                    scene.background = new THREE.Color(0xfafbfa);

                    var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
                    camera.position.set(0, 1.2, 2.5);

                    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                    renderer.setSize(width, height);
                    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                    container.appendChild(renderer.domElement);

                    // Lights
                    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xd0e0d5, 0.9);
                    scene.add(hemiLight);
                    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
                    dirLight.position.set(5, 10, 7);
                    scene.add(dirLight);

                    // Load GLTF Model
                    var loader = new THREE.GLTFLoader();
                    loader.load('<?php echo esc_url($file_url); ?>', function(gltf) {
                        if (loadingEl) loadingEl.remove();
                        scene.add(gltf.scene);
                    }, undefined, function(err) {
                        if (loadingEl) {
                            loadingEl.innerHTML = '<span style="color:#a84232;">3D Asset: <?php echo esc_js($atts['file']); ?> (Place in /wp-content/uploads/flowstate-poses/)</span>';
                        }
                    });

                    // Render Loop with gentle orbit
                    function animate() {
                        requestAnimationFrame(animate);
                        renderer.render(scene, camera);
                    }
                    animate();

                    window.addEventListener('resize', function() {
                        if (!container) return;
                        var w = container.clientWidth;
                        var h = container.clientHeight;
                        camera.aspect = w / h;
                        camera.updateProjectionMatrix();
                        renderer.setSize(w, h);
                    });
                }

                if (window.THREE && window.THREE.GLTFLoader) {
                    initViewer();
                } else {
                    window.addEventListener('load', initViewer);
                }
            })();
        </script>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Conditionally enqueue Three.js & GLTFLoader ONLY when [flowstate_pose_3d] is on the page
 */
add_action('wp_enqueue_scripts', 'flowstate_conditionally_enqueue_threejs');

function flowstate_conditionally_enqueue_threejs() {
    global $post;
    if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'flowstate_pose_3d')) {
        wp_enqueue_script('threejs', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', array(), '128', true);
        wp_enqueue_script('threejs-gltf', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js', array('threejs'), '128', true);
    }
}

/**
 * --------------------------------------------------------------------------
 * 7. LEARNDASH QUERY FILTER: Cycle & Trimester Pathway Gating
 * --------------------------------------------------------------------------
 */
add_filter('learndash_course_grid_query', 'flowstate_filter_learndash_grid_by_wellness_profile', 10, 2);
add_action('pre_get_posts', 'flowstate_filter_learndash_main_queries');

function flowstate_filter_learndash_grid_by_wellness_profile($query_args, $shortcode_atts) {
    if (!is_user_logged_in()) {
        return $query_args;
    }

    $user_id = get_current_user_id();
    $safety_flags = (array) get_user_meta($user_id, 'flowstate_safety_flags', true);
    $trimester = get_user_meta($user_id, 'flowstate_trimester', true);

    // If user is pregnant, filter to safe prenatal pathways
    if (!empty($safety_flags['pregnantOrPostpartum']) || (!empty($trimester) && $trimester !== 'none')) {
        $query_args['tax_query'][] = array(
            'taxonomy' => 'wellness_pathway',
            'field'    => 'slug',
            'terms'    => array('prenatal', 'postpartum', $trimester),
            'operator' => 'IN',
        );
    }

    return $query_args;
}

function flowstate_filter_learndash_main_queries($query) {
    if (is_admin() || !$query->is_main_query() || !is_user_logged_in()) {
        return;
    }

    if ($query->is_post_type_archive('sfwd-courses') || $query->is_tax('wellness_pathway')) {
        $user_id = get_current_user_id();
        $safety_flags = (array) get_user_meta($user_id, 'flowstate_safety_flags', true);
        $trimester = get_user_meta($user_id, 'flowstate_trimester', true);

        if (!empty($safety_flags['pregnantOrPostpartum'])) {
            $tax_query = (array) $query->get('tax_query');
            $tax_query[] = array(
                'taxonomy' => 'wellness_pathway',
                'field'    => 'slug',
                'terms'    => array('prenatal', 'postpartum'),
            );
            $query->set('tax_query', $tax_query);
        }
    }
}

/**
 * --------------------------------------------------------------------------
 * 8. CONDITIONAL DEQUEUEING: Performance Optimization
 * Removes render-blocking scripts on dedicated reset / lesson pages.
 * --------------------------------------------------------------------------
 */
add_action('wp_enqueue_scripts', 'flowstate_optimize_render_blocking_assets', 999);

function flowstate_optimize_render_blocking_assets() {
    // Only target lessons or the clean /how-are-you-feeling/ mood check-in page
    if (is_page('how-are-you-feeling') || is_singular('sfwd-lessons')) {
        // Dequeue WooCommerce cart fragments & styles if not on checkout/cart/shop
        if (!is_cart() && !is_checkout()) {
            wp_dequeue_style('woocommerce-general');
            wp_dequeue_style('woocommerce-layout');
            wp_dequeue_style('woocommerce-smallscreen');
            wp_dequeue_script('wc-cart-fragments');
        }

        // Dequeue floating WhatsApp chat widget on active somatic practice screens
        wp_dequeue_script('joinchat');
        wp_dequeue_style('joinchat');
    }
}
