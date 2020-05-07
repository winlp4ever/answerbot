import requests
import json

question = input('Enter your question:\n')

url = 'https://api.duckduckgo.com/'
params = {
    "q": question.strip(),
    "format": "json"
}

res = requests.get(url=url, params=params) 
data = res.json()
s = json.dumps(data, indent=4)
print(data["AbstractText"])