from datetime import datetime
from typing import Dict, Any
from app.clients.liturgy_client import LiturgyClient
from app.repositories.cache_repository import CacheRepository

class LiturgyService:
    def __init__(self, client: LiturgyClient, repository: CacheRepository):
        self.client = client
        self.repository = repository

    async def get_liturgy(self) -> Dict[str, Any]:
        """
        Lógica de Resiliência:
        1. Tenta Cache do dia
        2. Se não houver, tenta API Externa
        3. Se API falhar, tenta último Cache disponível (Fallback)
        """
        today = datetime.now().strftime("%Y-%m-%d")
        
        # 1. Tentar Cache
        cached_data = self.repository.get_cache(today)
        if cached_data:
            return cached_data

        # 2. Tentar API Externa
        external_data = await self.client.get_daily_liturgy()
        if external_data:
            self.repository.save_cache(today, external_data)
            return external_data

        # 3. Fallback (API falhou e não há cache de hoje)
        fallback_data = self.repository.get_latest_available()
        if fallback_data:
            return {
                **fallback_data,
                "status": "fallback",
                "message": "Exibindo última liturgia disponível devido a erro na conexão."
            }

        return {"error": "Serviço temporariamente indisponível e sem cache."}