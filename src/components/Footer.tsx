import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={footerStyle}>
      <div className="container" style={containerStyle}>
        <div style={logoSectionStyle}>
          <span style={logoTextStyle}>
            Manga<span style={logoStopStyle}>Zone</span>
          </span>
          <p style={taglineStyle}>A sua zona definitiva para ler mangás online gratuitamente.</p>
        </div>
        
        <hr style={dividerStyle} />
        
        <div style={bottomSectionStyle}>
          <p style={copyStyle}>
            &copy; {new Date().getFullYear()} MangaZone. Todos os direitos reservados.
          </p>
          <p style={creditStyle}>
            Feito com <Heart size={14} fill="var(--accent-pink)" color="var(--accent-pink)" style={{ display: 'inline', verticalAlign: 'middle' }} /> integrando a API oficial do MangaDex.
          </p>
        </div>
      </div>
    </footer>
  );
};

const footerStyle: React.CSSProperties = {
  background: 'rgba(8, 12, 20, 0.8)',
  borderTop: '1px solid var(--border-color)',
  padding: '3rem 0 2rem 0',
  marginTop: 'auto',
  width: '100%',
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
};

const logoSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '2rem',
};

const logoTextStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
};

const logoStopStyle: React.CSSProperties = {
  background: 'var(--accent-gradient)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const taglineStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: 'var(--text-secondary)',
  maxWidth: '400px',
};

const dividerStyle: React.CSSProperties = {
  width: '100%',
  border: 'none',
  borderTop: '1px solid var(--border-color)',
  margin: '0 0 1.5rem 0',
};

const bottomSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  flexWrap: 'wrap',
  gap: '1rem',
};

const copyStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
};

const creditStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
};

// CSS stylesheet styles for responsiveness
const responsiveStyles = `
  @media (max-width: 768px) {
    footer div[style*="bottomSectionStyle"] {
      flex-direction: column !important;
      text-align: center !important;
    }
  }
`;
const styleEl = document.createElement('style');
styleEl.textContent = responsiveStyles;
document.head?.appendChild(styleEl);
