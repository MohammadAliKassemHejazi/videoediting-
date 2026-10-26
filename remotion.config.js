import {Config} from '@remotion/cli/config';
Config.setPublicDir('remotion/public');
// Let Studio and each render choose an available port independently.
// Config.setPort(3000) would force the renderer onto that occupied port too.
