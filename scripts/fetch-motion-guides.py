"""Fetch text-only, pinned upstream motion references; never execute their installers."""
import concurrent.futures, json, pathlib, urllib.request, hashlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
REPOS = {
    'hyperframes': 'heygen-com/hyperframes',
    'onetake': 'feitangyuan/onetake',
    'collage-broll': 'pyang5166/gbro-collage-broll',
    'clawd-animation': 'JohnHeibel/ClaudeAnimationBase',
    'lemo-opuscar': 'lemomo-ai/lemo-opuscar',
}
def get(url):
    request = urllib.request.Request(url, headers={'User-Agent':'TechVideoStudio-reference-fetcher'})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()

def fetch_repo(item):
    name, repo = item
    info = json.loads(get(f'https://api.github.com/repos/{repo}'))
    branch = info['default_branch']
    commit = json.loads(get(f'https://api.github.com/repos/{repo}/commits/{branch}'))['sha']
    tree = json.loads(get(f'https://api.github.com/repos/{repo}/git/trees/{commit}?recursive=1'))
    if tree.get('truncated'): raise RuntimeError(f'Truncated tree: {repo}')
    selected = []
    for entry in tree['tree']:
        path = entry['path']
        if entry['type'] != 'blob' or entry.get('size',0) > 1500000: continue
        if not (path.endswith('.md') or pathlib.PurePosixPath(path).name.startswith('LICENSE')): continue
        if name == 'hyperframes' and not (path.startswith('skills/') or path.startswith('LICENSE')): continue
        selected.append(entry)
    folder = ROOT/'vendor'/'motion-guides'/name
    def save(entry):
        relative = pathlib.PurePosixPath(entry['path'])
        if '..' in relative.parts or relative.is_absolute(): raise RuntimeError('Unsafe upstream path')
        data = get(f'https://raw.githubusercontent.com/{repo}/{commit}/{entry["path"]}')
        target = folder.joinpath(*relative.parts)
        target.parent.mkdir(parents=True,exist_ok=True)
        if target.exists() and target.read_bytes()!=data: raise RuntimeError(f'Refusing overwrite: {target}')
        target.write_bytes(data)
        return {'path':entry['path'],'sha256':hashlib.sha256(data).hexdigest()}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        files = list(pool.map(save,selected))
    print(f'{name}: {len(files)} text references @ {commit[:12]}',flush=True)
    return {'id':name,'repo':repo,'commit':commit,'mode':'reference-only; no upstream executable installation','files':files}

if __name__=='__main__':
    records = [fetch_repo(item) for item in REPOS.items()]
    destination=ROOT/'vendor'/'motion-guides'/'sources.json'
    destination.write_text(json.dumps(records,indent=2)+'\n',encoding='utf8')
