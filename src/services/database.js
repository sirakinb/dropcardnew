import { supabase } from '../config/supabase';

// Profile Service
export const profileService = {
  async createProfile(profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { data: null, error: error.message };
    }
  },

  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting profile:', error);
      return { data: null, error: error.message };
    }
  },

  async updateProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
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

// Business Card Service
export const businessCardService = {
  async createCard(cardData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newCardData = {
        ...cardData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('business_cards')
        .insert([newCardData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating business card:', error);
      return { data: null, error: error.message };
    }
  },

  async getUserCards(userId = null) {
    try {
      let userIdToUse = userId;
      
      if (!userIdToUse) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        userIdToUse = user.id;
      }

      const { data, error } = await supabase
        .from('business_cards')
        .select('*')
        .eq('user_id', userIdToUse)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting user cards:', error);
      return { data: [], error: error.message };
    }
  },

  async updateCard(cardId, cardData) {
    try {
      const { data, error } = await supabase
        .from('business_cards')
        .update(cardData)
        .eq('id', cardId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating business card:', error);
      return { data: null, error: error.message };
    }
  },

  async deleteCard(cardId) {
    try {
      const { error } = await supabase
        .from('business_cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting business card:', error);
      return { error: error.message };
    }
  },

  async setPrimaryCard(cardId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, unset any existing primary cards for this user
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

// Contact Service
export const contactService = {
  async createContact(contactData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newContactData = {
        ...contactData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('contacts')
        .insert([newContactData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating contact:', error);
      return { data: null, error: error.message };
    }
  },

  async getUserContacts(userId = null) {
    try {
      let userIdToUse = userId;
      
      if (!userIdToUse) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        userIdToUse = user.id;
      }

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userIdToUse)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting user contacts:', error);
      return { data: [], error: error.message };
    }
  },

  async updateContact(contactId, contactData) {
    try {
      const updateData = {
        ...contactData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('contacts')
        .update(updateData)
        .eq('id', contactId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating contact:', error);
      return { data: null, error: error.message };
    }
  },

  async deleteContact(contactId) {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting contact:', error);
      return { error: error.message };
    }
  },

  async searchContacts(query, userId = null) {
    try {
      let userIdToUse = userId;
      
      if (!userIdToUse) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        userIdToUse = user.id;
      }

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userIdToUse)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%,title.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error searching contacts:', error);
      return { data: [], error: error.message };
    }
  },

  async getContactsByTag(tag, userId = null) {
    try {
      let userIdToUse = userId;
      
      if (!userIdToUse) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        userIdToUse = user.id;
      }

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userIdToUse)
        .contains('tags', [tag])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting contacts by tag:', error);
      return { data: [], error: error.message };
    }
  }
};

// Follow-up Service
export const followUpService = {
  async createFollowUp(followUpData) {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .insert([followUpData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating follow-up:', error);
      return { data: null, error: error.message };
    }
  },

  async getUserFollowUps(userId) {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select(`
          *,
          contacts (
            id,
            name,
            email,
            company
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user follow-ups:', error);
      return { data: null, error: error.message };
    }
  },

  async updateFollowUp(followUpId, followUpData) {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .update(followUpData)
        .eq('id', followUpId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating follow-up:', error);
      return { data: null, error: error.message };
    }
  },

  async deleteFollowUp(followUpId) {
    try {
      const { error } = await supabase
        .from('follow_ups')
        .delete()
        .eq('id', followUpId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting follow-up:', error);
      return { error: error.message };
    }
  }
}; 