# WorkDay Platform

WorkDay is a comprehensive platform connecting workers with opportunities. It features a robust job board, chat communication, and administrative controls.

## Project Structure

- `WorkDay_Api/`: Node.js Express backend.
- `WorkDay_Web/`: React (Vite) frontend.

## Security Features

The platform implements several modern security standards:
- **Google reCAPTCHA**: Protection against bots.
- **Two-Factor Authentication (2FA)**: Enhanced account security via TOTP.
- **Social OAuth**: Secure login with Google and Facebook.

For a detailed breakdown of implementation and manual verification steps, see [SECURITY.md](SECURITY.md).

## Getting Started

### Backend
1. Go to `WorkDay_Api` directory.
2. Install dependencies: `npm install`.
3. Configure `.env` file.
4. Start the server: `npm run dev`.

### Frontend
1. Go to `WorkDay_Web/Workday` directory.
2. Install dependencies: `npm install`.
3. Configure `.env` file.
4. Start the dev server: `npm run dev`.
