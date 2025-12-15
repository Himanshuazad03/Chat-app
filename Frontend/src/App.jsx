import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import ChatForm from "./pages/chatForm/ChatForm";
import Signup from "./pages/Signup/Signup";
import ProtectedRoute from "./components/Protected/Protected";
import axios from "axios";
import store from "./Store/store.js";
import { logout } from "./Store/authSlice";
import PublicRoute from "./components/Protected/Public.js";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
