from pydantic import BaseModel, ConfigDict


class RoleDto(BaseModel):
    id: int
    role_name: str

    model_config = ConfigDict(from_attributes=True)

