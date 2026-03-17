import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAuthCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/");
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.clear();
        alert("Phiên đăng nhập hết hạn!");
        navigate("/");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);
}