from pydantic import BaseModel
from fastapi.responses import FileResponse

class ExportDto(BaseModel):
    processed_players: FileResponse
    processed_ball: FileResponse

    class Config:
        arbitrary_types_allowed = True