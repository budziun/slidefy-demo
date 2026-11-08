/**
 * High-fidelity Mock implementation of Spotify Web Playback SDK
 * Streams genuine 30s previews using HTML5 Audio (from Apple iTunes CDN)
 * with full player controls (play/pause, seek, volume, progress bar)
 */
import polishTracks from './polishTracks.json';

const trackMap = new Map();
polishTracks.forEach(t => trackMap.set(t.uri, t));

class MockSpotifyPlayer {
  constructor(options = {}) {
    this.name = options.name || 'Mock Spotify Player';
    this.volume = options.volume !== undefined ? options.volume : 0.5;
    this.listeners = new Map();
    this.connected = false;
    this.deviceId = 'mock-device-id-slidefy';
    this.audio = null;
    
    this.state = {
      paused: true,
      position: 0,
      duration: 30000,
      track_window: {
        current_track: {
          id: 'mock-track-init',
          uri: polishTracks[0]?.uri || 'spotify:track:0VjIjW4GlULA7n1N1yZk50',
          name: polishTracks[0]?.name || 'Demo Track',
          duration_ms: 30000,
          artists: polishTracks[0]?.artists || [{ name: 'Slidefy Artist' }],
          album: polishTracks[0]?.album || {
            name: 'Demo Album',
            images: [{ url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' }]
          }
        }
      }
    };

    this.timer = null;

    // Auto-trigger ready event
    setTimeout(() => {
      this.emit('ready', { device_id: this.deviceId });
    }, 200);
  }

  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return true;
  }

  removeListener(event, callback) {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event).filter(cb => cb !== callback);
    this.listeners.set(event, list);
  }

  emit(event, data) {
    const list = this.listeners.get(event) || [];
    list.forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.warn('Mock Player listener error:', err);
      }
    });
  }

  connect() {
    this.connected = true;
    setTimeout(() => {
      this.emit('ready', { device_id: this.deviceId });
    }, 100);
    return Promise.resolve(true);
  }

  disconnect() {
    this.connected = false;
    this._stopAudio();
    this._stopTimer();
    return Promise.resolve();
  }

  getCurrentState() {
    return Promise.resolve({
      ...this.state,
      track_window: {
        ...this.state.track_window,
        current_track: { ...this.state.track_window.current_track }
      }
    });
  }

  setVolume(volume) {
    this.volume = volume;
    if (this.audio) {
      try {
        this.audio.volume = Math.max(0, Math.min(1, volume));
      } catch (e) {}
    }
    return Promise.resolve();
  }

  seek(positionMs) {
    this.state.position = Math.max(0, Math.min(this.state.duration, positionMs));
    if (this.audio && this.audio.duration) {
      try {
        this.audio.currentTime = positionMs / 1000;
      } catch (e) {}
    }
    this.emit('player_state_changed', this.state);
    return Promise.resolve();
  }

  pause() {
    this.state.paused = true;
    if (this.audio) {
      try {
        this.audio.pause();
      } catch (e) {}
    }
    this._stopTimer();
    this.emit('player_state_changed', this.state);
    return Promise.resolve();
  }

  resume() {
    this.state.paused = false;
    if (this.audio) {
      this.audio.play().catch(e => {
        console.log('Audio resume error (browser policy):', e);
        this._startTimer();
      });
    } else {
      this._startTimer();
    }
    this.emit('player_state_changed', this.state);
    return Promise.resolve();
  }

  togglePlay() {
    if (this.state.paused) {
      return this.resume();
    } else {
      return this.pause();
    }
  }

  playTrack(trackUri, trackData = {}) {
    const found = trackMap.get(trackUri);
    const target = found || trackData;

    this.state.track_window.current_track.uri = trackUri;
    if (target.name) this.state.track_window.current_track.name = target.name;
    // Always 30s for demo preview audio
    this.state.duration = 30000;
    this.state.track_window.current_track.duration_ms = 30000;
    if (target.artists) this.state.track_window.current_track.artists = target.artists;
    if (target.album) this.state.track_window.current_track.album = target.album;

    this.state.position = 0;
    this.state.paused = false;

    const previewUrl = target.preview_url;

    this._stopTimer();

    if (previewUrl) {
      try {
        // Reuse the single Audio instance so mobile browsers (iOS Safari / Android)
        // retain user-gesture authorization and smoothly autoplay subsequent tracks without blocking
        if (!this.audio) {
          this.audio = new Audio();
          
          this.audio.ontimeupdate = () => {
            if (!this.state.paused && this.audio) {
              this.state.position = (this.audio.currentTime || 0) * 1000;
              this.state.duration = (this.audio.duration && !isNaN(this.audio.duration)) ? Math.round(this.audio.duration * 1000) : 30000;
              this.emit('player_state_changed', this.state);
            }
          };

          this.audio.onended = () => {
            this.state.paused = true;
            this.state.position = 0;
            this.emit('player_state_changed', this.state);
          };
        }

        this.audio.volume = Math.max(0, Math.min(1, this.volume));
        
        if (this.audio.src !== previewUrl) {
          this.audio.src = previewUrl;
        }
        this.audio.currentTime = 0;

        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.log('Audio autoplay prevented, using timer fallback:', e.message);
            this._startTimer();
          });
        }
      } catch (err) {
        console.warn('Audio element error, falling back to timer:', err);
        this._startTimer();
      }
    } else {
      this._stopAudio();
      this._startTimer();
    }

    this.emit('player_state_changed', this.state);
  }

  _stopAudio() {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch (e) {}
    }
  }

  _startTimer() {
    this._stopTimer();
    this.timer = setInterval(() => {
      if (!this.state.paused) {
        this.state.position += 500;
        if (this.state.position >= this.state.duration) {
          this.state.position = 0;
          this.state.paused = true;
          this._stopTimer();
        }
        this.emit('player_state_changed', this.state);
      }
    }, 500);
  }

  _stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export function setupMockSpotifySdk() {
  window.Spotify = window.Spotify || {};
  window.Spotify.Player = MockSpotifyPlayer;
  window.Spotify.isMock = true;

  if (typeof window.onSpotifyWebPlaybackSDKReady === 'function') {
    window.onSpotifyWebPlaybackSDKReady();
  } else {
    let sdkCallback = null;
    Object.defineProperty(window, 'onSpotifyWebPlaybackSDKReady', {
      get: () => sdkCallback,
      set: (fn) => {
        sdkCallback = fn;
        if (typeof fn === 'function') {
          setTimeout(fn, 50);
        }
      },
      configurable: true
    });
  }
}
