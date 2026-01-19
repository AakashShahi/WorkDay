export const getBackendImageUrl = (imagePath) => {
    if (!imagePath) return null
    const apiUrl = import.meta.env.VITE_BACKEND_URL || "https://localhost:5050"

    // Sanitize path: remove any leading "uploads/" or "uploads\" or "/"
    const cleanFilename = imagePath.replace(/^.*[\\\/]/, '');

    return `${apiUrl}/api/media/${cleanFilename}`;
}