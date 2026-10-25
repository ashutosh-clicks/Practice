import urllib.request
import json

def test_track(name, track_id, alpha=0.4, beta=0.4, gamma=0.1, delta=0.1):
    payload = {
        'track_id': track_id,
        'alpha': alpha,
        'beta': beta,
        'gamma': gamma,
        'delta': delta,
        'n': 8
    }
    req = urllib.request.Request(
        'http://127.0.0.1:8000/recommend',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))

    print(f"\n=================== Seed: {name} ===================")
    for i, r in enumerate(data.get('recommendations', []), 1):
        s = r.get('scores', {})
        total = s.get('total', 0) * 100
        print(f"{i}. {r['track_name']} by {r['artists']} [{r['genre']}] -> Score: {total:.1f}/100 (Content: {s.get('content',0)*100:.1f}, Collab: {s.get('collaborative',0)*100:.1f}, Pop: {s.get('popularity',0)*100:.1f})")

test_track("Bohemian Rhapsody (Queen)", "3z8h0TU7ReDPLIbEnYhWZb", alpha=0.5, beta=0.5, gamma=0.5, delta=0.5)
test_track("Blinding Lights (The Weeknd)", "0VjIjW4GlUZAMYd2vXMi3b", alpha=0.4, beta=0.35, gamma=0.15, delta=0.1)
