import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../../contexts/AuthContext';
import { businessCardService } from '../../services/database';
import QRCodeDisplay from '../../components/cards/QRCodeDisplay';
import BusinessCard from '../../components/cards/BusinessCard';

export default function ShareScreen({ navigation, route }) {
  const { user } = useAuth();
  const { cardData } = route.params || {};
  const [primaryCard, setPrimaryCard] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentCard = cardData || primaryCard;

  useEffect(() => {
    if (!cardData) {
      loadPrimaryCard();
    } else {
      setLoading(false);
    }
  }, [cardData]);

  const loadPrimaryCard = async () => {
    try {
      const result = await businessCardService.getUserCards();
      if (result.error) {
        throw new Error(result.error);
      }
      
      const cards = result.data || [];
      const primary = cards.find(card => card.is_primary) || cards[0];
      
      if (!primary) {
        Alert.alert(
          'No Business Card',
          'You need to create a business card first.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Create Card', onPress: () => navigation.navigate('CreateCard') }
          ]
        );
        return;
      }
      
      setPrimaryCard(primary);
    } catch (error) {
      console.error('Error loading primary card:', error);
      Alert.alert('Error', 'Failed to load your business card.');
    } finally {
      setLoading(false);
    }
  };

  const handleNativeShare = async () => {
    if (!currentCard) return;

    try {
      const shareData = {
        title: `${currentCard.name}'s Business Card`,
        message: `
📱 ${currentCard.name}
${currentCard.title ? `💼 ${currentCard.title}` : ''}
${currentCard.company ? `🏢 ${currentCard.company}` : ''}
${currentCard.email ? `📧 ${currentCard.email}` : ''}
${currentCard.phone ? `📞 ${currentCard.phone}` : ''}
${currentCard.website ? `🌐 ${currentCard.website}` : ''}

Shared via DropCard
        `.trim(),
      };

      await Share.share(shareData);
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share card. Please try again.');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const cardText = `${currentCard.name}\n${currentCard.title}\n${currentCard.company}\n${currentCard.email}\n${currentCard.phone}`;
      
      await Clipboard.setStringAsync(cardText);
      Alert.alert('Copied!', 'Card information copied to clipboard.');
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy card information.');
    }
  };

  const handleEmailShare = () => {
    if (!currentCard?.email) {
      Alert.alert('No Email', 'This card doesn\'t have an email address.');
      return;
    }

    // This would typically open the email app
    Alert.alert(
      'Email Share',
      'This will open your email app to share the card.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Email', onPress: () => console.log('Open email app') }
      ]
    );
  };

  const handleSocialShare = (platform) => {
    Alert.alert(
      `Share on ${platform}`,
      `This will open ${platform} to share your business card.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => console.log(`Share on ${platform}`) }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your card...</Text>
        </View>
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.emptyContainer}>
          <Ionicons name="card-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Card to Share</Text>
          <Text style={styles.emptySubtitle}>Create a business card first</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateCard')}
          >
            <Text style={styles.createButtonText}>Create Card</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Share Your Card</Text>
          <Text style={styles.subtitle}>Choose how you'd like to share</Text>
        </View>

        {/* Business Card Preview */}
        <View style={styles.cardPreview}>
          <BusinessCard 
            cardData={currentCard}
            themeColor={currentCard.theme_color}
            compact={true}
          />
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>QR Code</Text>
          <QRCodeDisplay 
            cardData={currentCard}
            size={180}
            showActions={false}
          />
        </View>

        {/* Sharing Options */}
        <View style={styles.sharingOptions}>
          <Text style={styles.sectionTitle}>Sharing Options</Text>
          
          <TouchableOpacity style={styles.shareOption} onPress={handleNativeShare}>
            <View style={styles.shareIconContainer}>
              <Ionicons name="share-outline" size={24} color="#111827" />
            </View>
            <View style={styles.shareTextContainer}>
              <Text style={styles.shareTitle}>Share via Apps</Text>
              <Text style={styles.shareDescription}>Share through messaging, email, or social apps</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareOption} onPress={handleCopyToClipboard}>
            <View style={styles.shareIconContainer}>
              <Ionicons name="copy-outline" size={24} color="#111827" />
            </View>
            <View style={styles.shareTextContainer}>
              <Text style={styles.shareTitle}>Copy to Clipboard</Text>
              <Text style={styles.shareDescription}>Copy card information as text</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareOption} onPress={handleEmailShare}>
            <View style={styles.shareIconContainer}>
              <Ionicons name="mail-outline" size={24} color="#111827" />
            </View>
            <View style={styles.shareTextContainer}>
              <Text style={styles.shareTitle}>Send via Email</Text>
              <Text style={styles.shareDescription}>Send as email attachment</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Social Sharing */}
        <View style={styles.socialSection}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialShare('LinkedIn')}
            >
              <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
              <Text style={styles.socialText}>LinkedIn</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialShare('Twitter')}
            >
              <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
              <Text style={styles.socialText}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialShare('Instagram')}
            >
              <Ionicons name="logo-instagram" size={24} color="#E4405F" />
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  cardPreview: {
    marginBottom: 32,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  sharingOptions: {
    marginBottom: 32,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  shareIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shareTextContainer: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  shareDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  socialSection: {
    alignItems: 'center',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    minWidth: 80,
  },
  socialText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '500',
  },
}); 