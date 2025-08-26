import csv
import json
import time
import requests

RIOT_API_DEV_KEY = "RGAPI-c250f553-2a2a-4880-9294-57ccee8c869a"

# Define the structure of a Player object for clarity
# This matches the TypeScript `Player` interface in your application.
class Player:
    def __init__(self, id, name, peakRankTier, peakRankDivision, soloRankTier, soloRankDivision, flexRankTier, flexRankDivision, role, secondaryRoles, isCaptain, contact, timezone):
        try:
            peakRankDivision = int(peakRankDivision)
        except ValueError as e:
            peakRankDivision = -1
        try:
            soloRankDivision = int(soloRankDivision)
        except ValueError as e:
            soloRankDivision = -1
        try:
            flexRankDivision = int(flexRankDivision)
        except ValueError as e:
            flexRankDivision = -1

        self.id = id
        self.name = name
        self.peakRankTier = peakRankTier.title()
        self.peakRankDivision = int(peakRankDivision) if not isinstance(peakRankDivision, str) else str(peakRankDivision)
        self.soloRankTier = soloRankTier.title()
        self.soloRankDivision = int(soloRankDivision) if not isinstance(soloRankDivision, str) else str(soloRankDivision)
        self.flexRankTier = flexRankTier.title()
        self.flexRankDivision = int(flexRankDivision) if not isinstance(flexRankDivision, str) else str(flexRankDivision)
        self.role = role
        self.secondaryRoles = secondaryRoles
        self.isCaptain = isCaptain
        self.contact = contact
        self.timezone = timezone

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "peakRankTier": self.peakRankTier,
            "peakRankDivision": self.peakRankDivision,
            "soloRankTier": self.soloRankTier,
            "soloRankDivision": self.soloRankDivision,
            "flexRankTier": self.flexRankTier,
            "flexRankDivision": self.flexRankDivision,
            "role": self.role,
            "secondaryRoles": self.secondaryRoles,
            "isCaptain": self.isCaptain,
            "contact": self.contact,
            "timezone": self.timezone
        }
    
def get_puuid(name: str, tag: str) -> str | None:
    """Fetches a user's PUUID from the Riot Account API."""
    url = f"https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{name}/{tag}"
    headers = {"X-Riot-Token": RIOT_API_DEV_KEY}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raises an exception for 4xx/5xx errors
        return response.json().get("puuid")
    except requests.exceptions.RequestException as e:
        print(f"  [ERROR] Could not get PUUID for {name}#{tag}: {e.response.status_code if e.response else 'N/A'}")
        return None
    

def get_league_data(puuid: str) -> list | None:
    """Fetches a user's ranked league data from the League v4 API."""
    # NOTE: This is hardcoded to na1. You could make this dynamic if needed.
    url = f"https://na1.api.riotgames.com/lol/league/v4/entries/by-puuid/{puuid}"
    headers = {"X-Riot-Token": RIOT_API_DEV_KEY}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"  [ERROR] Could not get league data for PUUID {puuid}: {e.response.status_code if e.response else 'N/A'}")
        return None
    

def process_player(summoner_name: str):
    try:
        name, tag = summoner_name.split('#')
    except ValueError:
        print(f"  [WARNING] Invalid Summoner Name format for {summoner_name}. Skipping API calls for this entry.")
        name = summoner_name # Keep the name for the JSON output
        tag = ""

    if name and tag:
        # Make the API calls
        puuid = get_puuid(name, tag)
        if puuid:
            print(f"  > Found PUUID: {puuid}")
            # Be respectful of rate limits
            league_data = get_league_data(puuid)
            
            if league_data:
                if not league_data: # Handle empty list response
                    print("  > No ranked data found for this player.")
                # else:
                    # print("  > Live Ranked Data:")
                    # for entry in league_data:
                    #     print(f"    - Queue: {entry.get('queueType', 'N/A')}")
                    #     print(f"      Rank: {entry.get('tier', 'N/A')} {entry.get('rank', 'N/A')}")
                    #     print(f"      LP: {entry.get('leaguePoints', 'N/A')}")
            return league_data
    return []


def get_rank_data(league_data, queue_type: str):
    for entry in league_data:
        if entry.get('queueType', 'N/A') == queue_type:
            return {'tier': entry.get('tier', 'N/A'), 'rank': entry.get('rank', 'N/A'), 'lp': entry.get('leaguePoints', 'N/A')}
    return {}


def convert_rank_division(numeral_division: str) -> int: 
    numeral_to_num = {
        'I': 1,
        'II': 2,
        'III': 3,
        'IV': 4,
        'N/A': -1
    }
    return numeral_to_num[numeral_division]
        
