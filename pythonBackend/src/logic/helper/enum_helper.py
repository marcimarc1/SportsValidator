from enum import Enum
from typing import Type, Dict, List, Callable, Any


def get_enum_dict(enum: Type[Enum]) -> Dict[str, int]:
    if not issubclass(enum, Enum):
        raise ValueError(f"{enum.__name__} is not a valid Enum class.")

    return {e.name: e.value for e in enum}


def get_enum_list(enum: Type[Enum]) -> list[dict[str, Any]]:
    if not issubclass(enum, Enum):
        raise ValueError(f"{enum.__name__} is not a valid Enum class.")
    return [{"name": item.name, "id": item.value} for item in enum]