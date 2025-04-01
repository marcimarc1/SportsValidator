from typing import List, Dict, Tuple

from pydantic import BaseModel, RootModel


class Point(BaseModel):
    id: str
    x: float
    y: float
    originalCoords: Tuple[float, float]


# Football data
class MidlinePointSoccer(BaseModel):
    id: str
    coords: Tuple[float, float]


class MiddleCircleSoccer(BaseModel):
    center: Tuple[float, float]
    radius: float


class PenaltySpotSoccer(BaseModel):
    id: str
    coords: Tuple[float, float]


class FieldSectionSoccer(BaseModel):
    frame: int
    outerArea: List[Point]
    penaltyAreaLeft: List[Point]
    penaltyAreaRight: List[Point]
    goalAreaLeft: List[Point]
    goalAreaRight: List[Point]
    middleLine: List[Point]
    penaltySpot: List[Point]
    # filterBoxes: List[List[float]]


class HomographyModelSoccer(RootModel[Dict[int, FieldSectionSoccer]]):
    pass


class HomographyModelSoccerAsList(RootModel[List[Tuple[int, FieldSectionSoccer]]]):
    pass


# Tennis data
class FieldSectionTennis(BaseModel):
    outerArea: List[Point]
    baselineCenterline: List[Point]
    baselineSingle: List[Point]
    centerNet: List[Point]
    singleNet: List[Point]
    sideNet: List[Point]
    serviceSingle: List[Point]
    # filterBoxes: List[List[float]]


class HomographyModelTennis(RootModel[Dict[int, FieldSectionTennis]]):
    pass


class HomographyModelTennisAsList(RootModel[List[Tuple[int, FieldSectionTennis]]]):
    pass
