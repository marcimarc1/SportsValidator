import uuid
from typing import Generic, TypeVar, Type, List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy import select

CreateDtoType = TypeVar("CreateDtoType")
ModelDtoType = TypeVar("ModelDtoType")
UpdateDtoType = TypeVar("UpdateDtoType")
ListDtoType = TypeVar("ListDtoType")
SearchDtoType = TypeVar("SearchDtoType")
DBModelType = TypeVar("DBModelType")  # SQLAlchemy Model

class BaseCrudLogic(Generic[CreateDtoType, ModelDtoType,UpdateDtoType, ListDtoType, SearchDtoType, DBModelType]):

    def __init__(
            self,
            db_model: Type[DBModelType],
            model_dto: Type[ModelDtoType],
            list_dto: Type[ListDtoType],
    ):
        self.db_model = db_model
        self.model_dto = model_dto
        self.list_dto = list_dto

    async def create(self, dto: CreateDtoType, db: Session) -> ModelDtoType:
        create_data = self.generate_db_obj(dto, db)
        db_obj = self.db_model(**create_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        self.post_create(db_obj, db)

        return self.model_dto.model_validate(db_obj)

    async def get(self, obj_id: uuid.UUID, db: Session) -> ModelDtoType:
        db_obj = db.query(self.db_model).filter(self.db_model.id == obj_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail="Object not found")
        return self.model_dto.model_validate(db_obj)

    async def update(self, obj_id: uuid.UUID, dto: UpdateDtoType, db: Session) -> ModelDtoType:
        db_obj = db.query(self.db_model).filter(self.db_model.id == obj_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail="Object not found")

        update_data = dto.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_obj, key, value)
        db.commit()
        db.refresh(db_obj)
        return self.model_dto.model_validate(db_obj)

    async def delete(self, obj_id: uuid.UUID, db: Session) -> dict[str, str]:
        db_obj = db.query(self.db_model).filter(self.db_model.id == obj_id).first()
        if not db_obj:
            raise HTTPException(status_code=404, detail="Object not found")
        can_delete, msg = self.can_delete(db_obj, db)
        if not can_delete:
            return msg
        db.delete(db_obj)
        db.commit()
        self.post_delete(db_obj, db)
        return {"message": "success"}

    async def get_many(self, search_dto: SearchDtoType, db: Session) -> ListDtoType:
        # No SearchDto = no filer => full list
        if search_dto is None:
            results = db.query(self.model_dto).all()
            models = [self.model_dto.model_validate(obj) for obj in results]
            list_field_name = next(iter(self.list_dto.model_fields))
            return self.list_dto(**{list_field_name: models})

        query = db.query(self.db_model)
        query = self.apply_filters(query, search_dto)

        if hasattr(search_dto, "skip"):
            query = query.offset(search_dto.skip)
        if hasattr(search_dto, "take"):
            query = query.limit(search_dto.take)

        results = query.all()
        models = [self.model_dto.model_validate(obj) for obj in results]
        list_field_name = next(iter(self.list_dto.model_fields))
        return self.list_dto(**{list_field_name: models})

    def apply_filters(self, query, search_dto: SearchDtoType):
        """Override this in child classes if needed"""
        return query

    def generate_db_obj(self, dto: CreateDtoType, db: Session) -> DBModelType:
        """Override this in child classes if needed"""
        return dto.model_dump(exclude_unset=True)

    def can_delete(self, db_obj: DBModelType, db: Session)->(bool, dict[str,str]):
        """Override this in child classes if needed"""
        return True, {}

    def post_delete(self, db_obj: DBModelType, db: Session):
        """Override this in child classes if needed"""
        pass

    def post_create(self, db_obj, db: Session):
        pass
