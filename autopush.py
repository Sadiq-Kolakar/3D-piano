import subprocess
import time
import argparse
import sys

def auto_push(commit_message):
    try:
        # Check if there are any changes
        status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
        if not status.stdout.strip():
            print(f"[{time.strftime('%H:%M:%S')}] No changes to commit.")
            return False

        print(f"[{time.strftime('%H:%M:%S')}] Changes detected. Adding, committing, and pushing...")
        
        # Add all changes
        subprocess.run(["git", "add", "."], check=True)
        
        # Commit changes
        subprocess.run(["git", "commit", "-m", commit_message], check=True)
        
        # Push changes
        subprocess.run(["git", "push"], check=True)
        
        print(f"[{time.strftime('%H:%M:%S')}] Successfully pushed changes: '{commit_message}'")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"[{time.strftime('%H:%M:%S')}] Error during git operation: {e}")
        return False
    except FileNotFoundError:
        print("Git command not found. Please ensure git is installed and in your PATH.")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Auto add, commit, and push changes to GitHub.")
    parser.add_argument(
        "-m", "--message", 
        default=None, 
        help="Commit message. If not provided, a timestamped message is used."
    )
    parser.add_argument(
        "-w", "--watch", 
        type=int, 
        metavar="SECONDS", 
        help="Watch mode: Check and push changes every N seconds."
    )
    
    args = parser.parse_args()
    
    if args.watch:
        print(f"Watching for changes every {args.watch} seconds... Press Ctrl+C to stop.")
        try:
            while True:
                msg = args.message if args.message else f"Auto-commit: {time.strftime('%Y-%m-%d %H:%M:%S')}"
                auto_push(msg)
                time.sleep(args.watch)
        except KeyboardInterrupt:
            print("\nStopped watching.")
    else:
        msg = args.message if args.message else f"Auto-commit: {time.strftime('%Y-%m-%d %H:%M:%S')}"
        auto_push(msg)

if __name__ == "__main__":
    main()
