from .active_learning import add_test
from .utils import distance_of_points, scaled_difference, angle_at_z
from ..pydantic_models.homography import FieldSectionSoccer


@add_test("length_test", "Soccer")
def outer_lines_same_length_score(data: FieldSectionSoccer, diff_threshold) -> float:
    """
    Given a field, calculates how similar the outer line lengths are.
    Returns a score from 0 to 1, evaluating how similar left line length is to right line and top is to bot line
    """
    # top line: outer-0 == midline-0 == outer-1
    # bot line: outer-3 == midline-1 == outer-2
    distance_top = distance_of_points([data.outerArea[0], data.middleLine[0], data.outerArea[1]])
    distance_bot = distance_of_points([data.outerArea[3], data.middleLine[1], data.outerArea[2]])

    # left line: outer-0 == penalty-left-0 == goal-left-0 == goal-left-3 == penalty-left-3 == outer-3
    # right line: outer-1 == penalty-right-1 == goal-right-1 == goal-right-2 == penalty-right-2 == outer-2
    distance_left = distance_of_points([data.outerArea[0], data.penaltyAreaLeft[0], data.goalAreaLeft[0],
                                        data.goalAreaLeft[3], data.penaltyAreaLeft[3], data.outerArea[3]])

    distance_right = distance_of_points([data.outerArea[1], data.penaltyAreaRight[1], data.goalAreaRight[1],
                                         data.goalAreaRight[2], data.penaltyAreaRight[2], data.outerArea[2]])

    return ((scaled_difference(distance_top, distance_bot, diff_threshold) +
            scaled_difference(distance_left, distance_right, diff_threshold))
            / 2)

@add_test("parallel_test", "Soccer")
def lines_parallel_score(data: FieldSectionSoccer, diff_threshold) -> float:
    """
    Given a field, calculates how similar the line parallelism is.
    For that calculate the diff in height of two points and compare to the other side
    Returns a score from 0 to 1
    """
    # top outer-0 == outer-1
    # bot outer-3 == outer-2
    top_diff = abs(data.outerArea[0].y - data.outerArea[1].y)
    bot_diff = abs(data.outerArea[3].y - data.outerArea[2].y)

    # left: outer-0 == outer-3
    # right: outer-1 == outer-2
    left_diff = abs(data.outerArea[0].y - data.outerArea[3].y)
    right_diff = abs(data.outerArea[1].y - data.outerArea[2].y)

    return (scaled_difference(top_diff, bot_diff, diff_threshold) +
            scaled_difference(left_diff, right_diff, diff_threshold)) / 2

@add_test("corner_degree_test", "Soccer")
def corner_degree(data: FieldSectionSoccer, _) -> float:
    """
    c0----c1
    |      |
     c2----c3
    """
    # diff_threshold not needed, since values can only be between 0 and 180 degree
    # Calculate rank for all 4 corners and return the average
    c0 = angle_at_z(data.outerArea[3], data.outerArea[1], data.outerArea[0])
    c1 = angle_at_z(data.outerArea[0], data.outerArea[2], data.outerArea[1])
    c2 = angle_at_z(data.outerArea[0], data.outerArea[2], data.outerArea[3])
    c3 = angle_at_z(data.outerArea[3], data.outerArea[1], data.outerArea[2])
    return sum((c0, c1, c2, c3)) / 4.0

@add_test("filter_boxes_test", "Soccer")
def lines_parallel_score(data: FieldSectionSoccer, diff_threshold) -> float:
    return (data.filterBoxes[0][4] + data.filterBoxes[1][4]) / 2
