from pydantic import BaseModel
from fastapi import UploadFile
from typing import List

class ImportRequestDto(BaseModel):
    game_id: int
    sequence_number: int
    upload_user: str
    files: List[UploadFile]