-- Add content_type column to pages table for HTML/Markdown mode persistence
ALTER TABLE pages 
ADD COLUMN content_type text NOT NULL DEFAULT 'markdown';

-- Add check constraint for valid content types
ALTER TABLE pages 
ADD CONSTRAINT pages_content_type_check 
CHECK (content_type IN ('markdown', 'html'));

-- Auto-detect existing HTML pages and update their content_type
UPDATE pages 
SET content_type = 'html' 
WHERE content ~ '<(div|p|span|table|ul|ol|h[1-6]|section|article|style|!DOCTYPE|html)[\s>\/]';