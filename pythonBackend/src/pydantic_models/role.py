from pydantic import BaseModel


class RoleDto(BaseModel):
    id: int
    role_name: str

    class Config:
        orm_mode = True

