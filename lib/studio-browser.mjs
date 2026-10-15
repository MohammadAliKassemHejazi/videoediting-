import {existsSync} from 'node:fs';
import {chromium} from 'playwright';

// Playwright's headless shell here lacks H.264. Inspect actual video playback
// with an installed browser that supports the studio's delivery codec.
export function studioBrowserExecutable(){
 for(const file of ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'])if(existsSync(file))return file;
 return chromium.executablePath();
}
