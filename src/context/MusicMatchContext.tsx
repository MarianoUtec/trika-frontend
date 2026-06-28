import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as api from '../lib/api';

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }

interface MusicMatchContextType {
  // Auth
  user: api.User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;

  // Songs
  songsList: api.Song[];
  unratedSongs: api.Song[];
  loadingSongs: boolean;
  searchQuery: string;
  searchResults: api.Song[];
  setSearchQuery: (q: string) => void;
  searchSongs: (q: string) => Promise<void>;

  // Ratings
  myRatings: api.Rating[];
  ratedMap: Record<number, number>;
  submitRating: (songId: number, score: number) => Promise<void>;
  deleteRating: (ratingId: number) => Promise<void>;
  loadingRatings: boolean;

  // Recommendations
  recommendation: api.Recommendation | null;
  loadingRecs: boolean;
  fetchRecommendations: () => Promise<void>;

  // Latent space
  latentProfile: api.LatentProfile | null;
  latentUsers: api.LatentSpaceUser[];
  latentHistory: api.LatentHistoryItem[];
  loadingLatent: boolean;
  fetchLatent: () => Promise<void>;

  // Feed
  feedItems: api.FeedItem[];
  loadingFeed: boolean;
  fetchFeed: () => Promise<void>;

  // Chat
  conversations: api.Conversation[];
  loadingConversations: boolean;
  fetchConversations: () => Promise<void>;

  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;

  // Profile update
  updateProfile: (data: { name?: string }) => Promise<void>;

  refreshAll: () => void;
}

const MusicMatchContext = createContext<MusicMatchContextType | undefined>(undefined);

export function MusicMatchProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<api.User | null>(() => {
    try { return JSON.parse(localStorage.getItem('mm_user') || 'null'); } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [songsList, setSongsList] = useState<api.Song[]>([]);
  const [unratedSongs, setUnratedSongs] = useState<api.Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<api.Song[]>([]);

  const [myRatings, setMyRatings] = useState<api.Rating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);

  const [recommendation, setRecommendation] = useState<api.Recommendation | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const [latentProfile, setLatentProfile] = useState<api.LatentProfile | null>(null);
  const [latentUsers, setLatentUsers] = useState<api.LatentSpaceUser[]>([]);
  const [latentHistory, setLatentHistory] = useState<api.LatentHistoryItem[]>([]);
  const [loadingLatent, setLoadingLatent] = useState(false);

  const [feedItems, setFeedItems] = useState<api.FeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const [conversations, setConversations] = useState<api.Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  let toastId = 0;

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = ++toastId;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };
  const removeToast = (id: number) => setToasts(t => t.filter(x => x.id !== id));

  const isAuthenticated = !!user && !!api.getAccessToken();

  const ratedMap: Record<number, number> = {};
  for (const r of myRatings) ratedMap[r.song.id] = r.score;

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.auth.login(email, password);
      setUser(res.user);
      localStorage.setItem('mm_user', JSON.stringify(res.user));
    } catch (e: any) {
      const msg = e?.message || 'Login failed';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.auth.register(name, email, password);
      setUser(res.user);
      localStorage.setItem('mm_user', JSON.stringify(res.user));
    } catch (e: any) {
      const msg = e?.message || 'Registration failed';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setSongsList([]);
    setMyRatings([]);
    setRecommendation(null);
    setLatentUsers([]);
    setFeedItems([]);
    setConversations([]);
  };

  const clearError = () => setError(null);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchSongs = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingSongs(true);
    try {
      const [all, unrated] = await Promise.all([api.songs.list(), api.songs.unrated()]);
      setSongsList(all);
      setUnratedSongs(unrated);
    } catch (e) { console.error('fetchSongs', e); }
    finally { setLoadingSongs(false); }
  }, [isAuthenticated]);

  const searchSongs = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const data = await api.songs.search(q);
      setSearchResults(data);
    } catch (e) { console.error('searchSongs', e); }
  }, []);

  const fetchRatings = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingRatings(true);
    try { setMyRatings(await api.ratings.mine()); }
    catch (e) { console.error('fetchRatings', e); }
    finally { setLoadingRatings(false); }
  }, [isAuthenticated]);

  const fetchRecommendations = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingRecs(true);
    try { setRecommendation(await api.recommendations.mine()); }
    catch (e) { console.error('fetchRecs', e); }
    finally { setLoadingRecs(false); }
  }, [isAuthenticated]);

  const fetchLatent = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingLatent(true);
    try {
      const [profile, space, history] = await Promise.all([
        api.latentSpace.myProfile(),
        api.latentSpace.allUsers(),
        api.latentSpace.history(),
      ]);
      setLatentProfile(profile);
      setLatentUsers(space.users);
      setLatentHistory(history);
    } catch (e) { console.error('fetchLatent', e); }
    finally { setLoadingLatent(false); }
  }, [isAuthenticated]);

  const fetchFeed = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingFeed(true);
    try { setFeedItems(await api.feed.get()); }
    catch (e) { console.error('fetchFeed', e); }
    finally { setLoadingFeed(false); }
  }, [isAuthenticated]);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingConversations(true);
    try { setConversations(await api.chat.conversations()); }
    catch (e) { console.error('fetchConversations', e); }
    finally { setLoadingConversations(false); }
  }, [isAuthenticated]);

  const refreshAll = useCallback(() => {
    fetchSongs();
    fetchRatings();
    fetchRecommendations();
    fetchLatent();
    fetchFeed();
    fetchConversations();
  }, [fetchSongs, fetchRatings, fetchRecommendations, fetchLatent, fetchFeed, fetchConversations]);

  useEffect(() => {
    if (isAuthenticated) refreshAll();
  }, [isAuthenticated]);

  // ── Ratings actions ───────────────────────────────────────────────────────
  const submitRating = async (songId: number, score: number) => {
    const existing = myRatings.find(r => r.song.id === songId);
    if (existing) {
      await api.ratings.delete(existing.id);
    }
    const newRating = await api.ratings.rate(songId, score);
    setMyRatings(prev => [...prev.filter(r => r.song.id !== songId), newRating]);
    setUnratedSongs(prev => prev.filter(s => s.id !== songId));
  };

  const deleteRating = async (ratingId: number) => {
    await api.ratings.delete(ratingId);
    setMyRatings(prev => prev.filter(r => r.id !== ratingId));
    fetchSongs();
  };

  const updateProfile = async (data: { name?: string }) => {
    const updated = await api.users.updateMe(data);
    setUser(updated);
    localStorage.setItem('mm_user', JSON.stringify(updated));
    addToast('Profile updated!', 'success');
  };

  return (
    <MusicMatchContext.Provider value={{
      user, isAuthenticated, isLoading, error,
      login, register, logout, clearError,
      songsList, unratedSongs, loadingSongs, searchQuery, searchResults,
      setSearchQuery, searchSongs,
      myRatings, ratedMap, submitRating, deleteRating, loadingRatings,
      recommendation, loadingRecs, fetchRecommendations,
      latentProfile, latentUsers, latentHistory, loadingLatent, fetchLatent,
      feedItems, loadingFeed, fetchFeed,
      conversations, loadingConversations, fetchConversations,
      toasts, addToast, removeToast,
      updateProfile,
      refreshAll,
    }}>
      {children}
    </MusicMatchContext.Provider>
  );
}

export function useMusicMatch() {
  const ctx = useContext(MusicMatchContext);
  if (!ctx) throw new Error('useMusicMatch must be used within MusicMatchProvider');
  return ctx;
}
