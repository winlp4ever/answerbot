import requests

url = 'http://localhost:5005/model/parse'
obj = {
	"text": "hello"
}

x = requests.post(url,json=obj)

print(x.json())