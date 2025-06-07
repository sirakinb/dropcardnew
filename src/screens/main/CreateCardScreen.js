import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { businessCardService } from '../../services/database';

export default function CreateCardScreen({ navigation, route }) {
  const { userName, editMode, cardData, avatar: initialAvatar } = route.params || {};
  
  const [formData, setFormData] = useState({
    name: userName || cardData?.name || '',
    title: cardData?.title || '',
    company: cardData?.company || '',
    email: cardData?.email || '',
    phone: cardData?.phone || '',
    website: cardData?.website || '',
    theme_color: cardData?.theme_color || '#000000',
  });
  const [errors, setErrors] = useState({});
  const [avatar, setAvatar] = useState(initialAvatar || null);
  const [loading, setLoading] = useState(false);

  // Available theme colors
  const themeColors = [
    '#000000', // Black
    '#1F2937', // Dark Gray
    '#DC2626', // Red
    '#EA580C', // Orange
    '#CA8A04', // Yellow
    '#16A34A', // Green
    '#0EA5E9', // Blue
    '#7C3AED', // Purple
    '#C2410C', // Brown
    '#0F766E', // Teal
  ];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validateWebsite = (website) => {
    if (!website) return true; // Optional field
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlRegex.test(website);
  };
  
  const validatePhone = (phone) => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/; // Basic international format
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.website && !validateWebsite(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePick = async () => {
    try {
      // Show action sheet for camera vs photo library
      Alert.alert(
        'Upload Photo',
        'Choose how you\'d like to add a photo',
        [
          { text: 'Camera', onPress: () => pickFromCamera() },
          { text: 'Photo Library', onPress: () => pickFromLibrary() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Image picker initialization error:', error);
      Alert.alert('Error', 'Failed to open photo picker. Please try again.');
    }
  };

  const pickFromCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow camera access to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('Image Too Large', 'Please take a smaller photo.');
          return;
        }
        setAvatar(asset.uri);
      }
    } catch (error) {
      console.error('Camera picker error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickFromLibrary = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload a photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('Image Too Large', 'Please select an image smaller than 5MB.');
          return;
        }
        setAvatar(asset.uri);
      }
    } catch (error) {
      console.error('Library picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handlePreview = () => {
    if (!validateForm()) {
      Alert.alert('Please Fix Errors', 'Please correct the highlighted fields before previewing.');
      return;
    }
    navigation.navigate('CardDisplay', { cardData: formData, avatar });
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Please Fix Errors', 'Please correct the highlighted fields before saving.');
      return;
    }

    try {
      setLoading(true);
      
      let result;
      if (editMode && cardData?.id) {
        // Update existing card
        result = await businessCardService.updateCard(cardData.id, formData);
      } else {
        // Create new card
        result = await businessCardService.createCard(formData);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      Alert.alert(
        'Success!', 
        editMode ? 'Card updated successfully!' : 'Card created successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('MainTabs', { screen: 'Cards' })
          }
        ]
      );
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(
        'Save Error', 
        error.message || 'Failed to save card. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {editMode ? 'Edit Your Card' : 'Create Your Card'}
          </Text>
          <Text style={styles.subtitle}>
            {editMode ? 'Update your digital identity' : 'Build your digital identity'}
          </Text>
        </View>

        {/* Photo Upload */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoUpload} onPress={handleImagePick}>
            {avatar ? (
              <Image 
                source={{ uri: avatar }} 
                style={styles.avatarImage}
                onError={() => {
                  console.warn('Avatar failed to load');
                  setAvatar(null);
                }}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={48} color="#9CA3AF" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
            <Ionicons name="camera" size={16} color="#6B7280" />
            <Text style={styles.uploadText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="John Doe"
              placeholderTextColor="#9CA3AF"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              autoCapitalize="words"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Product Designer"
              placeholderTextColor="#9CA3AF"
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Company</Text>
            <TextInput
              style={styles.input}
              placeholder="Company Name"
              placeholderTextColor="#9CA3AF"
              value={formData.company}
              onChangeText={(value) => updateFormData('company', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="your@email.com"
              placeholderTextColor="#9CA3AF"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="(555) 123-4567"
              placeholderTextColor="#9CA3AF"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={[styles.input, errors.website && styles.inputError]}
              placeholder="www.example.com"
              placeholderTextColor="#9CA3AF"
              value={formData.website}
              onChangeText={(value) => updateFormData('website', value)}
              keyboardType="url"
              autoCapitalize="none"
            />
            {errors.website && <Text style={styles.errorText}>{errors.website}</Text>}
          </View>

          {/* Theme Color Selection */}
          <View style={styles.field}>
            <Text style={styles.label}>Card Theme</Text>
            <Text style={styles.fieldDescription}>Choose a color theme for your business card</Text>
            <View style={styles.colorPicker}>
              {themeColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    formData.theme_color === color && styles.selectedColor
                  ]}
                  onPress={() => updateFormData('theme_color', color)}
                >
                  {formData.theme_color === color && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.previewButton} onPress={handlePreview}>
            <Text style={styles.previewButtonText}>Preview Card</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.buttonDisabled]} 
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : editMode ? 'Update Card' : 'Save Card'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoUpload: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
    overflow: 'hidden',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#6B7280',
  },
  form: {
    marginBottom: 32,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
  previewButton: {
    height: 52,
    backgroundColor: '#F3F4F6',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    height: 52,
    backgroundColor: '#000000',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  fieldDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#000000',
  },
}); 
