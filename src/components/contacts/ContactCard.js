import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getInitials, getAvatarColor, formatLastContact } from '../../utils/contactUtils';

export default function ContactCard({ contact, onPress }) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(contact)}
      activeOpacity={0.7}
    >
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

        {/* Website if available */}
        {contact.website && (
          <Text style={styles.website} numberOfLines={1}>
            🌐 {contact.website}
          </Text>
        )}

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {contact.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {contact.tags.length > 3 && (
              <View style={styles.moreTagsIndicator}>
                <Text style={styles.moreTagsText}>+{contact.tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {/* Notes Preview - Show more lines */}
        {contact.notes && (
          <Text style={styles.notes} numberOfLines={3}>
            💭 {contact.notes}
          </Text>
        )}

        {/* Contact Context/Additional Info */}
        {contact.context && (
          <Text style={styles.context} numberOfLines={2}>
            📝 {contact.context}
          </Text>
        )}

        {/* Additional metadata if available */}
        {contact.location && (
          <Text style={styles.metadata} numberOfLines={1}>
            📍 {contact.location}
          </Text>
        )}
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    minHeight: 120,
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
    paddingRight: 8,
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
  website: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
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
  context: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 6,
    lineHeight: 18,
  },
  metadata: {
    fontSize: 12,
    color: '#9CA3AF',
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
    website: PropTypes.string,
    context: PropTypes.string,
    location: PropTypes.string,
  }).isRequired,
  
  // Optional callback functions
  onPress: PropTypes.func,
};

// Default props for optional callbacks
ContactCard.defaultProps = {
  onPress: null,
};
