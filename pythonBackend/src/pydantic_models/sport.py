from typing import Dict, List

from pydantic import BaseModel, ConfigDict


class SportsDto(BaseModel):
    sports: List[Dict]

    model_config = ConfigDict(from_attributes=True)
