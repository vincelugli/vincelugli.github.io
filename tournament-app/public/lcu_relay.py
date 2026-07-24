import os
import sys
import json
import base64
import ssl
import time
import requests
import websocket

# Disable certificate verification for LCU's self-signed SSL certificate
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

class LcuRelay:
    def __init__(self, match_id, access_code, project_id="grumble-5885f", api_key="AIzaSyCDvOgg-Hacwo6375_xg0KYH8HK7jNbszU"):
        self.match_id = match_id
        self.access_code = access_code
        self.project_id = project_id
        self.api_key = api_key
        self.auth_token = None
        self.port = None
        self.password = None

    def authenticate(self):
        """Exchange Caster Access Code for Firebase Custom Token, then sign-in to retrieve ID Token."""
        print("Authenticating with access code...")
        
        # 1. Get Custom Token from Cloud Function
        func_url = f"https://us-central1-{self.project_id}.cloudfunctions.net/getAuthTokenForAccessCode"
        try:
            res = requests.post(func_url, json={"data": {"accessCode": self.access_code}}, timeout=10)
            if res.status_code != 200:
                print(f"Error: Authentication function returned HTTP {res.status_code}: {res.text}")
                sys.exit(1)
            
            result = res.json().get("result")
            custom_token = result.get("token") if isinstance(result, dict) else result
            if not custom_token:
                print("Error: Could not retrieve custom auth token from server.")
                sys.exit(1)
        except Exception as e:
            print(f"Network error calling authentication service: {e}")
            sys.exit(1)

        # 2. Exchange Custom Token for Firebase ID Token via Google Identity Toolkit
        auth_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key={self.api_key}"
        try:
            res = requests.post(auth_url, json={"token": custom_token, "returnSecureToken": True}, timeout=10)
            if res.status_code != 200:
                print(f"Error: Exchanging custom token failed with HTTP {res.status_code}: {res.text}")
                sys.exit(1)
            
            self.auth_token = res.json().get("idToken")
            print("Authentication successful.")
        except Exception as e:
            print(f"Network error exchanging custom token: {e}")
            sys.exit(1)

    def locate_lockfile(self):
        """Autodetect LoL client lockfile path depending on OS."""
        paths = []
        if sys.platform == "win32":
            paths = [
                "C:\\Riot Games\\League of Legends\\lockfile",
                os.path.expandvars("%LocalAppData%\\Riot Games\\Riot Client\\Config\\lockfile")
            ]
        elif sys.platform == "darwin":
            paths = [
                "/Applications/League of Legends.app/Contents/LoL/lockfile"
            ]
        
        for path in paths:
            if os.path.exists(path):
                return path
        return None

    def read_lockfile(self):
        path = self.locate_lockfile()
        if not path:
            print("Error: Could not locate League of Legends lockfile. Make sure the client is running.")
            sys.exit(1)
        
        try:
            with open(path, "r") as f:
                content = f.read()
                # Format: LeagueClient:pid:port:password:protocol
                parts = content.split(":")
                self.port = parts[2]
                self.password = parts[3]
                print(f"Connected to LCU on port {self.port}")
        except Exception as e:
            print(f"Error reading lockfile at '{path}': {e}")
            sys.exit(1)

    def push_to_firestore(self, draft_state):
        """Updates Firestore live draft document via REST API using Bearer Token."""
        if not self.auth_token:
            print("Error: No authentication token active. Re-authenticating...")
            self.authenticate()

        url = (
            f"https://firestore.googleapis.com/v1/projects/{self.project_id}/databases/(default)/documents"
            f"/liveDrafts/{self.match_id}?updateMask.fieldPaths=blueChamps&updateMask.fieldPaths=redChamps"
            f"&updateMask.fieldPaths=bluePlayers&updateMask.fieldPaths=redPlayers&updateMask.fieldPaths=lastUpdated"
        )
        
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        body = {
            "fields": {
                "bluePlayers": {
                    "arrayValue": {
                        "values": [{"stringValue": p} for p in draft_state["bluePlayers"]]
                    }
                },
                "redPlayers": {
                    "arrayValue": {
                        "values": [{"stringValue": p} for p in draft_state["redPlayers"]]
                    }
                },
                "blueChamps": {
                    "arrayValue": {
                        "values": [{"stringValue": str(c)} for c in draft_state["blueChamps"]]
                    }
                },
                "redChamps": {
                    "arrayValue": {
                        "values": [{"stringValue": str(c)} for c in draft_state["redChamps"]]
                    }
                },
                "lastUpdated": {
                    "integerValue": str(int(time.time()))
                }
            }
        }
        
        try:
            res = requests.patch(url, headers=headers, json=body, timeout=5)
            # If token has expired, re-authenticate and retry once
            if res.status_code == 401:
                print("Token expired. Re-authenticating...")
                self.authenticate()
                headers["Authorization"] = f"Bearer {self.auth_token}"
                res = requests.patch(url, headers=headers, json=body, timeout=5)

            if res.status_code != 200:
                print(f"Failed to update Firestore (HTTP {res.status_code}): {res.text}")
            else:
                print("Draft state successfully updated on grumble.cc")
        except Exception as e:
            print(f"Network error updating Firestore: {e}")

    def on_message(self, ws, message):
        if not message:
            return
        
        try:
            event = json.loads(message)
            if len(event) < 3 or event[1] != "OnJsonApiEvent":
                return
            
            data_payload = event[2]
            if data_payload.get("uri") != "/lol-champ-select/v1/session":
                return
            
            session = data_payload.get("data", {})
            self.process_session(session)
        except Exception as e:
            print(f"Error parsing event: {e}")

    def process_session(self, session):
        blue_players = []
        blue_champs = []
        red_players = []
        red_champs = []
        
        # Populate blue side (myTeam)
        for member in session.get("myTeam", []):
            name = member.get("gameName") or "Player"
            tag = member.get("tagLine")
            if tag:
                name = f"{name} #{tag}"
            champ_id = member.get("championId") or member.get("championPickIntent") or 0
            blue_players.append(name)
            blue_champs.append(champ_id)
            
        # Populate red side (theirTeam)
        for member in session.get("theirTeam", []):
            name = member.get("gameName") or "Player"
            tag = member.get("tagLine")
            if tag:
                name = f"{name} #{tag}"
            champ_id = member.get("championId") or member.get("championPickIntent") or 0
            red_players.append(name)
            red_champs.append(champ_id)

        # Pad arrays to 5 players
        while len(blue_players) < 5:
            blue_players.append(f"Player {len(blue_players) + 1}")
        while len(blue_champs) < 5:
            blue_champs.append(0)
        while len(red_players) < 5:
            red_players.append(f"Player {len(red_players) + 1}")
        while len(red_champs) < 5:
            red_champs.append(0)

        draft_state = {
            "bluePlayers": blue_players,
            "blueChamps": blue_champs,
            "redPlayers": red_players,
            "redChamps": red_champs
        }
        
        print(f"Draft Update -> Blue: {blue_champs} | Red: {red_champs}")
        self.push_to_firestore(draft_state)

    def run(self):
        self.authenticate()
        self.read_lockfile()
        
        auth = base64.b64encode(f"riot:{self.password}".encode()).decode()
        ws_url = f"wss://127.0.0.1:{self.port}/"
        
        ws = websocket.WebSocketApp(
            ws_url,
            header=[f"Authorization: Basic {auth}"],
            on_message=self.on_message,
            on_open=lambda ws: ws.send('[5, "OnJsonApiEvent"]')
        )
        
        print("Listening for champion select events...")
        ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python lcu_relay.py <match_id> <caster_access_code>")
        sys.exit(1)
    
    relay = LcuRelay(sys.argv[1], sys.argv[2])
    relay.run()
