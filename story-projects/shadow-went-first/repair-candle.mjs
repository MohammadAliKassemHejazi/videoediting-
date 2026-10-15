import {copyFileSync,existsSync} from 'node:fs';
import {ffmpeg} from '../../lib/ffmpeg.mjs';
const p='story-projects/shadow-went-first/assets/shots/';
if(!existsSync(p+'09-flame-original.mp4'))copyFileSync(p+'09.mp4',p+'09-flame-original.mp4');
// Flame lives against the hoodie. Remove only its small region after the breath;
// hold the smile before the source begins a second, unwanted blowing cycle.
await ffmpeg(['-i',p+'09-flame-original.mp4','-vf',"delogo=x=228:y=436:w=34:h=66:enable='gte(t,3.15)',trim=duration=5.6,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=1.4",'-an','-c:v','h264_nvenc','-preset','p5','-cq','18','-b:v','0',p+'09.mp4']);
