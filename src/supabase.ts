import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Environment variables or fallback credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Singleton Supabase Client instance
 */
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const STORAGE_BUCKET_MEDIA = 'gift-media';

export interface GiftItem {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  recipient_name: string;
  sender_name?: string;
  message?: string;
  price?: number;
  currency?: string;
  status?: 'draft' | 'ordered' | 'shipped' | 'delivered' | 'archived';
  category?: 'rose_hamper' | 'keepsake_box' | 'luxury_set' | 'custom' | string;
  paper_style?: 'blush' | 'champagne' | 'cream' | 'velvet' | string;
  wax_seal?: 'rose' | 'heart' | 'ring' | 'dove' | string;
  media_urls?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface MediaUploadResult {
  path: string;
  signedUrl?: string;
  publicUrl?: string;
}

/**
 * ==========================================
 * 1. AUTHENTICATION SERVICE
 * ==========================================
 */
export const authService = {
  /**
   * Sign up with email & password
   */
  async signUp(email: string, password: string, options?: { data?: Record<string, any>; redirectTo?: string }) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: options?.data,
        emailRedirectTo: options?.redirectTo,
      },
    });
  },

  /**
   * Sign in with email & password
   */
  async signInWithPassword(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  /**
   * Sign in with OAuth provider (Google, GitHub, Apple, etc.)
   */
  async signInWithOAuth(provider: 'google' | 'github' | 'apple', redirectTo?: string) {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || window.location.origin,
      },
    });
  },

  /**
   * Send password reset email
   */
  async resetPasswordForEmail(email: string, redirectTo?: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/reset-password`,
    });
  },

  /**
   * Sign out current user
   */
  async signOut() {
    return await supabase.auth.signOut();
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Get current active session
   */
  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};

/**
 * ==========================================
 * 2. DATABASE SERVICE ('gifts' table)
 * ==========================================
 */
export const giftsService = {
  /**
   * Fetch all gifts belonging to current user or accessible
   */
  async getGifts(filter?: { category?: string; status?: string; limit?: number; offset?: number }) {
    let query = supabase
      .from('gifts')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter?.category) {
      query = query.eq('category', filter.category);
    }
    if (filter?.status) {
      query = query.eq('status', filter.status);
    }
    if (filter?.limit) {
      query = query.limit(filter.limit);
    }
    if (filter?.offset && filter.limit) {
      query = query.range(filter.offset, filter.offset + filter.limit - 1);
    }

    return await query;
  },

  /**
   * Fetch a single gift by ID
   */
  async getGiftById(id: string) {
    return await supabase
      .from('gifts')
      .select('*')
      .eq('id', id)
      .single();
  },

  /**
   * Create a new gift record
   */
  async createGift(gift: Omit<GiftItem, 'id' | 'created_at' | 'updated_at'>) {
    const user = await authService.getCurrentUser();
    const payload = {
      ...gift,
      user_id: gift.user_id || user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return await supabase
      .from('gifts')
      .insert([payload])
      .select()
      .single();
  },

  /**
   * Update an existing gift record
   */
  async updateGift(id: string, updates: Partial<GiftItem>) {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return await supabase
      .from('gifts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Delete a gift record by ID
   */
  async deleteGift(id: string) {
    return await supabase
      .from('gifts')
      .delete()
      .eq('id', id);
  },

  /**
   * Subscribe to real-time changes on the 'gifts' table
   */
  subscribeToGifts(onPayload: (payload: any) => void) {
    return supabase
      .channel('public:gifts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gifts' },
        (payload) => onPayload(payload)
      )
      .subscribe();
  },
};

/**
 * ==========================================
 * 3. PRIVATE STORAGE SERVICE (User Media Assets)
 * ==========================================
 */
export const storageService = {
  /**
   * Upload a media asset (photo, audio note, gift wrap preview) to private storage
   * Stores files in user-scoped folders: `${userId}/${timestamp}_${fileName}`
   */
  async uploadMedia(
    file: File | Blob,
    fileName: string,
    bucketName: string = STORAGE_BUCKET_MEDIA
  ): Promise<{ data: { path: string } | null; error: Error | null }> {
    try {
      const user = await authService.getCurrentUser();
      const userId = user?.id || 'guest';
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${userId}/${Date.now()}_${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        return { data: null, error };
      }

      return { data: { path: data.path }, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  /**
   * Generate a secure temporary signed URL for private media access
   * @param expiresIn - Time in seconds (default 1 hour = 3600s)
   */
  async createSignedUrl(
    filePath: string,
    expiresIn: number = 3600,
    bucketName: string = STORAGE_BUCKET_MEDIA
  ): Promise<{ signedUrl: string | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        return { signedUrl: null, error };
      }

      return { signedUrl: data.signedUrl, error: null };
    } catch (err: any) {
      return { signedUrl: null, error: err };
    }
  },

  /**
   * Generate signed URLs for multiple files simultaneously
   */
  async createSignedUrls(
    filePaths: string[],
    expiresIn: number = 3600,
    bucketName: string = STORAGE_BUCKET_MEDIA
  ) {
    return await supabase.storage
      .from(bucketName)
      .createSignedUrls(filePaths, expiresIn);
  },

  /**
   * Delete media asset from storage
   */
  async deleteMedia(filePaths: string[], bucketName: string = STORAGE_BUCKET_MEDIA) {
    return await supabase.storage
      .from(bucketName)
      .remove(filePaths);
  },

  /**
   * List files in the user's private media folder
   */
  async listUserMedia(bucketName: string = STORAGE_BUCKET_MEDIA, folderPrefix?: string) {
    const user = await authService.getCurrentUser();
    const folder = folderPrefix || user?.id || 'guest';
    return await supabase.storage
      .from(bucketName)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });
  },

  /**
   * Download a private file as Blob
   */
  async downloadMedia(filePath: string, bucketName: string = STORAGE_BUCKET_MEDIA) {
    return await supabase.storage
      .from(bucketName)
      .download(filePath);
  },
};
