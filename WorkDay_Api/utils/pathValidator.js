const path = require('path');

/**
 * Validates if the user-supplied filename combined with a base directory
 * results in a path within that base directory.
 * 
 * @param {string} baseDir - The directory where files should be stored.
 * @param {string} userInput - The user-supplied filename or path.
 * @returns {boolean} - True if the resolved path is safe, false otherwise.
 */
const isPathSafe = (baseDir, userInput) => {
    const absoluteBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(path.join(baseDir, userInput));

    // Check if the resolved path starts with the base directory path
    return resolvedPath.startsWith(absoluteBase);
};

module.exports = { isPathSafe };
