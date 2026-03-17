import axiosClient from "./axiosClient";

export const getUsers = () =>
  axiosClient.get("/admin/users");

export const updateRole = (userId, role) =>
  axiosClient.put(`/admin/users/${userId}/role?role=${role}`);

export const deleteUser = (userId) =>
  axiosClient.delete(`/admin/users/${userId}`);