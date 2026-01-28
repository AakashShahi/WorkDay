const axios = require("axios");

// Memory cache to store used tokens for their lifetime (approx 2-3 mins)
// In a production environment with multiple instances, use Redis instead.
const usedTokens = new Set();

/**
 * Verifies the reCAPTCHA token and ensures it hasn't been reused.
 * @param {string} token - The g-recaptcha-response token from the frontend.
 * @returns {Promise<boolean>} - Returns true if valid and not a replay.
 */
exports.verifyCaptcha = async (token) => {
    if (!token) return false;

    // 1. Check if token was already used in this session (Manual Replay Protection)
    if (usedTokens.has(token)) {
        console.warn("reCAPTCHA Replay Attempt detected!");
        return false;
    }

    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const googleVerifyUrl = "https://www.google.com/recaptcha/api/siteverify";
        
        // Use URLSearchParams for form-urlencoded POST request (Google recommended)
        const params = new URLSearchParams();
        params.append('secret', secretKey);
        params.append('response', token);

        const response = await axios.post(googleVerifyUrl, params);

        if (response.data.success) {
            // 2. Add to used tokens set to prevent manual replays
            usedTokens.add(token);

            // 3. Set a timeout to remove the token after 2 minutes (reCAPTCHA tokens expire in 2 mins)
            setTimeout(() => {
                usedTokens.delete(token);
            }, 2 * 60 * 1000);

            return true;
        }

        console.log("Google reCAPTCHA Verification Failed:", response.data);
        return false;
    } catch (error) {
        console.error("reCAPTCHA Utility Error:", error.message);
        return false;
    }
};
