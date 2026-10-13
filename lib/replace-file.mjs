import {renameSync} from 'node:fs';
import {resolve,relative,isAbsolute} from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT} from './project.mjs';

// Native PowerShell handles replacing existing Windows draft files consistently.
// Both paths are fixed workspace files; never pass user text as shell syntax.
export function replaceWorkspaceFile(source,destination){
  const paths=[source,destination].map(path=>resolve(path));
  for(const path of paths){
    const local=relative(ROOT,path);
    if(!local||local==='..'||local.startsWith('..\\')||local.startsWith('../')||isAbsolute(local))throw Error('Replacement must stay within the workspace.');
  }
  if(process.platform!=='win32')return renameSync(...paths);
  const literal=value=>"'"+value.replaceAll("'","''")+"'";
  execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',`$ErrorActionPreference='Stop'; Move-Item -LiteralPath ${literal(paths[0])} -Destination ${literal(paths[1])} -Force`],{stdio:'inherit'});
}
