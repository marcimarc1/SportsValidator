from typing import List
from pythonBackend.src.pydantic_models.point_update_dto import PlayerBox, Point


def smooth_points(points_history: List[List[Point]], window_size: int = 5, oscillation_threshold: float = 2.0) -> List[List[Point]]:
    if not points_history or not points_history[0]:
        return points_history

    if len(points_history) < window_size:
        return points_history

    smoothed_history = []
    n_frames = len(points_history)
    n_points = len(points_history[0])

    for i in range(n_frames):
        if not points_history[i]:
            smoothed_history.append([])
            continue
            
        smoothed_points = []
        
        for point_idx in range(n_points):
            if point_idx >= len(points_history[i]):
                continue
                
            start_idx = max(0, i - window_size // 2)
            end_idx = min(n_frames, i + window_size // 2 + 1)
            
            window_points = []
            for f in range(start_idx, end_idx):
                if f < len(points_history) and point_idx < len(points_history[f]):
                    window_points.append(points_history[f][point_idx])
            
            if not window_points:
                if point_idx < len(points_history[i]):
                    smoothed_points.append(points_history[i][point_idx])
                continue

            oscillating = False
            if len(window_points) >= 3:
                direction_changes_x = 0
                direction_changes_y = 0
                for j in range(1, len(window_points) - 1):
                    prev_dx = window_points[j].x - window_points[j-1].x
                    next_dx = window_points[j+1].x - window_points[j].x
                    if prev_dx * next_dx < 0:
                        direction_changes_x += 1
                        
                    prev_dy = window_points[j].y - window_points[j-1].y
                    next_dy = window_points[j+1].y - window_points[j].y
                    if prev_dy * next_dy < 0:
                        direction_changes_y += 1
                
                oscillating = (direction_changes_x + direction_changes_y) >= oscillation_threshold

            if oscillating:
                smoothed_points.append(points_history[i][point_idx])
            else:
                x_avg = sum(p.x for p in window_points) / len(window_points)
                y_avg = sum(p.y for p in window_points) / len(window_points)
                
                smoothed_points.append(Point(
                    x=x_avg,
                    y=y_avg,
                    id=points_history[i][point_idx].id
                ))
                
        smoothed_history.append(smoothed_points)

    return smoothed_history


def get_part_of_image(image, point, size):
    height, width = image.shape[:2]
    x = round(point.x)
    y = round(point.y)
    
    x1 = max(0, x - size)
    x2 = min(width, x + size)
    y1 = max(0, y - size)
    y2 = min(height, y + size)
    
    return image[y1:y2, x1:x2], (x1 - (x - size), y1 - (y - size))

def is_point_near_player_box(point: Point, player_boxes: List[PlayerBox], frame_number: int, threshold: int = 100):
    for box in player_boxes:
        if box.frame_no != frame_number:
            continue
        
        if (box.x_1 - threshold <= point.x <= box.x_2 + threshold and 
            box.y_1 - threshold <= point.y <= box.y_2 + threshold):
            return True
    return False    
