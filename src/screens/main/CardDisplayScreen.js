import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BusinessCard from '../../components/cards/BusinessCard';
import QRCodeDisplay from '../../components/cards/QRCodeDisplay';

export default function CardDisplayScreen({ navigation, route }) {
  const { cardData = {}, avatar: initialAvatar, editMode = false } = route.params || {};
  const [avatar, setAvatar] = useState(initialAvatar || null);

  // Handle missing card data case
  if (!cardData || Object.keys(cardData).length === 0) {
    Alert.alert('Error', 'No card data available', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
    return null;
  }

  const handleEdit = () => {
    navigation.navigate('CreateCard', { 
      userName: cardData?.name,
      editMode: true,
      cardData,
      avatar 
    });
  };

  const handleShare = () => {
    navigation.navigate('MainTabs', { 
      screen: 'Share', 
      params: { cardData } 
    });
  };

  const handlePreview = () => {
    // Toggle between preview and edit modes
    Alert.alert(
      'Card Preview',
      'This is how your card appears to others when shared.',
      [{ text: 'OK' }]
    );
  };

  const handleMore = () => {
    Alert.alert(
      'More Options',
      'Choose an action',
      [
        { text: 'Duplicate Card', onPress: () => handleDuplicate() },
        { text: 'Delete Card', style: 'destructive', onPress: () => handleDelete() },
        { text: 'Export as Image', onPress: () => handleExport() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleDuplicate = () => {
    navigation.navigate('CreateCard', {
      cardData: { ...cardData, name: `${cardData.name} Copy` },
      avatar,
      editMode: false
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete "${cardData.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete functionality
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleExport = () => {
    Alert.alert(
      'Export Card',
      'Export functionality coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleBackToCards = () => {
    navigation.navigate('MainTabs', { screen: 'Cards' });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Your Card</Text>
          <TouchableOpacity onPress={handleMore}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Business Card Preview */}
        <View style={styles.cardSection}>
          <BusinessCard 
            cardData={cardData}
            avatar={avatar}
            themeColor={cardData.theme_color}
            style={styles.businessCard}
          />
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
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>QR Code</Text>
          <QRCodeDisplay 
            cardData={cardData}
            size={200}
            showActions={true}
            style={styles.qrDisplay}
          />
        </View>

        {/* Card Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Card Details</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{cardData.name || 'Not set'}</Text>
            </View>
            
            {cardData.title && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Title</Text>
                <Text style={styles.infoValue}>{cardData.title}</Text>
              </View>
            )}
            
            {cardData.company && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Company</Text>
                <Text style={styles.infoValue}>{cardData.company}</Text>
              </View>
            )}
            
            {cardData.email && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{cardData.email}</Text>
              </View>
            )}
            
            {cardData.phone && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{cardData.phone}</Text>
              </View>
            )}
            
            {cardData.website && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Website</Text>
                <Text style={styles.infoValue}>{cardData.website}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleBackToCards}>
          <Text style={styles.primaryButtonText}>Back to Cards</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    flex: 1,
  },
  cardSection: {
    marginBottom: 32,
  },
  businessCard: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
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
  qrSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  qrDisplay: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
  },
  infoSection: {
    marginBottom: 32,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
  },
  bottomAction: {
    padding: 32,
    alignItems: 'center',
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 