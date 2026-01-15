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
    *   Ensure **Intercept is ON** in the Proxy tab to capture requests before they are sent.
    *   Use the **Target** tab to scope the application for cleaner analysis.
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

## 5. Brute-Force Protection & Account Lockout

Disrupts automated attempts to guess passwords through both network-level and account-level restrictions.

*   **How it is applied:** 
    1.  **IP Rate Limiting:** Enforces a limit on the number of requests an IP address can make to auth routes (10 requests per 15 mins).
    2.  **Account Lockout:** Tracks failed login attempts per user. After **5 failed attempts**, the account is locked for **10 minutes**.
*   **Where it is applied:**
    *   **Backend Middleware:** [index.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/index.js) (IP limiting).
    *   **Backend Logic:** [userController.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/userController.js) (Login attempts tracking and `lockUntil` enforcement).
    *   **Frontend:** [LoginForm.jsx](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Web/Workday/src/components/auth/LoginForm.jsx) (Displays remaining attempts and lockout timer).
*   **Why it is applied:** 
    To prevent targeted "Credential Guessing" and distributed "Credential Stuffing" attacks.
*   **Testing:**
    *   **IP Limit:** Send 11+ requests to `/api/auth` from one IP. Observe `429 Too Many Requests`.
    *   **Account Lockout & Countdown:**
        1. Attempt to log in with an incorrect password 5 times.
        2. Observe the **live countdown timer** on the frontend (e.g., "Please wait 9m 45s").
        3. Attempt a 6th login while locked; ensure the server returns `403 Forbidden` with the `lockUntil` timestamp.
        4. Wait for the timer to reach zero. Ensure the UI refreshes and allows new attempts (auto-reset logic).

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
---

## 7. File Upload Security & Path Traversal

Protects the server from malicious file uploads and directory traversal attacks.

*   **How it is applied:**
    *   **Strict File Type Whitelisting:** Both frontend and backend only allow `.png`, `.jpg`, and `.jpeg` extensions. The backend also verifies the MIME type.
    *   **File Size Restriction:** A hard limit of **5MB** is enforced per file upload to prevent Disk Exhaustion attacks (DoS).
    *   **Frontend Validation:** All upload fields display the allowed maximum size (5MB) and the actual size of the selected file, providing immediate feedback before submission.
    *   **Filename Sanitization:** Files are renamed using `uuidv4` to prevent attackers from controlling the filename and conducting path traversal or overwriting critical files.
    *   **Path Canonicalization:** A custom utility [pathValidator.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/utils/pathValidator.js) is used to ensure resolved paths stay within the `uploads/` directory.
*   **Where it is applied:**
    *   **Frontend:** [WorkerProfileModals.jsx](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Web/Workday/src/components/worker/modals/WorkerProfileModals.jsx), [AdminSetting.jsx](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Web/Workday/src/components/admin/AdminSetting.jsx), and Profession modals.
    *   **Backend Middleware:** [fileUpload.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/middlewares/fileUpload.js).
    *   **Backend Utility:** [pathValidator.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/utils/pathValidator.js).
*   **Why it is applied:**
    *   Prevents Remote Code Execution (RCE) by blocking executable scripts (like `.php`, `.js`).
    *   Mitigates Path Traversal attacks where an attacker tries to write or read files outside the intended directory using `../` sequences.
*   **Testing:**
    *   **General:** Attempt to upload a `.pdf` or `.txt` file via the profile settings. The browser should either filter these out or the server should return an error.
    *   **Burp Suite (Bypassing UI):** Intercept an upload request. Change the filename in the multipart body to `../../etc/passwd` or `shell.php`. 
    *   **Verification:** Ensure the server returns a `500` or `400` error (e.g., `"Invalid file extension"` or `"Only .png, .jpg and .jpeg format allowed!"`) and no file is created outside the `uploads/` directory.

---

