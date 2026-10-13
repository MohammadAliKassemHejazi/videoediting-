import {readFileSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {createHash} from 'node:crypto';
export function storyDigest(root,recordFile){
 const spec=JSON.parse(readFileSync(recordFile,'utf8')),module=resolve(root,spec.rendererModule||'lib/story-painters.js');
 if(relative(root,module).startsWith('..'))throw Error('Story renderer must be in the workspace');
 const hash=createHash('sha256');
 for(const path of [recordFile,module,join(root,'remotion/Story.jsx'),join(root,'remotion/fonts.css')])hash.update(readFileSync(path));
 return hash.digest('hex');
}
