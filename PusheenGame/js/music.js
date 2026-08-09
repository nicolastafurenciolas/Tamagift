/* ═══════════════════════════════════════════════════════
   PUSHEEN GAME — music.js
   Manages per-screen background music using locally-loaded
   playlist.js files (avoids CORS issues on file://)
═══════════════════════════════════════════════════════ */

window.MusicManager = (function () {
    const CONTEXT_MAP = {
        rooms:     () => window.MusicPlaylists_rooms     || [],
        cinematica:() => window.MusicPlaylists_cinematica|| [],
        sushi:     () => window.MusicPlaylists_sushi     || [],
        memory:    () => window.MusicPlaylists_memory    || [],
        battle:    () => window.MusicPlaylists_batalla   || [],
        quiz:      () => window.MusicPlaylists_quiz      || [],
        snake:     () => window.MusicPlaylists_snake     || [],
        whack:     () => window.MusicPlaylists_whack     || [],
        ily_sarah: () => window.MusicPlaylists_ily_sarah || [],
    };

    const CONTEXT_FOLDER = {
        rooms: 'rooms', cinematica: 'cinematica',
        sushi: 'sushi', memory: 'memory', battle: 'batalla',
        quiz: 'quiz', snake: 'snake', whack: 'whack', ily_sarah: 'ily_sarah',
    };

    let _audio = null;
    let _currentContext = null;

    function _pick(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function _stopCurrent() {
        if (_audio) {
            _audio.pause();
            _audio.src = '';
            _audio = null;
        }
    }

    function play(context) {
        if (_currentContext === context && _audio && !_audio.paused) return;
        _stopCurrent();
        _currentContext = context;

        // 5% chance: override with ily_sarah
        const saraSongs = CONTEXT_MAP.ily_sarah();
        let songFile = null;
        let folder = null;

        if (saraSongs.length > 0 && Math.random() < 0.05) {
            songFile = _pick(saraSongs);
            folder   = CONTEXT_FOLDER.ily_sarah;
        } else {
            const songs = (CONTEXT_MAP[context] || (() => []))();
            if (!songs || songs.length === 0) return; // no songs yet — silence
            songFile = _pick(songs);
            folder   = CONTEXT_FOLDER[context] || context;
        }

        if (!songFile) return;

        // All music files live in assets/audio/ — no need for subfolders
        const src = `assets/audio/${songFile}`;
        _audio = document.getElementById('gameAudio');
        if (!_audio) return;

        _audio.src = src;
        _audio.volume = 0.3;
        _audio.loop = false;
        _audio.play().catch(() => {});

        // When the song ends, pick another one from the same context
        _audio.onended = () => {
            _currentContext = null; // reset to allow replaying same context
            play(context);
        };
    }

    function stopAll() {
        _currentContext = null;
        _stopCurrent();
    }

    return { play, stopAll };
})();
