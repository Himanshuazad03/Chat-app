import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import ChatForm from "./pages/chatForm/ChatForm";
import Signup from "./pages/Signup/Signup";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<ChatForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
