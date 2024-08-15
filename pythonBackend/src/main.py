from typing import List
import aiofiles
from fastapi import FastAPI, UploadFile
from src.db.database import engine
from src.db.db_models import annotations
from src.routers import annotation

# Table initialization for each DB model.
annotations.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Bind Routers from Router Directory
app.include_router(annotation.router)


@app.post("/upload")
async def upload(files: List[UploadFile]):
    for file in files:
        # Todo: Add correct path for upload items
        async with aiofiles.open("path", 'wb') as out_file:
            while content := await file.read(1024):
                await out_file.write(content)

    return "Files successfully uploaded"
