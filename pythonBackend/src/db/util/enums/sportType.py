from enum import Enum, unique


@unique
class SportType(Enum):
    Football = 1
    Tennis = 2


sportTypeDict: dict[SportType, str] = {
    SportType.Football: "Football",
    SportType.Tennis: "Tennis"
}
