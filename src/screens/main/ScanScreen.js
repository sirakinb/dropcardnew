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
import { CameraView } from 'expo-camera';
import { useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { contactService } from '../../services/database';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    
    setScanned(true);
    console.log('QR Code scanned:', { type, data });
    
    try {
      // Try to parse the QR code data as JSON (business card format)
      const cardData = JSON.parse(data);
      
      // Validate that it's a business card
      if (cardData.name || cardData.email) {
        setScannedData(cardData);
        setShowPreview(true);
      } else {
        Alert.alert(
          'Invalid QR Code',
          'This QR code does not contain valid business card information.',
          [{ text: 'Try Again', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      // If it's not JSON, treat it as a simple text/URL
      Alert.alert(
        'QR Code Scanned',
        `Content: ${data}`,
        [
          { text: 'Try Again', onPress: () => setScanned(false) },
          { text: 'OK', onPress: () => setScanned(false) }
        ]
      );
    }
  };

  const addToContacts = async () => {
    if (!scannedData) return;
    
    try {
      setSaving(true);
      
      const contactData = {
        name: scannedData.name || 'Unknown',
        email: scannedData.email || '',
        phone: scannedData.phone || '',
        company: scannedData.company || '',
        title: scannedData.title || '',
        website: scannedData.website || '',
        notes: `Added via QR scan on ${new Date().toLocaleDateString()}`,
        tags: ['scanned']
      };

      const result = await contactService.createContact(contactData);
      
      if (result.error) {
        throw new Error(result.error);
      }

      Alert.alert(
        'Contact Added!',
        `${contactData.name} has been added to your contacts.`,
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
      Alert.alert('Error', 'Failed to add contact. Please try again.');
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
                  {scannedData.website && (
                    <View style={styles.cardDetailItem}>
                      <Ionicons name="globe-outline" size={16} color="#6B7280" />
                      <Text style={styles.cardDetailText}>{scannedData.website}</Text>
                    </View>
                  )}
                </View>
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
}); 