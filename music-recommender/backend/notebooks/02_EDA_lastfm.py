# %% [markdown]
# # EDA Notebook 2 — Last.fm HetRec 2011 Dataset
# Exploratory Data Analysis of user listening history used for collaborative filtering.

# %% Imports
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from scipy.sparse import csr_matrix
from sklearn.preprocessing import normalize

sns.set_theme(style="darkgrid", palette="muted")
plt.rcParams["figure.dpi"] = 120

LASTFM_DIR = Path("../data/lastfm")

# %% Load datasets
artists_df = pd.read_csv(LASTFM_DIR / "artists.dat", sep="\t", encoding="utf-8", on_bad_lines="skip")
user_artists_df = pd.read_csv(LASTFM_DIR / "user_artists.dat", sep="\t", encoding="utf-8", on_bad_lines="skip")
tags_df = pd.read_csv(LASTFM_DIR / "tags.dat", sep="\t", encoding="utf-8", on_bad_lines="skip")

# Normalize columns
for d in [artists_df, user_artists_df, tags_df]:
    d.columns = d.columns.str.lower()

print(f"Artists        : {len(artists_df):,}")
print(f"Users          : {user_artists_df['userid'].nunique():,}")
print(f"Listening pairs: {len(user_artists_df):,}")
print(f"Tags           : {len(tags_df):,}")

# %% Play count distribution
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
fig.suptitle("Last.fm Play Count Analysis", fontsize=14, fontweight="bold")

axes[0].hist(user_artists_df['weight'], bins=80, color='#10B981', edgecolor='white', linewidth=0.3)
axes[0].set_title("Raw Play Counts")
axes[0].set_xlabel("Play count (weight)")
axes[0].set_ylabel("Number of user-artist pairs")

log_weights = np.log1p(user_artists_df['weight'])
axes[1].hist(log_weights, bins=80, color='#0EA5E9', edgecolor='white', linewidth=0.3)
axes[1].set_title("Log-normalised Play Counts  (used in model)")
axes[1].set_xlabel("log(1 + weight)")
axes[1].set_ylabel("Number of user-artist pairs")

plt.tight_layout()
plt.savefig("../data/figures/lastfm_playcounts.png", bbox_inches="tight")
plt.show()

# %% Top artists by total listens
top_artists = (
    user_artists_df.groupby('artistid')['weight']
    .sum()
    .sort_values(ascending=False)
    .head(20)
    .reset_index()
    .merge(artists_df[['id','name']] if 'id' in artists_df.columns else artists_df[['artistid','name']], 
           left_on='artistid', right_on=artists_df.columns[0])
)
fig, ax = plt.subplots(figsize=(12, 6))
ax.barh(top_artists['name'][::-1], top_artists['weight'][::-1], color='#0EA5E9')
ax.set_title("Top 20 Artists by Total Play Count", fontsize=14, fontweight="bold")
ax.set_xlabel("Total plays")
plt.tight_layout()
plt.savefig("../data/figures/lastfm_top_artists.png", bbox_inches="tight")
plt.show()

# %% User activity distribution
user_activity = user_artists_df.groupby('userid')['weight'].agg(['count','sum'])
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
axes[0].hist(user_activity['count'], bins=50, color='#10B981', edgecolor='white')
axes[0].set_title("Artists per User")
axes[0].set_xlabel("# unique artists listened to")
axes[1].hist(np.log1p(user_activity['sum']), bins=50, color='#0EA5E9', edgecolor='white')
axes[1].set_title("Total Plays per User (log scale)")
axes[1].set_xlabel("log(1 + total plays)")
plt.suptitle("User Activity Distribution", fontsize=14, fontweight="bold")
plt.tight_layout()
plt.savefig("../data/figures/lastfm_user_activity.png", bbox_inches="tight")
plt.show()

# %% Sparsity analysis
n_users = user_artists_df['userid'].nunique()
n_artists = user_artists_df['artistid'].nunique()
n_pairs = len(user_artists_df)
sparsity = 1 - n_pairs / (n_users * n_artists)
print(f"\nMatrix dimensions  : {n_users} users × {n_artists} artists")
print(f"Non-zero entries   : {n_pairs:,}")
print(f"Matrix sparsity    : {sparsity:.4%}")
print(f"Avg artists/user   : {user_activity['count'].mean():.1f}")
print(f"Avg users/artist   : {user_artists_df.groupby('artistid')['userid'].nunique().mean():.1f}")

print("\n✅  Last.fm EDA complete.")
