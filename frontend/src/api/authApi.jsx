import axiosClient from "./axiosClient";

export const register = (data) =>
  axiosClient.post("/auth/register", data);

export const login = (data) =>
  axiosClient.post("/auth/login", data);

export const forgotPassword = (data) =>
  axiosClient.post("/auth/forgot-password", data);

export const resetPassword = (data) =>
  axiosClient.post("/auth/reset-password", data);

export const refreshToken = (data) =>
  axiosClient.post("/auth/refresh", data);