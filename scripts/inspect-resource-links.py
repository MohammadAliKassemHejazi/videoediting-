from html.parser import HTMLParser
from pathlib import Path
class Links(HTMLParser):
    def __init__(self):super().__init__();self.links=set()
    def handle_starttag(self,tag,attrs):
        for key,value in attrs:
            if key=='href' and value and value.startswith('http'):self.links.add(value)
for name in ['threejsresources','polyfork']:
    parser=Links();parser.feed(Path(f'assets/story-library/{name}.html').read_text(encoding='utf8'))
    selected=[url for url in sorted(parser.links) if any(key in url.lower() for key in ['kenney','polyhaven','sketchfab','threejs','mixamo','ambientcg','quaternius'])]
    print(name+':\n'+'\n'.join(selected[:15]))
