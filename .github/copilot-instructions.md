# Supernote Templates Development Guide

## Language Preferences
- **Communication**: Always respond in Traditional Chinese (繁體中文) when talking to the user
- **Template Content**: All content inside templates (HTML, labels, titles) must be in English
- **Code & Comments**: Code and technical comments can be in English

## Project Overview
HTML/CSS-based template generator for Supernote e-ink devices (Nomad A6 X2 and Manta A5 X2). Templates are designed once using CSS variables and automatically generated for both devices via Puppeteer.

## Architecture Principles

### Multi-Device CSS System
- **Shared styles in `:root`** (outside media queries): font sizes, safe areas, colors - identical across devices due to same 300 DPI
- **Device-specific variables**: only `--device-width` and `--device-height` differ per device
- **Media queries trigger viewport**: Puppeteer sets viewport size → CSS media query activates → correct dimensions applied

Example from `styles/devices.css`:
```css
:root {
    --font-size-lg: 44px;  /* Same physical size on both devices */
    --safe-area-bottom: 150px;  /* Toolbar safe zone */
    --device-width: 1404px;  /* Nomad default */
}

@media (min-width: 1920px) and (min-height: 2560px) {
    :root {
        --device-width: 1920px;  /* Manta override */
        --device-height: 2560px;
    }
}
```

### Generation Pipeline
1. HTML templates in `templates/` reference `../styles/devices.css`
2. `scripts/generate-all.js` auto-scans all `.html` files in templates directory
3. For each template × device combination, `convert-to-png.js` launches Puppeteer with device viewport
4. PNG output saved to `dist/{deviceId}/{template-name}.png`

**Device configs** (in `scripts/convert-to-png.js`):
```javascript
const deviceConfigs = {
    nomad: { width: 1404, height: 1872 },
    manta: { width: 1920, height: 2560 }
};
```

## Development Workflows

### Creating New Templates
1. Add `templates/new-template.html` with `<link rel="stylesheet" href="../styles/devices.css">`
2. Use CSS variables: `var(--device-width)`, `var(--font-size-lg)`, `var(--safe-area-bottom)`, etc.
3. Run `npm run generate` - automatically detects and generates for both devices
4. No manual registration needed; `generate-all.js` discovers files via `fs.readdirSync()`

### Testing Template Responsiveness
Open HTML in browser and resize to device dimensions:
- Nomad: 1404 × 1872
- Manta: 1920 × 2560

Media query should trigger and dimensions should adapt automatically.

### Adding New Devices
1. Add media query in `styles/devices.css` with device dimensions
2. Add config in `scripts/convert-to-png.js` deviceConfigs object
3. Templates automatically support new device without modification

### Key Commands
- `npm run generate` - Generate all templates for all devices (production)
- `npm run generate:nomad` - Quick test for Nomad only (development)
- `npm run generate:manta` - Quick test for Manta only (development)
- `node scripts/convert-to-png.js templates/file.html deviceId` - Single template/device

## Critical Design Constraints

### Safe Areas (from research docs)
- Top/Right/Left: 15px minimum (device bezel)
- Bottom/Left: 150px minimum (toolbar overlay)
- Apply via: `padding: var(--safe-area-top) var(--safe-area-right) var(--safe-area-bottom) var(--safe-area-left);`

### File Specifications
- Format: PNG only (Supernote requirement)
- Resolution: Exact device pixels (1404×1872 or 1920×2560)
- DPI: 300 (both devices - enables consistent physical sizing)
- File naming: No spaces or special characters

### Font Sizing Philosophy
Since both devices share 300 DPI, `--font-size-lg: 44px` renders at identical physical size on both screens. Avoid device-specific font overrides unless intentional for design reasons.

## Project-Specific Patterns

### Why HTML Over Alternatives
- Version control friendly (plain text diffs)
- Programmatic generation via Puppeteer
- CSS variables enable single-source multi-device templates
- Familiar tooling (browser dev tools for debugging)

### Output Directory Structure
```
dist/
├── nomad/
│   ├── daily-tasks.png
│   └── [other templates].png
└── manta/
    ├── daily-tasks.png
    └── [other templates].png
```
**Note**: `dist/` is gitignored; generated files are build artifacts

### Module Pattern
`convert-to-png.js` exports `{ convertHtmlToPng, deviceConfigs }` for reuse by `generate-all.js`. When modifying device configs, update both the object and the generation logic.

## Common Pitfalls
- **Don't hardcode dimensions** in template HTML - always use CSS variables
- **Don't duplicate shared styles** in media queries - only device-specific overrides belong there
- **Don't manually list templates** in `generate-all.js` - it auto-discovers from filesystem
- **Don't forget safe areas** - Supernote toolbar overlays bottom-left corner

## Documentation References
- `docs/research/2025-10-24-multi-device-support-architecture.md` - Full technical analysis, device specs, and architecture decisions
- `docs/specs/multi-device-support-architecture/implementation.md` - Implementation checklist and task breakdown
- `README.md` - User-facing documentation for template development workflow
