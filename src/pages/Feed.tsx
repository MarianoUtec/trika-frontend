import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicMatch } from '../context/MusicMatchContext';
import { Pagination } from '../components/Pagination';

const PAGE_SIZES = [10, 25, 50];

export function Feed() {
  const { feedItems, loadingFeed, fetchFeed, latentProfile, user } = useMusicMatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState<'all' | 'compatible'>('all');

  useEffect(() => { fetchFeed(); }, []);

  const filtered = filter === 'compatible'
    ? feedItems.filter(f => f.compatibilityScore >= 50)
    : feedItems;

  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <h1>📰 Social Feed</h1>
          <p>See what compatible users have been rating</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {(['all', 'compatible'] as const).map(f => (
            <button
              key={f}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => { setFilter(f); setPage(0); }}
            >
              {f === 'all' ? 'All Activity' : '🔗 50%+ Compatible'}
            </button>
          ))}
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={fetchFeed}>↻ Refresh</button>
        </div>

        {loadingFeed ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><div className="spinner" /></div>
        ) : paged.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📰</div>
            <h3>No feed items yet</h3>
            <p>{filter === 'compatible' ? 'No highly compatible users yet. Rate more songs!' : 'Rate more songs to start seeing activity from similar users.'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/rate')}>Rate Songs</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {paged.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  {/* Avatar */}
                  <div className="avatar avatar-md" style={{ flexShrink: 0 }}>{item.userName[0].toUpperCase()}</div>

                  {/* Song cover */}
                  {item.song.coverUrl
                    ? <img src={item.song.coverUrl} alt={item.song.title} style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: '44px', height: '44px', borderRadius: '6px', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🎵</div>
                  }

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px' }}>
                      <strong>{item.userName}</strong>
                      <span style={{ color: 'var(--muted-foreground)' }}> rated </span>
                      <strong>{item.song.title}</strong>
                      <span style={{ color: 'var(--muted-foreground)' }}> by {item.song.artist}</span>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ color: '#fbbf24' }}>{'★'.repeat(item.score)}{'☆'.repeat(5 - item.score)}</span>
                      <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{formatTime(item.ratedAt)}</span>
                    </div>
                  </div>

                  {/* Compatibility */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span
                      className={`badge ${item.compatibilityScore >= 70 ? 'badge-success' : item.compatibilityScore >= 40 ? 'badge-primary' : 'badge-info'}`}
                    >
                      {Math.round(item.compatibilityScore)}%
                    </span>
                    <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>compatible</p>
                  </div>

                  {/* Chat button */}
                  {item.userId !== user?.id && (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ flexShrink: 0 }}
                      onClick={() => navigate(`/chat?user=${item.userId}`)}
                      title={`Chat with ${item.userName}`}
                    >💬</button>
                  )}
                </div>
              ))}
            </div>

            <Pagination
              page={page} totalPages={totalPages} totalElements={totalElements}
              pageSize={pageSize} onPage={p => setPage(p)}
              onSizeChange={s => { setPageSize(s); setPage(0); }}
              pageSizes={PAGE_SIZES}
            />
          </>
        )}
      </div>
    </div>
  );
}
