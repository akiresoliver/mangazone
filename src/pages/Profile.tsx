import React, { useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useProfile } from '../hooks/useProfile';
import { Crown, LogOut, Settings, Star, Camera, Image as ImageIcon, Check } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, isVip, logout } = useAuth();
  const { theme, setTheme, customColor, setCustomColor } = useTheme();
  const { banner, avatar, xp, level, updateBanner, updateAvatar } = useProfile();
  
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Você precisa estar logado para ver esta página.</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Faça login no topo da página.</p>
      </div>
    );
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateBanner(e.target.files[0]);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateAvatar(e.target.files[0]);
    }
  };

  return (
    <div className="container slide-up" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Banner & Avatar Header */}
      <div style={profileHeaderStyle}>
        <div style={{...bannerAreaStyle, backgroundImage: banner ? `url(${banner})` : 'var(--bg-surface)'}}>
          <div style={bannerOverlayStyle}>
            <button 
              onClick={() => bannerInputRef.current?.click()} 
              style={editBtnStyle}
              title="Trocar Banner"
            >
              <ImageIcon size={18} />
              <span className="desktop-only">Alterar Banner</span>
            </button>
            <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" style={{display: 'none'}} />
          </div>
        </div>

        <div style={userInfoAreaStyle}>
          <div style={avatarContainerStyle}>
            <img 
              src={avatar || user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
              alt="Avatar" 
              style={{...avatarStyle, border: isVip ? '4px solid var(--accent-pink)' : '4px solid var(--bg-base)'}} 
            />
            {isVip && <Crown size={24} style={vipBadgeStyle} />}
            
            <button onClick={() => avatarInputRef.current?.click()} style={editAvatarBtnStyle} title="Trocar Foto">
              <Camera size={16} />
            </button>
            <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" style={{display: 'none'}} />
          </div>
          
          <div style={infoContainerStyle}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>{user.displayName}</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{user.email}</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {isVip ? (
                <span className="badge badge-pink" style={{ fontSize: '0.9rem', padding: '0.3rem 0.6rem' }}>
                  <Crown size={16} /> Membro VIP
                </span>
              ) : (
                <span className="badge badge-cyan" style={{ fontSize: '0.9rem', padding: '0.3rem 0.6rem' }}>
                  Membro Gratuito
                </span>
              )}
              <span className="badge" style={{ fontSize: '0.9rem', padding: '0.3rem 0.6rem', background: 'var(--bg-surface-hover)', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)' }}>
                Nível {level}
              </span>
            </div>
            
            {/* XP Progress Bar */}
            <div style={{ width: '100%', maxWidth: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                <span>XP de Leitura</span>
                <span>{xp % 500} / 500 XP</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(xp % 500) / 5}px`, minWidth: `${(xp % 500) / 5}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '4px', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={dashboardGridStyle}>
        {/* Premium Theme Selector */}
        <div className="glass" style={{...cardStyle, gridColumn: '1 / -1'}}>
          <div style={cardHeaderStyle}>
            <Settings size={20} color="var(--accent-purple)" />
            <h3>Personalização de Tema</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Escolha um visual pré-definido ou crie sua própria paleta de cores.
          </p>
          
          <div style={themeGridStyle}>
            {/* Original Card */}
            <div 
              style={{...themeCardStyle, borderColor: theme === 'original' ? '#8b5cf6' : 'var(--border-color)'}}
              onClick={() => setTheme('original')}
            >
              <div style={{...themePreviewStyle, background: 'linear-gradient(135deg, #8b5cf6, #d946ef)'}}>
                {theme === 'original' && <Check color="white" />}
              </div>
              <div style={themeInfoStyle}>
                <span style={{fontWeight: 'bold'}}>MangaZone Original</span>
                <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Tema Místico</span>
              </div>
            </div>

            {/* Deku Card */}
            <div 
              style={{...themeCardStyle, borderColor: theme === 'deku' ? '#10b981' : 'var(--border-color)'}}
              onClick={() => setTheme('deku')}
            >
              <div style={{...themePreviewStyle, background: 'linear-gradient(135deg, #10b981, #059669)'}}>
                {theme === 'deku' && <Check color="white" />}
              </div>
              <div style={themeInfoStyle}>
                <span style={{fontWeight: 'bold'}}>Verde Esmeralda</span>
                <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Modo Deku</span>
              </div>
            </div>

            {/* Slime Card */}
            <div 
              style={{...themeCardStyle, borderColor: theme === 'slime' ? '#0ea5e9' : 'var(--border-color)'}}
              onClick={() => setTheme('slime')}
            >
              <div style={{...themePreviewStyle, background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)'}}>
                {theme === 'slime' && <Check color="white" />}
              </div>
              <div style={themeInfoStyle}>
                <span style={{fontWeight: 'bold'}}>Azul Ciano</span>
                <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Modo Slime</span>
              </div>
            </div>

            {/* Sukuna Card */}
            <div 
              style={{...themeCardStyle, borderColor: theme === 'sukuna' ? '#ef4444' : 'var(--border-color)'}}
              onClick={() => setTheme('sukuna')}
            >
              <div style={{...themePreviewStyle, background: 'linear-gradient(135deg, #ef4444, #991b1b)'}}>
                {theme === 'sukuna' && <Check color="white" />}
              </div>
              <div style={themeInfoStyle}>
                <span style={{fontWeight: 'bold'}}>Vermelho Sangue</span>
                <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Modo Sukuna</span>
              </div>
            </div>

            {/* Custom Color Card */}
            <div 
              style={{...themeCardStyle, borderColor: theme === 'custom' ? customColor : 'var(--border-color)'}}
            >
              <div style={{...themePreviewStyle, background: customColor, position: 'relative'}}>
                <input 
                  type="color" 
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  style={colorPickerInputStyle}
                />
                {theme === 'custom' && <Check color="white" style={{pointerEvents: 'none', position: 'relative', zIndex: 2}} />}
              </div>
              <div style={themeInfoStyle}>
                <span style={{fontWeight: 'bold'}}>Cor Customizada</span>
                <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Escolha o tom exato</span>
              </div>
            </div>
            
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

// Styles

const profileHeaderStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-md)',
  marginBottom: '2rem',
  overflow: 'hidden',
  border: '1px solid var(--border-color)',
};

const bannerAreaStyle: React.CSSProperties = {
  height: '200px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
};

const bannerOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
  padding: '1rem',
};

const userInfoAreaStyle: React.CSSProperties = {
  padding: '0 2rem 2rem 2rem',
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'flex-start',
  marginTop: '-50px',
};

const avatarContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '120px',
  height: '120px',
  flexShrink: 0,
};

const avatarStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  objectFit: 'cover',
  backgroundColor: 'var(--bg-base)',
};

const vipBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  right: 10,
  background: '#1a1a2e',
  color: '#ffd700',
  borderRadius: '50%',
  padding: '4px',
};

const editBtnStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.6)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.2)',
  padding: '0.5rem 1rem',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.85rem',
  backdropFilter: 'blur(4px)',
};

const editAvatarBtnStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 5,
  left: 5,
  background: 'var(--accent-purple)',
  color: 'white',
  border: 'none',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
};

const infoContainerStyle: React.CSSProperties = {
  flex: 1,
  paddingTop: '60px', // Push down text below avatar
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

const themeGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '1rem',
};

const themeCardStyle: React.CSSProperties = {
  background: 'var(--bg-base)',
  border: '2px solid',
  borderRadius: 'var(--radius-sm)',
  padding: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const themePreviewStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const themeInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const colorPickerInputStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  cursor: 'pointer',
  zIndex: 1,
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
