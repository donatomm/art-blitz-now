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
