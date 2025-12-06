import React from "react";
import { Login } from "../../components";
import { Box } from "@mui/material";

function Home() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(to bottom right, #dbeafe, #bfdbfe, #93c5fd)",
        overflow: "hidden",
      }}
    >
      <Login />
    </Box>
  );
}

export default Home;
