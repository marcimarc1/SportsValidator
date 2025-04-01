from .active_learning import add_test
from .utils import distance_of_points, scaled_difference, angle_at_z
from ..pydantic_models.homography import FieldSectionTennis


@add_test("length_test", "Tennis")
def outer_lines_same_length_score(data: FieldSectionTennis, diff_threshold) -> float:
    # top line: outer-0 == outer-1
    # bot line: outer-3 == outer-2
    distance_top = distance_of_points([data.outerArea[0], data.outerArea[1]])
    distance_bot = distance_of_points([data.outerArea[3], data.outerArea[2]])

    # left line: outer-0 == outer-3
    # right line: outer-1 == outer-2
    distance_left = distance_of_points([data.outerArea[0], data.outerArea[3]])
    distance_right = distance_of_points([data.outerArea[1], data.outerArea[2]])

    return ((scaled_difference(distance_top, distance_bot, diff_threshold) +
             scaled_difference(distance_left, distance_right, diff_threshold))
            / 2)


@add_test("outer_corner_degree_test", "Tennis")
def outer_corner_degree(data: FieldSectionTennis, _) -> float:
    """
    c0----c1
    |      |
     c2----c3
    """
    # diff_threshold not needed, since values can only be between 0 and 180 degree
    # Calculate rank for all 4 corners and return the average
    c0 = angle_at_z(data.outerArea[3], data.outerArea[1], data.outerArea[0])
    c1 = angle_at_z(data.outerArea[0], data.outerArea[2], data.outerArea[1])
    c2 = angle_at_z(data.outerArea[3], data.outerArea[1], data.outerArea[2])
    c3 = angle_at_z(data.outerArea[0], data.outerArea[2], data.outerArea[3])
    return sum((c0, c1, c2, c3)) / 4


@add_test("inner_corner_degree_test", "Tennis")
def inner_corner_angle_test(data: FieldSectionTennis, _) -> float:
    c0 = angle_at_z(data.serviceSingle[3], data.serviceSingle[1], data.serviceSingle[0])
    c1 = angle_at_z(data.serviceSingle[0], data.serviceSingle[2], data.serviceSingle[1])
    c2 = angle_at_z(data.serviceSingle[3], data.serviceSingle[1], data.serviceSingle[2])
    c3 = angle_at_z(data.serviceSingle[0], data.serviceSingle[2], data.serviceSingle[3])
    return sum((c0, c1, c2, c3)) / 4


@add_test("parallel_test", "Tennis")
def lines_parallel_score(data: FieldSectionTennis, diff_threshold) -> float:
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


@add_test("filter_boxes_test", "Tennis")
def lines_parallel_score(data: FieldSectionTennis, diff_threshold) -> float:
    return (data.filterBoxes[0][4] + data.filterBoxes[1][4]) / 2.0
