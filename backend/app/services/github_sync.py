import os
import requests
import json
from datetime import datetime
from typing import List, Dict, Any

class GitHubSyncService:
    def __init__(self, username: str = "vero-code"):
        self.username = username
        self.api_url = f"https://api.github.com/users/{username}/repos"
        self.token = os.getenv("GITHUB_TOKEN") 
        self.headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json"
        } if self.token else {}

    def fetch_repos(self) -> List[Dict[str, Any]]:
        """Fetches repositories, handling pagination."""
        repos = []
        page = 1
        print(f"📡 Connecting to GitHub API for user: {self.username}...")
        
        while True:
            params = {"per_page": 100, "page": page, "sort": "updated"}
            try:
                response = requests.get(self.api_url, headers=self.headers, params=params)
                response.raise_for_status()
                data = response.json()
                
                if not data:
                    break
                
                repos.extend(data)
                page += 1
            except requests.exceptions.RequestException as e:
                print(f"❌ Error fetching data: {e}")
                return []

        print(f"✅ Fetched {len(repos)} raw repositories.")
        return repos

    def process_data(self, raw_repos: List[Dict]) -> Dict[str, Any]:
        """Filters and cleans data for the AI Agent context."""
        processed_projects = []
        
        cutoff_date = datetime(2025, 1, 1).date()

        for repo in raw_repos:
            updated_at = datetime.strptime(repo["updated_at"], "%Y-%m-%dT%H:%M:%SZ").date()
            created_at = datetime.strptime(repo["created_at"], "%Y-%m-%dT%H:%M:%SZ").date()

            if updated_at < cutoff_date and created_at < cutoff_date:
                continue
            
            # if repo["fork"]: continue

            project_info = {
                "name": repo["name"],
                "description": repo["description"] or "No description provided.",
                "url": repo["html_url"],
                "stars": repo["stargazers_count"],
                "language": repo["language"],
                "topics": repo["topics"],
                "last_update": str(updated_at),
                "is_fork": repo["fork"]
            }
            processed_projects.append(project_info)

        processed_projects.sort(key=lambda x: (x["stars"], x["last_update"]), reverse=True)

        return {
            "generated_at": str(datetime.now()),
            "total_projects_2025_2026": len(processed_projects),
            "projects": processed_projects
        }

    def save_to_json(self, data: Dict, filepath: str = "backend/data/dynamic_profile.json"):
        """Saves the processed data to a JSON file."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"💾 Profile saved to {filepath} ({data['total_projects_2025_2026']} projects)")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    
    syncer = GitHubSyncService(username="vero-code")
    raw_data = syncer.fetch_repos()
    clean_data = syncer.process_data(raw_data)
    syncer.save_to_json(clean_data)