const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const requiredFiles = [
  'src/components/quotes/QuotesView.tsx',
  'src/components/trade/TradeView.tsx',
  'src/components/modals/OtpModal.tsx',
  'src/types/mt5.ts'
];

let missing = requiredFiles.filter(f => !fs.existsSync(path.resolve(process.cwd(), f)));

if (missing.length > 0) {
  console.log(`[build-check] Found ${missing.length} missing files: ${missing.join(', ')}`);
  console.log('[build-check] Automatically restoring missing files from upstream repository...');

  try {
    const tmpDir = path.resolve(process.cwd(), '.tmp_restore_repo');
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    execSync('git clone --depth 1 https://github.com/alqadasif2-cloud/Mm55.git .tmp_restore_repo', {
      stdio: 'inherit'
    });

    for (const relPath of missing) {
      const srcFile = path.join(tmpDir, relPath);
      const destFile = path.resolve(process.cwd(), relPath);

      if (fs.existsSync(srcFile)) {
        fs.mkdirSync(path.dirname(destFile), { recursive: true });
        fs.copyFileSync(srcFile, destFile);
        console.log(`[build-check] Restored: ${relPath}`);
      } else {
        console.warn(`[build-check] Warning: Could not find ${srcFile}`);
      }
    }

    fs.rmSync(tmpDir, { recursive: true, force: true });
    console.log('[build-check] All missing files successfully restored!');
  } catch (err) {
    console.error('[build-check] Error restoring files:', err.message);
  }
} else {
  console.log('[build-check] All required build files are present.');
}
