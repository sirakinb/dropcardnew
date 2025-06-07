// Contact utility functions to eliminate code duplication

/**
 * Generate initials from contact name
 * @param {string} name - The contact's name
 * @returns {string} - The initials (max 2 characters) or '?' if invalid
 */
export const getInitials = (name) => {
  // Check if name is undefined, null, not a string, or empty/whitespace only
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return '?';
  }
  
  try {
    return name
      .trim()
      .split(' ')
      .filter(word => word.length > 0) // Remove empty strings from split
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || '?'; // Fallback if result is empty
  } catch (error) {
    return '?'; // Fallback for any unexpected errors
  }
};

/**
 * Generate a color based on the contact's name
 * @param {string} name - The contact's name
 * @returns {string} - A hex color code
 */
export const getAvatarColor = (name) => {
  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
  ];
  
  // Handle undefined, null, non-string, or empty/whitespace-only names
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return colors[0]; // Return default color (red)
  }
  
  try {
    const trimmedName = name.trim();
    const index = trimmedName.length % colors.length;
    return colors[index];
  } catch (error) {
    return colors[0]; // Fallback for any unexpected errors
  }
};

/**
 * Format the last contact date into a human-readable string
 * @param {string|Date} date - The last contact date
 * @returns {string} - A formatted string indicating when the contact was last met
 */
export const formatLastContact = (date) => {
  if (!date) return 'No recent contact';
  
  const contactDate = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now - contactDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}; 