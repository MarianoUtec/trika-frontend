import { useState } from 'react';
import { useMusicMatch } from '../context/MusicMatchContext';

export function Profile() {
  const { user, myRatings, latentProfile, updateProfile, deleteRating, addToast } = useMusicMatch();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSave = async () => {
    if (!name.trim()) { addToast('Name cannot be empty', 'error'); return; }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      setEditing(false);
    } catch (e: any) {
      addToast(e?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRating = async (ratingId: number) => {
    if (!window.confirm('Remove this rating?')) return;
    setDeletingId(ratingId);
    try {
      await deleteRating(ratingId);
      addToast('Rating removed', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to delete rating', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const avgRating = myRatings.length > 0
    ? (myRatings.reduce((s, r) => s + r.score, 0) / myRatings.length).toFixed(1)
    : '—';

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: myRatings.filter(r => r.score === star).length,
  }));

  const sortedRatings = [...myRatings].sort((a, b) => b.score - a.score);

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <h1>👤 Profile</h1>
          <p>Manage your account and review your ratings</p>
        </div>

        {/* Profile card */}
        <div className="section">
          <div className="card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '32px', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '340px' }}>
                  <div>
                    <label className="input-label">Display Name</label>
                    <input
                      className="input"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSave()}
                      autoFocus
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => { setEditing(false); setName(user?.name || ''); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '700' }}>{user?.name}</h2>
                    {user?.role === 'ADMIN' && <span className="badge badge-info">Admin</span>}
                  </div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '4px' }}>{user?.email}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '12px', marginBottom: '16px' }}>
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </p>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>✏️ Edit Name</button>
                </>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <p className="stat-label">Songs Rated</p>
                <p className="stat-value">{myRatings.length}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p className="stat-label">Avg Rating</p>
                <p className="stat-value">{avgRating}</p>
              </div>
              {latentProfile && (
                <div style={{ textAlign: 'center' }}>
                  <p className="stat-label">Compatibility</p>
                  <p className="stat-value" style={{ fontSize: '22px' }}>{Math.round(latentProfile.compatibilityScore)}%</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating distribution */}
        {myRatings.length > 0 && (
          <div className="section">
            <h3>Rating Distribution</h3>
            <div className="card">
              {ratingDist.map(({ star, count }) => (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ width: '60px', fontSize: '14px', color: '#fbbf24', flexShrink: 0 }}>
                    {'★'.repeat(star)}
                  </span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div
                      className="progress-fill"
                      style={{ width: myRatings.length > 0 ? `${(count / myRatings.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span style={{ width: '32px', fontSize: '13px', color: 'var(--muted-foreground)', textAlign: 'right', flexShrink: 0 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latent profile */}
        {latentProfile && (
          <div className="section">
            <h3>Latent Profile</h3>
            <div className="card" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {[['X', latentProfile.coordX], ['Y', latentProfile.coordY], ['Z', latentProfile.coordZ]].map(([axis, val]) => (
                <div key={String(axis)} style={{ textAlign: 'center' }}>
                  <p className="stat-label">{axis} Axis</p>
                  <code style={{ fontSize: '22px', fontWeight: '700', color: 'var(--accent)' }}>{Number(val).toFixed(3)}</code>
                </div>
              ))}
              <div style={{ textAlign: 'center' }}>
                <p className="stat-label">Best Match Score</p>
                <p style={{ fontSize: '22px', fontWeight: '700' }} className="gradient-text">{Math.round(latentProfile.compatibilityScore)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* My Ratings list */}
        <div className="section">
          <h3>My Ratings ({myRatings.length})</h3>
          {myRatings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>
              <h3>No ratings yet</h3>
              <p>Go to Rate Songs to start rating!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sortedRatings.map(r => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', background: 'var(--card)',
                    border: '1px solid var(--border)', borderRadius: '8px',
                  }}
                >
                  {r.song.coverUrl
                    ? <img src={r.song.coverUrl} alt={r.song.title} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🎵</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: '600', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.song.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{r.song.artist}</p>
                  </div>
                  <span style={{ color: '#fbbf24', fontSize: '14px', flexShrink: 0 }}>{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', flexShrink: 0 }}>
                    {new Date(r.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteRating(r.id)}
                    disabled={deletingId === r.id}
                    title="Remove rating"
                  >
                    {deletingId === r.id ? '…' : '✕'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
