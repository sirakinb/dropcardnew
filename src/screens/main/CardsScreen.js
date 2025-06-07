import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { businessCardService } from '../../services/database';

export default function CardsScreen({ navigation }) {
  const { user, loading: authLoading } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCards = useCallback(async () => {
    // Don't try to load cards if auth is still loading or user is not authenticated
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await businessCardService.getUserCards();
      if (result.error) {
        throw new Error(result.error);
      }
      setCards(result.data || []);
    } catch (error) {
      console.error('Error loading cards:', error);
      Alert.alert('Error', 'Failed to load cards. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [authLoading, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  };

  // Load cards when screen comes into focus and user is authenticated
  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [loadCards])
  );

  // Also load cards when authentication state changes
  useEffect(() => {
    if (!authLoading && user) {
      loadCards();
    }
  }, [authLoading, user, loadCards]);

  const handleCardPress = (card) => {
    navigation.navigate('CardDisplay', { 
      cardData: card,
      editMode: false 
    });
  };

  const handleEditCard = (card) => {
    navigation.navigate('CreateCard', {
      editMode: true,
      cardData: card
    });
  };

  const handleDeleteCard = (card) => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete "${card.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await businessCardService.deleteCard(card.id);
              if (result.error) {
                throw new Error(result.error);
              }
              await loadCards(); // Refresh the list
              Alert.alert('Success', 'Card deleted successfully');
            } catch (error) {
              console.error('Error deleting card:', error);
              Alert.alert('Error', 'Failed to delete card. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleSetPrimary = async (card) => {
    try {
      const result = await businessCardService.setPrimaryCard(card.id);
      if (result.error) {
        throw new Error(result.error);
      }
      await loadCards(); // Refresh to show updated primary status
      Alert.alert('Success', `"${card.name}" is now your primary card`);
    } catch (error) {
      console.error('Error setting primary card:', error);
      Alert.alert('Error', 'Failed to set primary card. Please try again.');
    }
  };

  const renderCard = ({ item: card }) => (
    <View style={styles.cardItem}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={() => handleCardPress(card)}
      >
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>{card.name}</Text>
            {card.is_primary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryText}>Primary</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardTitle}>
            {card.title && card.company 
              ? `${card.title} at ${card.company}` 
              : card.title || card.company || 'No title'}
          </Text>
          <Text style={styles.cardEmail}>{card.email}</Text>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditCard(card)}
          >
            <Ionicons name="create-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
          
          {!card.is_primary && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleSetPrimary(card)}
            >
              <Ionicons name="star-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteCard(card)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="card-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No cards yet</Text>
      <Text style={styles.emptySubtitle}>Create your first digital business card</Text>
      
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateCard')}
      >
        <Text style={styles.createButtonText}>Create Card</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading cards...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>My Cards</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateCard')}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        {cards.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={cards}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
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
  listContainer: {
    paddingBottom: 100,
  },
  cardItem: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  primaryBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  primaryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  cardEmail: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
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
    marginBottom: 32,
  },
  createButton: {
    height: 52,
    backgroundColor: '#000000',
    borderRadius: 26,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 