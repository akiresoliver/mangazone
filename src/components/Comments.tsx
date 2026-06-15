import React, { useEffect } from 'react';

interface CommentsProps {
  url: string;
  identifier: string;
  title: string;
}

export const Comments: React.FC<CommentsProps> = ({ url, identifier, title }) => {
  useEffect(() => {
    // Reset disqus if it already exists
    if ((window as any).DISQUS) {
      (window as any).DISQUS.reset({
        reload: true,
        config: function () {
          this.page.url = url;
          this.page.identifier = identifier;
          this.page.title = title;
        }
      });
    } else {
      // First load
      (window as any).disqus_config = function () {
        this.page.url = url;
        this.page.identifier = identifier;
        this.page.title = title;
      };

      const d = document;
      const s = d.createElement('script');
      s.src = 'https://mangazone-demo.disqus.com/embed.js';
      s.setAttribute('data-timestamp', new Date().getTime().toString());
      (d.head || d.body).appendChild(s);
    }
  }, [url, identifier, title]);

  return (
    <div style={commentsContainerStyle} className="fade-in">
      <div style={headerStyle}>
        <h3>Comentários da Comunidade</h3>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Compartilhe suas teorias e opiniões com outros leitores!</p>
      </div>
      <div id="disqus_thread" style={{ minHeight: '300px' }}></div>
      <noscript>
        Por favor, ative o JavaScript para ver os comentários suportados por Disqus.
      </noscript>
    </div>
  );
};

const commentsContainerStyle: React.CSSProperties = {
  marginTop: '3rem',
  padding: '2rem',
  background: 'var(--bg-surface)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)'
};

const headerStyle: React.CSSProperties = {
  marginBottom: '2rem',
  paddingBottom: '1rem',
  borderBottom: '1px solid var(--border-color)',
};
