// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// Authentication
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  idCardNumber: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  customerTypeId: number;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

export interface User {
  userId: number;
  username: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}
