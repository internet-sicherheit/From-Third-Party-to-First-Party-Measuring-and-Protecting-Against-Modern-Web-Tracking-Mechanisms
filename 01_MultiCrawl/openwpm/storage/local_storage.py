import logging
from pathlib import Path

import pyarrow.parquet as pq
from pyarrow.lib import Table

from .arrow_storage import ArrowProvider
from .storage_providers import TableName, UnstructuredStorageProvider

import re
from simhash2 import Simhash

class LocalArrowProvider(ArrowProvider):
    """Stores Parquet files under storage_path/table_name/n.parquet"""

    def __init__(self, storage_path: Path) -> None:
        super().__init__()
        self.storage_path = storage_path

    async def write_table(self, table_name: TableName, table: Table) -> None:
        pq.write_to_dataset(table, str(self.storage_path / table_name))


class LocalGzipProvider(UnstructuredStorageProvider):
    """Stores files as storage_path/hash.zip"""

    async def init(self) -> None:
        pass

    def __init__(self, storage_path: Path) -> None:
        super().__init__()
        self.storage_path = storage_path
        self.logger = logging.getLogger("openwpm")

    def get_features(self, s):
        width = 3  # n_gram = 3

        # Lower and remove single words
        s = s.lower()
        s = re.sub(r'[^a-zA-Z0-9\s]+', '', s)

        # Remove whitespace
        s = re.sub(r'[^\w]+', '', s)
        return [s[i:i + width] for i in range(max(len(s) - width + 1, 1))]



    async def store_blob(
        self, filename: str, blob: bytes, overwrite: bool = False
    ) -> None:
        path = self.storage_path / (filename + ".zip")
        hash_path = self.storage_path / (filename + ".txt")
        if path.exists() and not overwrite:
            self.logger.debug(
                "File %s already exists on disk. Not overwriting", filename
            )
            return
        compressed = self._compress(blob)
        with path.open(mode="wb") as f:
            f.write(compressed.read())

        with hash_path.open(mode="w") as f:
            tmp_content = blob.decode('utf-8')
            content = self.get_features(tmp_content)
            s1 = Simhash(content)
            f.write(str(s1.value))

    async def flush_cache(self) -> None:
        pass

    async def shutdown(self) -> None:
        pass