## 8. Local Development HTTPS
For local development, we use HTTPS with self-signed certificates. This ensures that features like OAuth (Google/Facebook) work correctly as they often require secure origins.
- **Backend**: `https://localhost:5050`
- **Frontend**: `https://localhost:5173`

*   **How it is applied:**
    *   **Self-Signed Certificates:** A local Root CA and a Server Certificate (signed by the Root CA) are generated using OpenSSL.
    *   **Backend:** Node.js uses `https.createServer()` with the generated `server.key` and `server.crt`.
    *   **Frontend:** Vite is configured via `server.https` to serve the application over HTTPS.
*   **Where it is applied:**
    *   **Certificates:** Stored in the `/certs` directory at the project root.
    *   **Backend:** [server.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/server.js).
    *   **Frontend:** [vite.config.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Web/Workday/vite.config.js).
*   **Why it is applied:**
    *   To prevent "Mixed Content" warnings when the frontend (HTTPS) tries to communicate with a backend (HTTP).
    *   To simulate a production-like environment where SSL/TLS is mandatory.
*   **Testing:**
    *   **General:** Start the backend and frontend. Access `https://localhost:5173` in the browser. 
    *   **Verification:** 
        1. Check the browser address bar for `https://`.
        2. If the root certificate is not trusted, the browser will show a warning (which is expected for self-signed certs).
        3. To remove the warning, the `root.crt` must be manually added to the system's "Trusted Root Certification Authorities" store.
    *   **Burp Suite:** Capture traffic between the frontend and backend. Ensure the endpoints now start with `https://`.

---

## 9. Password History Policy

Ensures users do not reuse vulnerable or recently changed passwords.

*   **How it is applied:**
    The system maintains a `passwordHistory` array in the [User.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/models/User.js) model. Before a password update, the new password is hashed and compared against the current hash and the last 1 entry in the `passwordHistory` array (covering the last 2 unique passwords).
*   **Where it is applied:**
    *   **Backend:** [User.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/models/User.js) and role-controllers (e.g., [workerController.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/worker/workerController.js), [adminController.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/admin/adminController.js)).
*   **Why it is applied:**
    Prevents "Password Cycling" and ensures users choose fresh passwords, reducing the risk if an old password hash was ever leaked.
*   **Testing:**
    *   **General:** Change your password. Then immediately try to change it back to the previous one.
    *   **Verification:** Ensure the system returns an error: `"New password cannot be one of your last 2 passwords"`.

---

## 10. OTP-Verified Sensitive Updates (MFA for Account Changes)

Adds a mandatory verification step for high-risk account modifications.

*   **How it is applied:**
    Critical modifications (Profile Name, Profile Picture, Password Change) require a 6-digit One-Time Password (OTP). The backend generates this code, stores it with a 10-minute expiration, and sends it to the user's verified email. The update only commits if the user provides the correct, unexpired code.
*   **Where it is applied:**
    *   **Backend:** [userController.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/userController.js) (`requestUpdateOTP` and authentication checks).
    *   **Frontend:** [WorkerProfileModals.jsx](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Web/Workday/src/components/worker/modals/WorkerProfileModals.jsx) and [AdminSetting.jsx](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Web/Workday/src/components/admin/AdminSetting.jsx).
*   **Why it is applied:**
    Prevents "Account Takeover" via CSRF or session hijacking. Even if an attacker gains session access, they cannot modify the account without also controlling the user's email.
*   **Testing:**
    *   **General:** Open the Profile settings. Change your name and click "Save" before requesting the code. The button should either be blocked or return an error. Click "Send Code", retrieve it from email, and submit.
    *   **Burp Suite (Bypassing UI):** Captured a profile update request. Change the `otp` field to an incorrect value. Ensure the server returns generic `"Invalid or expired OTP"` error.

---

## 11. System Activity Logs (Audit Trail)

To maintain accountability and detect suspicious behavior, the system implements a comprehensive audit logging mechanism.

