import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAudio } from '@/lib/audio-context';
import { Loader2, ArrowLeft } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  audio_url: string;
  duration: string;
  order: number;
}

interface AudioContent {
  id: string;
  title: string;
  description?: string;
  cover_url?: string;
  file_url?: string;
  audio_url?: string;
  duration?: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
  };
  chapters?: Chapter[];
}

export function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setCurrentAudio, setPlayerVisible } = useAudio();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<AudioContent | null>(null);

  useEffect(() => {
    setPlayerVisible(true);
  }, [setPlayerVisible]);

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
              file_url,
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

          if (!error && data) {
            const chaptersResult = await supabase
              .from('audiobook_chapters')
              .select('id, title, audio_url, duration, order')
              .eq('audiobook_id', contentId)
              .order('order', { ascending: true });

            if (chaptersResult.data) {
              data.chapters = chaptersResult.data;
            }
          }
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

        const contentData = {
          ...data,
          author: author || { id: '', name: 'Unknown', username: 'unknown' }
        };

        setContent(contentData);

        const audioUrl = contentType === 'audiobook'
          ? (data.chapters && data.chapters.length > 0 ? data.chapters[0].audio_url : data.file_url || '')
          : data.audio_url || '';

        const chapters = contentType === 'audiobook' && data.chapters
          ? data.chapters.map((ch: any) => ({
              id: ch.id,
              title: ch.title,
              audio_url: ch.audio_url,
              duration: ch.duration
            }))
          : [];

        setCurrentAudio({
          id: data.id,
          title: data.title,
          author: author?.name || 'Unknown',
          thumbnail: data.cover_url || 'https://placehold.co/600x600?text=Audio',
          audioUrl,
          type: contentType as 'audiobook' | 'podcast',
          contentUrl: `/player/${id}`,
          chapters
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

              {content.chapters && content.chapters.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Chapters</h2>
                  <div className="space-y-2">
                    {content.chapters.map((chapter, index) => (
                      <div
                        key={chapter.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-8">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium">{chapter.title}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{chapter.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
