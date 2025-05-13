/**
 * Supabase Client
 * 
 * A strongly typed client for interacting with Supabase for database operations and authentication.
 * Includes helpers for:
 * - User authentication
 * - Document storage and retrieval
 * - Search history tracking
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Default configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Type definitions for tables
export type DocumentRow = Database['public']['Tables']['documents']['Row'];
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
export type SearchHistoryRow = Database['public']['Tables']['search_history']['Row'];
export type SearchHistoryInsert = Database['public']['Tables']['search_history']['Insert'];

// Supabase client singleton
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin client for privileged operations (server-side only)
let adminClient: ReturnType<typeof createClient<Database>> | null = null;
export const getAdminClient = () => {
  if (!adminClient) {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
    }
    adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey);
  }
  return adminClient;
};

/**
 * Authentication helpers
 */
export const auth = {
  /**
   * Sign in with email and password
   */
  async signInWithPassword(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'github' | 'google') {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  },

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
  },

  /**
   * Sign out
   */
  async signOut() {
    return await supabase.auth.signOut();
  },

  /**
   * Get current user
   */
  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  },

  /**
   * Update password
   */
  async updatePassword(password: string) {
    return await supabase.auth.updateUser({ password });
  },
};

/**
 * Document storage and retrieval
 */
export const documents = {
  /**
   * Save a document to the database
   */
  async save(document: DocumentInsert) {
    return await supabase
      .from('documents')
      .insert(document)
      .select('*')
      .single();
  },

  /**
   * Get a document by ID
   */
  async getById(id: string) {
    return await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();
  },

  /**
   * List documents with pagination
   */
  async list(page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    return await supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
  },

  /**
   * Search documents by full-text search
   */
  async search(query: string, limit = 10) {
    return await supabase
      .from('documents')
      .select('*')
      .textSearch('content', query)
      .limit(limit);
  },
};

/**
 * Search history tracking
 */
export const searchHistory = {
  /**
   * Save a search query to history
   */
  async save(historyItem: SearchHistoryInsert) {
    return await supabase
      .from('search_history')
      .insert(historyItem)
      .select('*')
      .single();
  },

  /**
   * Get search history for current user
   */
  async getForCurrentUser(limit = 10) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { data: null, error: new Error('User not authenticated') };

    return await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user.user.id)
      .order('timestamp', { ascending: false })
      .limit(limit);
  },

  /**
   * Clear search history for current user
   */
  async clearForCurrentUser() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return { data: null, error: new Error('User not authenticated') };

    return await supabase
      .from('search_history')
      .delete()
      .eq('user_id', user.user.id);
  },
};

export default {
  supabase,
  getAdminClient,
  auth,
  documents,
  searchHistory,
};
