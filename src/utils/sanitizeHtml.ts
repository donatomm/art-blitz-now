import DOMPurify from 'dompurify';

// Security configuration for HTML sanitization
// Strips all potentially dangerous elements and attributes
const sanitizeConfig = {
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress'],
  ALLOW_DATA_ATTR: false,
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, sanitizeConfig);
};

/**
 * Sanitizes inline markdown-converted content (bold, links)
 * @param text - Text with simple HTML from markdown conversion
 * @returns Sanitized HTML string
 */
export const sanitizeInlineHtml = (text: string): string => {
  // For inline content, we allow strong and anchor tags
  const inlineConfig = {
    ALLOWED_TAGS: ['strong', 'a', 'em', 'b', 'i'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  };
  return DOMPurify.sanitize(text, inlineConfig);
};

/**
 * Parse CSS string into a map of selector -> styles
 */
const parseCSS = (css: string): Record<string, string> => {
  const rules: Record<string, string> = {};
  // Match CSS rules: selector { properties }
  const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
  let match;
  
  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1].trim();
    const properties = match[2].trim();
    // Only handle simple class selectors for security
    if (selector.startsWith('.') && !selector.includes(' ')) {
      const className = selector.slice(1);
      rules[className] = properties;
    }
  }
  
  return rules;
};

/**
 * Apply CSS rules as inline styles to matching elements
 */
const applyInlineStyles = (html: string, cssRules: Record<string, string>): string => {
  let result = html;
  
  for (const [className, styles] of Object.entries(cssRules)) {
    // Match elements with this class and add inline styles
    const classRegex = new RegExp(`class=["']([^"']*\\b${className}\\b[^"']*)["']`, 'gi');
    result = result.replace(classRegex, (match, classes) => {
      // Check if style attribute already exists nearby
      return `${match} style="${styles}"`;
    });
  }
  
  return result;
};

/**
 * Process a full HTML document (with <!DOCTYPE>, <html>, <head>, <body>, <style>)
 * Extracts body content, converts embedded CSS to inline styles, and sanitizes
 */
export const processHtmlDocument = (html: string): string => {
  // 1. Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  
  // 2. Extract style rules from <style> tags
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const cssRules = styleMatch ? parseCSS(styleMatch[1]) : {};
  
  // 3. Apply CSS rules as inline styles
  const withInlineStyles = applyInlineStyles(bodyContent, cssRules);
  
  // 4. Sanitize the result (allows style attribute)
  const configWithStyles = {
    ...sanitizeConfig,
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'src', 'alt'],
  };
  
  return DOMPurify.sanitize(withInlineStyles, configWithStyles);
};

/**
 * Check if content is a full HTML document
 */
export const isFullHtmlDocument = (html: string): boolean => {
  return /<!DOCTYPE|<html|<head|<body/i.test(html);
};
