import { Snackbar, Alert } from "@mui/material";

function SnakeMessage({ open, message, type, onClose }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={1500}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity={type} variant="filled" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default SnakeMessage;
