import json
import os
from datetime import datetime
from typing import Optional, Dict, Any

class CacheRepository:
    def __init__(self, file_path: str = "cache_liturgia.json"):
        self.file_path = file_path

    def get_cache(self, date_key: str) -> Optional[Dict[str, Any]]:
        """Recupera a liturgia do cache para uma data específica."""
        if not os.path.exists(self.file_path):
            return None
        
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get(date_key)
        except Exception:
            return None

    def save_cache(self, date_key: str, content: Dict[str, Any]):
        """Salva a liturgia no cache local."""
        data = {}
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            except Exception:
                pass
        
        data[date_key] = content
        with open(self.file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def get_latest_available(self) -> Optional[Dict[str, Any]]:
        """Fallback: Retorna o último registro de cache disponível, independente da data."""
        if not os.path.exists(self.file_path):
            return None
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if not data:
                    return None
                # Retorna o último item inserido
                latest_key = sorted(data.keys())[-1]
                return data[latest_key]
        except Exception:
            return None