*   **How it is applied:**
    - A dedicated `AuditLog` model captures `user`, `action`, `status`, `details`, `ipAddress`, and `userAgent`.
    - A centralized `auditLogger` utility is used across controllers to record events.
    - Admins have access to a live dashboard with filtering by action, status, and date.
*   **Where it is applied:**
    - **Models:** [AuditLog.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/models/AuditLog.js)
    - **Utility:** [auditLogger.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/utils/auditLogger.js)
    - **Controllers:** [userController.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/userController.js), [workerController.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/worker/workerController.js), [adminController.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/admin/adminController.js).
    - **Admin Dashboard:** [AdminAuditLogs.jsx](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Web/Workday/src/components/admin/AdminAuditLogs.jsx) (`/admin/dashboard/logs`).
*   **Why it is applied:**
    - **Accountability:** Tracks who did what and when.
    - **Incident Response:** Helps reconstruct events during a security breach.
    - **Anomaly Detection:** Identifies patterns like repeat login failures or rapid profile changes.
    - **Compliance:** Facilitates auditing requirements.
*   **Testing:**
    1. Perform a login, logout, and profile update.
    2. Try failing a login 3 times.
    3. Log in as an Admin and navigate to **Activity Logs**.
    4. Verify that all actions (Successes and Failures) are recorded with correct timestamps and IP addresses.
    5. Use the filters to search for "LOGIN_FAILURE" and ensure the correct logs appear.

### Section 12: Secure Build Process
To minimize the attack surface and protect the application's logic, a secure build pipeline is implemented for production deployments.

*   **How it is applied:**
    - **Minification & Tree-shaking:** Vite's build process automatically removes unused code and minifies the output using `esbuild` to reduce the bundle size and obscure code structure.
    - **Code Obfuscation:** The `vite-plugin-javascript-obfuscator` is integrated into the production build to scramble JavaScript code, making reverse engineering significantly more difficult.
    - **Secure Environment Injection:** Sensitive keys are managed via environment variables and are NOT included in the client-side bundle unless explicitly prefixed with `VITE_`.
    - **No Sourcemaps:** Sourcemaps are disabled in production to prevent exposing the original source code structure.
*   **Where it is applied:**
    - **Build Config:** [vite.config.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Web/Workday/vite.config.js)
    - **Environment:** `.env` and `.env.local` files.
*   **Why it is applied:**
    - **Attack Surface Reduction:** Minimizing the amount of shipped code reduces potential entry points for attackers.
    - **IP Protection:** Obfuscation protects proprietary logic and prevents easy cloning or analysis of the application.
    - **Information Disclosure Prevention:** Disabling sourcemaps and filtering environment variables ensures internal paths and keys remain hidden.
*   **Testing:**
    1.  **Build Check:**
        - Run `npm run build` in the `WorkDay_Web/Workday` directory.
        - Inspect the generated files in the `dist` directory.
        - Verify that JavaScript files are minified and that variables/functions are renamed to non-obvious strings.
    2.  **Browser Verification (DevTools):**
        - Deploy or preview the build (`npm run preview`).
        - Open **Browser DevTools** (F12 or Ctrl+Shift+I).
        - Navigate to the **Sources** tab.
        - Locate the main logic files (usually under `assets/`).
        - **What to expect:**
            - **Code Scrambling:** The code should look like a dense, unreadable block of text with arbitrary names (e.g., `_0x1a2b`, `const a = ...`).
            - **No Readable Logic:** Business logic, API endpoints, and internal function names should be unrecognizable.
            - **Missing Sourcemaps:** You should see a notification like "Source Map detected but failed to load" (if disabled) or simply no link to the original `.jsx` files.
            - **String Concealment:** Hardcoded strings should be hex-encoded or obscured.
    3.  **Leakage Check:** 
        - Search the build output (in `dist` or via DevTools search) for sensitive strings (e.g., API secrets, internal server paths) to ensure no leakages occurred.
