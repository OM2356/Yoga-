-- ============================================================================
-- FlowState WordPress Security Audit & Spam Cleanup Script
-- Target: WordPress + LearnDash + Elementor + BuddyBoss Stack
-- Run via phpMyAdmin, WP Data Access, or MySQL CLI
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. IDENTIFY SPAM & HIDDEN INJECTIONS IN POST_CONTENT
-- Detects hidden text often injected by compromised plugins or nulled themes
-- (e.g., display:none, visibility:hidden, negative CSS coordinates, base64)
-- ----------------------------------------------------------------------------

-- Check 1A: Inspect posts containing suspicious negative CSS positioning (e.g. top: -9999px)
SELECT ID, post_title, post_type, post_status, post_modified 
FROM wp_posts 
WHERE post_content LIKE '%top:%-%' 
   OR post_content LIKE '%left:%-%' 
   OR post_content LIKE '%position: absolute; left: -%'
   OR post_content LIKE '%position:absolute;left:-%';

-- Check 1B: Inspect posts containing hidden div spam
SELECT ID, post_title, post_type, post_status, post_modified
FROM wp_posts
WHERE post_content LIKE '%display:none%'
   OR post_content LIKE '%display: none%'
   OR post_content LIKE '%visibility:hidden%'
   OR post_content LIKE '%visibility: hidden%';

-- Check 1C: Check for PHP code execution injections, eval, base64_decode inside post_content
SELECT ID, post_title, post_type, post_modified
FROM wp_posts
WHERE post_content LIKE '%base64_decode%'
   OR post_content LIKE '%eval(%'
   OR post_content LIKE '%<script%src=%http%'
   OR post_content LIKE '%document.write(unescape%';

-- ----------------------------------------------------------------------------
-- 2. AUDIT ADMINISTRATOR ACCOUNTS
-- Look for unauthorized or shadow administrator accounts created by exploits
-- ----------------------------------------------------------------------------
SELECT u.ID, u.user_login, u.user_email, u.user_registered, m.meta_value AS capabilities
FROM wp_users u
JOIN wp_usermeta m ON u.ID = m.user_id
WHERE m.meta_key = 'wp_capabilities'
  AND m.meta_value LIKE '%administrator%'
ORDER BY u.user_registered DESC;

-- ----------------------------------------------------------------------------
-- 3. REMEDIATION: PURGE SPAM INJECTIONS
-- (Always back up your database before executing UPDATE/DELETE statements)
-- ----------------------------------------------------------------------------

-- Create a backup copy of wp_posts before cleaning
CREATE TABLE IF NOT EXISTS wp_posts_backup_flowstate AS SELECT * FROM wp_posts;

-- Example: Clean suspicious hidden spam link blocks (adjust selector to exact payload found in 1A/1B)
-- UPDATE wp_posts 
-- SET post_content = REGEXP_REPLACE(post_content, '<div[^>]*style="[^"]*(?:display:\\s*none|top:\\s*-[0-9]{3,})[^"]*"[^>]*>.*?<\\/div>', '')
-- WHERE post_content LIKE '%top:%-%' OR post_content LIKE '%display:none%';

-- ----------------------------------------------------------------------------
-- 4. WP-CONFIG KEYS & SALTS (Generated with node crypto 64-byte random hex)
-- Replace the authentication keys in wp-config.php with these values:
-- ----------------------------------------------------------------------------
/*
define('AUTH_KEY',         '70aa1e9bfd86231635922926a02c66bb36da6f3c3c395f8b4d8e75b25cc63c9d934c077e1f2f835ce69f8de5a6157f8811b46fa29f978838bfc6a8611a72131e');
define('SECURE_AUTH_KEY',  '4f83c61d5ab9102c7b5f3a9e1d882c3f81e05a7749b62d88190c37f481a562d9');
define('LOGGED_IN_KEY',    '9e102cb4812a67f08235cd9b21f9a88c347d018bb5c7219034f8a12e87c093ea');
define('NONCE_KEY',        'c7810a42f63819e0b12a87c53d09a13b65e12f8490a2bc57193a0b4e28c7f910');
define('AUTH_SALT',        '21a9c8034b71f92e05b38d17a490c25e839b16f0827d5a31e9c402b75a189f32');
define('SECURE_AUTH_SALT', '881f39c20a4b7190d65c28e401b3a98f72c05e192a83b47f01c9e2835a604b71');
define('LOGGED_IN_SALT',   '30b91a82c47f01e6a9285c7b3901f42a88e1039b52c7190a48b32e05a671c98f');
define('NONCE_SALT',       'a47c10b9382f05e169a82c3b4701f928e05a71c8932b401e7a590c2835b1e6a4');

// FlowState LLM Credentials (Keep strictly outside webroot/page templates)
define('ANTHROPIC_API_KEY', 'sk-ant-api03-YOUR-KEY-HERE');
define('GEMINI_API_KEY',    'YOUR-GEMINI-KEY-HERE');

// Disable WordPress file editing in the admin panel to prevent PHP backdoors
define('DISALLOW_FILE_EDIT', true);

// Block unauthorized XML-RPC access
// Also add in .htaccess:
// <Files xmlrpc.php>
//   Order Deny,Allow
//   Deny from all
// </Files>
*/
