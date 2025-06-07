import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BusinessCard({ 
  cardData, 
  avatar, 
  themeColor = '#000000',
  style,
  compact = false 
}) {
  const {
    name = 'John Doe',
    title = '',
    company = '',
    email = '',
    phone = '',
    website = '',
    avatar_url = ''
  } = cardData || {};

  // Use avatar prop first, then fallback to avatar_url from cardData
  const displayAvatar = avatar || avatar_url;

  // Generate gradient colors based on theme
  const getGradientColors = (color) => {
    // Pre-defined gradient colors for each theme
    const gradients = {
      '#000000': ['#1F2937', '#111827'],
      '#111827': ['#374151', '#1F2937'],
      '#EF4444': ['#F87171', '#DC2626'], // Red
      '#F97316': ['#FB923C', '#EA580C'], // Orange
      '#EAB308': ['#FDE047', '#CA8A04'], // Yellow
      '#22C55E': ['#4ADE80', '#16A34A'], // Green
      '#3B82F6': ['#60A5FA', '#2563EB'], // Blue
      '#8B5CF6': ['#A78BFA', '#7C3AED'], // Purple
      '#EC4899': ['#F472B6', '#DB2777'], // Pink
      '#06B6D4': ['#22D3EE', '#0891B2'], // Cyan
      '#84CC16': ['#A3E635', '#65A30D'], // Lime
      '#F59E0B': ['#FBBF24', '#D97706']  // Amber
    };

    // Return pre-defined gradient or default for the given color
    return gradients[color] || [color, '#1F2937'];
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={getGradientColors(themeColor)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, compact && styles.compactCard]}
      >
        {/* Header Section */}
        <View style={styles.header}>
          {displayAvatar && (
            <Image 
              source={{ uri: displayAvatar }} 
              style={[styles.avatar, compact && styles.compactAvatar]}
            />
          )}
          <View style={styles.nameSection}>
            <Text style={[styles.name, compact && styles.compactName]} numberOfLines={1}>
              {name}
            </Text>
            {title && (
              <Text style={[styles.title, compact && styles.compactTitle]} numberOfLines={1}>
                {title}
              </Text>
            )}
            {company && (
              <Text style={[styles.company, compact && styles.compactCompany]} numberOfLines={1}>
                {company}
              </Text>
            )}
          </View>
        </View>

        {/* Contact Info */}
        {!compact && (
          <View style={styles.contactInfo}>
            {email && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue} numberOfLines={1}>{email}</Text>
              </View>
            )}
            {phone && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{phone}</Text>
              </View>
            )}
            {website && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={styles.contactValue} numberOfLines={1}>{website}</Text>
              </View>
            )}
          </View>
        )}

        {/* Bottom Branding */}
        <View style={styles.branding}>
          <Text style={styles.brandText}>DropCard</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    aspectRatio: 1.6, // Standard business card ratio
    justifyContent: 'space-between',
  },
  compactCard: {
    padding: 16,
    aspectRatio: 2.2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  compactName: {
    fontSize: 16,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  compactTitle: {
    fontSize: 12,
    marginBottom: 1,
  },
  company: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  compactCompany: {
    fontSize: 11,
  },
  contactInfo: {
    // Removed gap property for better platform compatibility
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // Added marginBottom instead of using gap
  },
  contactLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    width: 60,
  },
  contactValue: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
    textAlign: 'right',
  },
  branding: {
    alignSelf: 'flex-end',
  },
  brandText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    letterSpacing: 1,
  },
}); 