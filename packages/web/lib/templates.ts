import templatesData from "@/public/templates/templates.json";

// Get basePath for static assets (empty in dev, "/supernote-templates" in prod)
const basePath = process.env.NODE_ENV === "production" ? "/supernote-templates" : "";

export type Locale = "en" | "zh-TW" | "ja";

export type TemplateI18n = {
  name: string;
  description: string;
};

export type Template = {
  id: string;
  devices: string[];
  i18n: Record<Locale, TemplateI18n>;
};

export type TemplatesData = {
  version: number;
  templates: Template[];
};

/**
 * Get all templates from templates.json
 */
export function getTemplates(): Template[] {
  return (templatesData as TemplatesData).templates;
}

/**
 * Get a single template by ID
 */
export function getTemplateById(id: string): Template | undefined {
  return getTemplates().find((template) => template.id === id);
}

/**
 * Get all template IDs (useful for generateStaticParams)
 */
export function getAllTemplateIds(): string[] {
  return getTemplates().map((template) => template.id);
}

/**
 * Get the preview image path for a template (uses Nomad version)
 */
export function getTemplatePreviewPath(templateId: string): string {
  return `${basePath}/templates/nomad/${templateId}.png`;
}

/**
 * Get the download path for a specific device version
 */
export function getTemplateDownloadPath(
  templateId: string,
  device: string
): string {
  return `${basePath}/templates/${device}/${templateId}.png`;
}
