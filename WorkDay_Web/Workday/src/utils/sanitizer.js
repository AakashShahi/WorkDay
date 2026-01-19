import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * @param {string} dirty - The potentially malicious HTML string.
 * @returns {string} - The clean, sanitized HTML string.
 */
export const sanitizeHtml = (dirty) => {
    return DOMPurify.sanitize(dirty, {
        USE_PROFILES: { html: true }, // Only allow HTML
    });
};

/**
 * Sanitizes plain text input.
 * @param {string} text - The input text.
 * @returns {string} - Sanitized text.
 */
export const sanitizeText = (text) => {
    return DOMPurify.sanitize(text);
};

// Input sanitization utility
