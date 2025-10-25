# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Requirements

**CRITICAL**: Always communicate with the user in **Traditional Chinese (繁體中文)**. However, all template content (HTML labels, titles, section headers) must remain in English for consistency.

## Project Overview

HTML/CSS-based template generator for Supernote e-ink devices. Templates are written once using CSS variables and automatically converted to PNG files for multiple device sizes via Puppeteer.

**Supported devices:**
- Nomad (A6 X2): 1404×1872 px
- Manta (A5 X2): 1920×2560 px

Both devices share 300 DPI, enabling consistent physical sizing across devices.

## Core Commands

```bash
# Generate all templates for all devices (primary command)
npm run generate

# Quick test for single device (development)
npm run generate:nomad
npm run generate:manta

# Manual single conversion (rarely needed)
node scripts/convert-to-png.js templates/file.html nomad
```

## Architecture

### Multi-Device CSS System

The project uses a **CSS variable + media query** approach for multi-device support:

1. **Shared variables** (in `:root`, outside media queries) - identical across devices:
   - Font sizes: `--font-size-lg`, `--font-size-md`, `--font-size-sm`
   - Safe areas: `--safe-area-top`, `--safe-area-right`, `--safe-area-bottom`, `--safe-area-left`
   - Same physical size on both devices due to identical 300 DPI
   - See [styles/devices.css](styles/devices.css) for current values

2. **Device-specific variables** (in media queries) - only dimensions differ:
   - `--device-width` and `--device-height`
   - Nomad: 1404×1872 (default in `:root`)
   - Manta: 1920×2560 (overridden in `@media` query)

3. **Media query triggers**: When Puppeteer sets viewport to device dimensions, the matching media query activates and applies correct `--device-width/height`.

**Key file**: [styles/devices.css](styles/devices.css) - all device configs centralized here

### Generation Pipeline

1. Templates in `templates/*.html` import `<link rel="stylesheet" href="../styles/devices.css">`
2. `scripts/generate-all.js` auto-scans all `.html` files (no manual registration)
3. For each template × device:
   - `scripts/convert-to-png.js` launches Puppeteer with device viewport
   - Media query activates → correct CSS variables applied
   - Screenshot saved to `dist/{deviceId}/{template-name}.png`

### Critical Design Constraints

**Safe areas** (for Supernote toolbar overlay):
- Bottom/Left: Account for toolbar in bottom-left corner
- Top/Right: Account for device bezel

Current values are defined in [styles/devices.css](styles/devices.css).

Always apply to container:
```css
padding: var(--safe-area-top) var(--safe-area-right)
         var(--safe-area-bottom) var(--safe-area-left);
```

**File requirements**:
- Format: PNG only
- Resolution: Exact device pixels (no scaling)
- Naming: No spaces or special characters in filenames

## Creating New Templates

1. Create `templates/new-template.html`
2. Import shared styles:
   ```html
   <link rel="stylesheet" href="../styles/devices.css">
   ```
3. Use CSS variables for responsive design:
   ```css
   body {
       width: var(--device-width);
       height: var(--device-height);
   }
   .container {
       padding: var(--safe-area-top) var(--safe-area-right)
                var(--safe-area-bottom) var(--safe-area-left);
   }
   h1 {
       font-size: var(--font-size-lg);
   }
   ```
4. Run `npm run generate` - automatically detects new templates

**No manual registration needed** - `generate-all.js` uses `fs.readdirSync()` to discover templates.

## Common Patterns

### Testing Responsiveness
Open template HTML in browser and resize window to device dimensions:
- Nomad: 1404×1872
- Manta: 1920×2560

Media query should trigger automatically and dimensions should adapt.

### Adding New Devices

1. Add media query in `styles/devices.css`:
   ```css
   @media (min-width: 2048px) and (min-height: 2732px) {
       :root {
           --device-width: 2048px;
           --device-height: 2732px;
       }
   }
   ```

2. Add config in `scripts/convert-to-png.js`:
   ```javascript
   const deviceConfigs = {
       nomad: { width: 1404, height: 1872 },
       manta: { width: 1920, height: 2560 },
       newDevice: { width: 2048, height: 2732 }
   };
   ```

3. Existing templates automatically support new device

### Module Exports
`scripts/convert-to-png.js` exports `{ convertHtmlToPng, deviceConfigs }` for reuse by `generate-all.js`. When modifying device configs, update the object definition.

## Important Rules

**DO:**
- Always use CSS variables for dimensions and spacing
- Apply safe area padding to main containers
- Keep template content in English (labels, headers, titles)
- Communicate with user in Traditional Chinese
- Let `generate-all.js` auto-discover templates

**DON'T:**
- Hardcode pixel dimensions in template HTML
- Duplicate shared styles in media queries (only device-specific overrides belong there)
- Manually maintain template lists in scripts
- Forget safe areas (toolbar overlays bottom-left corner)
- Use device-specific font size overrides (both devices have same DPI)

## File Structure

```
templates/          Template HTML files (auto-scanned)
styles/devices.css  Shared CSS variables + device media queries
scripts/
  convert-to-png.js Single template converter (exports module)
  generate-all.js   Batch generator (auto-discovers templates)
dist/
  nomad/           Generated PNGs for Nomad (gitignored)
  manta/           Generated PNGs for Manta (gitignored)
```

## Additional Context

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed architecture decisions and [README.md](README.md) for user-facing documentation.
