import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { login, logout } from "../../Store/authSlice.js";
import { useDispatch } from "react-redux";
import SnakeMessage from "../SnakeMessage/SnakeMessage.jsx";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Stack,
  Paper,
  Typography,
  FormHelperText,
  Alert,
  Snackbar,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { Visibility, VisibilityOff } from "@mui/icons-material";
axios.defaults.withCredentials = true;
const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const submitHandler = async (data) => {
    try {
      const res = await axios.post("/api/user/login", data, {
        withCredentials: true,
      });
      dispatch(login({ user: res.data.user, token: res.data.user.token }));
      setSnack({
        open: true,
        type: "success",
        message: "Login Successful",
      });
      setTimeout(() => {
        navigate("/chat");
      }, 1000);
    } catch (error) {
      console.log("error", error.response.data.message);
      setSnack({
        open: true,
        type: "error",
        message: error.response.data.message,
      });
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 470,
        width: "100%",
        mx: "auto",
        borderRadius: 3,
        backgroundColor: "#f9fafb",
      }}
    >
      <form onSubmit={handleSubmit(submitHandler)}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={600} textAlign="center">
              Welcome Back
            </Typography>
            <Typography variant="body1" fontWeight={400} textAlign="center">
              Login to continue
            </Typography>
          </Stack>

          <Stack spacing={3}>
            {/* EMAIL FIELD */}
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email Address"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            {/* PASSWORD FIELD */}
            <FormControl variant="outlined" fullWidth error={!!errors.password}>
              <InputLabel>Password</InputLabel>

              <Controller
                name="password"
                control={control}
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                }}
                render={({ field }) => (
                  <OutlinedInput
                    {...field}
                    type={show ? "text" : "password"}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShow(!show)} edge="end">
                          {show ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Password"
                  />
                )}
              />

              {/* password helper text */}
              {errors.password && (
                <FormHelperText>{errors.password.message}</FormHelperText>
              )}
            </FormControl>

            {/* LOGIN BUTTON */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{ py: 1.2, textTransform: "none", fontWeight: 600 }}
              disabled={loading}
            >
              Login
            </Button>

            {/* GUEST CREDENTIALS */}
            <Button
              variant="outlined"
              color="error"
              size="large"
              fullWidth
              sx={{ py: 1.2, textTransform: "none", fontWeight: 500 }}
              onClick={async () => {
                setValue("email", "guest@example.com");
                setValue("password", "123456");
                await trigger(); // sync UI and validation
              }}
            >
              Use Guest Credentials
            </Button>
          </Stack>

          <Typography variant="body2" fontWeight={400} textAlign="center">
            Don’t have an account{" "}
            <Link
              className="text-blue-700 no-underline hover:underline"
              to="/signup"
            >
              Sign Up
            </Link>
          </Typography>
        </Stack>
      </form>
      <SnakeMessage
        open={snack.open}
        message={snack.message}
        type={snack.type}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </Paper>
  );
};

export default LoginForm;
