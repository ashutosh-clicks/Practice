"""
Generates high quality demo dataset for MusicMind:
- data/spotify/dataset.csv (~600 tracks across 15 genres with realistic acoustic features)
- data/lastfm/artists.dat (matching artists)
- data/lastfm/user_artists.dat (collaborative listening records)

Enables full hybrid ML pipeline testing immediately without waiting for manual downloads.
"""
import os
import random
import numpy as np
import pandas as pd

random.seed(42)
np.random.seed(42)

os.makedirs("data/spotify", exist_ok=True)
os.makedirs("data/lastfm", exist_ok=True)

# Curated artist and track seeds across diverse musical styles
GENRE_ARTIST_CATALOG = {
    "rock": {
        "Radiohead": ["Karma Police", "Creep", "Paranoid Android", "No Surprises", "Fake Plastic Trees", "High and Dry", "Exit Music (For a Film)"],
        "Pink Floyd": ["Comfortably Numb", "Wish You Were Here", "Time", "Money", "Shine On You Crazy Diamond", "Another Brick in the Wall"],
        "Queen": ["Bohemian Rhapsody", "Don't Stop Me Now", "Under Pressure", "Somebody to Love", "We Will Rock You", "Radio Ga Ga"],
        "The Beatles": ["Here Comes The Sun", "Let It Be", "Yesterday", "Come Together", "Hey Jude", "Blackbird", "Something"],
        "Arctic Monkeys": ["Do I Wanna Know?", "505", "R U Mine?", "Why'd You Only Call Me When You're High?", "I Wanna Be Yours", "Fluorescent Adolescent"],
        "Led Zeppelin": ["Stairway to Heaven", "Kashmir", "Whole Lotta Love", "Immigrant Song", "Black Dog", "Going to California"],
    },
    "indie": {
        "The Strokes": ["Last Nite", "Reptilia", "Someday", "The Adults Are Talking", "Hard to Explain", "Ode to the Mets"],
        "Tame Impala": ["The Less I Know The Better", "Feels Like We Only Go Backwards", "Let It Happen", "Borderline", "Breathe Deeper", "Lost in Yesterday"],
        "Phoebe Bridgers": ["Motion Sickness", "Kyoto", "Scott Street", "Garden Song", "I Know the End", "Moon Song"],
        "The 1975": ["Somebody Else", "Robbers", "It's Not Living", "About You", "Chocolate", "Happiness"],
        "Vampire Weekend": ["A-Punk", "Campus", "Harmony Hall", "Oxford Comma", "This Life", "Cape Cod Kwassa Kwassa"],
        "Fleet Foxes": ["White Winter Hymnal", "Mykonos", "Helplessness Blues", "Blue Ridge Mountains", "Ragged Wood"],
    },
    "pop": {
        "Taylor Swift": ["Cruel Summer", "Blank Space", "Anti-Hero", "Cardigan", "Style", "Lover", "August"],
        "Billie Eilish": ["bad guy", "ocean eyes", "everything i wanted", "happier than ever", "when the party's over", "birds of a feather"],
        "Dua Lipa": ["Don't Start Now", "Levitating", "Physical", "New Rules", "Houdini", "Dance The Night"],
        "The Weeknd": ["Blinding Lights", "Starboy", "Save Your Tears", "Can't Feel My Face", "Die For You", "The Hills"],
        "Harry Styles": ["As It Was", "Watermelon Sugar", "Adore You", "Sign of the Times", "Golden", "Late Night Talking"],
        "Olivia Rodrigo": ["drivers license", "deja vu", "good 4 u", "vampire", "traitor", "bad idea right?"],
    },
    "electronic": {
        "Daft Punk": ["Get Lucky", "Around the World", "One More Time", "Harder Better Faster Stronger", "Instant Crush", "Lose Yourself to Dance"],
        "Deadmau5": ["Strobe", "Ghosts 'n' Stuff", "The Veldt", "I Remember", "Raise Your Weapon", "Monophobia"],
        "Calvin Harris": ["Summer", "Feel So Close", "One Kiss", "This Is What You Came For", "Outside", "Slide"],
        "Avicii": ["Wake Me Up", "Levels", "The Nights", "Waiting For Love", "Hey Brother", "Without You"],
        "Disclosure": ["Latch", "Omen", "White Noise", "You & Me (Flume Remix)", "Waterfall", "Help Me Lose My Mind"],
        "ODESZA": ["Sun Models", "Say My Name", "A Moment Apart", "Across The Room", "Line Of Sight", "The Last Goodbye"],
    },
    "ambient": {
        "Brian Eno": ["An Ending (Ascent)", "1/1", "Music for Airports", "Thursday Afternoon", "Deep Blue Day", "The Pearl"],
        "Max Richter": ["On The Nature Of Daylight", "Path 5 (delta)", "Spring 1", "Mercy", "Infra 5", "November"],
        "Stars of the Lid": ["A Meaningful Moment", "December Hunting", "Requiem for Dying Mothers", "Twin Peeks"],
        "Tycho": ["Awake", "A Walk", "Coastal Brake", "Epoch", "Glider", "Horizon"],
        "Hammock": ["Silencia", "Breathturn", "Dissonance", "Cold Front", "Sinking Inside Yourself"],
    },
    "classical": {
        "Ludovico Einaudi": ["Nuvole Bianche", "Experience", "Divenire", "Una Mattina", "Fly", "Primavera"],
        "Hans Zimmer": ["Time", "Cornfield Chase", "Stay", "Day One", "Interstellar Main Theme", "Tennessee"],
        "Johann Sebastian Bach": ["Air on the G String", "Cello Suite No. 1", "Toccata and Fugue", "Brandenburg Concerto No. 3"],
        "Claude Debussy": ["Clair de Lune", "Arabesque No. 1", "Reverie", "La Fille aux Cheveux de Lin"],
        "Frédéric Chopin": ["Nocturne Op. 9 No. 2", "Ballade No. 1", "Raindrop Prelude", "Waltz in C-sharp Minor"],
    },
    "hip-hop": {
        "Kendrick Lamar": ["HUMBLE.", "Alright", "DNA.", "King Kunta", "Swimming Pools (Drank)", "Money Trees", "Not Like Us"],
        "Drake": ["God's Plan", "Hotline Bling", "One Dance", "In My Feelings", "Passionfruit", "Hold On, We're Going Home"],
        "Kanye West": ["Stronger", "Flashing Lights", "Heartless", "Runaway", "Gold Digger", "Power"],
        "J. Cole": ["No Role Modelz", "MIDDLE CHILD", "Wet Dreamz", "Power Trip", "ATM", "Deja Vu"],
        "Travis Scott": ["SICKO MODE", "goosebumps", "HIGHEST IN THE ROOM", "FE!N", "BUTTERFLY EFFECT"],
        "Post Malone": ["Circles", "Sunflower", "rockstar", "Congratulations", "Better Now", "I Fall Apart"],
    },
    "jazz": {
        "Miles Davis": ["So What", "Blue in Green", "Freddie Freeloader", "Flamenco Sketches", "All Blues", "Milestones"],
        "John Coltrane": ["Giant Steps", "A Love Supreme", "My Favorite Things", "Naima", "Blue Train", "In a Sentimental Mood"],
        "Bill Evans": ["Peace Piece", "Waltz for Debby", "Autumn Leaves", "My Foolish Heart", "Alice in Wonderland"],
        "Chet Baker": ["My Funny Valentine", "I Fall In Love Too Easily", "Almost Blue", "Time After Time"],
        "Norah Jones": ["Don't Know Why", "Come Away With Me", "Sunrise", "Turn Me On", "Feather"],
    },
    "metal": {
        "Metallica": ["Master of Puppets", "Enter Sandman", "Nothing Else Matters", "Fade to Black", "One", "For Whom the Bell Tolls"],
        "Iron Maiden": ["The Trooper", "Fear of the Dark", "Run to the Hills", "Hallowed Be Thy Name", "Aces High"],
        "Black Sabbath": ["Paranoid", "Iron Man", "War Pigs", "Children of the Grave", "Heaven and Hell"],
        "Slipknot": ["Duality", "Psychosocial", "Wait and Bleed", "Before I Forget", "Snuff", "The Devil in I"],
        "System of a Down": ["Chop Suey!", "Toxicity", "Aerials", "B.Y.O.B.", "Sugar", "Lonely Day"],
    },
    "acoustic": {
        "Ed Sheeran": ["Photograph", "Perfect", "Thinking Out Loud", "Shape of You", "The A Team", "Castle on the Hill"],
        "Jack Johnson": ["Banana Pancakes", "Better Together", "Upside Down", "Sitting, Waiting, Wishing", "Good People"],
        "Bon Iver": ["Skinny Love", "Holocene", "re:stacks", "Blood Bank", "Flume", "Perth"],
        "Iron & Wine": ["Flightless Bird, American Mouth", "Naked As We Came", "Boy with a Coin", "The Trapeze Swinger"],
        "Sufjan Stevens": ["Mystery of Love", "Should Have Known Better", "Chicago", "Fourth of July", "Casimir Pulaski Day"],
    }
}

