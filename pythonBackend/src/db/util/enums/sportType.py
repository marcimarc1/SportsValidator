from enum import Enum, unique


@unique
class SportType(Enum):
    Football= 1
    Tennis = 2


sportTypeDict: dict[int, str] = {
    SportType.Football.value: "Football",
    SportType.Tennis.value: "Tennis"
}
