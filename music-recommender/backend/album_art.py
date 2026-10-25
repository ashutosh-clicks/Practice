"""
Album Art Manager — Imports and caches real album artwork from Last.fm and fallback music APIs.
Supports Last.fm track.getInfo and album.getInfo, with iTunes Search API as a zero-key resilient fallback.
"""
from __future__ import annotations

import json
import os
import threading
import urllib.parse
import urllib.request
from typing import Optional


class AlbumArtManager:
    def __init__(self, cache_file: str = "models/album_art_cache.json"):
        self.cache_file = cache_file
        self.cache: dict[str, dict] = {}
        self.lock = threading.Lock()
        self.load_cache()

    def load_cache(self) -> None:
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    self.cache = json.load(f)
            except Exception as e:
                print(f"Error loading album art cache: {e}")
                self.cache = {}

    def save_cache(self) -> None:
        with self.lock:
            try:
                os.makedirs(os.path.dirname(self.cache_file) or ".", exist_ok=True)
                with open(self.cache_file, "w", encoding="utf-8") as f:
                    json.dump(self.cache, f, indent=2)
            except Exception as e:
                print(f"Error saving album art cache: {e}")

    def get_art_url(
        self,
        track_id: str,
        artist: str,
        track_name: str,
        album_name: Optional[str] = None,
        lastfm_key: Optional[str] = None,
    ) -> Optional[str]:
        """Return cached URL or fetch live from Last.fm / fallback."""
        if track_id in self.cache and self.cache[track_id].get("url"):
            return self.cache[track_id]["url"]

        # Fetch live
        url, source = self._fetch_art(artist, track_name, album_name, lastfm_key)
        if url:
            with self.lock:
                self.cache[track_id] = {
                    "url": url,
                    "source": source,
                    "artist": artist,
                    "track": track_name,
                }
            self.save_cache()
            return url

        return None

    def _fetch_art(
        self,
        artist: str,
        track_name: str,
        album_name: Optional[str],
        lastfm_key: Optional[str],
    ) -> tuple[Optional[str], str]:
        # Clean artist string (take primary if semicolon separated)
        primary_artist = artist.split(";")[0].strip()
        # Clean track title (strip single/remaster annotations)
        clean_track = track_name.split(" - ")[0].split(" (")[0].strip()

        key = lastfm_key or os.environ.get("LASTFM_API_KEY", "")

        # 1. Try Last.fm track.getInfo if key is provided
        if key:
            try:
                params = urllib.parse.urlencode({
                    "method": "track.getInfo",
                    "api_key": key,
                    "artist": primary_artist,
                    "track": clean_track,
                    "format": "json",
                })
                req = urllib.request.Request(
                    f"https://ws.audioscrobbler.com/2.0/?{params}",
                    headers={"User-Agent": "MusicMind-ML/1.0"},
                )
                with urllib.request.urlopen(req, timeout=4) as res:
                    data = json.loads(res.read().decode("utf-8"))
                    images = data.get("track", {}).get("album", {}).get("image", [])
                    # Pick largest image available
                    for size_name in ["extralarge", "large", "medium"]:
                        for img in images:
                            if img.get("size") == size_name and img.get("#text"):
                                return img["#text"], "lastfm"
            except Exception:
                pass

            # Try album.getInfo if album_name is available
            if album_name:
                try:
                    clean_album = album_name.split(" - ")[0].strip()
                    params = urllib.parse.urlencode({
                        "method": "album.getInfo",
                        "api_key": key,
                        "artist": primary_artist,
                        "album": clean_album,
                        "format": "json",
                    })
                    req = urllib.request.Request(
                        f"https://ws.audioscrobbler.com/2.0/?{params}",
                        headers={"User-Agent": "MusicMind-ML/1.0"},
                    )
                    with urllib.request.urlopen(req, timeout=4) as res:
                        data = json.loads(res.read().decode("utf-8"))
                        images = data.get("album", {}).get("image", [])
                        for size_name in ["extralarge", "large", "medium"]:
                            for img in images:
                                if img.get("size") == size_name and img.get("#text"):
                                    return img["#text"], "lastfm"
                except Exception:
                    pass

        # 2. Resilient Fallback: iTunes Search API (100% free, high-res 600x600 album art)
        try:
            query = f"{primary_artist} {clean_track}"
            params = urllib.parse.urlencode({
                "term": query,
                "entity": "song",
                "limit": 1,
            })
            req = urllib.request.Request(
                f"https://itunes.apple.com/search?{params}",
                headers={"User-Agent": "MusicMind-ML/1.0"},
            )
            with urllib.request.urlopen(req, timeout=4) as res:
                data = json.loads(res.read().decode("utf-8"))
                results = data.get("results", [])
                if results and "artworkUrl100" in results[0]:
                    art_100 = results[0]["artworkUrl100"]
                    art_600 = art_100.replace("100x100bb.jpg", "600x600bb.jpg")
                    return art_600, "itunes_fallback"
        except Exception:
            pass

        return None, "none"

    def batch_import_art(
        self,
        tracks_df,
        lastfm_key: Optional[str] = None,
        limit: int = 100,
    ) -> dict:
        """Import album art for up to `limit` tracks and persist to disk cache."""
        imported = 0
        already_cached = 0

        # Prioritize high popularity tracks
        sorted_df = tracks_df.sort_values(by="popularity", ascending=False)

        for _, row in sorted_df.head(limit).iterrows():
            tid = str(row.get("track_id", ""))
            if tid in self.cache and self.cache[tid].get("url"):
                already_cached += 1
                continue

            artist = str(row.get("artists", ""))
            track = str(row.get("track_name", ""))
            album = str(row.get("album_name", ""))

            url, source = self._fetch_art(artist, track, album, lastfm_key)
            if url:
                with self.lock:
                    self.cache[tid] = {
                        "url": url,
                        "source": source,
                        "artist": artist,
                        "track": track,
                    }
                imported += 1

        self.save_cache()
        return {
            "newly_imported": imported,
            "already_cached": already_cached,
            "total_cached": len(self.cache),
            "total_tracks": len(tracks_df),
        }
