# Local Remotion rendering

Run `npm run preview`. Studio chooses an available port; use the URL printed by
the command. The current session is at http://localhost:3002.

`remotion.config.js` sets the public directory and deliberately leaves both server
ports automatic. `scripts/style-lab.mjs` also leaves the port automatic and forwards
explicit preview arguments. Do not add `Config.setPort(3000)` or `--port=3000`:
the former sets both the Studio and renderer ports, while another service may
already own 3000. Studio captures the renderer setting at startup, so restart
only the studio's owned process after changing a fixed-port setting. Refresh its
browser tab and start a new render rather than retrying an old failed queue item.

On 2026-10-26, port 3000 remained owned by Docker. Studio started on 3002 and an
actual browser-queued 1440x2560/60fps Texas episode render used 3003 and advanced
past 1,191 of 5,400 frames. The user confirmed that rendering was working. No
Docker, GPU service or active render was stopped to free a port.

The separate production export `out/texas-cinema-myth/draft.mp4` had already
completed: 90.01 seconds, 1440x2560, 60fps, audio present, full decode passed.
The browser-queued re-export also completed at `out/texas-cinema-myth.mp4`:5,400
frames,90.01 seconds,1440x2560/60fps,audio, full decode passed. Its validation record
is `out/texas-cinema-myth/studio-render-check.json`.
Do not run another render or GPU generation concurrently with an active Studio
render, even when the studio queue does not use `.cache/render.lock`.
