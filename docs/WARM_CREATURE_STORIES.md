# Warm creature stories

**Current 2026-10-15 state:** real local GPU animation and the first 15-second
draft are now available. Read [LOCAL_GPU_ANIMATION.md](LOCAL_GPU_ANIMATION.md)
for the tested 6GB setup, native source limits, commands and actual output.
The original preparation notes below describe the earlier template-first route.

Added 2026-10-14 after inspecting the supplied 15.16-second fox/kitten reference.
Its technique is cinematic character animation: one character tries to leave,
the other asks for affection, the first reacts, and they reconnect. Warm backlight,
fur, eye direction, paw contact and reaction pauses carry the film. A moving still
cannot reproduce those performances.

The studio now includes an original production keyframe, stable Ember/Luma designs,
an actionable shot plan, official ComfyUI workflow files, and an assembler for real
animated shots. **The first original furry-animation draft is now generated.** The
three Arabic collage/brush/paper story films are separate, code-based capabilities.

## Generate the animation with ComfyUI

1. Install the official [ComfyUI desktop](https://www.comfy.org/download) or use
   your existing installation on suitable hardware. Open Workflow → Browse Templates,
   or drag `vendor/comfy-workflows/video_wan2_2_5B_ti2v.json` into ComfyUI.
2. Follow the [official Wan2.2 guide](https://docs.comfy.org/tutorials/video/wan/wan2_2)
   for the diffusion model, text encoder and VAE filenames and their model folders.
   The JSON templates remain here; this machine now has an isolated GGUF engine
   and verified local weights as documented in LOCAL_GPU_ANIMATION.md.
3. The prepared `projects/warm-creature-story/workflows/contact-test-5b.json`
   already enables Load Image, supplies the original contact/reaction prompt,
   fixes a seed and uses 352×640 / 73 source frames for a modest initial test.
   It is an edited native template, not a completed generation or a tested 6GB setup.
   Upload the local keyframe into its Load Image node. Alternatively enable the
   unmodified template's Load Image node with Ctrl+B and load the original keyframe
   `projects/warm-creature-story/assets/keyframe.png`. Generate short shots from the
   shot prompts in `projects/warm-creature-story/SHOT_PROMPTS.md`. Start with one
   3-second shot, modest resolution, and the template's default sampler settings.
   The supplied keyframe already shows contact, so start with the contact/reaction
   shot; create a separate departure keyframe for the preceding shot. With 24fps
   output, 73 frames is a suitable 4n+1 initial test length; preserve
   the model template's frame-length rules. Do not request a complex entire story
   in one generation.
4. For a precisely staged contact, create a consistent first and last keyframe
   showing the intended paws and faces, then use
   `video_wan2_2_14B_flf2v.json`. This is a heavier workflow. Keep the same character
   reference, camera side, wardrobe and fur markings. Reusing a seed alone does
   not guarantee identity. Reject warped paws, intersecting limbs or changed faces.
5. Export each accepted shot with handles, select clear action/reaction cuts, and
   save shots under a project assets directory. Copy the shot manifest example,
   point it at the real files, then run the assembler below. A storyboard drawing
   or PNG is deliberately rejected as an animated shot.

```powershell
node scripts/creature-story.mjs validate projects/warm-creature-story/shots.example.json
node scripts/creature-story.mjs assemble projects/warm-creature-story/shots.example.json
```

Hardware finding: this machine reports an RTX 3060 laptop GPU with 6 GB VRAM.
ComfyUI's official guide says the 5B workflow should fit 8 GB with native offloading;
the [Wan repository](https://github.com/Wan-Video/Wan2.2) documents a different
standard 5B command using at least 24 GB. Neither establishes that the provided
workflow will work reliably at 6 GB. Quantization/offloading can change requirements,
and the local quantized route has now been tested here (see the current guide).
A larger GPU, a separately chosen hosted generator,
or the Blender route can resolve this; no paid generation was initiated.

## Animate in Blender for precise contact

Model or acquire licensed rigged characters that match the series bible. Retain
source/license for each downloaded model. Create armatures with separate head,
ear, tail and paw controls; use paw IK targets so the kitten holds a stationary
fox forepaw while the torso turns. Add blink, eyelid, cheek and mouth shape keys.
Animate anticipation → reach → contact hold → reaction → release; aim the eyes
at the other face before turning the head. Check collision and planted feet from
both the render camera and a side view. Groom short fur on body/cheeks and longer
fur on tails, with warm backlight and soft fill. Render short shots first, then
the approved sequence at the studio's 2K/60fps target. Hardware-dependent render
time must be measured on the actual scene.

Blender's [Animation and Rigging manual](https://docs.blender.org/manual/en/3.6/animation/index.html)
documents armatures, constraints, shape keys and animation tools. This plan is our
production recommendation; it is not evidence that the supplied reference used Blender.

## What 2K/60fps means for generated shots

The assembler deliberately reframes to portrait 1440×2560 and repeats source
frames to 60fps. Upscaling does not create native 2K detail; repeated frames do not
create new animation. To obtain true 60fps performances, render the rigged scene
at 60fps, or separately evaluate motion interpolation and inspect paws/faces for
artifacts. Never describe a repeated 24fps source as native 60fps animation.