def get_rank_tier_and_division(rank_data):
    if len(rank_data) > 0:
        rank_data_tier = rank_data.get('tier')
        rank_data_division = rank_data.get('rank')
        if rank_data.get('tier') == 'CHALLENGER' or rank_data.get('tier') == 'MASTERS' or rank_data.get('tier') == 'GRANDMASTERS':
            rank_data_division = rank_data.get('lp')
    else:
        rank_data_tier = 'N/A'
        rank_data_division = 'N/A'
    return [rank_data_tier, convert_rank_division(rank_data_division)]
    

# --- The Main Parsing Function ---
def create_players_from_csv(filename: str) -> list[dict]:
    """
    Reads a CSV file of player sign-ups and converts it into a list of
    Player data objects, ready to be used as JSON for the admin page.

    Args:
        filename: The path to the input CSV file.

    Returns:
        A list of dictionaries, where each dictionary is a Player object.
    """
    players = []
    subs = []

    player_id = 0
    sub_id = 200
    
    try:
        with open(filename, mode='r', encoding='utf-8') as csvfile:
            # DictReader automatically uses the first row as headers
            reader = csv.DictReader(csvfile)
            
            for index, row in enumerate(reader):
                # 1. Clean and map basic fields
                # Removes the #NA1 tag from summoner names
                summoner_name = row.get('Summoner Name (e.g. Summoner#NA1)', '')

                time.sleep(1)
                league_data = process_player(summoner_name)

                if len(league_data) > 0:
                    solo_rank = get_rank_data(league_data, 'RANKED_SOLO_5x5')
                    [solo_rank_tier, solo_rank_division] = get_rank_tier_and_division(solo_rank)

                    flex_rank = get_rank_data(league_data, 'RANKED_FLEX_SR')
                    [flex_rank_tier, flex_rank_division] = get_rank_tier_and_division(flex_rank)
                else:
                    solo_rank_tier, flex_rank_tier = 'N/A', 'N/A'
                    solo_rank_division, flex_rank_division = -1, -1

                primary_role = row.get('Preferred Role', 'Fill').lower().strip()
                
                # Split secondary roles from a comma-separated string into a list
                secondary_roles_str = row.get('Secondary Roles', '')
                secondary_roles = [role.strip().lower() for role in secondary_roles_str.split(',') if role.strip()]
                
                # Convert "Yes"/"No" to a boolean
                is_captain = row.get('Do you want to be a Team Captain?', 'No').strip().lower() == 'yes'
                is_sub = row.get('Do you want to be a sub?', 'No').strip().lower() == 'yes'

                peakRankTier = row.get('Peak Rank Tier')
                peakRankDivision = row.get('Peak Rank division')
                rankLp = row.get('Peak LP')

                contact = row.get('Discord Username')

                timezone = row.get('Timezone')

                user_id = player_id + 1 if not is_sub else sub_id + 1

                player = Player(
                    id=user_id,
                    name=summoner_name,
                    peakRankTier=peakRankTier,
                    peakRankDivision=rankLp if peakRankDivision == 'LP' else peakRankDivision,
                    soloRankTier=solo_rank_tier,
                    soloRankDivision=solo_rank_division,
                    flexRankTier=flex_rank_tier,
                    flexRankDivision=flex_rank_division,
                    role=primary_role,
                    secondaryRoles=secondary_roles,
                    isCaptain=is_captain,
                    contact=contact,
                    timezone=timezone
                )
                if (is_sub):
                    subs.append(player.to_dict())
                    sub_id += 1
                else:
                    players.append(player.to_dict())
                    player_id += 1
                
    except FileNotFoundError:
        print(f"Error: The file '{filename}' was not found.")
        return []
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return []
        
    return [players, subs]

# --- Example Usage ---
if __name__ == "__main__":
    csv_filename = '/Users/lugli/Documents/vincelugligit/vincelugli.github.io/tournament-app/python/Google Rumble 2025 (go_grumble-2025-signup) (Responses) - Form Responses 1.csv'

    # 2. Run the function with the created CSV file
    player_data_objects, subs_data_objects = create_players_from_csv(csv_filename)

    # 3. Print the result as a nicely formatted JSON string
    # This is the exact string you would paste into your admin page's text area.
    if player_data_objects:
        with open('json_player_data.json', mode='w') as out:
            out.write(json.dumps(player_data_objects, indent=2))
        with open('json_sub_data.json', mode='w') as out:
            out.write(json.dumps(subs_data_objects, indent=2))
