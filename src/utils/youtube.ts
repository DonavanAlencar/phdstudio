import axios from 'axios';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const PLAYLIST_ID = import.meta.env.VITE_YOUTUBE_PLAYLIST_ID;
const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

export interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    publishedAt: string;
}

/**
 * Converte a duração ISO 8601 do YouTube para formato legível (MM:SS ou HH:MM:SS)
 */
const parseISO8601Duration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const fetchPlaylistVideos = async (limit = 10): Promise<YouTubeVideo[]> => {
    if (!YOUTUBE_API_KEY) {
        console.warn('⚠️ VITE_YOUTUBE_API_KEY não configurada. O carrossel do YouTube não funcionará.');
        return [];
    }

    try {
        let targetPlaylistId = PLAYLIST_ID || 'PLZ_eiyZByK0GPtwxJspv8n9tkkKYFmXYa';

        // Se tivermos um Channel ID mas não uma Playlist ID, buscamos a playlist de 'uploads' do canal
        const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
        if (!PLAYLIST_ID && channelId) {
            try {
                const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
                    params: {
                        part: 'contentDetails',
                        id: channelId,
                        key: YOUTUBE_API_KEY,
                    },
                });
                const uploadsId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
                if (uploadsId) targetPlaylistId = uploadsId;
            } catch (e) {
                console.error('Erro ao buscar playlist de uploads do canal:', e);
            }
        }

        // 1. Buscar itens da playlist (Snippet)
        const playlistResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
            params: {
                part: 'snippet,contentDetails',
                maxResults: limit,
                playlistId: targetPlaylistId,
                key: YOUTUBE_API_KEY,
            },
        });

        const items = playlistResponse.data.items;
        if (!items || items.length === 0) return [];

        const videoIds = items.map((item: any) => item.contentDetails.videoId).join(',');

        // 2. Buscar detalhes dos vídeos (ContentDetails para duração)
        const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'contentDetails',
                id: videoIds,
                key: YOUTUBE_API_KEY,
            },
        });

        const videoDetails = videosResponse.data.items;

        // 3. Mapear dados combinados
        return items.map((item: any) => {
            const details = videoDetails.find((d: any) => d.id === item.contentDetails.videoId);
            return {
                id: item.contentDetails.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                duration: details ? parseISO8601Duration(details.contentDetails.duration) : '0:00',
                publishedAt: item.snippet.publishedAt,
            };
        });
    } catch (error) {
        console.error('❌ Erro ao buscar vídeos do YouTube:', error);
        return [];
    }
};
