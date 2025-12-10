import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function PublicRoute({ children }) {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // If user is logged in → redirect to chat page
  useEffect(() => {
    if (user) {
      navigate("/chat");
    }
  }, [user]);

  return children;
}
