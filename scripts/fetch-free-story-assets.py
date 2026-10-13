"""Acquire only two verified CC0 Poly Haven resources used by the story treatment."""
import json,pathlib,urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]
folder=ROOT/'assets'/'story-library';folder.mkdir(parents=True,exist_ok=True)
def fetch(url):
    req=urllib.request.Request(url,headers={'User-Agent':'TechVideoStudio/1.0'})
    with urllib.request.urlopen(req,timeout=60) as response:return response.read()
records=[]
textureCatalog=json.loads(fetch('https://api.polyhaven.com/assets?t=textures'))
wood=next(name for name in sorted(textureCatalog) if name.startswith('wood_planks'))
for asset,kind in [('studio_small_09','hdri'),(wood,'texture')]:
    metadata=json.loads(fetch(f'https://api.polyhaven.com/files/{asset}'))
    if kind=='hdri': resource=metadata['hdri']['1k']['hdr']
    else:
        diffuseKey=next(key for key in metadata if 'diff' in key.lower())
        resource=metadata[diffuseKey]['1k']['jpg']
    extension='hdr' if kind=='hdri' else 'jpg'
    destination=folder/(f'{asset}.{extension}' if kind=='hdri' else 'wood.jpg')
    if not destination.exists():destination.write_bytes(fetch(resource['url']))
    records.append({'id':asset,'file':str(destination.relative_to(ROOT)).replace('\\','/'),'url':resource['url'],'license':'CC0','licenseUrl':'https://polyhaven.com/license','source':'Poly Haven official API'})
    print(f'Downloaded {asset} ({destination.stat().st_size} bytes)',flush=True)
(folder/'SOURCES.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf8')
for site in ['https://threejsresources.com/','https://polyfork.dev/assets?price=free']:
    try:
        data=fetch(site);print(f'Inspected resource directory {site}: {len(data)} bytes',flush=True)
        (folder/('threejsresources.html' if 'threejsresources' in site else 'polyfork.html')).write_bytes(data)
    except Exception as error:print(f'Directory access failed: {site}: {error}',flush=True)
