import cv2
import os
from ...pydantic_models.point_update_dto import PointUpdate, Point, TrackingResult
from ...util import is_valid_path

async def track_points_logic(dto: PointUpdate):
    #TODO: update video path
    video_path = f"{dto.video_id}"
    # if not is_valid_path(video_path):
    #     raise ValueError(f"Video file {video_path} does not exist")
    
    print(os.getcwd())

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise ValueError(f"Could not open video file {video_path}")

    ret, old_frame = cap.read()

    trackers = []
    for point in dto.points:
        tracker = cv2.TrackerCSRT_create()
        bbox = (
            int(point.x - 4),
            int(point.y - 4),
            8,
            8,
        )
        tracker.init(old_frame, bbox)
        trackers.append(tracker)

    tracked_points = [dto.points]

    frame_count = 0
    frame_skip = 1

    cap.set(
        cv2.CAP_PROP_POS_FRAMES, dto.start_frame
    )

    for _ in range(dto.start_frame, dto.end_frame):
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
            new_points.append(
                Point(
                    x=(x + w / 2),
                    y=(y + h / 2),
                    id=dto.points[i].id,
                )
            )

        tracked_points.append(new_points)

    return TrackingResult(
        tracked_points=tracked_points,
        start_frame=dto.start_frame,
        end_frame=dto.end_frame,
    )
