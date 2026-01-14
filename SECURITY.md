# Web Security Documentation - WorkDay

This document outlines the web security features implemented in the WorkDay application. Each implementation is detailed with its rationale, location, and testing procedures.

---

## 1. Google reCAPTCHA (v2)

To protect against automated attacks, bots, and brute-force attempts.

*   **How it is applied:** 
    Users must solve a visual/audio challenge before submitting authentication forms. The frontend sends a token to the backend, which is then verified against Google's servers.
*   **Where it is applied:**
    *   **Frontend:** [LoginForm.jsx](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Web/Workday/src/components/auth/LoginForm.jsx) and [RegisterForm.jsx](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Web/Workday/src/components/auth/RegisterForm.jsx).
    *   **Backend:** [userController.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/userController.js) (verification logic).
*   **Why it is applied:** 
    To ensure interactions are human-led and mitigate "Credential Stuffing" and automated registration bots.
*   **Testing:**
    *   **General:** Attempt to login/register without checking the CAPTCHA. The form should block submission or the server should reject it.
    *   **Burp Suite:** Capture a login request. In Repeater, remove or change the `captchaToken` parameter. The server must return a `400` error.

---

## 2. Two-Factor Authentication (2FA)

Provides an extra layer of security beyond just a password.

*   **How it is applied:** 
    Uses Time-based One-Time Passwords (TOTP). Users scan a QR code with an app (like Google Authenticator). During login, a 6-digit code is required after valid password entry.
*   **Where it is applied:**
    *   **Frontend:** [TwoFactorSetup.jsx](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/Workday_Web/Workday/src/components/auth/TwoFactorSetup.jsx) and [LoginForm.jsx](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Web/Workday/src/components/auth/LoginForm.jsx) (OTP prompt).
    *   **Backend:** [userController.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/userController.js) (logic for `setup2FA` and `verify2FALogin`).
*   **Why it is applied:** 
    Protects accounts even if passwords are compromised (Something you know + Something you have).
*   **Testing:**
    *   **General:** Enable 2FA, log out, and attempt to log in. Ensure the system asks for the 6-digit code.
    *   **Burp Suite:** Attempt to access a protected resource after a successful password check but *before* providing the OTP. Ensure the `tempToken` only allows 2FA verification and nothing else.

---

## 3. Social OAuth Integration (Google & Facebook)

Secure and convenient login using trusted third-party providers.

*   **How it is applied:** 
    The frontend uses official SDKs to obtain an `access_token`. This token is sent to our backend, which verifies its validity with Google/Facebook APIs before issuing a JWT.
*   **Where it is applied:**
    *   **Frontend:** [LoginForm.jsx](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Web/Workday/src/components/auth/LoginForm.jsx) (Google/Facebook buttons).
    *   **Backend:** [userController.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/userController.js) (`googleLogin` and `facebookLogin` methods).
*   **Why it is applied:** 
    Leverages high-security standards of major platforms and reduces password fatigue for users.
*   **Testing:**
    *   **General:** Click the "Sign in with Google" button and complete the flow. Verify a user record is created in the database.
    *   **Burp Suite:** Capture the social login request. In Repeater, change the `access_token` to a bogus value. Ensure the server returns a `500` or `401` verification failed error.

---

## 4. Prevention of Username Enumeration

Protects user privacy and prevents hackers from building a list of valid accounts.

*   **How it is applied:** 
    The API returns a generic error message for any authentication failure.
*   **Where it is applied:**
    *   **Backend:** [userController.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/userController.js) (Login logic).
*   **Why it is applied:** 
    Prevents attackers from using different responses (like "User not found" vs "Wrong password") to discover valid emails on the system.
*   **Testing:**
    *   **General:** Try to log in with an email that doesn't exist. Then try with a valid email but a wrong password.
    *   **Burp Suite (Repeater):** Observe that the HTTP Status (`400`), the message (`"Invalid email/username or password"`), and the response length are identical for both scenarios.

---

## 5. Brute-Force & Rate Limiting

Disrupts automated attempts to guess passwords.

*   **How it is applied:** 
    Enforces a strict limit on the number of requests an IP address can make to auth routes within a specific time window.
*   **Where it is applied:**
    *   **Backend:** [index.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/index.js) (Rate limiting middleware applied to `/api/auth`).
*   **Why it is applied:** 
    To prevent "Credential Stuffing" and automated dictionary attacks.
*   **Testing:**
    *   **General:** Rapidly refresh or submit the login form multiple times.
    *   **Burp Suite (Intruder):** Send a login request to Intruder. Set a payload for the password and run it 15+ times. Observe that after 10 requests, the status changes to `429 Too Many Requests`.

---

## 6. Backend Password Complexity Enforcement

Ensures security standards cannot be bypassed by skipping the frontend.

*   **How it is applied:** 
    The server validates the password string against a regex before processing registration or reset requests.
*   **Where it is applied:**
    *   **Backend:** [userController.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/userController.js) (Regex validation in `registerUser`).
*   **Why it is applied:** 
    To ensure all passwords meet the security policy (8+ chars, Uppercase, Number, Special Char) even if a user bypasses the UI using tools like Postman.
*   **Testing:**
    *   **General:** Try to register via the website with a simple password (the UI should block it).
    *   **Burp Suite (Repeater):** Capture a registration request and change the password to `12345`. The server MUST return a `400` error with the complexity requirement message.
