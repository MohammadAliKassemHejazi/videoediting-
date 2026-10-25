"""Measure affine prop motion from existing video; emit numbers, never edit images.

Uses CPU-only OpenCV optical flow/RANSAC. The final seek-safe renderer applies
original SVG label artwork, leaving the H3 source MP4s untouched.
"""
from pathlib import Path
import hashlib
import json
import sys
import cv2
import numpy as np

cv2.setNumThreads(1)
ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / 'projects/texas-cinema-myth'
settings = json.loads((FOLDER / 'TRACKING.json').read_text(encoding='utf-8'))
selected = set(sys.argv[1:])
for cfg in settings['shots']:
    if selected and cfg['id'] not in selected:
        continue
    source = FOLDER / 'assets/shots' / (cfg['id'] + '-h3.mp4')
    if not source.exists():
        print('Not generated yet:', cfg['id'])
        continue
    capture = cv2.VideoCapture(str(source))
    ok, first = capture.read()
    if not ok:
        raise RuntimeError('Cannot decode ' + str(source))
    height, width = first.shape[:2]
    if (width, height) != (352, 640):
        raise RuntimeError('Tracking configuration assumes native352x640 sources')
    mask = np.zeros((height, width), dtype=np.uint8)
    center = tuple(round(v) for v in cfg['center'])
    axes = tuple(round(v) for v in cfg['featureAxes'])
    cv2.ellipse(mask, center, axes, cfg['angle'], 0, 360, 255, -1)
    if cfg['kind'] == 'hub':
        cv2.ellipse(mask, center, tuple(round(v*1.2) for v in cfg['axes']), cfg['angle'], 0, 360, 0, -1)
    previous = cv2.cvtColor(first, cv2.COLOR_BGR2GRAY)
    transform = np.eye(3, dtype=np.float64)
    frames = []
    frame = first
    count = 0
    while True:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        confidence = 1.0
        if count:
            moved_mask = cv2.warpAffine(mask, transform[:2], (width, height), flags=cv2.INTER_NEAREST)
            points = cv2.goodFeaturesToTrack(previous, mask=moved_mask, maxCorners=150, qualityLevel=.012, minDistance=3, blockSize=5)
            if points is None or len(points) < 5:
                confidence = 0
            else:
                moved, status, _ = cv2.calcOpticalFlowPyrLK(previous, gray, points, None, winSize=(19,19), maxLevel=3)
                returned, back_status, _ = cv2.calcOpticalFlowPyrLK(gray, previous, moved, None, winSize=(19,19), maxLevel=3)
                good = status.reshape(-1).astype(bool) & back_status.reshape(-1).astype(bool) & (np.linalg.norm(returned-points,axis=2).reshape(-1)<1.1)
                if good.sum() >= 5:
                    affine, inliers = cv2.estimateAffine2D(points[good], moved[good], method=cv2.RANSAC, ransacReprojThreshold=1.2, confidence=.995)
                    if affine is not None:
                        determinant = float(np.linalg.det(affine[:,:2]))
                        confidence = float(inliers.mean())
                        if .86 < determinant < 1.16 and np.linalg.norm(affine[:,2]) < 24:
                            transform = np.vstack([affine,[0,0,1]]) @ transform
                        else:
                            confidence = 0
                    else:
                        confidence = 0
                else:
                    confidence = 0
        moved_center = transform @ np.array([*cfg['center'],1.0])
        # Stop the label showing through the black ink wipe. This is visibility
        # measurement only, not a synthetic re-lighting of the source image.
        px, py = (round(float(v)) for v in moved_center[:2])
        patch = frame[max(0,py-7):min(height,py+8),max(0,px-7):min(width,px+8)]
        brightness = float(np.percentile(cv2.cvtColor(patch,cv2.COLOR_BGR2HSV)[:,:,2],75)) if patch.size else 0
        visibility = float(np.clip((brightness-42)/55,0,1))
        if 'fadeOutFrames' in cfg:
            begin, end = cfg['fadeOutFrames']
            visibility = min(visibility, float(np.clip((end-count)/max(1,end-begin),0,1)))
        frames.append({'matrix':[round(float(transform[0,0]),6),round(float(transform[1,0]),6),round(float(transform[0,1]),6),round(float(transform[1,1]),6),round(float(transform[0,2]),4),round(float(transform[1,2]),4)],'confidence':round(confidence,3),'visibility':round(visibility,3)})
        previous = gray
        count += 1
        ok, frame = capture.read()
        if not ok:
            break
    capture.release()
    record={'id':cfg['id'],'kind':cfg['kind'],'width':width,'height':height,'fps':24,'sourceHash':hashlib.sha256(source.read_bytes()).hexdigest(),'configuration':cfg,'method':'CPU pyramidal Lucas-Kanade optical flow, forward/backward rejection and affine RANSAC; native-frame numeric metadata only','frames':frames,'review':'Tracking estimated; graphic alignment must be visually inspected before delivery'}
    out=FOLDER/'assets/tracking';out.mkdir(parents=True,exist_ok=True)
    (out/(cfg['id']+'.json')).write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
    print(f"Tracked {cfg['id']}: {count} frames, {sum(f['confidence']<.5 for f in frames)} weak frames, end {moved_center[:2]}",flush=True)
