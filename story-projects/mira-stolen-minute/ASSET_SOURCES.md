# Assets and runtime

Mira and Sam are original fictional character atlases made with the built-in image
tool; exact prompts and provenance are in series/mira-minute. Brush actors, props,
paper geometry and motion are locally authored. Collage uses the atlases as printed
cutouts; the other two use original code-drawn versions of the same design IDs.

Neural speech was generated through the existing edge-tts client using Microsoft's
online service, ar-SA-ZariyahNeural at -6%. Input text and word boundaries are kept
in assets/voice/*.json. Speech text is sent to that service. Foley and the sparse
musical motif are independently synthesized in scripts/memory-story.mjs; no library
music or sound effect license is required. Narrator gain is 1; no amix normalization.

Inter and Noto Sans Arabic are the existing local @fontsource font packages.
Three.js is the existing installed dependency; paper theatre does not download
external models. Upstream Clawd and Lemo guides are references, not claims of an
exact upstream runtime or style recreation. A generated cover is separate concept
art and is not used as a moving-still substitute for the acting in the film.
