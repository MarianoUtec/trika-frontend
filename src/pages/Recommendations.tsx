import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicMatch } from '../context/MusicMatchContext';

export function Recommendations() {
  const { recommendation, loadingRecs, fetchRecommendations, latentProfile, latentUsers } = useMusicMatch();
  const navigate = useNavigate();

  useEffect(() => { fetchRecommendations(); }, []);

  const closestUser = latentProfile ? latentUsers.find(u => u.userId === latentProfile.closestUserId) : null;

  if (loadingRecs) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const songs = recommendation?.songs ?? [];

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <h1>⚡ Recommendations</h1>
          <p>Songs tailored to your taste via SVD collaborative filtering</p>
        </div>

        {songs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎵</div>
            <h3>No recommendations yet</h3>
            <p>Rate more songs so the algorithm can find your taste.</p>
            <button className="btn btn-primary" onClick={() => navigate('/rate')}>Rate Songs</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }}>
            {/* Songs */}
            <div>
              {recommendation && (
                <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '20px' }}>
                  Based on <strong style={{ color: '#9f5ef8' }}>{recommendation.basedOnUserName}</strong>'s taste —{' '}
                  <span className="badge badge-info">{Math.round(latentProfile?.compatibilityScore || 0)}% compatible</span>
                </p>
              )}
              <div className="songs-grid">
                {songs.map(song => (
                  <div key={song.id} className="song-card">
                    {song.coverUrl
                      ? <img className="song-cover" src={song.coverUrl} alt={song.title} />
                      : <div className="song-cover-placeholder">🎵</div>
                    }
                    <div className="song-info">
                      <h4 title={song.title}>{song.title}</h4>
                      <p className="artist">{song.artist}</p>
                      {song.albumName && <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '8px' }}>💿 {song.albumName}</p>}
                      {song.previewUrl && (
                        <audio controls style={{ width: '100%', height: '28px', marginTop: '8px' }}>
                          <source src={song.previewUrl} />
                        </audio>
                      )}
                      {/* Audio features */}
                      {(song.danceability != null || song.energy != null || song.valence != null) && (
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {song.danceability != null && (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '2px' }}>
                                <span>Danceability</span><span>{Math.round(song.danceability * 100)}%</span>
                              </div>
                              <div className="progress-bar" style={{ height: '4px' }}>
                                <div className="progress-fill" style={{ width: `${song.danceability * 100}%` }} />
                              </div>
                            </div>
                          )}
                          {song.energy != null && (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '2px' }}>
                                <span>Energy</span><span>{Math.round(song.energy * 100)}%</span>
                              </div>
                              <div className="progress-bar" style={{ height: '4px' }}>
                                <div className="progress-fill" style={{ width: `${song.energy * 100}%`, background: 'linear-gradient(90deg, var(--secondary) 0%, var(--accent) 100%)' }} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar: compatible user */}
            <div>
              {(closestUser || latentProfile) && (
                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(8,145,178,0.1) 100%)', border: '1px solid rgba(124,58,237,0.3)' }}>
                  <h3 style={{ marginBottom: '20px' }}>🧬 Your Music Twin</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                    <div className="avatar avatar-lg">{(recommendation?.basedOnUserName || 'U')[0].toUpperCase()}</div>
                    <p style={{ fontWeight: '700', fontSize: '18px' }}>{recommendation?.basedOnUserName}</p>
                    <p className="gradient-text" style={{ fontSize: '40px', fontWeight: '800' }}>
                      {Math.round(latentProfile?.compatibilityScore || 0)}%
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>compatibility score</p>
                    {closestUser && (
                      <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Latent Coordinates</p>
                        <code style={{ fontSize: '12px', color: 'var(--accent)' }}>
                          [{closestUser.x.toFixed(3)}, {closestUser.y.toFixed(3)}, {closestUser.z.toFixed(3)}]
                        </code>
                      </div>
                    )}
                    <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => navigate(`/chat`)}>
                      💬 Start Chat
                    </button>
                  </div>
                </div>
              )}

              {/* Other close users */}
              {latentUsers.length > 1 && latentProfile && (
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Other close users</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {latentUsers
                      .filter(u => u.userId !== latentProfile.userId)
                      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
                      .slice(0, 5)
                      .map(u => (
                        <div key={u.userId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                          <div className="avatar avatar-sm">{u.userName[0].toUpperCase()}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: '600', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.userName}</p>
                            <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>
                              [{u.x.toFixed(2)}, {u.y.toFixed(2)}, {u.z.toFixed(2)}]
                            </p>
                          </div>
                          <span className="badge badge-primary">{Math.round(u.compatibilityScore)}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
