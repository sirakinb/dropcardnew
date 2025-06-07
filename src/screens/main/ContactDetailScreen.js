import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getInitials, getAvatarColor, formatLastContact } from '../../utils/contactUtils';

export default function ContactDetailScreen({ route, navigation }) {
  const { contact } = route.params;
  const [showAIModal, setShowAIModal] = useState(false);

  const handlePhonePress = () => {
    if (contact.phone) {
      Linking.openURL(`tel:${contact.phone}`);
    }
  };

  const handleEmailPress = () => {
    if (contact.email) {
      Linking.openURL(`mailto:${contact.email}`);
    }
  };

  const handleWebsitePress = () => {
    if (contact.website) {
      const url = contact.website.startsWith('http') ? contact.website : `https://${contact.website}`;
      Linking.openURL(url);
    }
  };

  const ContactInfoItem = ({ icon, label, value, onPress, isClickable = false }) => {
    if (!value) return null;

    const ItemComponent = isClickable ? TouchableOpacity : View;
    
    return (
      <ItemComponent style={styles.infoItem} onPress={onPress} activeOpacity={isClickable ? 0.7 : 1}>
        <View style={styles.infoIcon}>
          <Ionicons name={icon} size={20} color="#7C3AED" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={[styles.infoValue, isClickable && styles.clickableValue]}>
            {value}
          </Text>
        </View>
        {isClickable && (
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        )}
      </ItemComponent>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('AddContact', {
            editMode: true,
            contactData: contact
          })}
        >
          <Ionicons name="create-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={[styles.largeAvatar, { backgroundColor: getAvatarColor(contact.name) }]}>
            <Text style={styles.largeAvatarText}>{getInitials(contact.name)}</Text>
          </View>
          
          <Text style={styles.contactName}>{contact.name}</Text>
          
          {(contact.title || contact.company) && (
            <Text style={styles.contactPosition}>
              {contact.title && contact.company 
                ? `${contact.title} at ${contact.company}`
                : contact.title || contact.company
              }
            </Text>
          )}

          <Text style={styles.lastContactDate}>
            Met: {formatLastContact(contact.met_at)}
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.sectionContent}>
            <ContactInfoItem
              icon="mail-outline"
              label="Email"
              value={contact.email}
              isClickable={false}
            />
            <ContactInfoItem
              icon="call-outline"
              label="Phone"
              value={contact.phone}
              isClickable={false}
            />
            <ContactInfoItem
              icon="globe-outline"
              label="Website"
              value={contact.website}
              isClickable={false}
            />
          </View>
        </View>

        {/* Professional Information */}
        {(contact.title || contact.company) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional</Text>
            <View style={styles.sectionContent}>
              <ContactInfoItem
                icon="briefcase-outline"
                label="Title"
                value={contact.title}
              />
              <ContactInfoItem
                icon="business-outline"
                label="Company"
                value={contact.company}
              />
            </View>
          </View>
        )}

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {contact.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        {contact.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{contact.notes}</Text>
            </View>
          </View>
        )}

        {/* Enhance with AI Button */}
        <View style={styles.aiSection}>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => setShowAIModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.aiButtonContent}>
              <View style={styles.aiIcon}>
                <Ionicons name="sparkles" size={24} color="#ffffff" />
              </View>
              <View style={styles.aiTextContainer}>
                <Text style={styles.aiButtonTitle}>Enhance with AI</Text>
                <Text style={styles.aiButtonSubtitle}>Generate smart contact insights</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* AI Coming Soon Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAIModal}
        onRequestClose={() => setShowAIModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="sparkles" size={48} color="#7C3AED" />
            </View>
            <Text style={styles.modalTitle}>Coming Soon</Text>
            <Text style={styles.modalMessage}>
              AI-powered contact enhancement is on its way! This feature will provide intelligent insights about your contacts, and help you build stronger relationships.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowAIModal(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  largeAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  largeAvatarText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '700',
  },
  contactName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  contactPosition: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  lastContactDate: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  clickableValue: {
    color: '#7C3AED',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  notesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  aiSection: {
    marginTop: 32,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  aiButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  aiButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  aiButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  modalButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
}); 