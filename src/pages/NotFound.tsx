import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state">
        <div className="empty-icon">🎵</div>
        <h3 style={{ fontSize: '24px' }}>404 — Page not found</h3>
        <p>The page you're looking for doesn't exist.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Dashboard</button>
      </div>
    </div>
  );
}
