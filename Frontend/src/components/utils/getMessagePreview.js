export const getMessagePreview = (msg) => {
  if (!msg) return "";

  if (msg.isImage) return "📷 Photo";
  if (msg.isVideo) return "📹 Video";

  if (msg.content?.trim()) return msg.content;

  return "";
}