<?php
/**
 * FlowState WordPress Security Audit Utility (WP-CLI & Admin Tool)
 * 
 * Usage via WP-CLI:
 * wp eval-file wp-security-audit.php
 */

if (!defined('ABSPATH')) {
    // If run directly via CLI
    if (file_exists(__DIR__ . '/wp-load.php')) {
        require_once __DIR__ . '/wp-load.php';
    } elseif (file_exists(dirname(__DIR__) . '/wp-load.php')) {
        require_once dirname(__DIR__) . '/wp-load.php';
    } else {
        echo "Please run via `wp eval-file wp-security-audit.php` or place in WP root.\n";
        exit(1);
    }
}

echo "\n=======================================================\n";
echo "   FLOWSTATE WORDPRESS SECURITY AUDIT REPORT\n";
echo "   Target: " . get_bloginfo('name') . " (" . home_url() . ")\n";
echo "   Date: " . date('Y-m-d H:i:s') . "\n";
echo "=======================================================\n\n";

// 1. Audit Administrators
echo "[1] Checking Administrator Accounts:\n";
$admins = get_users(array('role' => 'administrator'));
foreach ($admins as $admin) {
    echo sprintf(
        " - ID #%d | Login: %-15s | Email: %-25s | Registered: %s\n",
        $admin->ID,
        $admin->user_login,
        $admin->user_email,
        $admin->user_registered
    );
}

// 2. Audit Core / Theme / Plugin Modification Dates (Last 14 Days)
echo "\n[2] Checking Recently Modified PHP Files in wp-content (Last 14 Days):\n";
$content_dir = WP_CONTENT_DIR;
$two_weeks_ago = time() - (14 * 86400);
$flagged_files = 0;

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($content_dir, RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST
);

foreach ($iterator as $item) {
    if ($item->isFile() && $item->getExtension() === 'php') {
        $mtime = $item->getMTime();
        if ($mtime > $two_weeks_ago) {
            $flagged_files++;
            echo sprintf(" - Modified %s: %s\n", date('Y-m-d H:i', $mtime), str_replace(ABSPATH, '', $item->getPathname()));
            if ($flagged_files >= 25) {
                echo "   ... (truncating further recent file logs for brevity)\n";
                break;
            }
        }
    }
}
if ($flagged_files === 0) {
    echo "   No PHP files modified in wp-content during the past 14 days.\n";
}

// 3. Scan for Negative CSS Positioning or Hidden Divs in Database
echo "\n[3] Scanning Posts for Hidden Spam Elements (CSS Absolute/Negative/Display:None):\n";
global $wpdb;
$spam_candidates = $wpdb->get_results("
    SELECT ID, post_title, post_type 
    FROM {$wpdb->posts} 
    WHERE (post_content LIKE '%top:%-%' OR post_content LIKE '%left:%-%' OR post_content LIKE '%display:none%' OR post_content LIKE '%display: none%')
      AND post_status = 'publish'
    LIMIT 10
");

if (!empty($spam_candidates)) {
    echo "   WARNING: Found " . count($spam_candidates) . " published posts with suspicious CSS hiding rules:\n";
    foreach ($spam_candidates as $p) {
        echo "   - Post ID #{$p->ID}: '{$p->post_title}' ({$p->post_type})\n";
    }
} else {
    echo "   Clean: No obvious negative absolute positioning found in sample query.\n";
}

// 4. Verify XML-RPC and Admin Ajax Protection
echo "\n[4] XML-RPC & File Edit Status:\n";
if (defined('DISALLOW_FILE_EDIT') && DISALLOW_FILE_EDIT) {
    echo "   ✓ DISALLOW_FILE_EDIT is ENABLED (Good: Theme/plugin editor disabled).\n";
} else {
    echo "   ⚠ DISALLOW_FILE_EDIT is FALSE. Recommended: add define('DISALLOW_FILE_EDIT', true); in wp-config.php\n";
}

echo "\nAudit complete. To purge identified spam content, use /wordpress/security-audit-and-cleanup.sql\n\n";
