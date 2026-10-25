"""Local adapter for raw-Comfy-key H3 GGUF text encoders.

These conversions contain the vision tower and original tensor names but no
llama.cpp architecture metadata. Validate that layout rather than remapping it
as a different Qwen model. Upstream model and loader sources remain untouched.
"""
import importlib
import warnings
import gguf
import torch
import nodes
import folder_paths
import comfy.sd
import comfy.model_management


class StudioH3CLIPLoaderGGUF:
    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {"clip_name": (folder_paths.get_filename_list("clip_gguf"),)}}

    RETURN_TYPES = ("CLIP",)
    FUNCTION = "load"
    CATEGORY = "studio/h3"

    def load(self, clip_name):
        package = nodes.NODE_CLASS_MAPPINGS["UnetLoaderGGUF"].__module__.rsplit(".", 1)[0]
        loader = importlib.import_module(package + ".loader")
        ops = importlib.import_module(package + ".ops")
        dequant = importlib.import_module(package + ".dequant")
        patcher = importlib.import_module(package + ".nodes").GGUFModelPatcher
        path = folder_paths.get_full_path_or_raise("clip_gguf", clip_name)
        reader = gguf.GGUFReader(path)
        names = {t.name for t in reader.tensors}
        signature = {"model.embed_tokens.weight", "model.layers.49.self_attn.q_proj.weight", "visual.deepstack_merger_list.0.norm.weight"}
        if not signature.issubset(names):
            raise ValueError("Expected raw H3 50-layer Qwen3-VL encoder with integrated vision tower")
        state = {}
        for tensor in reader.tensors:
            shape = loader.get_orig_shape(reader, tensor.name)
            if shape is None:
                shape = torch.Size(tuple(int(v) for v in reversed(tensor.shape)))
            # sd.cpp GGUF stores this Conv3d kernel with out_channels and RGB
            # flattened together; restore the native Qwen3-VL layout, same bytes.
            if tensor.name == "visual.patch_embed.proj.weight" and tuple(shape) == (3456, 2, 16, 16):
                shape = torch.Size((1152, 3, 2, 16, 16))
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", message="The given NumPy array is not writable")
                data = torch.from_numpy(tensor.data)
            if tensor.tensor_type == gguf.GGMLQuantizationType.BF16:
                # BF16 is already an ordinary torch dtype. Reinterpret its
                # packed bytes without allocating giant int32 dequant buffers
                # for the 151936x5120 token embedding on this 6 GB GPU.
                state[tensor.name] = data.view(torch.bfloat16).reshape(shape)
                continue
            if tensor.tensor_type in {gguf.GGMLQuantizationType.F32, gguf.GGMLQuantizationType.F16}:
                data = data.view(*shape)
            state[tensor.name] = ops.GGMLTensor(data, tensor_type=tensor.tensor_type, tensor_shape=shape)
            if tensor.name == "visual.patch_embed.proj.weight":
                # Native Conv3d has no GGML operation shim. This small kernel
                # must be a real tensor, not packed BF16 bytes with a shape hint.
                state[tensor.name] = dequant.dequantize_tensor(state[tensor.name], dtype=torch.float16).reshape(shape)
            elif len(shape) <= 1 and dequant.is_quantized(state[tensor.name]):
                state[tensor.name] = dequant.dequantize_tensor(state[tensor.name], dtype=torch.float32)
        clip = comfy.sd.load_text_encoder_state_dicts(
            clip_type=comfy.sd.CLIPType.MINIMAX,
            state_dicts=[state],
            model_options={"custom_operations": ops.GGMLOps, "initial_device": comfy.model_management.text_encoder_offload_device()},
            embedding_directory=folder_paths.get_folder_paths("embeddings"),
        )
        clip.patcher = patcher.clone(clip.patcher)
        # Keep the read-only backing file. The upstream detach pass copies the
        # whole 12 GB encoder through GPU into anonymous RAM, forcing heavy
        # paging on a 16 GB laptop before inference even starts.
        clip.patcher.mmap_released = True
        clip.patcher.named_modules_to_munmap = {}
        return (clip,)


class StudioH3UNETLoaderGGUF:
    @classmethod
    def INPUT_TYPES(cls):
        return nodes.NODE_CLASS_MAPPINGS["UnetLoaderGGUF"].INPUT_TYPES()

    RETURN_TYPES = ("MODEL",)
    FUNCTION = "load"
    CATEGORY = "studio/h3"

    def load(self, unet_name):
        model, = nodes.NODE_CLASS_MAPPINGS["UnetLoaderGGUF"]().load_unet(unet_name)
        model.mmap_released = True
        model.named_modules_to_munmap = {}
        return (model,)


NODE_CLASS_MAPPINGS = {"StudioH3CLIPLoaderGGUF": StudioH3CLIPLoaderGGUF, "StudioH3UNETLoaderGGUF": StudioH3UNETLoaderGGUF}
NODE_DISPLAY_NAME_MAPPINGS = {"StudioH3CLIPLoaderGGUF": "Studio H3 Raw GGUF Text Encoder", "StudioH3UNETLoaderGGUF": "Studio H3 File-Backed GGUF Model"}
