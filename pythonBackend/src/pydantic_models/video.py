from pydantic import BaseModel


class VideoDto(BaseModel):
    id: int
    path: str
    uploaded_by: str