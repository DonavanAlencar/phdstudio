import axios from 'axios';

const getYouTubeApiBase = () => {
  if (import.meta.env.VITE_YOUTUBE_API_URL) return import.meta.env.VITE_YOUTUBE_API_URL;
  const apiUrl = import.meta.env.VITE_API_URL || 'https://phdstudio.com.br/api';
  const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
  return `${baseUrl}/youtube`;
};

const BACKEND_YT = getYouTubeApiBase();
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const PLAYLIST_ID = 'UU_s3s_4pA_p-yQY_k_E8B_w';
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
    try {
        try {
            const controller = new AbortController();
            const t = setTimeout(() => controller.abort(), 15000);
            const force = import.meta.env.DEV ? '&force=1' : '';
            const r = await fetch(`${BACKEND_YT}/videos?limit=${limit}&v=${Date.now()}${force}`, { signal: controller.signal });
            clearTimeout(t);
            if (r.ok) {
                const j = await r.json();
                if (j?.success && Array.isArray(j.data)) {
                    const v: YouTubeVideo[] = j.data.slice(0, limit);
                    return v;
                }
            }
        } catch (e) {}

        if (!YOUTUBE_API_KEY) {
            return [];
        }

        let targetPlaylistId = PLAYLIST_ID || 'PLZ_eiyZByK0GPtwxJspv8n9tkkKYFmXYa';

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
                
            }
        }

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

        const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'contentDetails',
                id: videoIds,
                key: YOUTUBE_API_KEY,
            },
        });

        const videoDetails = videosResponse.data.items;

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
        return [];
    }
};
