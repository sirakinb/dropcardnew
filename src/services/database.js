import { supabase } from '../config/supabase';

// Business Cards Operations
export const cardService = {
  // Create a new business card
  async createCard(cardData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const cardPayload = {
        user_id: user.id,
        name: cardData.name,
        title: cardData.title || null,
        company: cardData.company || null,
        email: cardData.email,
        phone: cardData.phone || null,
        website: cardData.website || null,
        theme_color: '#000000', // Default black theme
        is_primary: true, // First card is primary
      };

      const { data, error } = await supabase
        .from('business_cards')
        .insert([cardPayload])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating card:', error);
      return { data: null, error: error.message };
    }
  },

  // Get all cards for the current user
  async getUserCards() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('business_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching cards:', error);
      return { data: null, error: error.message };
    }
  },

  // Get primary card for the current user
  async getPrimaryCard() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('business_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching primary card:', error);
      return { data: null, error: error.message };
    }
  },

  // Update an existing business card
  async updateCard(cardId, cardData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const cardPayload = {
        name: cardData.name,
        title: cardData.title || null,
        company: cardData.company || null,
        email: cardData.email,
        phone: cardData.phone || null,
        website: cardData.website || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('business_cards')
        .update(cardPayload)
        .eq('id', cardId)
        .eq('user_id', user.id) // Security: only update own cards
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating card:', error);
      return { data: null, error: error.message };
    }
  },

  // Delete a business card
  async deleteCard(cardId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('business_cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id); // Security: only delete own cards

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting card:', error);
      return { error: error.message };
    }
  },

  // Set a card as primary
  async setPrimaryCard(cardId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, unset all cards as non-primary
      await supabase
        .from('business_cards')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Then set the selected card as primary
      const { data, error } = await supabase
        .from('business_cards')
        .update({ is_primary: true })
        .eq('id', cardId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error setting primary card:', error);
      return { data: null, error: error.message };
    }
  }
};

// Profile Operations
export const profileService = {
  // Get user profile
  async getUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error: error.message };
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error: error.message };
    }
  }
}; 