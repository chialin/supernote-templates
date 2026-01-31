# Supernote Templates

Ready-to-use note templates for Supernote e-ink devices. Download PNG files and import them directly to your Nomad (A6 X2) or Manta (A5 X2) device.

## Available Templates

**🌐 Browse and download templates:**
- [chialin.github.io/supernote-templates](https://chialin.github.io/supernote-templates/)
- [supernote.yurenju.info](https://supernote.yurenju.info)

Or download directly from this repository:
- [**Nomad (A6 X2) Templates**](packages/generator/dist/nomad/) - 1404×1872 px
- [**Manta (A5 X2) Templates**](packages/generator/dist/manta/) - 1920×2560 px

## How to Use

### 1. Download Templates

1. Choose your device folder above (Nomad or Manta)
2. Browse available templates
3. Download the PNG files you want to use

### 2. Import to Supernote

1. Connect your Supernote to your computer
2. Open Supernote storage
3. Copy the downloaded PNG files to the `MyStyles/` folder
4. Disconnect your device
5. On your Supernote, select the new template to start using it

That's it! No installation or technical setup required.

## Supported Devices

| Device | Screen Size | Resolution | DPI |
|--------|-------------|------------|-----|
| **Nomad (A6 X2)** | 7.8 inches | 1404 × 1872 px | 300 |
| **Manta (A5 X2)** | 10.7 inches | 1920 × 2560 px | 300 |

## Current Templates

- **Daily Routine** - Monthly habit tracker with task grid and notes section
- **Priority Todo** - Priority-based todo list with section headers
- **Lined Notebook** - Simple lined notebook for note-taking
- **Ruby Lined Notebook** - Lined notebook with ruby annotation space
- **Morning Planning** - Daily planning template with schedule, priorities and goals
- **6-Minute Journal (Morning)** - Morning journaling with gratitude and daily intentions
- **6-Minute Journal (Evening)** - Evening reflection with accomplishments and lessons learned

More templates coming soon!

## Project Structure

This is a Turborepo monorepo with the following packages:

```
packages/
├── generator/    # PNG template generator (HTML → PNG via Puppeteer)
└── web/          # Next.js static website for template preview and download
```

### Web Package Features

- Browse all templates with preview images
- Download templates for Nomad or Manta devices
- Multi-language support (English, 繁體中文, 日本語)
- Responsive design for desktop, tablet, and mobile

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Build All Packages

```bash
npm run build
```

This runs builds for all packages:
1. `@supernote-templates/generator`: Generates PNG files and `templates.json` to `packages/generator/dist/`
2. `@supernote-templates/web`: Copies generator output to `public/templates/`, then builds static site to `packages/web/out/`

### Development Mode

```bash
npm run dev
```

### Build Individual Packages

```bash
# Generator only
cd packages/generator && npm run build

# Web only
cd packages/web && npm run build
```

## Creating New Templates

Templates are HTML files with embedded metadata. To create a new template:

1. Create `packages/generator/templates/your-template.html`
2. Add required meta tags in `<head>`:
   ```html
   <!-- Template Metadata (required for all 3 languages) -->
   <meta name="template:name:en" content="Your Template Name">
   <meta name="template:name:zh-TW" content="模板名稱">
   <meta name="template:name:ja" content="テンプレート名">
   <meta name="template:description:en" content="Description of your template...">
   <meta name="template:description:zh-TW" content="模板描述...">
   <meta name="template:description:ja" content="テンプレートの説明...">
   ```
3. Import shared styles and use CSS variables for responsive design
4. Run `npm run build` - the template will be automatically discovered and built

See [CLAUDE.md](CLAUDE.md) for detailed development guidelines.

## About This Project

These templates are generated from HTML/CSS files, making them:
- **Easy to version control** - All changes are tracked in Git
- **Automatically generated** - One design works for multiple device sizes
- **Open source** - Anyone can contribute new templates

Want to learn how it works or contribute? Check out [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**For Developers**: Want to create or modify templates? See [CONTRIBUTING.md](CONTRIBUTING.md) for the full development guide.
