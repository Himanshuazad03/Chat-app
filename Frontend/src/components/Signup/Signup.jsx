import React, { useState } from "react";
import { Link } from "react-router-dom";
import SnakeMessage from "../SnakeMessage/SnakeMessage";
import { uploadToCloudinary } from "../utils/UploadToCloud";
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
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Alert, Snackbar } from "@mui/material";
import api from "../../api/axios";

const SignupForm = () => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      image: null,
    },
  });

  const [showPass, setShowPass] = useState(false);
  const [uploadImage, setUploadImage] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const navigate = useNavigate();

  const passwordValue = watch("password");

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return null;

    field.onChange(file);

    setUploadImage(true);

    try {
      const url = await uploadToCloudinary(file);


      // store url in hook form
      setValue("image", url, { shouldValidate: true }); // ✅ Cloudinary image URL
    } catch (err) {
      console.log("Cloudinary Upload Error:", err);
      setUploadImage(false);
      setSnack({
        open: true,
        message: "Image Upload Failed. Try again!",
        type: "error",
      });
      return null;
    }
    setUploadImage(false);
  };

  const submitHandler = async (data) => {
    try {
      const res = await api.post("/api/user/register", data);
      setSnack({
        open: true,
        type: "success",
        message: "Registration Successful",
      });

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.log("error", error.message);
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
        <Stack spacing={2}>
          {/* Heading */}
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={600} textAlign="center">
              Create Account
            </Typography>
            <Typography variant="body1" fontWeight={400} textAlign="center">
              Sign up to get started
            </Typography>
          </Stack>

          <Stack spacing={2}>
            {/* NAME */}
            <Controller
              name="name"
              control={control}
              rules={{
                required: "Name is required",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            {/* EMAIL */}
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
                  type="email"
                  label="Email Address"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            {/* PASSWORD */}
            <FormControl fullWidth variant="outlined" error={!!errors.password}>
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
                    type={showPass ? "text" : "password"}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPass(!showPass)}
                          edge="end"
                        >
                          {showPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Password"
                  />
                )}
              />

              {errors.password && (
                <FormHelperText>{errors.password.message}</FormHelperText>
              )}
            </FormControl>

            {/* CONFIRM PASSWORD */}
            <FormControl
              fullWidth
              variant="outlined"
              error={!!errors.confirmPassword}
            >
              <InputLabel>Confirm Password</InputLabel>

              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: "Confirm password is required",
                  validate: (value) =>
                    value === passwordValue || "Passwords must match",
                }}
                render={({ field }) => (
                  <OutlinedInput
                    {...field}
                    type={showConfirmPass ? "text" : "password"}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          edge="end"
                        >
                          {showConfirmPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Confirm Password"
                  />
                )}
              />

              {errors.confirmPassword && (
                <FormHelperText>
                  {errors.confirmPassword.message}
                </FormHelperText>
              )}
            </FormControl>

            {/* IMAGE UPLOAD */}
            <Controller
              name="imageFile"
              control={control}
              render={({ field }) => (
                <>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ textTransform: "none" }}
                  >
                    Upload Profile Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={async (e) => handleImageUpload(e, field)}
                    />
                  </Button>
                  {field.value && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: "text.secondary" }}
                    >
                      Selected: {field.value.name}
                    </Typography>
                  )}
                  {errors.imageFile && (
                    <FormHelperText error>
                      {errors.imageFile.message}
                    </FormHelperText>
                  )}
                </>
              )}
            />

            {/* SIGNUP BUTTON */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{ py: 1.2, textTransform: "none", fontWeight: 600 }}
              disabled={uploadImage}
            >
              {uploadImage ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Sign Up"
              )}
            </Button>
          </Stack>

          {/* LINK TO LOGIN */}
          <Typography variant="body2" fontWeight={400} textAlign="center">
            Already have an account{" "}
            <Link className="text-blue-700 no-underline hover:underline" to="/">
              Login
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

export default SignupForm;
