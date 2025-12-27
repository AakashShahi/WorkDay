import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminProfessionManagement from "../AdminProfessionManagement";

// --- Mocks ---

// Mock the main hook to control its data
jest.mock("../../../hooks/admin/useAdminProfession", () => ({
    useAdminProfession: jest.fn(),
}));

// Mock child modal components to isolate the parent component
jest.mock("../modal/CreateProfessionModal", () => ({
    __esModule: true,
    default: ({ isOpen, onClose }) =>
        isOpen ? (
            <div data-testid="create-modal">
                Create Modal is Open
                <button onClick={onClose}>Close Create</button>
            </div>
        ) : null,
}));

jest.mock("../modal/UpdateProfessionModal", () => ({
    __esModule: true,
    default: ({ isOpen, onClose, profession }) =>
        isOpen ? (
            <div data-testid="update-modal">
                Update Modal for: {profession?.name}
                <button onClick={onClose}>Close Update</button>
            </div>
        ) : null,
}));

jest.mock("../modal/DeleteProfessionModal", () => ({
    __esModule: true,
    default: ({ isOpen, onClose, professionId }) =>
        isOpen ? (
            <div data-testid="delete-modal">
                Delete Modal for ID: {professionId}
                <button onClick={onClose}>Close Delete</button>
            </div>
        ) : null,
}));

// Mock utility functions and other libraries
jest.mock("../../../utils/backend_image", () => ({
    getBackendImageUrl: (path) => `http://mock.com/${path}`,
}));

jest.mock("lucide-react", () => ({
    Pencil: () => <div data-testid="edit-icon" />,
    Trash2: () => <div data-testid="delete-icon" />,
    Plus: () => <div data-testid="plus-icon" />,
}));

jest.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

// --- Test Setup ---

const { useAdminProfession } = require("../../../hooks/admin/useAdminProfession");

const mockProfessions = [
    { _id: "1", name: "Plumber", category: "Home Services", description: "Fixes pipes" },
    { _id: "2", name: "Electrician", category: "Home Services", description: "Fixes wires" },
];

const renderWithProviders = (ui) => {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
};

// --- Test Suite ---

describe("AdminProfessionManagement", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("displays loading state correctly", () => {
        useAdminProfession.mockReturnValue({ professions: [], isLoading: true });
        renderWithProviders(<AdminProfessionManagement />);
        expect(screen.getByText("Loading professions...")).toBeInTheDocument();
    });

    test("renders a list of professions when data is loaded", () => {
        useAdminProfession.mockReturnValue({ professions: mockProfessions, isLoading: false });
        renderWithProviders(<AdminProfessionManagement />);

        expect(screen.getByText("Plumber")).toBeInTheDocument();
        expect(screen.getByText("Electrician")).toBeInTheDocument();
        expect(screen.queryByText("Loading professions...")).not.toBeInTheDocument();
    });

    test("opens and closes the create profession modal", () => {
        useAdminProfession.mockReturnValue({ professions: [], isLoading: false });
        renderWithProviders(<AdminProfessionManagement />);

        // Modal should not be visible initially
        expect(screen.queryByTestId("create-modal")).not.toBeInTheDocument();

        // Open the modal
        const addButton = screen.getByRole("button", { name: /Add Profession/i });
        fireEvent.click(addButton);

        // Assert modal is visible
        const createModal = screen.getByTestId("create-modal");
        expect(createModal).toBeInTheDocument();

        // Close the modal
        const closeButton = within(createModal).getByRole("button", { name: /Close Create/i });
        fireEvent.click(closeButton);

        // Assert modal is gone
        expect(screen.queryByTestId("create-modal")).not.toBeInTheDocument();
    });

    test("opens the update modal with correct data when edit is clicked", () => {
        useAdminProfession.mockReturnValue({ professions: mockProfessions, isLoading: false });
        renderWithProviders(<AdminProfessionManagement />);

        // Find the "Plumber" card and click its edit button
        const plumberCard = screen.getByText("Plumber").closest("div");
        const editButton = within(plumberCard).getByTestId("edit-icon");
        fireEvent.click(editButton);

        // Assert update modal is visible with the correct profession name
        const updateModal = screen.getByTestId("update-modal");
        expect(updateModal).toBeInTheDocument();
        expect(updateModal).toHaveTextContent("Update Modal for: Plumber");
    });

    test("opens the delete modal with correct id when delete is clicked", () => {
        useAdminProfession.mockReturnValue({ professions: mockProfessions, isLoading: false });
        renderWithProviders(<AdminProfessionManagement />);

        // Find the "Electrician" card and click its delete button
        const electricianCard = screen.getByText("Electrician").closest("div");
        const deleteButton = within(electricianCard).getByTestId("delete-icon");
        fireEvent.click(deleteButton);

        // Assert delete modal is visible with the correct profession ID
        const deleteModal = screen.getByTestId("delete-modal");
        expect(deleteModal).toBeInTheDocument();
        expect(deleteModal).toHaveTextContent("Delete Modal for ID: 2");
    });
});