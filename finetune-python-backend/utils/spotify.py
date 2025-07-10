import requests

def get_random_song():
    url = f'http://127.0.0.1:3000/spotify/random_song'
    response = requests.get(url)
    if response.ok:
        song = response.json()
        return song
    else:
        raise Exception(f"Get random song failed with exit code {response.status_code}")