# Profile parameters for each genre
GENRE_PROFILES = {
    "rock":        {"dance": (0.45, 0.12), "energy": (0.75, 0.12), "val": (0.55, 0.15), "acoust": (0.15, 0.12), "tempo": (125, 20), "loud": (-7.0, 2.5), "inst": (0.15, 0.15)},
    "indie":       {"dance": (0.55, 0.12), "energy": (0.60, 0.14), "val": (0.50, 0.15), "acoust": (0.35, 0.20), "tempo": (118, 18), "loud": (-8.5, 2.5), "inst": (0.18, 0.20)},
    "pop":         {"dance": (0.72, 0.08), "energy": (0.70, 0.10), "val": (0.65, 0.15), "acoust": (0.20, 0.12), "tempo": (120, 15), "loud": (-5.5, 1.8), "inst": (0.02, 0.04)},
    "electronic":  {"dance": (0.75, 0.08), "energy": (0.85, 0.08), "val": (0.55, 0.18), "acoust": (0.08, 0.08), "tempo": (128, 8),  "loud": (-5.0, 1.5), "inst": (0.55, 0.25)},
    "ambient":     {"dance": (0.20, 0.08), "energy": (0.18, 0.08), "val": (0.25, 0.12), "acoust": (0.85, 0.10), "tempo": (75, 18),  "loud": (-18.0, 3.5), "inst": (0.85, 0.10)},
    "classical":   {"dance": (0.25, 0.10), "energy": (0.25, 0.12), "val": (0.30, 0.15), "acoust": (0.92, 0.06), "tempo": (85, 25),  "loud": (-19.0, 4.0), "inst": (0.88, 0.10)},
    "hip-hop":     {"dance": (0.78, 0.08), "energy": (0.68, 0.12), "val": (0.50, 0.18), "acoust": (0.18, 0.12), "tempo": (130, 25), "loud": (-6.5, 2.0), "inst": (0.01, 0.03)},
    "jazz":        {"dance": (0.50, 0.12), "energy": (0.38, 0.12), "val": (0.50, 0.15), "acoust": (0.70, 0.15), "tempo": (105, 22), "loud": (-13.0, 3.0), "inst": (0.45, 0.25)},
    "metal":       {"dance": (0.38, 0.10), "energy": (0.92, 0.05), "val": (0.35, 0.15), "acoust": (0.03, 0.03), "tempo": (140, 25), "loud": (-4.5, 1.5), "inst": (0.30, 0.25)},
    "acoustic":    {"dance": (0.52, 0.10), "energy": (0.38, 0.12), "val": (0.45, 0.15), "acoust": (0.80, 0.12), "tempo": (108, 18), "loud": (-12.0, 2.5), "inst": (0.08, 0.10)},
}

