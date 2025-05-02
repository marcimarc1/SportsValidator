import os


def is_valid_path(path: str) -> bool:
    return os.path.exists(path) and os.access(path, os.W_OK)
