import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  console.log(user);
  useEffect(()=>{
    if (!user) {
      navigate("/");
    }
  }, [user]);

  return children;
}
