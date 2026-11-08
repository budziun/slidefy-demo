import axios from 'axios';
import { mockApi } from './mockApi';
import { setupMockSpotifySdk } from './mockSpotifySdk';

export function initMocks() {
  setupMockSpotifySdk();

  // Custom Axios adapter to intercept all backend calls in the browser
  axios.defaults.adapter = async (config) => {
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();

    // Small delay to simulate realistic UI feedback (spinners, loading state)
    await new Promise(r => setTimeout(r, 100));

    try {
      if (url.includes('/api/token')) {
        const data = await mockApi.getToken();
        return { data, status: 200, statusText: 'OK', headers: {}, config };
      }

      if (url.includes('/dashboard')) {
        const data = await mockApi.getDashboard();
        return { data, status: 200, statusText: 'OK', headers: {}, config };
      }

      if (url.includes('/api/playlists')) {
        const data = await mockApi.getPlaylists();
        return { data, status: 200, statusText: 'OK', headers: {}, config };
      }

      if (url.match(/\/api\/playlist\/([^/]+)\/remove-track/)) {
        const match = url.match(/\/api\/playlist\/([^/]+)\/remove-track/);
        const playlistId = match[1];
        const reqData = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
        const res = await mockApi.removeTrack(playlistId, reqData.trackUri);
        return { data: res, status: 200, statusText: 'OK', headers: {}, config };
      }

      if (url.match(/\/api\/playlist\/([^/?#]+)$/)) {
        const match = url.match(/\/api\/playlist\/([^/?#]+)$/);
        const playlistId = match[1];
        if (method === 'delete') {
          const res = await mockApi.deletePlaylist(playlistId);
          return { data: res, status: 200, statusText: 'OK', headers: {}, config };
        } else {
          const res = await mockApi.getPlaylistById(playlistId);
          return { data: res, status: 200, statusText: 'OK', headers: {}, config };
        }
      }

      if (url.includes('/api/stats/top-tracks')) {
        let timeRange = 'short_term';
        if (url.includes('time_range=')) {
          const match = url.match(/time_range=([a-z_]+)/);
          if (match) timeRange = match[1];
        }
        const data = await mockApi.getTopTracks(timeRange);
        return { data, status: 200, statusText: 'OK', headers: {}, config };
      }

      if (url.includes('/api/stats/top-artists')) {
        let timeRange = 'short_term';
        if (url.includes('time_range=')) {
          const match = url.match(/time_range=([a-z_]+)/);
          if (match) timeRange = match[1];
        }
        const data = await mockApi.getTopArtists(timeRange);
        return { data, status: 200, statusText: 'OK', headers: {}, config };
      }

      if (url.includes('/api/create-playlist')) {
        const reqData = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
        const res = await mockApi.createPlaylist(reqData);
        return { data: res, status: 200, statusText: 'OK', headers: {}, config };
      }

      // Default fallback
      return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    } catch (err) {
      if (err.response) {
        return Promise.reject(err);
      }
      return Promise.reject({
        message: err.message,
        config,
        response: { status: 500, data: { error: err.message } }
      });
    }
  };

  // Patch window.fetch so fetch() calls are also seamlessly intercepted
  const originalFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : (input?.url || '');

    if (url.includes('/api/token')) {
      const data = await mockApi.getToken();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.includes('api.spotify.com/v1/me/player/pause')) {
      if (window.spotifyPlayerInstance?.player) {
        window.spotifyPlayerInstance.player.pause();
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.includes('api.spotify.com/v1/me/player/play')) {
      try {
        const body = init.body ? JSON.parse(init.body) : {};
        const uri = body.uris?.[0];
        if (window.spotifyPlayerInstance?.player && uri) {
          window.spotifyPlayerInstance.player.playTrack(uri);
        }
      } catch (e) {
        console.warn('Mock player play error', e);
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.includes('api.spotify.com')) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (originalFetch) {
      return originalFetch(input, init);
    }
    return new Response(JSON.stringify({}), { status: 200 });
  };
}

