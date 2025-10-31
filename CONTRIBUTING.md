# Contributing Guide

Thank you for your interest in contributing to Supernote Templates! This guide will help you understand the project architecture and how to create or modify templates.

## Table of Contents

- [Why HTML?](#why-html)
- [Getting Started](#getting-started)
- [Project Architecture](#project-architecture)
- [Creating New Templates](#creating-new-templates)
- [Modifying Existing Templates](#modifying-existing-templates)
- [Advanced Topics](#advanced-topics)

---

## Why HTML?

This project uses HTML/CSS for template creation instead of traditional drawing software. Here's why:

### Advantages Over Drawing Software

- **Version Control Friendly** - Plain text format allows Git to clearly track every modification, making collaboration easier
- **Automated Generation** - Write once, automatically export to multiple device sizes via Puppeteer
- **Easy to Modify** - Adjust CSS variables to batch update all templates without manual editing
- **No Professional Tools Required** - Any text editor and browser is sufficient for development and preview
- **Programmatic** - Can generate dynamic content, iterate designs, or create template variants easily

### Technical Benefits

- **Responsive Design** - CSS Media Queries automatically adapt layouts for different screen sizes
- **Maintainable** - Centralized styling through CSS variables means one change updates everywhere
- **Testable** - Preview in browser before generating final PNG files
- **Extensible** - Adding new devices or templates requires minimal code changes

---

## Getting Started

### Prerequisites

- Node.js v14 or higher
- Basic knowledge of HTML/CSS
- A text editor (VS Code recommended)
- A modern browser for previewing

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd supernote-templates
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate templates to verify setup:
   ```bash
   npm run generate
   ```

If successful, you'll see PNG files in `dist/nomad/` and `dist/manta/`.

---

## Project Architecture

### Directory Structure

```
supernote-templates/
├── styles/
│   └── devices.css          # Shared device styles (CSS variables + Media Queries)
├── templates/
│   ├── daily-routine.html   # Template files (using variables from devices.css)
│   └── priority-todo.html
├── scripts/
│   ├── convert-to-png.js    # Single template conversion script
│   └── generate-all.js      # Batch generation script (auto-scans templates/)
├── dist/
│   ├── nomad/               # Generated Nomad PNG files (gitignored)
│   └── manta/               # Generated Manta PNG files (gitignored)
├── docs/
│   └── research/            # Technical research and architecture decisions
└── package.json
```

### How It Works

#### Multi-Device CSS System

The project uses **CSS Variables + Media Queries** to implement multi-device support:

**1. Shared Variables** (in `:root`, outside media queries)
- Font sizes: `--font-size-lg`, `--font-size-md`, `--font-size-sm`
- Safe areas: `--safe-area-top`, `--safe-area-right`, `--safe-area-bottom`, `--safe-area-left`
- Colors, spacing, and other design tokens
- **Why shared?** Both devices have 300 DPI, so physical size is identical

**2. Device-Specific Variables** (inside media queries)
- `--device-width` and `--device-height`
- Nomad: 1404×1872 (`:root` default)
- Manta: 1920×2560 (media query override)
- **Why separate?** Only screen dimensions differ between devices

**3. Media Query Trigger**
When Puppeteer sets the viewport to device resolution, the corresponding media query activates and applies the correct dimensions.

#### Generation Pipeline

```
1. templates/*.html (import devices.css)
         ↓
2. scripts/generate-all.js (auto-scan all .html files)
         ↓
3. For each template × device:
   - scripts/convert-to-png.js launches Puppeteer
   - Sets viewport to device dimensions
   - Media query activates → correct CSS variables applied
   - Takes screenshot
         ↓
4. dist/{deviceId}/{template-name}.png
```

#### Safe Area Design

**Purpose**: Avoid Supernote toolbar and device bezel overlapping content

- **Bottom/Left**: Toolbar is located in the bottom-left corner
- **Top/Right**: Device bezel

Current values are defined in [styles/devices.css](styles/devices.css). Always apply to containers:

```css
.container {
    padding: var(--safe-area-top) var(--safe-area-right)
             var(--safe-area-bottom) var(--safe-area-left);
}
```

---

## Creating New Templates

### Step-by-Step Guide

#### 1. Create HTML File

Create a new file in `templates/`, e.g., `templates/weekly-planner.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Planner</title>
    <link rel="stylesheet" href="../styles/devices.css">
    <style>
        /* Your custom styles here */
    </style>
</head>
<body>
    <!-- Your template content -->
</body>
</html>
```

#### 2. Import Shared Styles

Always include this in your `<head>`:
```html
<link rel="stylesheet" href="../styles/devices.css">
```

This imports all device-specific CSS variables.

#### 3. Use CSS Variables

Apply responsive variables in your styles:

```css
body {
    width: var(--device-width);
    height: var(--device-height);
    margin: 0;
    padding: 0;
}

.container {
    width: 100%;
    height: 100%;
    /* IMPORTANT: Apply safe areas to avoid toolbar */
    padding: var(--safe-area-top) var(--safe-area-right)
             var(--safe-area-bottom) var(--safe-area-left);
}

h1 {
    font-size: var(--font-size-lg);
}

p {
    font-size: var(--font-size-md);
}
```

#### 4. Preview in Browser

Open your HTML file in a browser and resize the window to test responsiveness:
- Nomad: 1404 × 1872
- Manta: 1920 × 2560

The layout should adapt automatically when you cross the media query breakpoint.

#### 5. Generate PNG Files

Run the generation command:

```bash
# Generate for all devices
npm run generate

# Or test single device first
npm run generate:nomad
npm run generate:manta
```

Your template will be automatically detected and generated as:
- `dist/nomad/weekly-planner.png`
- `dist/manta/weekly-planner.png`

### Available CSS Variables

#### Device Dimensions (auto-adjusted per device)
```css
var(--device-width)   /* 1404px (Nomad) or 1920px (Manta) */
var(--device-height)  /* 1872px (Nomad) or 2560px (Manta) */
```

#### Typography (shared across devices)
```css
var(--font-size-lg)   /* Large headings */
var(--font-size-md)   /* Regular text */
var(--font-size-sm)   /* Small text */
```

#### Safe Areas (shared across devices)
```css
var(--safe-area-top)
var(--safe-area-right)
var(--safe-area-bottom)  /* Bottom safe zone for toolbar */
var(--safe-area-left)    /* Left safe zone for toolbar */
```

See [styles/devices.css](styles/devices.css) for current values.

### Best Practices

**DO:**
- ✅ Always use CSS variables for dimensions and spacing
- ✅ Apply safe area padding to main containers
- ✅ Test in browser before generating PNG
- ✅ Keep template content in English for consistency
- ✅ Use semantic HTML structure

**DON'T:**
- ❌ Hardcode pixel dimensions in template HTML
- ❌ Forget safe areas (toolbar overlays bottom-left corner)
- ❌ Override font sizes in media queries (DPI is same for both devices)
- ❌ Use complex JavaScript (won't work in generated PNG)

---

## Modifying Existing Templates

### Adjusting Device Parameters

To modify font sizes, safe areas, or other shared settings, edit [styles/devices.css](styles/devices.css):

```css
/* Shared styles (all devices) */
:root {
    --font-size-lg: 44px;      /* Increase/decrease as needed */
    --font-size-md: 32px;
    --font-size-sm: 24px;
    --safe-area-top: 80px;
    --safe-area-right: 80px;
    --safe-area-bottom: 150px;  /* Adjust for toolbar clearance */
    --safe-area-left: 120px;    /* Adjust for toolbar clearance */
}
```

After modification, regenerate all templates:
```bash
npm run generate
```

### Making Template-Specific Changes

1. Open the template HTML file in `templates/`
2. Modify the HTML structure or CSS styles
3. Preview changes in browser
4. Regenerate: `npm run generate`

---

## Advanced Topics

### Adding New Device Support

If Supernote releases new devices, you can add support easily:

#### 1. Add Media Query in `styles/devices.css`

```css
/* New device: Supernote X (example) */
@media (min-width: 2048px) and (min-height: 2732px) {
    :root {
        --device-width: 2048px;
        --device-height: 2732px;
    }
}
```

#### 2. Add Device Config in `scripts/convert-to-png.js`

```javascript
const deviceConfigs = {
    nomad: { width: 1404, height: 1872 },
    manta: { width: 1920, height: 2560 },
    supernoteX: { width: 2048, height: 2732 }  // Add new device
};
```

#### 3. Update `scripts/generate-all.js`

Add the new device to the devices array:
```javascript
const devices = ['nomad', 'manta', 'supernoteX'];
```

#### 4. Regenerate

Run `npm run generate`. All existing templates will automatically support the new device!

### Quick Testing Commands

```bash
# Generate all templates for all devices
npm run generate

# Generate single device only (faster for testing)
npm run generate:nomad
npm run generate:manta

# Generate single template for single device (manual)
node scripts/convert-to-png.js templates/daily-routine.html nomad
```

### Understanding the Build Process

**Scripts overview:**

- `scripts/convert-to-png.js` - Core conversion logic
  - Launches headless Chrome via Puppeteer
  - Sets viewport to device dimensions
  - Loads HTML template
  - Waits for rendering
  - Takes screenshot
  - Saves as PNG

- `scripts/generate-all.js` - Batch processor
  - Scans `templates/` directory for `.html` files
  - Calls `convert-to-png.js` for each template × device combination
  - No manual registration needed

### Troubleshooting Development Issues

**Issue: Generated PNG has incorrect dimensions**
- Check Media Query breakpoints in `styles/devices.css`
- Ensure `deviceConfigs` in `convert-to-png.js` matches CSS
- Verify media query uses `min-width` and `min-height` correctly

**Issue: Template content is cut off or overlapped by toolbar**
- Increase `--safe-area-bottom` and `--safe-area-left` values
- Ensure main container has safe area padding applied
- Test on actual device to verify clearance

**Issue: Font size differs between devices**
- Font variables should only be defined in `:root` outside media queries
- Don't redefine font sizes inside device-specific media queries
- Both devices have 300 DPI, so physical size should be identical

**Issue: Template not auto-detected by generate-all.js**
- Ensure file has `.html` extension
- File must be directly in `templates/` directory (not subdirectories)
- Check for syntax errors in HTML that might cause script to skip it

### File Format Requirements

**For Supernote compatibility:**
- **Format**: PNG only
- **Resolution**: Exact device pixels (1404×1872 or 1920×2560)
- **DPI**: 300 (maintained automatically by Puppeteer)
- **Color mode**: Grayscale recommended for e-ink (but RGB works)
- **File naming**: Avoid spaces, use hyphens or underscores

---

## Related Documentation

- [CLAUDE.md](CLAUDE.md) - Project guide for AI assistants
- [.github/copilot-instructions.md](.github/copilot-instructions.md) - Detailed architecture decisions
- [docs/research/2025-10-24-multi-device-support-architecture.md](docs/research/2025-10-24-multi-device-support-architecture.md) - Complete technical analysis

---

## Submitting Your Contribution

### Before Submitting

1. ✅ Test your template on both devices (or at least in browser preview)
2. ✅ Verify safe areas are properly applied
3. ✅ Run `npm run generate` successfully
4. ✅ Check generated PNG files look correct
5. ✅ Follow the code style of existing templates

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-template-name`
3. Add your template to `templates/`
4. Generate PNGs: `npm run generate`
5. Commit your changes:
   ```bash
   git add templates/your-template.html
   git add dist/nomad/your-template.png
   git add dist/manta/your-template.png
   git commit -m "Add new template: Your Template Name"
   ```
6. Push to your fork: `git push origin feature/new-template-name`
7. Open a Pull Request with:
   - Clear description of the template
   - Screenshots of the generated PNGs
   - Any special usage notes

### Commit Guidelines

- Use clear, descriptive commit messages
- Include both HTML template and generated PNG files
- For modifications, explain what changed and why

---

## Questions?

- **Technical questions**: Open an issue with the `question` label
- **Bug reports**: Open an issue with the `bug` label
- **Feature requests**: Open an issue with the `enhancement` label

Thank you for contributing! 🎉
