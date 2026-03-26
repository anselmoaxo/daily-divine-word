import httpx
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class LiturgyClient:
    def __init__(self, base_url: str = "https://liturgia.up.railway.app/v2/"):
        self.base_url = base_url
        self.timeout = httpx.Timeout(10.0, connect=5.0)

    async def get_daily_liturgy(self) -> Optional[Dict[str, Any]]:
        """Busca a liturgia do dia na API externa."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.base_url)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Erro ao consumir API externa: {str(e)}")
            return None