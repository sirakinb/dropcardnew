import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { contactService } from '../../services/database';

export default function AddContactScreen({ navigation, route }) {
  const { editMode = false, contactData = null } = route.params || {};
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    notes: '',
    tags: [],
  });
  
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form with contact data if editing
  useEffect(() => {
    if (editMode && contactData) {
      setFormData({
        name: contactData.name || '',
        email: contactData.email || '',
        phone: contactData.phone || '',
        company: contactData.company || '',
        title: contactData.title || '',
        notes: contactData.notes || '',
        tags: contactData.tags || [],
      });
    }
  }, [editMode, contactData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    // More flexible phone validation for international formats
    // Remove all non-digit characters except + at the start
    const digitsOnly = phone.replace(/[^\d+]/g, '').replace(/\+(.*)/, '+$1');
    
    // Check if it starts with + (international) or is domestic
    const internationalRegex = /^\+\d{7,15}$/; // International: + followed by 7-15 digits
    const domesticRegex = /^\d{7,15}$/; // Domestic: 7-15 digits
    
    // Allow various formatting with parentheses, spaces, dashes, dots
    const formatRegex = /^[\+]?[\d\s\-\(\)\.]{7,}$/;
    
    // First check if format is acceptable, then check digit count
    if (!formatRegex.test(phone)) {
      return false;
    }
    
    // Extract only digits (keeping + if present)
    const cleanNumber = phone.replace(/[^\d+]/g, '');
    
    return internationalRegex.test(cleanNumber) || domesticRegex.test(cleanNumber);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Map specific errors to user-friendly messages
  const getErrorMessage = (error, editMode) => {
    if (!error) return `Failed to ${editMode ? 'update' : 'create'} contact. Please try again.`;
    
    const errorString = error.toString().toLowerCase();
    
    // Network and connection errors
    if (errorString.includes('network') || errorString.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    // Authentication errors
    if (errorString.includes('unauthorized') || errorString.includes('auth')) {
      return 'Authentication expired. Please log out and log back in.';
    }
    
    // Validation errors
    if (errorString.includes('validation') || errorString.includes('invalid')) {
      return 'Please check that all required fields are filled correctly.';
    }
    
    // Duplicate errors
    if (errorString.includes('duplicate') || errorString.includes('already exists')) {
      return 'A contact with this information already exists.';
    }
    
    // Permission errors
    if (errorString.includes('permission') || errorString.includes('forbidden')) {
      return 'You don\'t have permission to perform this action.';
    }
    
    // Database errors
    if (errorString.includes('database') || errorString.includes('sql')) {
      return 'Database error occurred. Please try again in a moment.';
    }
    
    // Rate limiting
    if (errorString.includes('rate limit') || errorString.includes('too many')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    
    // Server errors
    if (errorString.includes('server') || errorString.includes('5')) {
      return 'Server is temporarily unavailable. Please try again later.';
    }
    
    // Default fallback with the actual error if it's user-readable
    if (error.length < 100 && !errorString.includes('error:') && !errorString.includes('exception')) {
      return `${editMode ? 'Update' : 'Creation'} failed: ${error}`;
    }
    
    return `Failed to ${editMode ? 'update' : 'create'} contact. Please try again.`;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let result;
      
      if (editMode) {
        result = await contactService.updateContact(contactData.id, formData);
      } else {
        result = await contactService.createContact(formData);
      }

      if (result.error) {
        const errorMessage = getErrorMessage(result.error, editMode);
        const error = new Error(errorMessage);
        error.originalError = result.error;
        error.isUserFriendly = true;
        throw error;
      }

      Alert.alert(
        'Success',
        `Contact ${editMode ? 'updated' : 'created'} successfully`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Error saving contact:', error.originalError || error);
      
      // Use user-friendly message if available, otherwise generate one
      const errorMessage = error.isUserFriendly 
        ? error.message 
        : getErrorMessage(error.message, editMode);
      
      Alert.alert(
        'Error', 
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => handleSave()
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete "${formData.name}"? This action cannot be undone.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await contactService.deleteContact(contactData.id);
              if (result.error) {
                throw new Error(result.error);
              }
              
              Alert.alert(
                'Contact Deleted',
                'Contact has been deleted successfully',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back to the main tabs and specifically to the Contacts tab
                      navigation.reset({
                        index: 0,
                        routes: [
                          {
                            name: 'MainTabs',
                            state: {
                              routes: [
                                { name: 'Share' },
                                { name: 'Cards' },
                                { name: 'Contacts' },
                                { name: 'Scan' },
                                { name: 'Settings' }
                              ],
                              index: 2, // Contacts tab is at index 2
                            },
                          },
                        ],
                      });
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert(
                'Error',
                'Failed to delete contact. Please try again.',
                [
                  {
                    text: 'Try Again',
                    onPress: () => handleDelete()
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  }
                ]
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderFormField = (label, field, placeholder, options = {}) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label}
        {options.required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          errors[field] && styles.inputError
        ]}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={options.keyboardType || 'default'}
        autoCapitalize={options.autoCapitalize || 'words'}
        multiline={options.multiline}
        numberOfLines={options.numberOfLines}
        textAlignVertical={options.multiline ? 'top' : 'center'}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        
        <Text style={styles.title}>
          {editMode ? 'Edit Contact' : 'Add Contact'}
        </Text>
        
        <TouchableOpacity
          style={[
            styles.saveButton,
            loading && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {renderFormField('Name', 'name', 'Enter full name', { required: true })}
        
        {renderFormField('Email', 'email', 'Enter email address', { 
          keyboardType: 'email-address',
          autoCapitalize: 'none'
        })}
        
        {renderFormField('Phone', 'phone', 'Enter phone number', { 
          keyboardType: 'phone-pad' 
        })}
        
        {renderFormField('Company', 'company', 'Enter company name')}
        
        {renderFormField('Title', 'title', 'Enter job title')}
        
        {renderFormField('Notes', 'notes', 'Add any additional notes...', {
          multiline: true,
          numberOfLines: 4
        })}

        {/* Tags Section */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Tags</Text>
          
          {/* Add Tag Input */}
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add a tag..."
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={addTag}
              disabled={!tagInput.trim()}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          {/* Current Tags */}
          {formData.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {formData.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity
                    onPress={() => removeTag(tag)}
                    style={styles.removeTagButton}
                  >
                    <Ionicons name="close" size={14} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          <Text style={styles.tagHint}>
            Tags help organize and filter your contacts
          </Text>
        </View>

        {/* Delete Button - Only show in edit mode */}
        {editMode && (
          <View style={styles.deleteSection}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={20} color="#ffffff" />
              <Text style={styles.deleteButtonText}>Delete Contact</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  addTagButton: {
    backgroundColor: '#111827',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  removeTagButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagHint: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 40,
  },
  deleteSection: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 