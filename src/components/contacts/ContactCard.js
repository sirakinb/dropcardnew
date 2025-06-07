import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ContactCard({ contact, onPress, onEdit, onDelete }) {
  // Generate initials from contact name
  const getInitials = (name) => {
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

  // Generate a color based on the contact's name
  const getAvatarColor = (name) => {
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

  const formatLastContact = (date) => {
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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(contact)}
      activeOpacity={0.7}
    >
      {/* Main Contact Info */}
      <View style={styles.content}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(contact.name) }]}>
          <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
        </View>

        {/* Contact Details */}
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>
            {contact.name}
          </Text>
          
          {contact.title && contact.company ? (
            <Text style={styles.position} numberOfLines={1}>
              {contact.title} at {contact.company}
            </Text>
          ) : contact.title ? (
            <Text style={styles.position} numberOfLines={1}>
              {contact.title}
            </Text>
          ) : contact.company ? (
            <Text style={styles.position} numberOfLines={1}>
              {contact.company}
            </Text>
          ) : null}

          {contact.email && (
            <Text style={styles.email} numberOfLines={1}>
              {contact.email}
            </Text>
          )}

          {contact.phone && (
            <Text style={styles.phone} numberOfLines={1}>
              {contact.phone}
            </Text>
          )}

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {contact.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {contact.tags.length > 2 && (
                <View style={styles.moreTagsIndicator}>
                  <Text style={styles.moreTagsText}>+{contact.tags.length - 2}</Text>
                </View>
              )}
            </View>
          )}

          {/* Notes Preview */}
          {contact.notes && (
            <Text style={styles.notes} numberOfLines={2}>
              {contact.notes}
            </Text>
          )}

          {/* Last Contact */}
          <Text style={styles.lastContact}>
            Met: {formatLastContact(contact.met_at)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(event) => {
            event.stopPropagation();
            onEdit && onEdit(contact);
          }}
        >
          <Ionicons name="create-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(event) => {
            event.stopPropagation();
            onDelete && onDelete(contact);
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  details: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  position: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 1,
  },
  phone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 4,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  moreTagsIndicator: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  moreTagsText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  notes: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 6,
    lineHeight: 18,
  },
  lastContact: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});

// PropTypes validation
ContactCard.propTypes = {
  // Contact object is required and must contain a name
  contact: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired, // Name is required
    email: PropTypes.string,
    phone: PropTypes.string,
    company: PropTypes.string,
    title: PropTypes.string,
    notes: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    met_at: PropTypes.string, // ISO date string
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    user_id: PropTypes.string,
    voice_note_url: PropTypes.string,
  }).isRequired,
  
  // Optional callback functions
  onPress: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

// Default props for optional callbacks
ContactCard.defaultProps = {
  onPress: null,
  onEdit: null,
  onDelete: null,
};
