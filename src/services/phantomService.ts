import api from "./api";
import type { ApiResponse } from "../types/api";
import type {
    RevenueReportRequest,
    RevenueReportResponse,
} from "../types/phantom";

export const phantomService = {
    // Manager: Revenue Report Generation
    exportRevenueReportUnsafe: async (request: RevenueReportRequest) => {
        const response = await api.post<ApiResponse<RevenueReportResponse>>(
            "/concurrency/phantom/revenue-report-unsafe",
            request
        );
        return response.data;
    },

    exportRevenueReportSafe: async (request: RevenueReportRequest) => {
        const response = await api.post<ApiResponse<RevenueReportResponse>>(
            "/concurrency/phantom/revenue-report-safe",
            request
        );
        return response.data;
    },
};
