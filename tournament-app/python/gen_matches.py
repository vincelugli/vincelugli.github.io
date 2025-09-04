import json

def generate_round_robin_matches(groups: dict) -> list[dict]:
    """
    Generates a list of all round-robin matches for a given set of groups.

    Args:
        groups: A dictionary where keys are group names and values are lists of team IDs.

    Returns:
        A list of match dictionaries.
    """
    matches = []
    match_id_counter = 1

    for group_name, team_ids in groups.items():
        # Use a nested loop to create every unique pair of teams
        # The second loop starts from i + 1 to avoid duplicates and self-play
        for i in range(len(team_ids)):
            for j in range(i + 1, len(team_ids)):
                match = {
                    "id": match_id_counter,
                    "team1Id": team_ids[i],
                    "team2Id": team_ids[j],
                    "status": "upcoming",
                    "tournamentCodes": []
                }
                matches.append(match)
                match_id_counter += 1
        # Add the bye weeks
        if group_name == "C":
            for i in range(len(team_ids)):
                match = {
                    "id": match_id_counter,
                    "team1Id": team_ids[i],
                    "team2Id": -1,
                    "status": "upcoming",
                    "tournamentCodes": []
                }
                matches.append(match)
                match_id_counter += 1
    
    return matches

# --- Example Usage ---
if __name__ == "__main__":
    # Define our groups, each with 5 teams
    tournament_groups = {
        "A": [1, 4, 7, 10],
        "B": [2, 5, 8, 11],
        "C": [3, 6, 9]
    }

    # Generate the list of all matches
    all_matches = generate_round_robin_matches(tournament_groups)

    # Print the result as a nicely formatted JSON string
    print(json.dumps(all_matches, indent=2))
