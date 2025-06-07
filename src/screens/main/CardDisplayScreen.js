import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

export default function CardDisplayScreen({ navigation, route }) {
  const { cardData = {}, avatar: initialAvatar } = route.params || {};
  const [avatar, setAvatar] = useState(initialAvatar || null);

  // Handle missing card data case
  if (!cardData || Object.keys(cardData).length === 0) {
    navigation.goBack();
    return null;
  }

  const qrData = (() => {
    try {
      const data = JSON.stringify({
        name: cardData?.name || 'John Doe',
        title: cardData?.title || 'Product Designer',
        company: cardData?.company || '',
        email: cardData?.email || '',
        phone: cardData?.phone || '',
        website: cardData?.website || '',
      });
      
      // QR codes have size limits - approximately 2953 bytes for QR version 40
      if (data.length > 2000) {
        console.warn('QR data may be too large for reliable scanning');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating QR data:', error);
      return JSON.stringify({ name: cardData?.name || 'John Doe' });
    }
  })();

  const handleEdit = () => {
    navigation.navigate('CreateCard', { 
      userName: cardData?.name,
      editMode: true,
      cardData,
      avatar 
    });
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share card');
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    console.log('Preview card');
  };

  const handleMore = () => {
    // TODO: Implement more options
    console.log('More options');
  };

  const handleSaveChanges = () => {
    try {
      // TODO: Save changes to Supabase
      navigation.navigate('MainTabs');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.content}>
        <Text style={styles.title}>Your DropCard</Text>

        {/* Card Container */}
        <View style={styles.cardContainer}>
          {/* QR Code */}
          <View style={styles.qrSection}>
            <QRCode
              value={qrData}
              size={200}
              color="#000000"
              backgroundColor="transparent"
            />
          </View>

          <Text style={styles.scanText}>Scan to share card</Text>

          {/* User Info */}
          <View style={styles.userInfo}>
            {avatar && (
              <Image 
                source={{ uri: avatar }} 
                style={styles.avatar}
                onError={(error) => {
                  console.warn('Avatar failed to load:', error);
                  setAvatar(null); // Clear invalid avatar
                }}
              />
            )}
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{cardData?.name || 'John Doe'}</Text>
              <Text style={styles.userTitle}>{cardData?.title || 'Product Designer'}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
              <Ionicons name="create-outline" size={20} color="#374151" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handlePreview}>
              <Ionicons name="eye-outline" size={20} color="#374151" />
              <Text style={styles.actionText}>Preview</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#374151" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleMore}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#374151" />
              <Text style={styles.actionText}>More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 40,
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scanText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  saveButton: {
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 