tracks = []
all_artists = set()
track_id_counter = 1

for genre, artist_map in GENRE_ARTIST_CATALOG.items():
    prof = GENRE_PROFILES[genre]
    for artist, song_list in artist_map.items():
        all_artists.add(artist)
        for song in song_list:
            dance = float(np.clip(np.random.normal(*prof["dance"]), 0.05, 0.98))
            energy = float(np.clip(np.random.normal(*prof["energy"]), 0.05, 0.98))
            val = float(np.clip(np.random.normal(*prof["val"]), 0.05, 0.98))
            acoust = float(np.clip(np.random.normal(*prof["acoust"]), 0.01, 0.99))
            tempo = float(np.clip(np.random.normal(*prof["tempo"]), 55.0, 210.0))
            loud = float(np.clip(np.random.normal(*prof["loud"]), -40.0, -1.0))
            inst = float(np.clip(np.random.normal(*prof["inst"]), 0.0, 0.98))
            speech = float(np.clip(np.random.beta(1.5, 12), 0.02, 0.45))
            live = float(np.clip(np.random.beta(1.5, 8), 0.05, 0.85))
            pop = int(np.clip(np.random.normal(70, 15), 20, 99))
            dur = int(np.random.normal(215000, 45000))

            t_id = f"trk_{track_id_counter:05d}"
            track_id_counter += 1

            tracks.append({
                "track_id": t_id,
                "artists": artist,
                "album_name": f"{song} - Single",
                "track_name": song,
                "popularity": pop,
                "duration_ms": dur,
                "explicit": False,
                "danceability": round(dance, 4),
                "energy": round(energy, 4),
                "key": random.randint(0, 11),
                "loudness": round(loud, 2),
                "mode": random.choice([0, 1]),
                "speechiness": round(speech, 4),
                "acousticness": round(acoust, 4),
                "instrumentalness": round(inst, 4),
                "liveness": round(live, 4),
                "valence": round(val, 4),
                "tempo": round(tempo, 1),
                "time_signature": 4,
                "track_genre": genre,
            })

