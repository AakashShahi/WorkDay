import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminSetting from "../AdminSetting";

// =================================================================
// Mocks
// =================================================================

const mockUpdateProfileMutate = jest.fn();
const mockChangePasswordMutate = jest.fn();

jest.mock("../../../hooks/admin/useAdminProfile", () => ({
    useAdminProfile: jest.fn(),
    useUpdateAdminProfile: () => ({ mutate: mockUpdateProfileMutate }),
    useChangeAdminPassword: () => ({ mutate: mockChangePasswordMutate }),
}));

jest.mock("../../../utils/backend_image", () => ({
    getBackendImageUrl: (path) => `http://mock.com/${path}`,
}));

jest.mock("lucide-react", () => ({
    Eye: () => "EyeIcon",
    EyeOff: () => "EyeOffIcon",
}));

// =================================================================
// Test Setup
// =================================================================

const { useAdminProfile } = require("../../../hooks/admin/useAdminProfile");

const mockAdmin = {
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    profilePic: "admin.jpg",
};

const renderWithProviders = (ui) => {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
};

// =================================================================
// Test Suite
// =================================================================

describe("AdminSetting", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Set a default mock implementation for the main data hook
        useAdminProfile.mockReturnValue({ admin: mockAdmin, isLoading: false });
    });

    test("shows loading state correctly", () => {
        useAdminProfile.mockReturnValue({ admin: null, isLoading: true });
        renderWithProviders(<AdminSetting />);
        expect(screen.getByText(/Loading admin settings.../i)).toBeInTheDocument();
    });

    test("renders admin profile information when data is loaded", () => {
        renderWithProviders(<AdminSetting />);
        expect(screen.getByText(mockAdmin.name)).toBeInTheDocument();
        expect(screen.getByText(mockAdmin.email)).toBeInTheDocument();
        // Check if the form is pre-filled
        expect(screen.getByPlaceholderText("Name")).toHaveValue(mockAdmin.name);
    });

    // --- Profile Update Form ---
    describe("Profile Update Form", () => {
        test("allows updating name and profile picture and calls mutation", async () => {
            renderWithProviders(<AdminSetting />);

            const nameInput = screen.getByPlaceholderText("Name");
            const fileInput = screen.getByLabelText(/Change Profile Picture/i);
            const submitButton = screen.getByRole("button", { name: /Update Profile/i });

            const newName = "New Admin Name";
            const fakeFile = new File(["avatar"], "avatar.png", { type: "image/png" });

            // Simulate user input
            await userEvent.clear(nameInput);
            await userEvent.type(nameInput, newName);
            await userEvent.upload(fileInput, fakeFile);

            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockUpdateProfileMutate).toHaveBeenCalledTimes(1);
                // Check if FormData was passed
                expect(mockUpdateProfileMutate).toHaveBeenCalledWith(expect.any(FormData));
            });
        });

        test("shows validation error if name is empty and prevents submission", async () => {
            renderWithProviders(<AdminSetting />);
            const nameInput = screen.getByPlaceholderText("Name");
            const submitButton = screen.getByRole("button", { name: /Update Profile/i });

            await userEvent.clear(nameInput);
            fireEvent.click(submitButton);

            expect(await screen.findByText("Name is required")).toBeInTheDocument();
            expect(mockUpdateProfileMutate).not.toHaveBeenCalled();
        });
    });

    // --- Password Change Form ---
    describe("Password Change Form", () => {
        test("allows changing password and calls mutation on valid submission", async () => {
            // Mock the mutation to call onSuccess to test form reset
            mockChangePasswordMutate.mockImplementation((values, { onSuccess }) => {
                onSuccess();
            });
            renderWithProviders(<AdminSetting />);

            const currentPasswordInput = screen.getByPlaceholderText("Current Password");
            const newPasswordInput = screen.getByPlaceholderText("New Password");
            const submitButton = screen.getByRole("button", { name: /Change Password/i });

            await userEvent.type(currentPasswordInput, "oldPassword123");
            await userEvent.type(newPasswordInput, "newPassword123");

            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockChangePasswordMutate).toHaveBeenCalledTimes(1);
                expect(mockChangePasswordMutate).toHaveBeenCalledWith(
                    { currentPassword: "oldPassword123", newPassword: "newPassword123" },
                    expect.any(Object)
                );
            });

            // Form should reset after successful submission
            expect(currentPasswordInput).toHaveValue("");
            expect(newPasswordInput).toHaveValue("");
        });

        test("shows validation errors for empty fields and prevents submission", async () => {
            renderWithProviders(<AdminSetting />);
            const submitButton = screen.getByRole("button", { name: /Change Password/i });
            fireEvent.click(submitButton);

            expect(await screen.findAllByText("Required")).toHaveLength(2);
            expect(mockChangePasswordMutate).not.toHaveBeenCalled();
        });

        test("toggles password visibility", async () => {
            renderWithProviders(<AdminSetting />);
            const toggleButton = screen.getByRole("button", { name: /Show passwords/i });
            const currentPasswordInput = screen.getByPlaceholderText("Current Password");

            expect(currentPasswordInput).toHaveAttribute("type", "password");

            fireEvent.click(toggleButton);

            await waitFor(() => {
                expect(currentPasswordInput).toHaveAttribute("type", "text");
            });

            fireEvent.click(toggleButton);

            await waitFor(() => {
                expect(currentPasswordInput).toHaveAttribute("type", "password");
            });
        });
    });
});