# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Requirements

**CRITICAL**: Always communicate with the user in **Traditional Chinese (繁體中文)**. However, all template content (HTML labels, titles, section headers) must remain in English for consistency.

## Project Overview

Turborepo monorepo for Supernote e-ink device templates. Contains two packages:

1. **@supernote-templates/generator**: HTML/CSS-based template generator that converts templates to PNG files via Puppeteer
2. **@supernote-templates/web**: Next.js static website for template preview and download

**Supported devices:**
- Nomad (A6 X2): 1404×1872 px
- Manta (A5 X2): 1920×2560 px

Both devices share 300 DPI, enabling consistent physical sizing across devices.

## Core Commands

```bash
# Build all packages (from root)
npm run build

# Development mode for all packages
npm run dev

# Build generator only
cd packages/generator && npm run build

# Build web only
cd packages/web && npm run build

# Manual single conversion (from generator directory)
cd packages/generator
node scripts/convert-to-png.js templates/file.html nomad
```

## Architecture

### Multi-Device CSS System

The project uses a **CSS variable + media query** approach for multi-device support:

1. **Shared variables** (in `:root`, outside media queries) - identical across devices:
   - Font sizes: `--font-size-lg`, `--font-size-md`, `--font-size-sm`
   - Safe areas: `--safe-area-top`, `--safe-area-right`, `--safe-area-bottom`, `--safe-area-left`
   - Same physical size on both devices due to identical 300 DPI
   - See [packages/generator/styles/devices.css](packages/generator/styles/devices.css) for current values

2. **Device-specific variables** (in media queries) - only dimensions differ:
   - `--device-width` and `--device-height`
   - Nomad: 1404×1872 (default in `:root`)
   - Manta: 1920×2560 (overridden in `@media` query)

3. **Media query triggers**: When Puppeteer sets viewport to device dimensions, the matching media query activates and applies correct `--device-width/height`.

**Key file**: [packages/generator/styles/devices.css](packages/generator/styles/devices.css) - all device configs centralized here

### Generation Pipeline

1. Templates in `packages/generator/templates/*.html` import `<link rel="stylesheet" href="../styles/devices.css">`
2. `packages/generator/scripts/generate-all.js` auto-scans all `.html` files (no manual registration)
3. For each template × device:
   - `packages/generator/scripts/convert-to-png.js` launches Puppeteer with device viewport
   - Media query activates → correct CSS variables applied
   - Screenshot saved to `packages/generator/dist/{deviceId}/{template-name}.png`
4. After all PNGs are generated, `generate-all.js` extracts metadata from HTML files and outputs `dist/templates.json`

### Web Integration

The web package integrates with generator output via npm workspace dependency:

1. `packages/web/package.json` declares `@supernote-templates/generator` as a devDependency
2. `packages/web/scripts/copy-templates.js` runs as a prebuild script
3. The script copies `generator/dist/*` to `web/public/templates/`
4. Web pages read `templates.json` to display template listings

### Critical Design Constraints

**Safe areas** (for Supernote toolbar overlay):
- Bottom/Left: Account for toolbar in bottom-left corner
- Top/Right: Account for device bezel

Current values are defined in [packages/generator/styles/devices.css](packages/generator/styles/devices.css).

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

1. Create `packages/generator/templates/new-template.html`
2. Import shared styles:
   ```html
   <link rel="stylesheet" href="../styles/devices.css">
   ```
3. **Add required template metadata** (all 6 meta tags are required):
   ```html
   <!-- Template Metadata -->
   <meta name="template:name:en" content="Template Name">
   <meta name="template:name:zh-TW" content="模板名稱">
   <meta name="template:name:ja" content="テンプレート名">
   <meta name="template:description:en" content="Description of the template...">
   <meta name="template:description:zh-TW" content="模板描述...">
   <meta name="template:description:ja" content="テンプレートの説明...">
   ```
4. Use CSS variables for responsive design:
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
5. Run `npm run build` from root - automatically detects new templates

**No manual registration needed** - `generate-all.js` uses `fs.readdirSync()` to discover templates.

**Build will fail** if any required meta tags are missing - this ensures all templates have complete i18n support.

## Common Patterns

### Testing Responsiveness
Open template HTML in browser and resize window to device dimensions:
- Nomad: 1404×1872
- Manta: 1920×2560

Media query should trigger automatically and dimensions should adapt.

### Adding New Devices

1. Add media query in `packages/generator/styles/devices.css`:
   ```css
   @media (min-width: 2048px) and (min-height: 2732px) {
       :root {
           --device-width: 2048px;
           --device-height: 2732px;
       }
   }
   ```

2. Add config in `packages/generator/scripts/convert-to-png.js`:
   ```javascript
   const deviceConfigs = {
       nomad: { width: 1404, height: 1872 },
       manta: { width: 1920, height: 2560 },
       newDevice: { width: 2048, height: 2732 }
   };
   ```

3. Existing templates automatically support new device

### Module Exports
`packages/generator/scripts/convert-to-png.js` exports `{ convertHtmlToPng, deviceConfigs }` for reuse by `generate-all.js`. When modifying device configs, update the object definition.

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
packages/
├── generator/                    # @supernote-templates/generator
│   ├── templates/                Template HTML files (auto-scanned)
│   ├── styles/devices.css        Shared CSS variables + device media queries
│   ├── scripts/
│   │   ├── convert-to-png.js     Single template converter (exports module)
│   │   └── generate-all.js       Batch generator + metadata extractor
│   ├── dist/                     Generated output (gitignored)
│   │   ├── nomad/                PNG files for Nomad device
│   │   ├── manta/                PNG files for Manta device
│   │   └── templates.json        Template metadata for web
│   └── package.json
└── web/                          # @supernote-templates/web
    ├── app/[locale]/             Localized pages (en, zh-TW, ja)
    │   ├── page.tsx              Template list homepage
    │   └── templates/[id]/       Template detail pages
    ├── components/               React components
    │   ├── ui/                   shadcn/ui components
    │   ├── LanguageSwitcher.tsx  Language dropdown
    │   └── TemplateCard.tsx      Template card component
    ├── lib/templates.ts          Template data access layer
    ├── i18n/                     next-intl configuration
    ├── messages/                 Translation JSON files
    ├── scripts/copy-templates.js Prebuild script for generator integration
    ├── public/templates/         Copied from generator (gitignored)
    ├── out/                      Static export output (gitignored)
    └── package.json
turbo.json                        Turborepo configuration
package.json                      Root workspace configuration
```

## Web Package i18n

The web package uses **next-intl** for internationalization with static export:

- **Supported languages**: English (`en`), Traditional Chinese (`zh-TW`), Japanese (`ja`)
- **URL structure**: All languages use path prefix (`/en`, `/zh-TW`, `/ja`), root `/` redirects to `/en`
- **Key files**:
  - `i18n/routing.ts` - Language routing configuration
  - `i18n/request.ts` - Request configuration for static rendering
  - `messages/*.json` - Translation files

**Adding translations**: Edit `messages/{locale}.json` files. All locales must have the same key structure.

## Web Package UI Components

The web package uses **shadcn/ui** for UI components:

- **Component location**: `components/ui/` directory
- **Configuration**: `components.json` in web package root
- **Adding components**: Run `npx shadcn@latest add <component-name>` from `packages/web/`

Currently installed components: `button`, `card`, `dropdown-menu`

## Additional Context

See [README.md](README.md) for user-facing documentation.
