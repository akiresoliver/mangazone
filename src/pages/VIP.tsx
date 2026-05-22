import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Crown, Check, Zap, Image, Paintbrush, Loader2 } from 'lucide-react';

export const VIP: React.FC = () => {
  const { user, isVip, simulateVipPurchase } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      alert("Faça login primeiro para se tornar VIP!");
      return;
    }
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    await simulateVipPurchase();
    setLoading(false);
    setSuccess(true);
  };

  if (isVip && !success) {
    return (
      <div className="container slide-up" style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '60vh' }}>
        <Crown size={64} style={{ color: '#ffd700', margin: '0 auto 1rem auto' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Você já é um Membro VIP!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          Obrigado por apoiar o MangaZone! Você já tem acesso a todos os recursos exclusivos, emblemas personalizados e navegação sem anúncios.
        </p>
        <button onClick={() => window.location.hash = '#/perfil'} style={backBtnStyle}>
          Ir para o Meu Perfil
        </button>
      </div>
    );
  }

  return (
    <div className="container slide-up" style={{ padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Crown size={48} style={{ color: 'var(--accent-pink)', margin: '0 auto 1rem auto' }} />
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          MangaZone Premium
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Eleve sua experiência de leitura ao máximo.</p>
      </div>

      {success ? (
        <div className="glass fade-in" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Check size={40} color="#22c55e" />
          </div>
          <h2>Pagamento Aprovado!</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '2rem' }}>
            Parabéns! Agora você é um membro VIP oficial do MangaZone.
          </p>
          <button onClick={() => window.location.hash = '#/perfil'} style={primaryBtnStyle}>
            Acessar Meu Painel VIP
          </button>
        </div>
      ) : (
        <div style={pricingGridStyle}>
          <div className="glass" style={pricingCardStyle}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Plano Gratuito</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>R$ 0<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/mês</span></div>
            <ul style={featuresListStyle}>
              <li style={featureStyle}><Check size={18} color="#22c55e" /> Milhares de Mangás</li>
              <li style={featureStyle}><Check size={18} color="#22c55e" /> Atualizações Diárias</li>
              <li style={featureStyle}><Check size={18} color="#22c55e" /> Salvar Favoritos no Navegador</li>
              <li style={{ ...featureStyle, opacity: 0.5 }}><XIcon size={18} /> Com Anúncios</li>
              <li style={{ ...featureStyle, opacity: 0.5 }}><XIcon size={18} /> Temas Padrão</li>
            </ul>
            <button style={secondaryBtnStyle} disabled>Seu Plano Atual</button>
          </div>

          <div className="glass" style={{ ...pricingCardStyle, border: '2px solid var(--accent-pink)', transform: 'scale(1.05)', position: 'relative' }}>
            <div style={badgeStyle}>Mais Popular</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-pink)' }}>Membro VIP</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>R$ 14,90<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/mês</span></div>
            <ul style={featuresListStyle}>
              <li style={featureStyle}><Zap size={18} color="#ffd700" /> Navegação 100% Sem Anúncios</li>
              <li style={featureStyle}><Image size={18} color="#ffd700" /> Qualidade de Imagem Máxima</li>
              <li style={featureStyle}><Paintbrush size={18} color="#ffd700" /> Personalização de Cores (Em Breve)</li>
              <li style={featureStyle}><Crown size={18} color="#ffd700" /> Emblema VIP no Perfil e Comentários</li>
            </ul>
            <button onClick={handlePurchase} style={primaryBtnStyle} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Assinar VIP Agora (Simulação)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const XIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const pricingGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2rem',
  padding: '1rem',
};

const pricingCardStyle: React.CSSProperties = {
  padding: '2.5rem',
  borderRadius: 'var(--radius-lg)',
  display: 'flex',
  flexDirection: 'column',
};

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-12px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'var(--accent-gradient)',
  padding: '4px 16px',
  borderRadius: '20px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  color: 'white',
};

const featuresListStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '0 0 2rem 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  flex: 1,
};

const featureStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  fontSize: '1rem',
};

const primaryBtnStyle: React.CSSProperties = {
  background: 'var(--accent-gradient)',
  color: 'white',
  border: 'none',
  padding: '1rem',
  borderRadius: 'var(--radius-sm)',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.2s',
  boxShadow: 'var(--glow-purple)',
};

const secondaryBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-secondary)',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '1rem',
  borderRadius: 'var(--radius-sm)',
  fontWeight: 'bold',
  fontSize: '1.1rem',
};

const backBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  color: 'white',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: 'var(--radius-sm)',
  fontWeight: 'bold',
  cursor: 'pointer',
};
