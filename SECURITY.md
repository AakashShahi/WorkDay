# Web Security Documentation - WorkDay

This document outlines the web security features implemented in the WorkDay application to ensure user data protection and prevent unauthorized access.

## 1. Google reCAPTCHA (v2)
To protect against automated attacks, bots, and brute-force attempts, Google reCAPTCHA is integrated into both the registration and login flows.

*   **How it is applied:**
    *   **Frontend:** The `react-google-recaptcha` component is embedded in [LoginForm.jsx](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Web/Workday/src/components/auth/LoginForm.jsx) and [RegisterForm.jsx](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Web/Workday/src/components/auth/RegisterForm.jsx). Users must solve the challenge before the "Login" or "Register" buttons become active.
    *   **Backend:** Upon form submission, the `captchaToken` is sent to the API. The [userController.js](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/userController.js) verifies this token using Google's verification API before processing any sensitive logic.
*   **Why it is used:** To ensure that interactions are performed by humans and to mitigate "Credential Stuffing" and "Bot Registration" attacks.

---

## 2. Two-Factor Authentication (2FA / TOTP)
We provide an optional but highly recommended 2FA layer using Time-based One-Time Passwords (TOTP).

*   **How it is applied:**
    *   **Implementation:** Powered by the `speakeasy` library on the backend and `qrcode.react` on the frontend.
    *   **Setup Path:** Users can enable 2FA via the [TwoFactorSetup.jsx](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/Workday_Web/Workday/src/components/auth/TwoFactorSetup.jsx) component. A unique secret is generated, and a QR code is presented for scanning with apps like Google Authenticator or Authy.
    *   **Login Flow:** When a user with 2FA enabled attempts to log in ([userController.js:L141](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/userController.js#L141)), the system validates their password first, then issues a short-lived "tempToken" and prompts for an OTP. The final JWT is only issued after a successful OTP verification.
*   **Why it is used:** To provide "Multi-Factor Authentication" (Something you know + Something you have). This prevents account takeover even if the user's password is stolen.

---

## 3. Social OAuth Integration (Google & Facebook)
Users can sign in securely using their existing Google or Facebook accounts.

*   **How it is applied:**
    *   **Google Login:** Implemented using `@react-oauth/google`. The frontend handles the implicit flow to obtain an `access_token`, which is then verified by the backend ([userController.js:L342](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/userController.js#L342)) using the `googleapis.com` userinfo endpoint.
    *   **Facebook Login:** Implemented using `react-facebook-login`. The frontend obtains a Facebook access token, and the backend ([userController.js:L394](file:///e:/shahi/Documents/Developer/Cw2/WorkDay/WorkDay_Api/controllers/userController.js#L394)) verifies it against the Facebook Graph API.
    *   **Seamless Onboarding:** If a social user doesn't have an account, the system automatically creates one using their verified email and profile picture, assigning a secure random password.
*   **Why it is used:** To improve user experience with "Single Sign-On" (SSO) while leveraging the advanced security infrastructure of major tech platforms.

---

## 4. Other Security Measures
*   **Password Hashing:** All passwords are salted and hashed using `bcrypt` (10 rounds) before storage.
*   **Encrypted Sessions:** Authentication is handled via JSON Web Tokens (JWT), signed with a server-side secret.
*   **Input Validation:** Strict validation using `Yup` and `Formik` on the frontend and manual checks on the backend to prevent malformed data injection.
