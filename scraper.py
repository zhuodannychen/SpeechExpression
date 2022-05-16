from bs4 import BeautifulSoup
import requests

URL = "https://conversationstartersworld.com/250-conversation-starters/"
page = requests.get(URL)
soup = BeautifulSoup(page.text, "html.parser")
res = []
try:
    idx = 0
    cur = soup.find_all("h3")[0]
    while True:
        question = soup.find_all("h3")[idx]
        print(question.get_text())
        idx += 1
except:
    print("error")
print(res)