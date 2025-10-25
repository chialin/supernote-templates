# Supernote Templates

Multi-device Supernote template generator that supports both Nomad (A6 X2) and Manta (A5 X2) devices. Templates are designed using HTML/CSS and converted to PNG format using Puppeteer.

## Features

- **Multi-device support**: Automatically generates templates for Nomad (1404×1872) and Manta (1920×2560)
- **Shared style system**: CSS Media Query-based approach for consistent styling across devices
- **Automatic scanning**: Batch generation automatically detects all templates in the `templates/` directory
- **Easy to extend**: Add new devices or templates with minimal configuration

## Project Structure

```
supernote-templates/
├── styles/
│   └── devices.css          # Shared device-specific styles (CSS variables + Media Queries)
├── templates/
│   └── daily-tasks.html     # Template files (use CSS variables from devices.css)
├── scripts/
│   ├── convert-to-png.js    # Single template conversion script
│   └── generate-all.js      # Batch generation script (auto-scans templates/)
├── dist/
│   ├── nomad/               # Generated PNG files for Nomad device
│   └── manta/               # Generated PNG files for Manta device
├── package.json
└── README.md
```

## Installation

1. Ensure Node.js is installed (v14 or higher)
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Generate all templates for all devices

```bash
npm run generate
```

This command automatically:
- Scans all `.html` files in the `templates/` directory
- Generates PNG files for both Nomad and Manta devices
- Outputs files to `dist/nomad/` and `dist/manta/` directories

### Generate single template for specific device

For Nomad:
```bash
npm run generate:nomad
```

For Manta:
```bash
npm run generate:manta
```

Or use the script directly:
```bash
node scripts/convert-to-png.js templates/daily-tasks.html nomad
node scripts/convert-to-png.js templates/daily-tasks.html manta
```

## Developing New Templates

1. **Create HTML file**: Add a new `.html` file in the `templates/` directory
2. **Import shared styles**: Include the device styles in your HTML:
   ```html
   <link rel="stylesheet" href="../styles/devices.css">
   ```
3. **Use CSS variables**: Apply device-responsive variables in your styles:
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
4. **Generate**: Run `npm run generate` to automatically create PNG files for all devices

### Available CSS Variables

**Device dimensions** (automatically adjusted per device):
- `--device-width`: Canvas width
- `--device-height`: Canvas height

**Shared variables** (same across all devices due to identical DPI):
- `--font-size-lg`: Large text
- `--font-size-md`: Medium text
- `--font-size-sm`: Small text
- `--safe-area-top`: Top margin
- `--safe-area-right`: Right margin
- `--safe-area-bottom`: Bottom margin (for toolbar safe area)
- `--safe-area-left`: Left margin (for toolbar safe area)

See [styles/devices.css](styles/devices.css) for current values.

## Adjusting Device Parameters

Edit [styles/devices.css](styles/devices.css) to modify device-specific settings:

```css
/* Shared styles for all devices */
:root {
    --font-size-lg: 44px;    /* Adjust font sizes */
    --safe-area-bottom: 150px; /* Adjust safe areas */
    /* See styles/devices.css for all available variables */
}

/* Nomad default dimensions */
:root {
    --device-width: 1404px;
    --device-height: 1872px;
}

/* Manta dimensions */
@media (min-width: 1920px) and (min-height: 2560px) {
    :root {
        --device-width: 1920px;
        --device-height: 2560px;
    }
}
```

After modifying `devices.css`, regenerate all templates with `npm run generate`.

## Adding New Devices

1. **Add CSS Media Query** in [styles/devices.css](styles/devices.css):
   ```css
   @media (min-width: 2048px) and (min-height: 2732px) {
       :root {
           --device-width: 2048px;
           --device-height: 2732px;
       }
   }
   ```

2. **Add device config** in [scripts/convert-to-png.js](scripts/convert-to-png.js):
   ```javascript
   const deviceConfigs = {
       nomad: { width: 1404, height: 1872 },
       manta: { width: 1920, height: 2560 },
       newDevice: { width: 2048, height: 2732 }  // Add this
   };
   ```

3. **Regenerate**: Run `npm run generate` to create templates for all devices including the new one

## Device Specifications

### Nomad (A6 X2)
- Screen size: 7.8 inches
- Resolution: 1404 × 1872 pixels
- DPI: 300

### Manta (A5 X2)
- Screen size: 10.7 inches
- Resolution: 1920 × 2560 pixels
- DPI: 300

**Note**: Safe area margins are defined in [styles/devices.css](styles/devices.css) to accommodate the toolbar position.

## Notes

- **DPI Consistency**: Both devices have 300 DPI, so font sizes and safe areas remain the same in pixels to maintain identical physical dimensions
- **Auto-scanning**: The `generate-all.js` script automatically discovers all `.html` files in `templates/`, no need to manually maintain a template list
- **Browser preview**: Open any template HTML in a browser and resize the window to 1404×1872 (Nomad) or 1920×2560 (Manta) to preview device-specific layouts

## Output Files

Generated PNG files are organized by device:
- `dist/nomad/daily-tasks.png` (1404×1872 px)
- `dist/manta/daily-tasks.png` (1920×2560 px)

The `dist/` directory is ignored by git (see [.gitignore](.gitignore)).
