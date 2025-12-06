import React from "react";
import { SignupForm } from "../../components";
import { Box } from "@mui/material";

function Signup() {
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
        <SignupForm/>
    </Box>
  );
}

export default Signup;
