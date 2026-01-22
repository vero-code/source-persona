import requests
import time
import sys

def test_pdf_generation():
    url = "http://localhost:8000/api/generate-report"
    data = {
        "chat_history": [
            {"role": "user", "content": "Hi, I am an expert in Python and AI."},
            {"role": "model", "content": "That is great. Can you prove it?"},
            {"role": "user", "content": "I built a transformer from scratch using PyTorch."}
        ]
    }
    
    print(f"Sending request to {url}...")
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            content_type = response.headers.get("content-type")
            print(f"Success! Status: {response.status_code}")
            print(f"Content-Type: {content_type}")
            if "application/pdf" in content_type:
                with open("test_report.pdf", "wb") as f:
                    f.write(response.content)
                print("PDF saved to test_report.pdf")
                return True
            else:
                print("Error: content-type is not application/pdf")
                return False
        else:
            print(f"Failed. Status: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

if __name__ == "__main__":
    # Wait for server to start if needed
    max_retries = 5
    for i in range(max_retries):
        if test_pdf_generation():
            sys.exit(0)
        print(f"Retry {i+1}/{max_retries}...")
        time.sleep(2)
    sys.exit(1)
