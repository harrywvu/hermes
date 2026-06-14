from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/message")
async def whatsup():
    return {"message": "What's up!"}