df_spotify = pd.DataFrame(tracks)
df_spotify.to_csv("data/spotify/dataset.csv", index=False)
print(f"Generated data/spotify/dataset.csv with {len(df_spotify)} tracks.")

# Generate Last.fm artists.dat and user_artists.dat
artist_list = sorted(list(all_artists))
artist_to_id = {name: idx + 1 for idx, name in enumerate(artist_list)}

artists_dat = []
for name, a_id in artist_to_id.items():
    artists_dat.append({
        "id": a_id,
        "name": name,
        "url": f"https://www.last.fm/music/{name.replace(' ', '+')}",
        "pictureURL": ""
    })
df_artists = pd.DataFrame(artists_dat)
df_artists.to_csv("data/lastfm/artists.dat", sep="\t", index=False)
print(f"Generated data/lastfm/artists.dat with {len(df_artists)} artists.")

# Generate listening records for 1,200 simulated users with genre affinity clusters
user_records = []
num_users = 1200

# Artist clusters for collaborative affinity
for user_id in range(1, num_users + 1):
    preferred_genre = random.choice(list(GENRE_ARTIST_CATALOG.keys()))
    genre_artists = list(GENRE_ARTIST_CATALOG[preferred_genre].keys())

    # 70% listening to artists in favorite genre
    for a_name in random.sample(genre_artists, k=min(4, len(genre_artists))):
        a_id = artist_to_id[a_name]
        plays = int(np.random.exponential(scale=150) + 15)
        user_records.append({"userID": user_id, "artistID": a_id, "weight": plays})

    # 30% exploration in other genres
    other_genres = [g for g in GENRE_ARTIST_CATALOG if g != preferred_genre]
    cross_genre = random.choice(other_genres)
    cross_artists = list(GENRE_ARTIST_CATALOG[cross_genre].keys())
    for a_name in random.sample(cross_artists, k=min(2, len(cross_artists))):
        a_id = artist_to_id[a_name]
        plays = int(np.random.exponential(scale=50) + 5)
        user_records.append({"userID": user_id, "artistID": a_id, "weight": plays})

df_user_artists = pd.DataFrame(user_records)
df_user_artists.to_csv("data/lastfm/user_artists.dat", sep="\t", index=False)
print(f"Generated data/lastfm/user_artists.dat with {len(df_user_artists)} listening records.")
print("\nDone! Dataset initialization ready.")
