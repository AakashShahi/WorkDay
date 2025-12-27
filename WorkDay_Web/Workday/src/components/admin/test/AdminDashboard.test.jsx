import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AdminDashboard from "../AdminDashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthContextProvider from "../../../auth/AuthProvider";

jest.mock('recharts', () => {
    const OriginalModule = jest.requireActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }) => (
            <div className="recharts-responsive-container" style={{ width: 800, height: 300 }}>
                {children}
            </div>
        ),
    };
});


// Mock all required hooks
jest.mock("../../../hooks/admin/useAdminUser", () => ({
    useAdminUsers: () => ({
        users: [
            { role: "customer", createdAt: new Date() },
            { role: "worker", createdAt: new Date() },
        ],
        isLoading: false,
        isError: false,
    }),
}));

jest.mock("../../../hooks/admin/useAdminProfession", () => ({
    useAdminProfession: () => ({
        professions: [{ name: "Electrician" }, { name: "Plumber" }],
        isLoading: false,
        isError: false,
    }),
}));

jest.mock("../../../hooks/admin/useAdminVerification", () => ({
    useGetVerificationRequests: () => ({
        verifications: [{}, {}],
        isLoading: false,
        isError: false,
    }),
}));

jest.mock("../../../hooks/admin/useAdminReview", () => ({
    useGetAllReviews: () => ({
        reviews: [],
        pagination: { total: 10 },
        isLoading: false,
        isError: false,
    }),
}));

jest.mock("../../../hooks/admin/useAdminJob", () => ({
    useAdminJob: () => ({
        jobs: [{ createdAt: new Date() }],
        isLoading: false,
        isError: false,
    }),
}));

const renderWithProviders = (ui) => {
    const queryClient = new QueryClient();
    return render(
        <AuthContextProvider>
            <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
        </AuthContextProvider>
    );
};

describe("AdminDashboard", () => {
    it("renders dashboard with stats and charts", async () => {
        renderWithProviders(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByText("Dashboard Overview")).toBeInTheDocument();
            expect(screen.getByText("Total Customers")).toBeInTheDocument();
            expect(screen.getByText("Total Workers")).toBeInTheDocument();
            expect(screen.getByText("Total Jobs")).toBeInTheDocument();
            expect(screen.getByText(/Monthly New User Registrations/)).toBeInTheDocument();
            expect(screen.getByText(/Monthly Job Posts/)).toBeInTheDocument();
        });
    });
});
