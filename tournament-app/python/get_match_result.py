import firebase_admin
from firebase_admin import credentials, firestore
import json
import sys

def initialize_firebase_app():
    """Initializes the Firebase Admin SDK using environment credentials."""
    try:
        # The SDK will automatically find the credentials via the environment variable.
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)
        print("Firebase App initialized successfully.", file=sys.stderr)
    except Exception as e:
        # Check if the app is already initialized, which can happen in interactive sessions
        if not firebase_admin._apps:
            print(f"Error initializing Firebase App: {e}", file=sys.stderr)
            sys.exit(1)

def get_match_result_as_json(collection_name: str, document_id: str) -> str | None:
    """
    Fetches a single document from Firestore and returns it as a formatted JSON string.

    Args:
        collection_name (str): The name of the collection (e.g., 'match_results').
        document_id (str): The ID of the document to fetch.

    Returns:
        A formatted JSON string of the document data, or None if not found.
    """
    db = firestore.client()
    
    print(f"Fetching document '{document_id}' from collection '{collection_name}'...", file=sys.stderr)
    
    try:
        # Get a reference to the specific document
        doc_ref = db.collection(collection_name).document(document_id)
        doc = doc_ref.get()

        if not doc.exists:
            print(f"  [ERROR] Document '{document_id}' not found.", file=sys.stderr)
            return None

        match_data = doc.to_dict()
        
        # Convert the dictionary to a JSON string.
        # The `default=str` argument is a crucial handler for data types
        # like Firestore Timestamps, which are not natively JSON serializable.
        return json.dumps(match_data, indent=2, default=str)

    except Exception as e:
        print(f"\nAn error occurred while fetching the document: {e}", file=sys.stderr)
        return None

# --- Main Execution Block ---
if __name__ == "__main__":
    # 1. Check for the command-line argument
    if len(sys.argv) != 2:
        # Print usage instructions to stderr so they don't pollute the JSON output
        print("Usage: python get_match_result.py <match_id>", file=sys.stderr)
        sys.exit(1)
    
    match_id_to_fetch = sys.argv[1]
    print(match_id_to_fetch)
    # 2. Initialize the connection to your Firebase project
    initialize_firebase_app()

    # 3. Define the path. 'default' database is used automatically by the SDK.
    TARGET_COLLECTION = "match_results"
    
    # 4. Run the function
    json_output = get_match_result_as_json(TARGET_COLLECTION, match_id_to_fetch)

    # 5. Print the JSON output to standard output
    if json_output:
        print(json_output)