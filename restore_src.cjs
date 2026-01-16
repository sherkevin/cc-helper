const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir);
}

function copyFiles(source, target) {
  const files = fs.readdirSync(source);
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath);
      }
      copyFiles(sourcePath, targetPath);
    } else {
      if (file.endsWith('.js')) {
        const tsPath = targetPath.replace('.js', '.ts');
        const content = fs.readFileSync(sourcePath, 'utf-8');
        fs.writeFileSync(tsPath, content);
        console.log(`Restored ${tsPath}`);
      } else if (file.endsWith('.json')) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied ${targetPath}`);
      }
    }
  });
}

copyFiles(distDir, srcDir);
