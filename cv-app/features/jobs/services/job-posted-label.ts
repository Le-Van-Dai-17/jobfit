const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatJobPostedLabel(postedAt: Date, now = new Date()) {
  const elapsedMs = Math.max(0, now.getTime() - postedAt.getTime());
  const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000));

  if (elapsedMinutes < 5) return "Vừa đăng";
  if (elapsedMinutes < 60) return `${elapsedMinutes} phút trước`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} giờ trước`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return `${elapsedDays} ngày trước`;

  return `Đăng ${dateFormatter.format(postedAt)}`;
}
