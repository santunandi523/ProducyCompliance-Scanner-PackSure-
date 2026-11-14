import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('dist');
const destDir = path.resolve('backend/src/main/resources/static');

if (fs.existsSync(srcDir)) {
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.cpSync(srcDir, destDir, { recursive: true });
  console.log('Successfully bundled frontend dist into backend/src/main/resources/static for single-project deployment!');
} else {
  console.error('Source directory "dist" does not exist. Please run "npm run build" first.');
  process.exit(1);
}
