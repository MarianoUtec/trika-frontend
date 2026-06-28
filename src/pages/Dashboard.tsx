import { useNavigate } from 'react-router-dom';
import { useMusicMatch } from '../context/MusicMatchContext';

function SongRow({ song, score }: { song: any; score: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: 'var(--muted)', borderRadius: '8px' }}>
      {song.coverUrl
        ? <img src={song.coverUrl} alt={song.title} style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
        : <div style={{ width: '42px', height: '42px', borderRadius: '6px', backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🎵</div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: '600', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</p>
        <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.artist}</p>
      </div>
      <div style={{ display: 'flex', gap: '1px', flexShrink: 0 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ color: i < score ? '#fbbf24' : 'var(--border)', fontSize: '14px' }}>★</span>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user, myRatings, recommendation, latentProfile, latentUsers, loadingRatings, loadingRecs, feedItems } = useMusicMatch();
  const navigate = useNavigate();

  const topRatings = [...myRatings].sort((a, b) => b.score - a.score).slice(0, 5);
  const avgRating = myRatings.length > 0 ? (myRatings.reduce((sum, r) => sum + r.score, 0) / myRatings.length).toFixed(1) : '—';
  const closestUser = latentProfile ? latentUsers.find(u => u.userId === latentProfile.closestUserId) : null;

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <h1>Welcome, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
          <p>Your music taste profile at a glance</p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-label">Songs Rated</p>
            <p className="stat-value">{myRatings.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Avg Rating</p>
            <p className="stat-value">{avgRating}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Recommendations</p>
            <p className="stat-value">{recommendation?.songs?.length ?? '—'}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Compatibility</p>
            <p className="stat-value" style={{ fontSize: '24px' }}>
              {latentProfile ? `${Math.round(latentProfile.compatibilityScore)}%` : '—'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
          {/* Top Rated Songs */}
          <div className="section" style={{ gridColumn: '1' }}>
            <h3>⭐ Top Rated Songs</h3>
            <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loadingRatings ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><div className="spinner" /></div>
              ) : topRatings.length > 0 ? topRatings.map(r => (
                <SongRow key={r.id} song={r.song} score={r.score} />
              )) : (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <p>No ratings yet</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => navigate('/rate')}>Rate Songs →</button>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Most Compatible */}
            {(closestUser || latentProfile) && (
              <div className="section" style={{ marginBottom: 0 }}>
                <h3>🧬 Most Compatible User</h3>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px' }}>
                  <div className="avatar avatar-lg">{(closestUser?.userName || 'U')[0].toUpperCase()}</div>
                  <p style={{ fontWeight: '700', fontSize: '18px' }}>{closestUser?.userName || `User #${latentProfile?.closestUserId}`}</p>
                  <p style={{ fontSize: '36px', fontWeight: '800' }} className="gradient-text">{Math.round(latentProfile?.compatibilityScore || 0)}%</p>
                  {latentProfile && (
                    <code style={{ fontSize: '11px', color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)', padding: '4px 8px', borderRadius: '4px' }}>
                      [{latentProfile.coordX.toFixed(2)}, {latentProfile.coordY.toFixed(2)}, {latentProfile.coordZ.toFixed(2)}]
                    </code>
                  )}
                  <button className="btn btn-outline btn-sm" onClick={() => navigate('/latent-space')}>View Latent Space →</button>
                </div>
              </div>
            )}

            {/* Rec preview */}
            {recommendation && recommendation.songs.length > 0 && (
              <div className="section" style={{ marginBottom: 0 }}>
                <h3>⚡ Latest Recommendations</h3>
                <div className="card" style={{ padding: '16px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '12px' }}>
                    Based on <strong style={{ color: '#9f5ef8' }}>{recommendation.basedOnUserName}</strong>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recommendation.songs.slice(0, 3).map(song => (
                      <SongRow key={song.id} song={song} score={0} />
                    ))}
                  </div>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }} onClick={() => navigate('/recommendations')}>See all →</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Social feed preview */}
        {feedItems.length > 0 && (
          <div className="section" style={{ marginTop: '8px' }}>
            <h3>📰 Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {feedItems.slice(0, 3).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <div className="avatar avatar-sm">{item.userName[0].toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: '600', fontSize: '13px' }}>{item.userName}</span>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}> rated </span>
                    <span style={{ fontWeight: '600', fontSize: '13px' }}>{item.song.title}</span>
                    <span style={{ color: '#fbbf24', marginLeft: '6px' }}>{'★'.repeat(item.score)}</span>
                  </div>
                  <span className="badge badge-info">{Math.round(item.compatibilityScore)}% match</span>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '8px' }} onClick={() => navigate('/feed')}>View all →</button>
          </div>
        )}

        {/* Quick actions if no data */}
        {myRatings.length === 0 && !loadingRatings && (
          <div className="card" style={{ textAlign: 'center', padding: '40px', marginTop: '8px' }}>
            <p style={{ fontSize: '40px', marginBottom: '16px' }}>🎶</p>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Get started!</h3>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '20px' }}>Rate some songs to unlock recommendations and find your music twin.</p>
            <button className="btn btn-primary" onClick={() => navigate('/rate')}>Rate Songs Now</button>
          </div>
        )}
      </div>
    </div>
  );
}
