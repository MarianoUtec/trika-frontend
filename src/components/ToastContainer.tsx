interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }

export function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: number) => void }) {
  if (!toasts.length) return null;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const colors = { success: '#4ade80', error: '#f87171', info: '#67e8f9' };
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 9999 }}>
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
            background: 'var(--card)', border: `1px solid ${colors[t.type]}40`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            animation: 'slideIn 0.2s ease', maxWidth: '320px',
            color: colors[t.type],
          }}
        >
          <span>{icons[t.type]}</span>
          <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>{t.message}</span>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }`}</style>
    </div>
  );
}
