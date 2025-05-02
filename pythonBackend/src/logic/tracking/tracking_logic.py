import cv2
import os

from logic.helper.util import is_valid_path
from logic.tracking.tracking_helper_functions import get_part_of_image

from pydantic_models.point_update_dto import PlayerBox, PointUpdate, Point, TrackingResult
from pydantic_models.point_update_dto import PointUpdate, Point, TrackingResult

#OPTIONS
BOUNDING_BOX_SIZE = 25
MAX_MOVEMENT = 5
APPLY_SMOOTHING = True
PART_OF_IMAGE_SIZE = 100
FRAME_SKIP = 3

async def track_points_logic(dto: PointUpdate):
    #TODO: update video path
    video_path = f"src/{dto.video_id}"
    if not is_valid_path(video_path):
        video_path = f"backend/src/{dto.video_id}"

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise ValueError(f"Could not open video file {video_path}")

    ret, old_frame = cap.read()

    trackers = []
    initial_points = dto.points if isinstance(dto.points, list) else [dto.points]
    for point in initial_points:
        tracker = cv2.TrackerCSRT_create()
        part_of_image, _ = get_part_of_image(old_frame, point, PART_OF_IMAGE_SIZE)
        bbox = (
            part_of_image.shape[1] // 2,
            part_of_image.shape[0] // 2,
            BOUNDING_BOX_SIZE,
            BOUNDING_BOX_SIZE,
        )
        tracker.init(part_of_image, bbox)
        trackers.append(tracker)

    tracked_points = [initial_points]

    frame_count = 0
    frame_skip = 1

    cap.set(
        cv2.CAP_PROP_POS_FRAMES, dto.start_frame
    )

    for frame_number in range(dto.start_frame, dto.end_frame):
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % frame_skip != 0:
            continue

        new_points = []
        for i, tracker in enumerate(trackers):
            success, box = tracker.update(frame)
            if not success:
                break
            x, y, w, h = box
            new_x = current_point.x + (x - part_of_image.shape[1]//2) + offset_x
            new_y = current_point.y + (y - part_of_image.shape[0]//2) + offset_y

            dx = new_x - current_point.x
            dy = new_y - current_point.y
            if abs(dx) > MAX_MOVEMENT or abs(dy) > MAX_MOVEMENT:
                new_points.append(current_point)
            else:
                new_points.append(
                    Point(
                        x=new_x,
                        y=new_y,
                        id=current_point.id,
                        label=dto.points[i].label,
                    )
                )

        if len(new_points) == len(initial_points):
            tracked_points.append(new_points)
        else:
            tracked_points.append(tracked_points[-1] if tracked_points else initial_points)

    if APPLY_SMOOTHING:
        tracked_points = smooth_points(tracked_points)

    return TrackingResult(
        tracked_points=tracked_points,
        start_frame=dto.start_frame,
        end_frame=dto.end_frame,
    )
