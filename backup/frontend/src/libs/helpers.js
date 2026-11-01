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

export const tokenExpired = (text) => {
    if (text === "jwt expired" || text === "invalid signature" || text === "Invalid or expired session" || text == "No token provided!") {
        localStorage.removeItem("user");
        window.location.reload();
    }
}