import tensorflow as tf
import tensorflow.keras.backend as K
import gc
import torch



def clear_gpu_memory():
    # 🛑 1. Free TensorFlow memory
    try:
        K.clear_session()  # Clears the backend session to release occupied GPU memory
        tf.compat.v1.reset_default_graph()  # Resets the computational graph to avoid stale references
    except Exception as e:
        print(f"⚠ Error clearing TensorFlow memory: {e}")

    # 🛑 2. Free PyTorch memory
    try:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()  # Releases unreferenced GPU memory
            torch.cuda.ipc_collect()  # Cleans up unused inter-process memory
    except Exception as e:
        print(f"⚠ Error clearing PyTorch memory: {e}")

    # 🛑 3. Run garbage collection to free system RAM
    try:
        gc.collect()  # Forces Python garbage collection to free up memory
    except Exception as e:
        print(f"⚠ Error freeing system RAM: {e}")