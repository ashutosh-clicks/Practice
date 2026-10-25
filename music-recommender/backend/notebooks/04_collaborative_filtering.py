# %% [markdown]
# # EDA Notebook 4 — Collaborative Filtering (Last.fm)
# Building and evaluating the item-based collaborative filtering layer.

# %% Imports
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity

sns.set_theme(style="darkgrid")
plt.rcParams["figure.dpi"] = 120
LASTFM_DIR = Path("../data/lastfm")

# %% Load data
artists_df = pd.read_csv(LASTFM_DIR / "artists.dat", sep="\t", encoding="utf-8", on_bad_lines="skip")
ua_df = pd.read_csv(LASTFM_DIR / "user_artists.dat", sep="\t", encoding="utf-8", on_bad_lines="skip")
artists_df.columns = artists_df.columns.str.lower()
ua_df.columns = ua_df.columns.str.lower()
print(f"Users: {ua_df['userid'].nunique():,} | Artists: {ua_df['artistid'].nunique():,}")

# %% Build sparse user-artist matrix (log-normalised)
user_cat = ua_df["userid"].astype("category")
artist_cat = ua_df["artistid"].astype("category")
weights_log = np.log1p(ua_df["weight"].values.astype(float))

# Shape: (n_artists, n_users)  — rows=artists for item-item similarity
artist_user_matrix = csr_matrix(
    (weights_log, (artist_cat.cat.codes.values, user_cat.cat.codes.values)),
    shape=(artist_cat.nunique(), user_cat.nunique()),
)
print(f"Sparse matrix shape: {artist_user_matrix.shape}")
print(f"Sparsity: {1 - artist_user_matrix.nnz / (artist_user_matrix.shape[0]*artist_user_matrix.shape[1]):.4%}")

# %% On-demand cosine similarity for a query artist
def get_similar_artists(artist_name: str, top_n: int = 10):
    """Find the top-N most similar artists using item-based CF."""
    name_lower = artists_df["name"].str.lower()
    matches = name_lower[name_lower.str.contains(artist_name.lower(), na=False)]
    if matches.empty:
        print(f"Artist not found: {artist_name}")
        return pd.DataFrame()
    
    artist_id = artists_df.loc[matches.index[0], artists_df.columns[0]]
    artist_code = artist_cat.cat.categories.tolist().index(artist_id)
    
    query_vec = artist_user_matrix[artist_code]
    sims = cosine_similarity(query_vec, artist_user_matrix)[0]
    sims[artist_code] = 0.0  # exclude self
    
    top_codes = np.argsort(sims)[::-1][:top_n]
    code_to_id = dict(enumerate(artist_cat.cat.categories))
    id_to_name = dict(zip(artists_df.iloc[:, 0], artists_df["name"]))
    
    results = []
    for code in top_codes:
        aid = code_to_id.get(code)
        name = id_to_name.get(aid, "Unknown")
        results.append({"artist": name, "similarity": round(float(sims[code]), 4)})
    
    return pd.DataFrame(results)

# %% Test: find artists similar to "Radiohead"
print("=== Artists similar to Radiohead ===")
similar = get_similar_artists("Radiohead", top_n=10)
print(similar.to_string(index=False))

print("\n=== Artists similar to Daft Punk ===")
similar2 = get_similar_artists("Daft Punk", top_n=10)
print(similar2.to_string(index=False))

# %% Visualise similarity distribution for one artist
fig, ax = plt.subplots(figsize=(10, 4))
artist_id_0 = artist_cat.cat.categories[0]
query = artist_user_matrix[0]
all_sims = cosine_similarity(query, artist_user_matrix)[0]
all_sims[0] = 0
ax.hist(all_sims[all_sims > 0], bins=80, color="#0EA5E9", edgecolor="white", linewidth=0.3)
ax.set_title("Distribution of Item-Based CF Similarity Scores", fontsize=13, fontweight="bold")
ax.set_xlabel("Cosine Similarity")
ax.set_ylabel("Count")
ax.axvline(0.1, color="#F97316", linestyle="--", lw=1.5, label="threshold=0.1")
ax.legend()
plt.tight_layout()
plt.savefig("../data/figures/cf_similarity_dist.png", bbox_inches="tight")
plt.show()

print("\n✅  Collaborative filtering analysis complete.")
