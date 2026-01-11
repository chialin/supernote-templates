/**
 * Cross-platform script to copy generator output to web public directory
 * Copies dist/ contents from @supernote-templates/generator to public/templates/
 *
 * In npm workspaces, packages are symlinked rather than copied to node_modules.
 * This script resolves the actual location of the generator package.
 */

const fs = require('fs');
const path = require('path');

/**
 * Find the generator's dist directory
 * First tries node_modules (for published packages), then falls back to workspace sibling
 */
function findGeneratorDist() {
    // Try node_modules path first (handles both symlink and actual install)
    const nodeModulesPath = path.join(__dirname, '..', 'node_modules', '@supernote-templates', 'generator', 'dist');
    if (fs.existsSync(nodeModulesPath)) {
        return nodeModulesPath;
    }

    // Fallback: direct sibling package in monorepo
    const siblingPath = path.join(__dirname, '..', '..', 'generator', 'dist');
    if (fs.existsSync(siblingPath)) {
        return siblingPath;
    }

    return null;
}

// Source: generator's dist directory
const sourceDir = findGeneratorDist();
// Destination: web's public/templates directory
const destDir = path.join(__dirname, '..', 'public', 'templates');

/**
 * Recursively copy a directory
 * @param {string} src - Source directory path
 * @param {string} dest - Destination directory path
 */
function copyDir(src, dest) {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Main execution
console.log('Copying templates from generator to web...');

if (!sourceDir) {
    console.error('Error: Could not find generator dist directory.');
    console.error('Checked locations:');
    console.error('  - node_modules/@supernote-templates/generator/dist');
    console.error('  - ../generator/dist (sibling package)');
    console.error('Make sure @supernote-templates/generator is built before running this script.');
    process.exit(1);
}

console.log(`  Source: ${sourceDir}`);
console.log(`  Destination: ${destDir}`);

// Clean destination directory if it exists
if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
    console.log('  Cleaned existing destination directory');
}

// Copy files
copyDir(sourceDir, destDir);

// Verify copy was successful
const expectedFiles = ['templates.json', 'nomad', 'manta'];
const missingFiles = expectedFiles.filter(file => !fs.existsSync(path.join(destDir, file)));

if (missingFiles.length > 0) {
    console.error(`Error: Missing expected files/directories: ${missingFiles.join(', ')}`);
    process.exit(1);
}

console.log('Templates copied successfully!');
