const xss = require("xss");

/**
 * Recursive function to sanitize objects, arrays, and strings.
 * This ensures that nested JSON bodies are also cleaned.
 */
const sanitize = (value) => {
    if (typeof value === "string") {
        return xss(value);
    }
    if (Array.isArray(value)) {
        return value.map(sanitize);
    }
    if (typeof value === "object" && value !== null) {
        Object.keys(value).forEach((key) => {
            value[key] = sanitize(value[key]);
        });
        return value;
    }
    return value;
};

const inputSanitizer = (req, res, next) => {
    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    if (req.params) {
        req.params = sanitize(req.params);
    }
    next();
};

module.exports = inputSanitizer;
