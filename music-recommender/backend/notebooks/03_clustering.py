# %% [markdown]
# # EDA Notebook 3 — K-Means Clustering on Spotify Audio Features
# Finding the optimal number of clusters (k) using the Elbow Method and Silhouette Score.

# %% Imports
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA

sns.set_theme(style="darkgrid")
plt.rcParams["figure.dpi"] = 120

SPOTIFY_PATH = Path("../data/spotify/dataset.csv")
FEATURE_COLS = [
    "danceability", "energy", "loudness_norm", "speechiness",
    "acousticness", "instrumentalness", "liveness", "valence", "tempo_norm",
]

# %% Load and preprocess
df = pd.read_csv(SPOTIFY_PATH)
df.columns = df.columns.str.lower()
df = df.drop_duplicates(subset=["track_name","artists"]).dropna(subset=["danceability","energy"]).reset_index(drop=True)

loudness_scaler = MinMaxScaler()
tempo_scaler = MinMaxScaler()
df["loudness_norm"] = loudness_scaler.fit_transform(df[["loudness"]])
df["tempo_norm"] = tempo_scaler.fit_transform(df[["tempo"]])

scaler = StandardScaler()
X = scaler.fit_transform(df[FEATURE_COLS].values)
print(f"Feature matrix shape: {X.shape}")

# %% Elbow method — inertia vs k
k_range = range(10, 120, 10)
inertias = []
print("Running elbow method (this may take a few minutes)...")
for k in k_range:
    km = KMeans(n_clusters=k, random_state=42, n_init="auto")
    km.fit(X)
    inertias.append(km.inertia_)
    print(f"  k={k:3d} | inertia={km.inertia_:.1f}")

fig, ax = plt.subplots(figsize=(10, 5))
ax.plot(list(k_range), inertias, "o-", color="#0EA5E9", lw=2, markersize=7)
ax.set_xlabel("Number of Clusters (k)", fontsize=12)
ax.set_ylabel("Inertia (within-cluster SSE)", fontsize=12)
ax.set_title("Elbow Method — Finding Optimal k", fontsize=14, fontweight="bold")
# Annotate the "elbow"
ax.axvline(60, color="#F97316", linestyle="--", lw=1.5, label="k=60 (chosen)")
ax.legend()
plt.tight_layout()
plt.savefig("../data/figures/elbow_curve.png", bbox_inches="tight")
plt.show()

# %% Silhouette scores for a subset of k values
sil_k_range = [20, 40, 60, 80, 100]
sil_scores = []
X_sample = X[np.random.choice(len(X), min(5000, len(X)), replace=False)]  # sample for speed
print("\nComputing silhouette scores (sampled 5K)...")
for k in sil_k_range:
    km = KMeans(n_clusters=k, random_state=42, n_init="auto")
    labels = km.fit_predict(X_sample)
    score = silhouette_score(X_sample, labels)
    sil_scores.append(score)
    print(f"  k={k:3d} | silhouette={score:.4f}")

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(sil_k_range, sil_scores, "o-", color="#10B981", lw=2, markersize=8)
ax.set_xlabel("Number of Clusters (k)")
ax.set_ylabel("Silhouette Score")
ax.set_title("Silhouette Score vs k", fontsize=14, fontweight="bold")
plt.tight_layout()
plt.savefig("../data/figures/silhouette_scores.png", bbox_inches="tight")
plt.show()

# %% Train final K-Means with chosen k=60
OPTIMAL_K = 60
print(f"\nTraining final K-Means with k={OPTIMAL_K}...")
kmeans = KMeans(n_clusters=OPTIMAL_K, random_state=42, n_init="auto")
df["cluster"] = kmeans.fit_predict(X)
print(f"Cluster size distribution:")
cluster_counts = df["cluster"].value_counts().sort_index()
print(f"  min={cluster_counts.min()} | max={cluster_counts.max()} | mean={cluster_counts.mean():.0f}")

# %% PCA 2D Visualization of clusters
print("Reducing to 2D with PCA for visualization...")
pca = PCA(n_components=2, random_state=42)
X_2d = pca.fit_transform(X)
print(f"  Explained variance: PC1={pca.explained_variance_ratio_[0]:.1%}, PC2={pca.explained_variance_ratio_[1]:.1%}")

fig, ax = plt.subplots(figsize=(13, 9))
scatter = ax.scatter(
    X_2d[:, 0], X_2d[:, 1], c=df["cluster"], cmap="tab20",
    alpha=0.35, s=5, rasterized=True
)
ax.set_xlabel(f"PC1 ({pca.explained_variance_ratio_[0]:.1%} variance)")
ax.set_ylabel(f"PC2 ({pca.explained_variance_ratio_[1]:.1%} variance)")
ax.set_title(f"K-Means Clusters (k={OPTIMAL_K}) — PCA 2D Projection", fontsize=14, fontweight="bold")
plt.tight_layout()
plt.savefig("../data/figures/kmeans_pca.png", bbox_inches="tight", dpi=150)
plt.show()

# %% Cluster audio profiles (radar chart data)
cluster_profiles = df.groupby("cluster")[["danceability","energy","valence",
                                          "acousticness","instrumentalness","speechiness"]].mean()
print("\nTop 5 cluster feature profiles:")
print(cluster_profiles.head())

print("\n✅  Clustering analysis complete.")
