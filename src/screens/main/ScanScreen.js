import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Try to import camera, but handle gracefully if not available
let CameraView, useCameraPermissions;
try {
  const cameraModule = require('expo-camera');
  CameraView = cameraModule.CameraView;
  useCameraPermissions = cameraModule.useCameraPermissions;
} catch (error) {
  console.warn('expo-camera not available in this build');
  CameraView = null;
  useCameraPermissions = null;
}

// Import contact service with error handling
let contactService;
try {
  const dbModule = require('../../services/database');
  contactService = dbModule.contactService;
  
  // Verify the service is properly exported
  if (!contactService || typeof contactService.createContact !== 'function') {
    console.error('contactService is not properly exported or missing createContact method');
    contactService = null;
  }
} catch (error) {
  console.error('Error importing database service:', error);
  contactService = null;
}

export default function ScanScreen({ navigation }) {
  // If camera is not available, show error
  if (!CameraView || !useCameraPermissions) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Ionicons name="camera-outline" size={64} color="#9CA3AF" />
          <Text style={styles.errorTitle}>Camera Not Available</Text>
          <Text style={styles.errorMessage}>
            Camera functionality requires a development build with expo-camera included.
          </Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    try {
      // Try to parse QR code data
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (parseError) {
        // If not JSON, try to extract vCard or other format
        parsedData = parseVCard(data) || { raw: data };
      }
      
      console.log('Scanned data:', parsedData);
      setScannedData(parsedData);
      setShowPreview(true);
    } catch (error) {
      console.error('Error processing scanned data:', error);
      Alert.alert('Scan Error', 'Unable to process the scanned QR code.');
      setScanned(false);
    }
  };

  const parseVCard = (data) => {
    // Simple vCard parser for common fields
    if (!data.includes('BEGIN:VCARD')) {
      return null;
    }

    const lines = data.split('\n');
    const vCard = {};
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('FN:')) {
        vCard.name = trimmedLine.substring(3);
      } else if (trimmedLine.startsWith('EMAIL:')) {
        vCard.email = trimmedLine.substring(6);
      } else if (trimmedLine.startsWith('TEL:')) {
        vCard.phone = trimmedLine.substring(4);
      } else if (trimmedLine.startsWith('ORG:')) {
        vCard.company = trimmedLine.substring(4);
      } else if (trimmedLine.startsWith('TITLE:')) {
        vCard.title = trimmedLine.substring(6);
      } else if (trimmedLine.startsWith('URL:')) {
        vCard.website = trimmedLine.substring(4);
      } else if (trimmedLine.startsWith('ADR:')) {
        // Address format: ;;street;city;state;zip;country
        const addressParts = trimmedLine.substring(4).split(';');
        const addressComponents = [];
        if (addressParts[2]) addressComponents.push(addressParts[2]); // street
        if (addressParts[3]) addressComponents.push(addressParts[3]); // city
        if (addressParts[4]) addressComponents.push(addressParts[4]); // state
        if (addressParts[5]) addressComponents.push(addressParts[5]); // zip
        if (addressParts[6]) addressComponents.push(addressParts[6]); // country
        
        if (addressComponents.length > 0) {
          vCard.address = addressComponents.join(', ');
        }
      } else if (trimmedLine.startsWith('NOTE:')) {
        vCard.notes = trimmedLine.substring(5);
      } else if (trimmedLine.startsWith('ROLE:')) {
        vCard.role = trimmedLine.substring(5);
      } else if (trimmedLine.includes('TYPE=WORK') && trimmedLine.includes('TEL:')) {
        vCard.workPhone = trimmedLine.substring(trimmedLine.indexOf('TEL:') + 4);
      } else if (trimmedLine.includes('TYPE=HOME') && trimmedLine.includes('TEL:')) {
        vCard.homePhone = trimmedLine.substring(trimmedLine.indexOf('TEL:') + 4);
      } else if (trimmedLine.includes('TYPE=FAX') && trimmedLine.includes('TEL:')) {
        vCard.fax = trimmedLine.substring(trimmedLine.indexOf('TEL:') + 4);
      } else if (trimmedLine.includes('X-SOCIALPROFILE')) {
        // Handle social media profiles
        if (trimmedLine.includes('linkedin')) {
          vCard.linkedin = trimmedLine.substring(trimmedLine.indexOf('http'));
        } else if (trimmedLine.includes('twitter')) {
          vCard.twitter = trimmedLine.substring(trimmedLine.indexOf('http'));
        }
      } else if (trimmedLine.startsWith('X-') && trimmedLine.includes(':')) {
        // Handle custom X- fields
        const colonIndex = trimmedLine.indexOf(':');
        const fieldName = trimmedLine.substring(2, colonIndex).toLowerCase().replace(/-/g, '');
        const fieldValue = trimmedLine.substring(colonIndex + 1);
        if (fieldValue) {
          vCard[fieldName] = fieldValue;
        }
      }
    });

    return Object.keys(vCard).length > 0 ? vCard : null;
  };

  const addToContacts = async () => {
    if (!scannedData) {
      Alert.alert('Error', 'No contact data to save.');
      return;
    }

    if (!contactService) {
      Alert.alert(
        'Service Unavailable',
        'Contact service is not available. Please restart the app and try again.',
        [
          { text: 'OK', onPress: () => setShowPreview(false) }
        ]
      );
      return;
    }
    
    try {
      setSaving(true);
      
      // Standard contact fields that map to database schema
      const standardFields = ['name', 'email', 'phone', 'company', 'title'];
      
      // Extract standard fields
      const contactData = {
        name: scannedData.name || scannedData.raw || 'Unknown Contact',
        email: scannedData.email || '',
        phone: scannedData.phone || '',
        company: scannedData.company || '',
        title: scannedData.title || '',
        tags: ['scanned']
      };

      // Find any additional fields that aren't in the standard schema
      const additionalFields = {};
      Object.keys(scannedData).forEach(key => {
        if (!standardFields.includes(key) && key !== 'raw' && scannedData[key]) {
          additionalFields[key] = scannedData[key];
        }
      });

      // Create notes with scan info and any additional data
      let notes = `Added via QR scan on ${new Date().toLocaleDateString()}`;
      
      if (Object.keys(additionalFields).length > 0) {
        notes += '\n\nAdditional Information:';
        Object.entries(additionalFields).forEach(([key, value]) => {
          const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          notes += `\n• ${fieldName}: ${value}`;
        });
      }

      contactData.notes = notes;

      console.log('Creating contact with data:', contactData);
      console.log('Additional fields found:', additionalFields);
      
      const result = await contactService.createContact(contactData);
      
      if (result.error) {
        throw new Error(result.error);
      }

      Alert.alert(
        'Contact Added!',
        `${contactData.name} has been added to your contacts.${Object.keys(additionalFields).length > 0 ? '\n\nAdditional information has been saved in the notes section.' : ''}`,
        [
          { 
            text: 'View Contacts', 
            onPress: () => {
              setShowPreview(false);
              setScanned(false);
              setScannedData(null);
              navigation.navigate('MainTabs', { screen: 'Contacts' });
            }
          },
          { 
            text: 'Scan Another', 
            onPress: () => {
              setShowPreview(false);
              setScanned(false);
              setScannedData(null);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert(
        'Error', 
        `Failed to add contact: ${error.message || 'Unknown error'}. Please try again.`
      );
    } finally {
      setSaving(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#9CA3AF" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionMessage}>
            To scan QR codes and add business cards, we need access to your camera.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <Text style={styles.headerSubtitle}>Point camera at a business card QR code</Text>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'aztec', 'ean13', 'ean8', 'upc_e', 'upc_a', 'code39', 'code128'],
          }}
        >
          {/* Scanning Overlay */}
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            
            {scanned && (
              <View style={styles.scannedIndicator}>
                <Ionicons name="checkmark-circle" size={64} color="#10B981" />
                <Text style={styles.scannedText}>QR Code Detected!</Text>
              </View>
            )}
          </View>
        </CameraView>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {scanned && (
          <TouchableOpacity 
            style={styles.rescanButton} 
            onPress={() => setScanned(false)}
          >
            <Ionicons name="refresh" size={20} color="#6B7280" />
            <Text style={styles.rescanText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Business Card Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={styles.modal}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPreview(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Business Card Scanned</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Card Preview */}
          <ScrollView style={styles.modalContent}>
            {scannedData && (
              <View style={styles.cardPreview}>
                <Text style={styles.cardName}>{scannedData.name || 'Unknown'}</Text>
                {scannedData.title && (
                  <Text style={styles.cardTitle}>{scannedData.title}</Text>
                )}
                {scannedData.company && (
                  <Text style={styles.cardCompany}>{scannedData.company}</Text>
                )}
                
                <View style={styles.cardDetails}>
                  {scannedData.email && (
                    <View style={styles.cardDetailItem}>
                      <Ionicons name="mail-outline" size={16} color="#6B7280" />
                      <Text style={styles.cardDetailText}>{scannedData.email}</Text>
                    </View>
                  )}
                  {scannedData.phone && (
                    <View style={styles.cardDetailItem}>
                      <Ionicons name="call-outline" size={16} color="#6B7280" />
                      <Text style={styles.cardDetailText}>{scannedData.phone}</Text>
                    </View>
                  )}
                  
                  {/* Display all additional fields dynamically */}
                  {Object.entries(scannedData).map(([key, value]) => {
                    // Skip standard fields and empty values
                    if (['name', 'email', 'phone', 'company', 'title', 'raw'].includes(key) || !value) {
                      return null;
                    }
                    
                    // Choose appropriate icon based on field name
                    let iconName = 'information-circle-outline';
                    if (key.toLowerCase().includes('website') || key.toLowerCase().includes('url')) {
                      iconName = 'globe-outline';
                    } else if (key.toLowerCase().includes('address')) {
                      iconName = 'location-outline';
                    } else if (key.toLowerCase().includes('social') || key.toLowerCase().includes('linkedin') || key.toLowerCase().includes('twitter')) {
                      iconName = 'logo-linkedin';
                    } else if (key.toLowerCase().includes('fax')) {
                      iconName = 'print-outline';
                    } else if (key.toLowerCase().includes('department')) {
                      iconName = 'business-outline';
                    }
                    
                    const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                    
                    return (
                      <View key={key} style={styles.cardDetailItem}>
                        <Ionicons name={iconName} size={16} color="#6B7280" />
                        <View style={styles.cardDetailContent}>
                          <Text style={styles.cardDetailLabel}>{fieldName}:</Text>
                          <Text style={styles.cardDetailText}>{value}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
                
                {/* Show info about additional fields */}
                {Object.keys(scannedData).filter(key => 
                  !['name', 'email', 'phone', 'company', 'title', 'raw'].includes(key) && scannedData[key]
                ).length > 0 && (
                  <View style={styles.additionalFieldsInfo}>
                    <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                    <Text style={styles.additionalFieldsText}>
                      Additional information will be saved in the notes section
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowPreview(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.addButton, saving && styles.addButtonDisabled]} 
              onPress={addToContacts}
              disabled={saving}
            >
              <Text style={styles.addButtonText}>
                {saving ? 'Adding...' : 'Add to Contacts'}
              </Text>
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
    backgroundColor: '#000000',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#ffffff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#000000',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  cameraContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#ffffff',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scannedIndicator: {
    position: 'absolute',
    top: 100,
    alignItems: 'center',
  },
  scannedText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  actions: {
    padding: 24,
    alignItems: 'center',
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  rescanText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  modal: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  cardPreview: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 2,
  },
  cardCompany: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  cardDetails: {
    gap: 12,
  },
  cardDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardDetailText: {
    fontSize: 14,
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    paddingBottom: 34,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 2,
    height: 48,
    backgroundColor: '#000000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  websiteNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  additionalFieldsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  additionalFieldsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardDetailContent: {
    flexDirection: 'column',
  },
  cardDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
}); 