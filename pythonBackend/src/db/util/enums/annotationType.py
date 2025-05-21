from enum import Enum, unique


@unique
class AnnotationType(Enum):
    Player = 0
    Ball = 1
