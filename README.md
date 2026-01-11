# Supernote Templates

Ready-to-use note templates for Supernote e-ink devices. Download PNG files and import them directly to your Nomad (A6 X2) or Manta (A5 X2) device.

## Available Templates

Browse and download templates:
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

## Template Preview

Current available templates:
- `daily-routine.png` - Monthly habit tracker with task grid and notes section
- `priority-todo.png` - Priority-based todo list with section headers

More templates coming soon!

## Project Structure

This is a Turborepo monorepo with the following packages:

```
packages/
├── generator/    # PNG template generator (HTML → PNG via Puppeteer)
└── web/          # Next.js static website for template preview
```

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

This runs builds for all packages in parallel:
- `@supernote-templates/generator`: Generates PNG files to `packages/generator/dist/`
- `@supernote-templates/web`: Builds static site to `packages/web/out/`

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
