import requests
import shutil
import re
from bs4 import BeautifulSoup

# get the page
page = requests.get('https://zavarovanec.zzzs.si/izbira-in-zamenjava-osebnega-zdravnika/seznami-zdravnikov/')

# load into parser
soup = BeautifulSoup(page.content, 'html.parser')
table = soup.find('table', id='seznamdatotek-1560')

# for each link, get it, get the original filename header and save under said filename
for link in table.find_all('a', href=True):
    count = 0
    res = requests.get(link['href'])
    header = res.headers.get('content-disposition')
    # regex
    filename = re.findall('filename="?([^";]+)"?', header)
    # fallback for filename
    if filename:
        name = filename[0]
        print("found " + name)
    else:
        name = "unknown" + str(count) + ".xlsx"
        count += 1
        print("didn't find filename")
    # save it in chunks
    with open(name, 'wb') as f:
        for chunk in res.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
    # move the file into the dataset folder (if renaming successful)
    # if filename:
    #    shutil.move(name, '../datasets/.') 