import { useState, useEffect, useMemo } from 'react';
import { useMusicMatch } from '../context/MusicMatchContext';
import { Pagination } from '../components/Pagination';

const PAGE_SIZES = [10, 25, 50];

export function RateSongs() {
  const { songsList, ratedMap, submitRating, loadingSongs, addToast, searchSongs, searchResults, searchQuery, setSearchQuery } = useMusicMatch();
  const [pending, setPending] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showUnratedOnly, setShowUnratedOnly] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const t = setTimeout(() => { searchSongs(searchQuery); }, 400);
    setDebounceTimer(t);
    setPage(0);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const displayList = useMemo(() => {
    let list = searchQuery.trim() ? searchResults : songsList;
    if (showUnratedOnly) list = list.filter(s => !ratedMap[s.id] && !pending[s.id]);
    return list;
  }, [songsList, searchResults, searchQuery, ratedMap, pending, showUnratedOnly]);

  const totalElements = displayList.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const paged = displayList.slice(page * pageSize, (page + 1) * pageSize);

  const effectiveRating = (id: number) => pending[id] ?? ratedMap[id] ?? 0;
  const ratedCount = songsList.filter(s => effectiveRating(s.id) > 0).length;
  const progress = songsList.length > 0 ? (ratedCount / songsList.length) * 100 : 0;

  const handleSave = async () => {
    if (Object.keys(pending).length === 0) return;
    setSaving(true);
    let saved = 0;
    try {
      await Promise.all(
        Object.entries(pending).map(([id, score]) =>
          submitRating(Number(id), score).then(() => { saved++; })
        )
      );
      setPending({});
      addToast(`Saved ${saved} rating${saved !== 1 ? 's' : ''}!`, 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to save some ratings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loadingSongs) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <h1>⭐ Rate Songs</h1>
          <p>Rate songs to get personalized recommendations</p>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Progress</span>
            <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{ratedCount} / {songsList.length} rated</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: '200px' }}
            placeholder="🔍 Search songs or artists…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--muted-foreground)', cursor: 'pointer', flexShrink: 0 }}>
            <input type="checkbox" checked={showUnratedOnly} onChange={e => { setShowUnratedOnly(e.target.checked); setPage(0); }} />
            Unrated only
          </label>
        </div>

        {/* Pending badge */}
        {Object.keys(pending).length > 0 && (
          <div className="alert alert-info" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{Object.keys(pending).length} unsaved rating{Object.keys(pending).length !== 1 ? 's' : ''}</span>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save All'}
            </button>
          </div>
        )}

        {/* Song grid */}
        {paged.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎵</div>
            <h3>No songs found</h3>
            <p>{searchQuery ? 'Try a different search term' : showUnratedOnly ? 'All songs are rated!' : 'No songs available'}</p>
          </div>
        ) : (
          <div className="songs-grid">
            {paged.map(song => {
              const current = effectiveRating(song.id);
              const isPending = pending[song.id] !== undefined;
              return (
                <div key={song.id} className="song-card" style={{ border: isPending ? '1px solid var(--primary)' : undefined }}>
                  {song.coverUrl
                    ? <img className="song-cover" src={song.coverUrl} alt={song.title} />
                    : <div className="song-cover-placeholder">🎵</div>
                  }
                  <div className="song-info">
                    <h4 title={song.title}>{song.title}</h4>
                    <p className="artist" title={song.artist}>{song.artist}</p>
                    {song.albumName && <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '8px' }}>💿 {song.albumName}</p>}
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          className={`star ${current >= star ? 'active' : ''}`}
                          onClick={() => setPending(p => ({ ...p, [song.id]: star }))}
                          title={`${star} star${star !== 1 ? 's' : ''}`}
                        >★</button>
                      ))}
                    </div>
                    {isPending && (
                      <span style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '4px', display: 'block' }}>● Unsaved</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            page={page} totalPages={totalPages} totalElements={totalElements}
            pageSize={pageSize} onPage={setPage} onSizeChange={s => { setPageSize(s); setPage(0); }}
            pageSizes={PAGE_SIZES}
          />
        )}

        {/* Save button */}
        {Object.keys(pending).length > 0 && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '24px', padding: '14px', justifyContent: 'center', fontSize: '16px' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : `💾 Save ${Object.keys(pending).length} Rating${Object.keys(pending).length !== 1 ? 's' : ''}`}
          </button>
        )}
      </div>
    </div>
  );
}
