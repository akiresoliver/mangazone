import React from 'react';

// Styling for skeletons is defined in index.css as .skeleton

export const MangaCardSkeleton: React.FC = () => {
  return (
    <div style={cardStyle}>
      <div className="skeleton" style={imageStyle} />
      <div style={contentStyle}>
        <div className="skeleton" style={titleStyle} />
        <div className="skeleton" style={authorStyle} />
        <div style={badgeContainerStyle}>
          <div className="skeleton" style={badgeStyle} />
          <div className="skeleton" style={badgeStyle} />
        </div>
      </div>
    </div>
  );
};

export const MangaGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div style={gridStyle}>
      {Array.from({ length: count }).map((_, i) => (
        <MangaCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const MangaDetailsSkeleton: React.FC = () => {
  return (
    <div style={detailsContainerStyle} className="slide-up">
      <div className="skeleton" style={bannerStyle} />
      <div style={infoGridStyle}>
        <div className="skeleton" style={detailCoverStyle} />
        <div style={metaStyle}>
          <div className="skeleton" style={detailTitleStyle} />
          <div className="skeleton" style={detailAuthorStyle} />
          <div style={detailTagsContainerStyle}>
            <div className="skeleton" style={{ ...badgeStyle, width: '70px', height: '24px' }} />
            <div className="skeleton" style={{ ...badgeStyle, width: '90px', height: '24px' }} />
            <div className="skeleton" style={{ ...badgeStyle, width: '60px', height: '24px' }} />
          </div>
          <div className="skeleton" style={descLineStyle} />
          <div className="skeleton" style={descLineStyle} />
          <div className="skeleton" style={{ ...descLineStyle, width: '60%' }} />
        </div>
      </div>
    </div>
  );
};

// Styles
const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '1.5rem',
  width: '100%',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  height: '350px',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '240px',
};

const contentStyle: React.CSSProperties = {
  padding: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  flex: 1,
};

const titleStyle: React.CSSProperties = {
  height: '18px',
  width: '85%',
  borderRadius: '4px',
};

const authorStyle: React.CSSProperties = {
  height: '12px',
  width: '50%',
  borderRadius: '4px',
};

const badgeContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.25rem',
  marginTop: 'auto',
};

const badgeStyle: React.CSSProperties = {
  height: '18px',
  width: '45px',
  borderRadius: '4px',
};

// Details Styles
const detailsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  width: '100%',
  paddingBottom: '3rem',
};

const bannerStyle: React.CSSProperties = {
  height: '280px',
  width: '100%',
  borderRadius: 'var(--radius-lg)',
};

const infoGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '240px 1fr',
  gap: '2rem',
  marginTop: '-120px',
  padding: '0 2rem',
  alignItems: 'end',
};

const detailCoverStyle: React.CSSProperties = {
  width: '240px',
  height: '340px',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-lg)',
  border: '2px solid var(--border-color)',
};

const metaStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  flex: 1,
  paddingBottom: '1rem',
};

const detailTitleStyle: React.CSSProperties = {
  height: '36px',
  width: '70%',
  borderRadius: '6px',
};

const detailAuthorStyle: React.CSSProperties = {
  height: '18px',
  width: '30%',
  borderRadius: '4px',
};

const detailTagsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  margin: '0.5rem 0',
};

const descLineStyle: React.CSSProperties = {
  height: '14px',
  width: '100%',
  borderRadius: '4px',
};
