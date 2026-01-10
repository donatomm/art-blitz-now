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
  
  // 2. Extract style block from <style> tags
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  let cssContent = styleMatch ? styleMatch[1] : '';
  
  // 3. Replace 'body' selector with '.html-content' wrapper class
  // This ensures body styles apply to our wrapper div
  cssContent = cssContent.replace(/\bbody\b/g, '.html-content');
  
  // 4. Add default typography styles
  const defaultStyles = `
    .html-content { line-height: 1.7; }
    .html-content p { margin-bottom: 1.2em; }
    .html-content h1 { 
      font-size: 2.5em; 
      font-weight: 800; 
      margin-top: 0; 
      margin-bottom: 1em; 
      line-height: 1.2;
      color: #1a1a2e;
    }
    .html-content h2 { 
      font-size: 1.6em; 
      font-weight: 700; 
      margin-top: 2em; 
      margin-bottom: 0.75em; 
      color: #2980b9;
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.3em;
    }
    .html-content h3 { 
      font-size: 1.25em; 
      font-weight: 600; 
      margin-top: 1.5em; 
      margin-bottom: 0.5em; 
    }
    .html-content ul, .html-content ol { margin-bottom: 1em; }
    .html-content section { margin-bottom: 2em; }
  `;
  
  const styleBlock = `<style>${defaultStyles}${cssContent}</style>`;
  
  // 4. Wrap body content in a div with the html-content class
  const wrappedContent = `<div class="html-content">${bodyContent}</div>`;
  
  // 5. Combine style block with wrapped content
  const combined = styleBlock + wrappedContent;
  
  // 6. Sanitize with explicit ALLOWED_TAGS including style
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
      'audio', 'source', 'video', 'track',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'src', 'alt', 'lang', 'title', 'datetime', 'id', 'controls', 'preload', 'autoplay', 'loop', 'muted', 'type'],
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
