const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.resolve(__dirname, '../apps/web/public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Base App Icon SVG (512x512)
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background squircle -->
  <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#bgGrad)" />

  <!-- Document Sheet -->
  <g filter="url(#shadow)">
    <!-- Main page -->
    <rect x="120" y="100" width="272" height="320" rx="16" fill="#ffffff" />
    
    <!-- Top accent bar -->
    <rect x="144" y="128" width="130" height="18" rx="6" fill="#1e293b" />
    <rect x="144" y="154" width="90" height="10" rx="5" fill="#64748b" />
    
    <!-- Divider -->
    <line x1="144" y1="180" x2="368" y2="180" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" />
    
    <!-- Content lines -->
    <rect x="144" y="202" width="224" height="10" rx="5" fill="#94a3b8" />
    <rect x="144" y="224" width="190" height="10" rx="5" fill="#cbd5e1" />
    <rect x="144" y="246" width="210" height="10" rx="5" fill="#cbd5e1" />

    <rect x="144" y="280" width="120" height="14" rx="5" fill="#2563eb" />
    <rect x="144" y="306" width="224" height="10" rx="5" fill="#94a3b8" />
    <rect x="144" y="328" width="180" height="10" rx="5" fill="#cbd5e1" />
    <rect x="144" y="350" width="200" height="10" rx="5" fill="#cbd5e1" />
    <rect x="144" y="372" width="150" height="10" rx="5" fill="#cbd5e1" />
    
    <!-- ATS Verified Badge -->
    <circle cx="340" cy="142" r="22" fill="#10b981" />
    <path d="M330 142 L337 149 L351 135" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- AI Intelligence Star Sparkle -->
  <g transform="translate(350, 70)">
    <path d="M30 0 Q30 30 60 30 Q30 30 30 60 Q30 30 0 30 Q30 30 30 0 Z" fill="url(#sparkleGrad)" filter="url(#shadow)" />
    <circle cx="30" cy="30" r="6" fill="#ffffff" />
  </g>
  <g transform="translate(90, 360) scale(0.6)">
    <path d="M20 0 Q20 20 40 20 Q20 20 20 40 Q20 20 0 20 Q20 20 20 0 Z" fill="#60a5fa" opacity="0.85" />
  </g>
</svg>
`;

// 2. Maskable Icon SVG (with 15% inner safe zone padding)
const maskableIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="sparkleGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
  </defs>

  <!-- Full bleed background for maskable target -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />

  <!-- Centered safe scaled elements -->
  <g transform="translate(40, 35) scale(0.85)">
    <!-- Main page -->
    <rect x="120" y="100" width="272" height="320" rx="16" fill="#ffffff" />
    
    <rect x="144" y="128" width="130" height="18" rx="6" fill="#1e293b" />
    <rect x="144" y="154" width="90" height="10" rx="5" fill="#64748b" />
    
    <line x1="144" y1="180" x2="368" y2="180" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" />
    
    <rect x="144" y="202" width="224" height="10" rx="5" fill="#94a3b8" />
    <rect x="144" y="224" width="190" height="10" rx="5" fill="#cbd5e1" />
    <rect x="144" y="246" width="210" height="10" rx="5" fill="#cbd5e1" />

    <rect x="144" y="280" width="120" height="14" rx="5" fill="#2563eb" />
    <rect x="144" y="306" width="224" height="10" rx="5" fill="#94a3b8" />
    <rect x="144" y="328" width="180" height="10" rx="5" fill="#cbd5e1" />
    <rect x="144" y="350" width="200" height="10" rx="5" fill="#cbd5e1" />
    <rect x="144" y="372" width="150" height="10" rx="5" fill="#cbd5e1" />
    
    <circle cx="340" cy="142" r="22" fill="#10b981" />
    <path d="M330 142 L337 149 L351 135" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />

    <g transform="translate(350, 70)">
      <path d="M30 0 Q30 30 60 30 Q30 30 30 60 Q30 30 0 30 Q30 30 30 0 Z" fill="url(#sparkleGradMask)" />
      <circle cx="30" cy="30" r="6" fill="#ffffff" />
    </g>
  </g>
</svg>
`;

// 3. Open Graph & Twitter Social Card SVG (1200x630)
const ogImageSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1329" />
      <stop offset="60%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#60a5fa" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
    <radialGradient id="glow" cx="20%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#2563eb" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#2563eb" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1" stroke-opacity="0.3" />
    </pattern>
  </defs>

  <!-- Background base -->
  <rect width="1200" height="630" fill="url(#ogBg)" />
  <rect width="1200" height="630" fill="url(#grid)" />
  <rect width="1200" height="630" fill="url(#glow)" />

  <!-- Top Badge -->
  <g transform="translate(100, 75)">
    <rect width="270" height="38" rx="19" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" />
    <circle cx="20" cy="19" r="6" fill="#10b981" />
    <text x="36" y="24" fill="#93c5fd" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="600" letter-spacing="1">ATS COMPLIANT STUDIO</text>
  </g>

  <!-- Headline -->
  <text x="100" y="180" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="52" font-weight="800" letter-spacing="-1">
    ATS Resume Intelligence Studio
  </text>
  
  <text x="100" y="235" fill="url(#brandGrad)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="34" font-weight="700">
    AI-Powered Optimization • 15 ATS Templates • Live A4 Balancing
  </text>

  <!-- Description paragraph -->
  <text x="100" y="295" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="400">
    Import, analyze, and craft recruiter-ready resumes backed by Google Gemini AI,
  </text>
  <text x="100" y="328" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="400">
    truthful career-gap assistance, and native Word (.docx) &amp; PDF exports.
  </text>

  <!-- Feature Tags / Pills -->
  <g transform="translate(100, 380)">
    <!-- Pill 1 -->
    <rect x="0" y="0" width="190" height="42" rx="10" fill="#1e293b" stroke="#475569" stroke-width="1" />
    <text x="24" y="26" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="600">Google Gemini AI</text>

    <!-- Pill 2 -->
    <rect x="206" y="0" width="180" height="42" rx="10" fill="#1e293b" stroke="#475569" stroke-width="1" />
    <text x="228" y="26" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="600">15 ATS Templates</text>

    <!-- Pill 3 -->
    <rect x="402" y="0" width="180" height="42" rx="10" fill="#1e293b" stroke="#475569" stroke-width="1" />
    <text x="424" y="26" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="600">DOCX &amp; PDF Export</text>

    <!-- Pill 4 -->
    <rect x="598" y="0" width="180" height="42" rx="10" fill="#1e293b" stroke="#475569" stroke-width="1" />
    <text x="620" y="26" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="600">Offline PWA Ready</text>
  </g>

  <!-- Bottom Bar Info -->
  <g transform="translate(100, 520)">
    <line x1="0" y1="0" x2="1000" y2="0" stroke="#334155" stroke-width="1.5" />
    <text x="0" y="45" fill="#64748b" font-family="sans-serif" font-size="16" font-weight="500">
      Verified Candidate Management • Anti-Hallucination Guardrails • Universal PC &amp; Mobile Responsive
    </text>
  </g>

  <!-- Right Hero Visual Emblem -->
  <g transform="translate(860, 110)">
    <!-- Outer Glow Circle -->
    <circle cx="130" cy="150" r="140" fill="#1d4ed8" opacity="0.25" filter="url(#glow)"/>
    
    <!-- Mini Document Card Illustration -->
    <rect x="30" y="40" width="200" height="260" rx="14" fill="#ffffff" filter="url(#shadow)"/>
    
    <rect x="50" y="65" width="90" height="14" rx="4" fill="#0f172a" />
    <rect x="50" y="85" width="60" height="8" rx="4" fill="#64748b" />
    <line x1="50" y1="105" x2="210" y2="105" stroke="#e2e8f0" stroke-width="2" />
    
    <rect x="50" y="120" width="160" height="7" rx="3" fill="#94a3b8" />
    <rect x="50" y="135" width="140" height="7" rx="3" fill="#cbd5e1" />
    <rect x="50" y="150" width="150" height="7" rx="3" fill="#cbd5e1" />

    <rect x="50" y="175" width="75" height="10" rx="3" fill="#2563eb" />
    <rect x="50" y="195" width="160" height="7" rx="3" fill="#94a3b8" />
    <rect x="50" y="210" width="130" height="7" rx="3" fill="#cbd5e1" />
    <rect x="50" y="225" width="145" height="7" rx="3" fill="#cbd5e1" />
    
    <!-- Verified Badge -->
    <circle cx="190" cy="75" r="16" fill="#10b981" />
    <path d="M183 75 L188 80 L198 70" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />

    <!-- AI Sparkle on card -->
    <g transform="translate(195, 20)">
      <path d="M18 0 Q18 18 36 18 Q18 18 18 36 Q18 18 0 18 Q18 18 18 0 Z" fill="#38bdf8"/>
    </g>
  </g>
</svg>
`;

async function generateAllAssets() {
  console.log('Generating website icons and Open Graph metadata assets...');

  // 1. Save icon.svg
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg.trim());
  console.log('✓ Created icon.svg');

  // 2. Generate icon-512.png
  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ Created icon-512.png');

  // 3. Generate icon-192.png
  await sharp(Buffer.from(iconSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✓ Created icon-192.png');

  // 4. Generate apple-touch-icon.png (180x180)
  await sharp(Buffer.from(iconSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Created apple-touch-icon.png');

  // 5. Generate favicon-32x32.png and favicon-16x16.png
  await sharp(Buffer.from(iconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✓ Created favicon-32x32.png');

  await sharp(Buffer.from(iconSvg))
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('✓ Created favicon-16x16.png');

  // 6. Generate favicon.ico (using 48x48 PNG container supported by all modern browsers)
  await sharp(Buffer.from(iconSvg))
    .resize(48, 48)
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ Created favicon.ico');

  // 7. Generate maskable icons for Android PWA
  await sharp(Buffer.from(maskableIconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));
  console.log('✓ Created icon-maskable-512.png');

  await sharp(Buffer.from(maskableIconSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-192.png'));
  console.log('✓ Created icon-maskable-192.png');

  // 8. Generate Open Graph social image (og-image.png - 1200x630)
  await sharp(Buffer.from(ogImageSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('✓ Created og-image.png (1200x630)');

  // 9. Generate Twitter summary large image (twitter-image.png - 1200x630)
  await sharp(Buffer.from(ogImageSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'twitter-image.png'));
  console.log('✓ Created twitter-image.png (1200x630)');

  console.log('All branding and Open Graph assets generated successfully!');
}

generateAllAssets().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
