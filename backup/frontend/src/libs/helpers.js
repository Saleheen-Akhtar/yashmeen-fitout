// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format date with time
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Calculate average rating
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews?.reduce((acc, review) => acc + review?.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

// Get rating distribution
export const getRatingDistribution = (reviews) => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach(review => {
    distribution[review.rating]++;
  });

  return Object.entries(distribution).map(([rating, count]) => ({
    rating: Number(rating),
    count,
    percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0
  }));
};

const AUTH_EXPIRED_MESSAGES = new Set([
  "jwt expired",
  "invalid signature",
  "Invalid or expired session",
  "No token provided!",
  "Not authorized, no token provided",
  "Account not found",
  "Session expired, please log in again",
  "Not authorized, invalid or expired token",
]);

export const tokenExpired = (text) => {
  if (AUTH_EXPIRED_MESSAGES.has(text)) {
    try {
      localStorage.removeItem("user");
    } catch {
      /* ignore */
    }
    try {
      sessionStorage.removeItem("user");
    } catch {
      /* ignore */
    }
    window.location.reload();
  }
};

// Mon-Fri 8:30am - 6:00pm Asia/Dubai (GST)
export const getDubaiAtelierStatus = (now = new Date()) => {
  try {
    const timeStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dubai",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now);

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dubai",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const map = {};
    for (const part of parts) {
      map[part.type] = part.value;
    }

    const weekday = map.weekday || "";
    const hourNum = Number.parseInt(map.hour ?? "0", 10) % 24;
    const minNum = Number.parseInt(map.minute ?? "0", 10);
    const totalMinutes = hourNum * 60 + minNum;
    const isWeekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday);
    const isOpen = isWeekday && totalMinutes >= 510 && totalMinutes < 1080;

    return { dubaiTime: timeStr, isOpen };
  } catch {
    return { dubaiTime: "Dubai, UAE", isOpen: false };
  }
};