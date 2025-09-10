import firebase_admin
from firebase_admin import credentials, firestore
import json
import sys

def initialize_firebase_app():
    """Initializes the Firebase Admin SDK using environment credentials."""
    try:
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)
        print("Firebase App initialized successfully.")
    except Exception as e:
        if not firebase_admin._apps:
            print(f"Error initializing Firebase App: {e}")
            sys.exit(1)

def generate_code_metadata(collection_name: str, document_id: str) -> dict:
    """
    Fetches all match documents from a collection and generates a metadata object
    keyed by tournament codes.

    Args:
        collection_name (str): The name of the matches collection to process
                               (e.g., 'grumble2025_master').

    Returns:
        A dictionary containing the tournament code metadata.
    """
    db = firestore.client()
    metadata = {}
    
    print(f"\nFetching documents from '{collection_name}'...")
    
    try:
        # Get a reference to the specific document
        doc_ref = db.collection(collection_name).document(document_id)
        doc = doc_ref.get()

        if not doc.exists:
            print(f"  [ERROR] Document '{document_id}' not found in collection '{collection_name}'.")
            return {}

        doc_data = doc.to_dict()
        
        # NOTE: We assume the array of matches is in a field named 'matches'.
        # If your field is named something else (e.g., 'all_matches'), change it here.
        all_matches = doc_data.get('matches')

        if not all_matches or not isinstance(all_matches, list):
            print(f"  [ERROR] Document '{document_id}' does not contain a valid 'matches' array field.")
            return {}
        
        print(f"Found {len(all_matches)} matches in the document. Processing...")

        # Iterate through the list of match objects from the document
        for match_data in all_matches:
            team1_id = match_data.get('team1Id')
            team2_id = match_data.get('team2Id')
            tournament_codes = match_data.get('tournamentCodes')

            if not all([team1_id, team2_id, tournament_codes, isinstance(tournament_codes, list)]):
                print(f"  [WARNING] Skipping a match entry due to missing or invalid fields.")
                continue
            
            for index, code in enumerate(tournament_codes):
                # Game number determines the side (Team 1 starts Blue)
                # Game 1 (index 0) -> Blue, Game 2 (index 1) -> Red, Game 3 (index 2) -> Blue
                team1_side = "Red" if index % 2 == 1 else "Blue"
                team2_side = "Blue" if index % 2 == 1 else "Red"
                
                metadata[code] = {
                    "team1Id": team1_id,
                    "team2Id": team2_id,
                    "team1Side": team1_side,
                    "team2Side": team2_side
                }
        
        print(f"Successfully processed {len(metadata)} total tournament codes.")
        return metadata

    except Exception as e:
        print(f"\nAn error occurred while processing the document: {e}")
        return {}

# --- Example Usage ---
if __name__ == "__main__":
    # 1. Initialize the connection to your Firebase project
    initialize_firebase_app()

    # 2. Define which collection to read from.
    TARGET_COLLECTION = 'matches'
    TARGET_DOC = "grumble2025_master"

    # 3. Run the function
    code_metadata = generate_code_metadata(TARGET_COLLECTION, TARGET_DOC)

    # 4. Print the result as a nicely formatted JSON string
    if code_metadata:
        print("\n--- Generated Tournament Code Metadata JSON ---")
        output_json = json.dumps(code_metadata, indent=2)
        print(output_json)

        # Optionally, save to a file
        with open('tournament_metadata.json', 'w', encoding='utf-8') as f:
            f.write(output_json)
        print("\nMetadata also saved to 'tournament_metadata.json'")