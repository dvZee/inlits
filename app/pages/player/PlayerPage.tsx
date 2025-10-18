import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAudio } from '@/lib/audio-context';
import { Loader2, ArrowLeft } from 'lucide-react';

interface AudioContent {
  id: string;
  title: string;
  description?: string;
  cover_url?: string;
  audio_url?: string;
  duration?: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
  };
}

export function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setCurrentAudio, setPlayerVisible, setIsMainPlayerPage } = useAudio();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<AudioContent | null>(null);

  useEffect(() => {
    setIsMainPlayerPage(true);
    setPlayerVisible(true);

    return () => {
      setIsMainPlayerPage(false);
    };
  }, [setIsMainPlayerPage, setPlayerVisible]);

  useEffect(() => {
    const loadContent = async () => {
      if (!id) {
        setError('No content ID provided');
        setLoading(false);
        return;
      }

      try {
        const parts = id.split('-');
        const contentType = parts[0];
        const contentId = parts.slice(1).join('-');

        let data: any = null;
        let error: any = null;

        if (contentType === 'audiobook') {
          const result = await supabase
            .from('audiobooks')
            .select(`
              id,
              title,
              description,
              cover_url,
              audio_url,
              duration,
              author:profiles!audiobooks_author_id_fkey (
                id,
                name,
                username,
                avatar_url
              )
            `)
            .eq('id', contentId)
            .eq('status', 'published')
            .single();

          data = result.data;
          error = result.error;
        } else if (contentType === 'podcast') {
          const result = await supabase
            .from('podcast_episodes')
            .select(`
              id,
              title,
              description,
              cover_url,
              audio_url,
              duration,
              author:profiles!podcast_episodes_author_id_fkey (
                id,
                name,
                username,
                avatar_url
              )
            `)
            .eq('id', contentId)
            .eq('status', 'published')
            .single();

          data = result.data;
          error = result.error;
        }

        if (error) throw error;

        if (!data) {
          throw new Error('Content not found');
        }

        const author = Array.isArray(data.author) ? data.author[0] : data.author;

        setContent({
          ...data,
          author: author || { id: '', name: 'Unknown', username: 'unknown' }
        });

        setCurrentAudio({
          id: data.id,
          title: data.title,
          author: author?.name || 'Unknown',
          thumbnail: data.cover_url || 'https://placehold.co/600x600?text=Audio',
          audioUrl: data.audio_url || '',
          type: contentType as 'audiobook' | 'podcast',
          contentUrl: `/player/${id}`,
          chapters: []
        });
      } catch (err) {
        console.error('Error loading content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [id, setCurrentAudio]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Content Not Found</h2>
          <p className="text-muted-foreground">{error || 'The requested content could not be found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-32">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-80 aspect-square rounded-lg overflow-hidden shadow-xl flex-shrink-0">
              <img
                src={content.cover_url || 'https://placehold.co/600x600?text=Audio'}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{content.title}</h1>
                <p className="text-lg text-muted-foreground">
                  by {content.author.name}
                </p>
              </div>

              {content.description && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {content.description}
                  </p>
                </div>
              )}

              {content.duration && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Duration: {content.duration}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
