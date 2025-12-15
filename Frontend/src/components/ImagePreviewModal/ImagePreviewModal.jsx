import { Modal, Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ImagePreviewModal = ({ open, imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "90vw",
          maxHeight: "90vh",
          outline: "none",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            color: "white",
          }}
        >
          <CloseIcon />
        </IconButton>

        <img
          src={imageUrl}
          alt="preview"
          style={{
            maxWidth: "100%",
            maxHeight: "90vh",
            borderRadius: "8px",
          }}
        />
      </Box>
    </Modal>
  );
};

export default ImagePreviewModal;
