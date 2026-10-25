"""
Initialization script — trains and saves all models.
Run this ONCE after placing the datasets in the data/ directories.

Dataset setup:
  data/spotify/dataset.csv       ← from Kaggle (maharshipandya/-spotify-tracks-dataset)
  data/lastfm/artists.dat        ← from GroupLens HetRec 2011
  data/lastfm/user_artists.dat   ← from GroupLens HetRec 2011
"""
import os
import sys

from recommender import MusicRecommender

SPOTIFY_PATH = "data/spotify/dataset.csv"
LASTFM_ARTISTS_PATH = "data/lastfm/artists.dat"
LASTFM_USER_ARTISTS_PATH = "data/lastfm/user_artists.dat"
N_CLUSTERS = 60  # Increase for finer granularity, decrease to speed up training


def check_data_files():
    missing = []
    for path in [SPOTIFY_PATH, LASTFM_ARTISTS_PATH, LASTFM_USER_ARTISTS_PATH]:
        if not os.path.exists(path):
            missing.append(path)
    return missing


def main():
    print("=" * 60)
    print("  MusicMind — Model Initialization")
    print("=" * 60)

    missing = check_data_files()
    if missing:
        print("\n❌  Missing data files:")
        for f in missing:
            print(f"    • {f}")
        print("\n📥  Download instructions:")
        print("    Spotify dataset:")
        print("      kaggle datasets download maharshipandya/-spotify-tracks-dataset")
        print("      Unzip → rename to dataset.csv → move to data/spotify/")
        print()
        print("    Last.fm HetRec 2011:")
        print("      https://grouplens.org/datasets/hetrec-2011/")
        print("      Download hetrec2011-lastfm-2k.zip → extract artists.dat & user_artists.dat → move to data/lastfm/")
        sys.exit(1)

    print("\n✅  All data files found. Starting training pipeline...\n")

    rec = MusicRecommender(model_dir="models")
    rec.load_data(SPOTIFY_PATH, LASTFM_ARTISTS_PATH, LASTFM_USER_ARTISTS_PATH)
    k = min(N_CLUSTERS, max(5, len(rec.spotify_df) // 10))
    rec.fit(n_clusters=k)
    rec.save()

    print("\n🎉  Initialization complete!")
    print("    Start the API server with:  uvicorn main:app --reload --port 8000\n")


if __name__ == "__main__":
    main()
