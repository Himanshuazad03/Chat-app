import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  useEffect(()=>{
    if (!user) {
      navigate("/");
    }else{
      navigate("/chat");
    }
  }, [user]);

  return children;
}
