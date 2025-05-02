import collections
import json
from typing import Union

from pydantic_models.homography import (HomographyModelSoccer, HomographyModelSoccerAsList, FieldSectionSoccer,
                                          HomographyModelTennis, FieldSectionTennis, HomographyModelTennisAsList)

registered_tests = collections.defaultdict(dict)


def add_test(test_id: str, module_name: str):
    """Decorator to register test functions with a specific ID.
    Structure of the registered_test dictionary is as follows:
    {
        "Soccer": {
            "test_name_1": fct,
            "test_name_2": fct,
        },
        "Tennis": {
            "test_name1" : fct,
            "test_name3" : fct,
        }
    }
    """

    def decorator(func):
        registered_tests[module_name.lower()][test_id.lower()] = func
        return func

    return decorator


def quality_function(data: Union[FieldSectionSoccer, FieldSectionTennis], sport: str) -> dict[str, float]:
    with open("./active_learning_config.json", "r") as file:
        config = json.load(file)

    res = {}
    for test_config in config.get("tests", {}).get(sport.lower(), []):
        test_id = test_config.get("id")
        if not test_id:
            raise KeyError(f"Test with id: {test_id} not found")
        threshold = test_config.get("threshold")
        if not threshold:
            raise KeyError(f"threshold missing for test with id {test_id}")
        if test_id in registered_tests[sport.lower()] and test_config.get("enabled", True):
            res[test_id] = registered_tests[sport.lower()][test_id](data, threshold)
        elif test_id not in registered_tests:
            print(f"Warning: Test '{test_id}' not found for sport: {sport}")
    return res

def filter_annotation_data_by_score(data: Union[HomographyModelSoccer, HomographyModelTennis], sport: str) -> Union[
    HomographyModelSoccerAsList, HomographyModelTennisAsList]:
    with open("./active_learning_config.json", "r") as file:
        config = json.load(file)

    scored_points = []
    # For each data point, run all tests
    for frame, field_section in data.root.items():
        score = filter_field(field_section, config, sport)
        scored_points.append((score, (frame, field_section)))

    # get 10 lowest
    scored_points.sort()
    lowest_points = [point for score, point in scored_points[:config.get("returned_frames", 10)]]
    lowest_points.sort()
    if sport.lower() == "soccer":
        return HomographyModelSoccerAsList.parse_obj(lowest_points)
    elif sport.lower() == "tennis":
        return HomographyModelTennisAsList.parse_obj(lowest_points)
    else:
        raise ValueError("Unknown sport: ", sport)


def filter_field(data: Union[FieldSectionSoccer, FieldSectionTennis], config, sport: str) -> float:
    res_score = 0.0  # 0.0 is worst score, 1.0 is best score
    executed_tests = 0
    for test_config in config.get("tests", {}).get(sport.lower(), []):
        test_id = test_config.get("id")
        if not test_id:
            raise KeyError(f"Test with id: {test_id} not found")
        threshold = test_config.get("threshold")
        if not threshold:
            raise KeyError(f"threshold missing for test with id {test_id}")
        if test_id in registered_tests[sport.lower()] and test_config.get("enabled", True):
            executed_tests += 1
            res_score += registered_tests[sport.lower()][test_id](data, threshold)
        elif test_id not in registered_tests:
            print(f"Warning: Test '{test_id}' not found for sport: {sport}")
    return res_score / max(executed_tests, 1)
