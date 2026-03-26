import logging
from fastapi import FastAPI, Depends
from app.services.liturgy_service import LiturgyService
from app.clients.liturgy_client import LiturgyClient
from app.repositories.cache_repository import CacheRepository

# Configuração de Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="API Liturgia Resiliente")

# Injeção de Dependências (Singleton-like para o escopo da app)
liturgy_client = LiturgyClient()
cache_repo = CacheRepository()
liturgy_service = LiturgyService(liturgy_client, cache_repo)

@app.get("/liturgia")
async def get_liturgia():
    """Endpoint principal para obter a liturgia do dia."""
    logger.info("Requisição recebida para /liturgia")
    return await liturgy_service.get_liturgy()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)