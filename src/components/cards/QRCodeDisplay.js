import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';

export default function QRCodeDisplay({ 
  cardData, 
  size = 200, 
  showActions = true,
  style 
}) {
  const [qrRef, setQrRef] = useState(null);
  
  // Feature flag for save functionality - set to true when save feature is implemented
  const SAVE_QR_ENABLED = false;

  // Generate QR data
  const generateQRData = () => {
    try {
      // Create a DropCard URL format for better sharing
      const baseData = {
        name: cardData?.name || 'DropCard User',
        title: cardData?.title || '',
        company: cardData?.company || '',
        email: cardData?.email || '',
        phone: cardData?.phone || '',
        website: cardData?.website || '',
        type: 'dropcard'
      };

      const qrString = JSON.stringify(baseData);
      
      // Check QR code size limits
      if (qrString.length > 2000) {
        console.warn('QR data might be too large for reliable scanning');
        // Return minimal data if too large
        return JSON.stringify({
          name: cardData?.name || 'DropCard User',
          email: cardData?.email || '',
          type: 'dropcard'
        });
      }
      
      return qrString;
    } catch (error) {
      console.error('Error generating QR data:', error);
      return JSON.stringify({ 
        name: cardData?.name || 'DropCard User',
        type: 'dropcard'
      });
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out my digital business card: ${cardData?.name || 'DropCard User'}`,
        title: 'Share Business Card'
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share card. Please try again.');
    }
  };

  const handleSaveQR = () => {
    if (qrRef) {
      // TODO: Implement QR code saving to device
      // This would require additional permissions and file system access
      Alert.alert(
        'Save QR Code',
        'QR code saving feature coming soon!',
        [{ text: 'OK' }]
      );
    }
  };

  const qrData = generateQRData();

  return (
    <View style={[styles.container, style]}>
      {/* QR Code */}
      <View style={styles.qrContainer}>
        <QRCode
          value={qrData}
          size={size}
          color="#000000"
          backgroundColor="#ffffff"
          logo={null} // Could add DropCard logo here
          logoSize={size * 0.15}
          logoBackgroundColor="transparent"
          getRef={(ref) => setQrRef(ref)}
          ecl="M" // Error correction level
        />
      </View>

      {/* Instructions */}
      <Text style={styles.instructionText}>
        Point your camera at this QR code to save the contact
      </Text>

      {/* Action Buttons */}
      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color="#111827" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          {SAVE_QR_ENABLED && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleSaveQR}
            >
              <Ionicons name="download-outline" size={20} color="#111827" />
              <Text style={styles.actionText}>Save QR</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* QR Info */}
      <View style={styles.qrInfo}>
        <Text style={styles.infoText}>
          QR Code contains: {cardData?.name || 'Contact information'}
        </Text>
        <Text style={styles.infoSubtext}>
          Data size: {qrData.length} bytes
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  qrInfo: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  infoSubtext: {
    fontSize: 10,
    color: '#D1D5DB',
    marginTop: 2,
  },
}); 