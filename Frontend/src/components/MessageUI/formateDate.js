function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();

  const isToday = date.toDateString() === today.toDateString();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString();
}

export default formatDate;