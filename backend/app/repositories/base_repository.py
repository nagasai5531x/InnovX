from typing import Generic, List, Optional, Type, TypeVar
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db

    async def get_by_id(self, id_val: str) -> Optional[ModelType]:
        result = await self.db.execute(select(self.model).where(self.model.id == id_val))
        return result.scalars().first()

    async def get_all(self, limit: int = 100, offset: int = 0) -> List[ModelType]:
        result = await self.db.execute(select(self.model).offset(offset).limit(limit))
        return list(result.scalars().all())

    async def create(self, obj: ModelType) -> ModelType:
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def update(self, obj: ModelType) -> ModelType:
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def delete(self, id_val: str) -> bool:
        obj = await self.get_by_id(id_val)
        if obj:
            await self.db.delete(obj)
            await self.db.flush()
            return True
        return False
