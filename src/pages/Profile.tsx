import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Crown, LogOut, Settings, Star } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, isVip, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Você precisa estar logado para ver esta página.</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Faça login no topo da página.</p>
      </div>
    );
  }

  return (
    <div className="container slide-up" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass" style={profileHeaderStyle}>
        <div style={avatarContainerStyle}>
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
            alt="Avatar" 
            style={{...avatarStyle, border: isVip ? '3px solid var(--accent-pink)' : '3px solid var(--border-color)'}} 
          />
          {isVip && <Crown size={24} style={vipBadgeStyle} />}
        </div>
        <div style={infoContainerStyle}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>{user.displayName}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{user.email}</p>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isVip ? (
              <span className="badge badge-pink" style={{ fontSize: '0.9rem', padding: '0.3rem 0.6rem' }}>
                <Crown size={16} /> Membro VIP
              </span>
            ) : (
              <span className="badge badge-cyan" style={{ fontSize: '0.9rem', padding: '0.3rem 0.6rem' }}>
                Membro Gratuito
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={dashboardGridStyle}>
        <div className="glass" style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Settings size={20} color="var(--accent-purple)" />
            <h3>Personalização de Tema</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Escolha o visual do seu leitor inspirado em clássicos.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setTheme('original')} 
              style={{...themeBtnStyle, background: '#8b5cf6', borderColor: theme === 'original' ? 'white' : 'transparent'}}
              title="MangaZone Original"
            />
            <button 
              onClick={() => setTheme('deku')} 
              style={{...themeBtnStyle, background: '#10b981', borderColor: theme === 'deku' ? 'white' : 'transparent'}}
              title="Modo Deku (Verde)"
            />
            <button 
              onClick={() => setTheme('slime')} 
              style={{...themeBtnStyle, background: '#0ea5e9', borderColor: theme === 'slime' ? 'white' : 'transparent'}}
              title="Modo Slime (Azul)"
            />
            <button 
              onClick={() => setTheme('sukuna')} 
              style={{...themeBtnStyle, background: '#ef4444', borderColor: theme === 'sukuna' ? 'white' : 'transparent'}}
              title="Modo Sukuna (Vermelho)"
            />
          </div>
        </div>

        <div className="glass" style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Star size={20} color="var(--accent-pink)" />
            <h3>Meus Dados</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Seus favoritos e histórico estão sendo salvos no seu navegador atual.
          </p>
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <button onClick={() => { logout(); window.location.hash = '#/'; }} style={logoutBtnStyle}>
              <LogOut size={16} /> Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const profileHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '2rem',
  padding: '2rem',
  borderRadius: 'var(--radius-md)',
  marginBottom: '2rem',
};

const avatarContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '120px',
  height: '120px',
};

const avatarStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  objectFit: 'cover',
};

const vipBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  right: 0,
  background: '#1a1a2e',
  color: '#ffd700',
  borderRadius: '50%',
  padding: '4px',
};

const infoContainerStyle: React.CSSProperties = {
  flex: 1,
};

const dashboardGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '1.5rem',
};

const cardStyle: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: 'var(--radius-md)',
  display: 'flex',
  flexDirection: 'column',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '1rem',
};

const logoutBtnStyle: React.CSSProperties = {
  background: 'rgba(255, 50, 50, 0.1)',
  color: '#ff5555',
  border: '1px solid rgba(255, 50, 50, 0.2)',
  padding: '0.5rem 1rem',
  borderRadius: 'var(--radius-sm)',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const themeBtnStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '2px solid transparent',
  cursor: 'pointer',
  transition: 'transform 0.2s',
};
