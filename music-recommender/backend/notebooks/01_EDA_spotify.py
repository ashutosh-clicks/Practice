# %% [markdown]
# # EDA Notebook 1 — Spotify Tracks Dataset
# Exploratory Data Analysis of Spotify audio features used for content-based recommendations.
# Run cells sequentially with VS Code Python Interactive or convert with: `jupytext --to ipynb 01_EDA_spotify.py`

# %% Imports
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns
from pathlib import Path

sns.set_theme(style="darkgrid", palette="muted")
plt.rcParams["figure.dpi"] = 120
plt.rcParams["font.family"] = "sans-serif"

SPOTIFY_PATH = Path("../data/spotify/dataset.csv")

# %% Load dataset
df = pd.read_csv(SPOTIFY_PATH)
df.columns = df.columns.str.lower()
print(f"Shape: {df.shape}")
print(f"\nColumns: {list(df.columns)}")
df.head(3)

# %% Basic info
print("=== Dataset Overview ===")
print(f"Tracks      : {len(df):,}")
print(f"Genres      : {df['track_genre'].nunique()}")
print(f"Artists     : {df['artists'].nunique():,}")
print(f"Missing     : \n{df.isnull().sum()[df.isnull().sum() > 0]}")
print(f"\nDuplicates (name+artist): {df.duplicated(subset=['track_name','artists']).sum():,}")

# %% After deduplication
df = df.drop_duplicates(subset=['track_name', 'artists']).reset_index(drop=True)
print(f"After dedup: {len(df):,} tracks")

# %% Audio Feature Distributions
FEATURES = ['danceability','energy','loudness','speechiness',
            'acousticness','instrumentalness','liveness','valence','tempo']

fig, axes = plt.subplots(3, 3, figsize=(15, 10))
fig.suptitle("Audio Feature Distributions", fontsize=16, fontweight="bold")

for ax, feat in zip(axes.flatten(), FEATURES):
    ax.hist(df[feat], bins=50, color="#0EA5E9", alpha=0.75, edgecolor="white", linewidth=0.3)
    ax.set_title(feat, fontsize=11)
    ax.set_xlabel("")
    mean_val = df[feat].mean()
    ax.axvline(mean_val, color="#F97316", linestyle="--", lw=1.5, label=f"μ={mean_val:.2f}")
    ax.legend(fontsize=8)

plt.tight_layout()
plt.savefig("../data/figures/feature_distributions.png", bbox_inches="tight")
plt.show()

# %% Correlation heatmap
fig, ax = plt.subplots(figsize=(10, 8))
corr = df[FEATURES + ['popularity']].corr()
mask = np.triu(np.ones_like(corr, dtype=bool))
sns.heatmap(
    corr, mask=mask, ax=ax, cmap="coolwarm", center=0,
    annot=True, fmt=".2f", square=True, linewidths=0.5,
    annot_kws={"size": 9}, vmin=-1, vmax=1
)
ax.set_title("Feature Correlation Matrix", fontsize=14, fontweight="bold")
plt.tight_layout()
plt.savefig("../data/figures/correlation_heatmap.png", bbox_inches="tight")
plt.show()

# %% Mood quadrant scatter (valence vs energy)
fig, ax = plt.subplots(figsize=(10, 7))
sample = df.sample(min(5000, len(df)), random_state=42)
scatter = ax.scatter(
    sample['valence'], sample['energy'],
    c=sample['popularity'], cmap='plasma', alpha=0.4, s=8, rasterized=True
)
cbar = plt.colorbar(scatter, ax=ax)
cbar.set_label("Popularity", fontsize=10)

# Quadrant labels
ax.axvline(0.5, color='gray', linestyle='--', lw=1)
ax.axhline(0.5, color='gray', linestyle='--', lw=1)
for (x, y, label) in [(0.15,0.85,"😤 Angry / Intense"), (0.75,0.85,"😊 Happy / Euphoric"),
                       (0.15,0.15,"😔 Sad / Melancholic"), (0.75,0.15,"😌 Calm / Peaceful")]:
    ax.text(x, y, label, ha='center', fontsize=12, color='white',
            bbox=dict(boxstyle='round,pad=0.3', fc='#1A1A1A', alpha=0.7))

ax.set_xlabel("Valence (positivity →)", fontsize=12)
ax.set_ylabel("Energy →", fontsize=12)
ax.set_title("Mood Quadrant Map (Russell's Circumplex Model)", fontsize=14, fontweight="bold")
plt.tight_layout()
plt.savefig("../data/figures/mood_quadrant.png", bbox_inches="tight")
plt.show()

# %% Top genres by track count
top_genres = df['track_genre'].value_counts().head(20)
fig, ax = plt.subplots(figsize=(12, 6))
top_genres.plot(kind='bar', ax=ax, color='#0EA5E9', edgecolor='white')
ax.set_title("Top 20 Genres by Track Count", fontsize=14, fontweight="bold")
ax.set_xlabel("Genre")
ax.set_ylabel("Track Count")
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig("../data/figures/top_genres.png", bbox_inches="tight")
plt.show()

# %% Popularity vs Audio Features
fig, axes = plt.subplots(2, 3, figsize=(15, 9))
fig.suptitle("Popularity vs Audio Features", fontsize=16, fontweight="bold")
for ax, feat in zip(axes.flatten(), ['energy','valence','danceability','acousticness','tempo','loudness']):
    ax.scatter(df[feat], df['popularity'], alpha=0.05, s=3, color='#0EA5E9', rasterized=True)
    z = np.polyfit(df[feat].dropna(), df['popularity'][df[feat].notna()], 1)
    p = np.poly1d(z)
    x_line = np.linspace(df[feat].min(), df[feat].max(), 100)
    ax.plot(x_line, p(x_line), color='#F97316', lw=2, label=f"trend")
    ax.set_xlabel(feat)
    ax.set_ylabel("Popularity" if ax == axes[0][0] else "")
    ax.set_title(feat.capitalize())
plt.tight_layout()
plt.savefig("../data/figures/popularity_vs_features.png", bbox_inches="tight")
plt.show()

print("\n✅  EDA complete. Figures saved to data/figures/")
