import requests

url = 'http://localhost:6800/ask-bob'
obj = {
	"qid": "5601"
}

x = requests.post(url,json=obj)

print(x.json())