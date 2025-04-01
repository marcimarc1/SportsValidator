import math

from ..pydantic_models.homography import Point


def scaled_difference(a: float, b: float, x: float) -> float:
    """
    Calculates a scaled difference between two floats.

    :param a: First float.
    :param b: Second float.
    :param x: Threshold difference for returning 0.
    :return: 1 if a == b, 0 if abs(a - b) >= x, otherwise a scaled value.
    """
    assert x > 0, "x should be greater than 0"
    diff = abs(a - b)
    if diff == 0:
        return 1
    elif diff >= x:
        return 0
    else:
        return 1 - (diff / x)


def angle_at_z(x, y, z):
    # Vectors XZ and YZ
    xz = (x.x - z.x, x.y - z.y)
    yz = (y.x - z.x, y.y - z.y)

    # Dot product
    dot_product = xz[0] * yz[0] + xz[1] * yz[1]

    # Magnitudes
    mag_xz = math.sqrt(xz[0] ** 2 + xz[1] ** 2)
    mag_yz = math.sqrt(yz[0] ** 2 + yz[1] ** 2)

    # Avoid division by zero
    if mag_xz == 0 or mag_yz == 0:
        return None  # Undefined angle

    # Compute the angle in radians and convert to degrees
    cos_theta = dot_product / (mag_xz * mag_yz)
    angle_rad = math.acos(max(-1, min(1, cos_theta)))  # Clamp to avoid errors
    angle_deg = math.degrees(angle_rad)

    return angle_deg


def distance_of_points(points: list[Point]) -> float:
    """
    Calculates the total distance between consecutive points in a list.

    :param points: List of Points [p1, p2, p3, ...] representing points.
    :return: Sum of distances between consecutive points.
    """
    return sum(math.dist((points[i].x, points[i].y), (points[i + 1].x, points[i + 1].y)) for i in range(len(points) - 1))
