import { useEffect } from 'react';
import { useMusicMatch } from '../context/MusicMatchContext';

export function LatentSpace() {
  const { latentUsers, latentProfile, latentHistory, loadingLatent, fetchLatent } = useMusicMatch();

  useEffect(() => { fetchLatent(); }, []);

  if (loadingLatent) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const myCoords = latentProfile ? { x: latentProfile.coordX, y: latentProfile.coordY, z: latentProfile.coordZ } : null;
  const sortedUsers = [...latentUsers].sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  const distanceTo = (u: { x: number; y: number; z: number }) => {
    if (!myCoords) return 0;
    return Math.hypot(u.x - myCoords.x, u.y - myCoords.y, u.z - myCoords.z);
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <h1>🧬 Latent Space</h1>
          <p>SVD-based 3D visualization of music taste profiles</p>
        </div>

        {/* My position */}
        {latentProfile && myCoords && (
          <div className="section">
            <h3>Your Position</h3>
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.1) 100%)', border: '1px solid rgba(124,58,237,0.4)' }}>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                {(['X', 'Y', 'Z'] as const).map((axis, i) => {
                  const val = [myCoords.x, myCoords.y, myCoords.z][i];
                  const colors = ['#9f5ef8', '#0891b2', '#06b6d4'];
                  return (
                    <div key={axis} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{axis} Axis</p>
                      <p style={{ fontSize: '28px', fontWeight: '700', color: colors[i], fontFamily: 'monospace' }}>{val.toFixed(3)}</p>
                    </div>
                  );
                })}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Best Match</p>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#fbbf24' }}>{Math.round(latentProfile.compatibilityScore)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2D scatter plot */}
        {sortedUsers.length > 0 && myCoords && (
          <div className="section">
            <h3>Space Map (X vs Y)</h3>
            <div className="card" style={{ padding: '0', position: 'relative', height: '320px', overflow: 'hidden' }}>
              {/* Axes */}
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'var(--border)', opacity: 0.3 }} />
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', backgroundColor: 'var(--border)', opacity: 0.3 }} />

              {sortedUsers.map(u => {
                const isMe = latentProfile && u.userId === latentProfile.userId;
                const isClosest = latentProfile && u.userId === latentProfile.closestUserId;
                const px = ((u.x + 1) / 2) * 100;
                const py = ((u.y + 1) / 2) * 100;
                return (
                  <div
                    key={u.userId}
                    title={`${u.userName} — ${Math.round(u.compatibilityScore)}% compatible`}
                    style={{
                      position: 'absolute',
                      left: `${Math.max(3, Math.min(96, px))}%`,
                      top: `${Math.max(3, Math.min(96, 100 - py))}%`,
                      transform: 'translate(-50%, -50%)',
                      width: isMe ? '18px' : '12px', height: isMe ? '18px' : '12px',
                      borderRadius: '50%',
                      backgroundColor: isMe ? '#a855f7' : isClosest ? '#fbbf24' : '#6366f1',
                      border: isMe ? '2px solid white' : 'none',
                      boxShadow: isMe ? '0 0 12px rgba(168,85,247,0.8)' : isClosest ? '0 0 8px rgba(251,191,36,0.6)' : 'none',
                      cursor: 'default', zIndex: isMe ? 10 : 1, transition: 'all 0.2s',
                    }}
                  />
                );
              })}
              {/* YOU label */}
              {myCoords && (
                <div style={{
                  position: 'absolute',
                  left: `${Math.max(3, Math.min(96, ((myCoords.x + 1) / 2) * 100))}%`,
                  top: `${Math.max(3, Math.min(96, 100 - ((myCoords.y + 1) / 2) * 100))}%`,
                  transform: 'translate(-50%, -130%)',
                  fontSize: '10px', color: '#a855f7', fontWeight: '700', pointerEvents: 'none', zIndex: 11, whiteSpace: 'nowrap',
                }}>YOU</div>
              )}
              {/* Legend */}
              <div style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '11px', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span>🟣 You</span><span>🟡 Best match</span><span>🔵 Others</span>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {latentHistory.length > 0 && (
          <div className="section">
            <h3>Your Evolution Over Time</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {latentHistory.slice(0, 10).map((h, i) => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', width: '20px', textAlign: 'center' }}>#{i + 1}</span>
                  <code style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'monospace', flex: 1 }}>
                    [{h.coordX.toFixed(3)}, {h.coordY.toFixed(3)}, {h.coordZ.toFixed(3)}]
                  </code>
                  <span className="badge badge-primary">{Math.round(h.compatibilityScore)}% compat</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', flexShrink: 0 }}>{h.ratingsCount} ratings</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User table */}
        <div className="section">
          <h3>All Users ({sortedUsers.length})</h3>
          {sortedUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧬</div>
              <h3>No latent data</h3>
              <p>Rate songs to compute your latent profile</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sortedUsers.map(u => {
                const isMe = latentProfile && u.userId === latentProfile.userId;
                const isClosest = latentProfile && u.userId === latentProfile.closestUserId;
                const dist = distanceTo(u);
                return (
                  <div key={u.userId} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                    background: isMe ? 'rgba(124,58,237,0.15)' : isClosest ? 'rgba(251,191,36,0.08)' : 'var(--card)',
                    border: `1px solid ${isMe ? 'rgba(124,58,237,0.5)' : isClosest ? 'rgba(251,191,36,0.4)' : 'var(--border)'}`,
                    borderRadius: '8px',
                  }}>
                    <div className="avatar avatar-sm">{u.userName[0].toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '600', fontSize: '14px' }}>
                        {u.userName}
                        {isMe && <span style={{ color: 'var(--primary)', fontSize: '12px' }}> (You)</span>}
                        {isClosest && !isMe && <span style={{ color: '#fbbf24', fontSize: '12px' }}> ⭐ Best match</span>}
                      </p>
                      <code style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>
                        [{u.x.toFixed(3)}, {u.y.toFixed(3)}, {u.z.toFixed(3)}]
                      </code>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: '700', fontSize: '14px', color: '#9f5ef8' }}>{Math.round(u.compatibilityScore)}%</p>
                      {!isMe && <p style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>d={dist.toFixed(3)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
