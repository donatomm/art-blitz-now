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
 * Process a full HTML document (with <!DOCTYPE>, <html>, <head>, <body>, <style>)
 * Extracts body content and style block, combines them, and sanitizes
 */
export const processHtmlDocument = (html: string): string => {
  // 1. Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  
  // 2. Extract style block from <style> tags (preserve it)
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const styleBlock = styleMatch ? `<style>${styleMatch[1]}</style>` : '';
  
  // 3. Combine style block with body content
  const combined = styleBlock + bodyContent;
  
  // 4. Sanitize with explicit ALLOWED_TAGS including style
  // Using ALLOWED_TAGS means we must list ALL tags we want to keep
  const configWithStyles = {
    FORCE_BODY: true,
    ALLOWED_TAGS: [
      'style', 'article', 'section', 'header', 'footer', 'nav', 'aside', 'main',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'div', 'span', 'br', 'hr',
      'ul', 'ol', 'li', 'dl', 'dt', 'dd',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
      'a', 'strong', 'b', 'em', 'i', 'u', 's', 'small', 'mark', 'sub', 'sup',
      'blockquote', 'pre', 'code', 'kbd', 'samp',
      'img', 'figure', 'figcaption',
      'address', 'time', 'abbr', 'cite', 'q',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'src', 'alt', 'lang', 'title', 'datetime', 'id'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress'],
  };
  
  return DOMPurify.sanitize(combined, configWithStyles);
};

/**
 * Check if content is a full HTML document
 */
export const isFullHtmlDocument = (html: string): boolean => {
  return /<!DOCTYPE|<html|<head|<body/i.test(html);
};
