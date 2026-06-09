# ============================================================
# simhash2_optimized.py
# ============================================================
# This file replaces the original SimhashIndex in simhash2.py
# with a more memory‐ and CPU‐efficient implementation.
#
# Key changes:
#   1. Buckets store (integer_hash, obj_id) tuples instead of
#      "hexstring,obj_id" strings.
#   2. Maintain a dict: self.id_to_hash = { obj_id: Simhash_instance }
#      so we never need to re‐parse buckets just to enumerate all items.
#   3. Optional "benchmarks" can be passed in directly. They are simply
#      treated as additional (obj_id, simhash) pairs.
#   4. Reduced logging frequency, caching of offsets, and simplified
#      distance computations.
# ============================================================

import collections
import hashlib
import logging
import numbers
import re
import sys
from itertools import groupby
from collections import defaultdict, deque
from tqdm import tqdm

import numpy as np

try:
    from collections.abc import Iterable
except ImportError:
    from collections import Iterable

if sys.version_info[0] >= 3:
    basestring = str
    unicode = str
    long = int

    def int_to_bytes(n, length):
        return n.to_bytes(length, 'big')

    def bytes_to_int(b):
        return int.from_bytes(b, 'big')
else:
    range = xrange

    def int_to_bytes(n, length):
        return '{:0{}x}'.format(n, length * 2).decode('hex')

    def bytes_to_int(b):
        return int(b.encode('hex'), 16)


def _hashfunc(x):
    return hashlib.md5(x).digest()


class Simhash(object):
    large_weight_cutoff = 50
    batch_size = 200

    def __init__(
        self, value, f=64, reg=r'[\w\u4e00-\u9fcc]+', hashfunc=_hashfunc, log=None
    ):
        if f % 8:
            raise ValueError('f must be a multiple of 8')

        self.f = f
        self.f_bytes = f // 8
        self.reg = reg
        self.value = None
        self.hashfunc = hashfunc
        self.hashfunc_returns_int = isinstance(hashfunc(b"test"), numbers.Integral)

        if log is None:
            self.log = logging.getLogger("simhash")
        else:
            self.log = log

        if isinstance(value, Simhash):
            self.value = value.value
        elif isinstance(value, basestring):
            self.build_by_text(unicode(value))
        elif isinstance(value, Iterable):
            self.build_by_features(value)
        elif isinstance(value, numbers.Integral):
            self.value = value
        else:
            raise Exception('Bad parameter with type {}'.format(type(value)))

    def __eq__(self, other):
        return self.value == other.value

    def _slide(self, content, width=4):
        return [content[i : i + width] for i in range(max(len(content) - width + 1, 1))]

    def _tokenize(self, content):
        content = content.lower()
        content = ''.join(re.findall(self.reg, content))
        ans = self._slide(content)
        return ans

    def build_by_text(self, content):
        features = self._tokenize(content)
        features = {k: sum(1 for _ in g) for k, g in groupby(sorted(features))}
        return self.build_by_features(features)

    def build_by_features(self, features):
        sums = []
        batch = []
        count = 0
        w = 1
        truncate_mask = 2**self.f - 1

        if isinstance(features, dict):
            features = features.items()

        for f, weight in (
            (f, 1) if isinstance(f, basestring) else f
            for f in features
        ):
            if not isinstance(f, basestring):
                # f is tuple (feature_string, weight)
                feature_str, w = f
                if w > self.large_weight_cutoff or not isinstance(w, int):
                    # skip batch logic; do a direct bit‐array approach
                    h_int = (
                        self.hashfunc(feature_str.encode('utf-8')) & truncate_mask
                        if self.hashfunc_returns_int
                        else int.from_bytes(
                            self.hashfunc(feature_str.encode('utf-8'))[-self.f_bytes :], 'big'
                        )
                    )
                    bitarr = self._bitarray_from_bytes(int_to_bytes(h_int, self.f_bytes))
                    sums.append(bitarr * w)
                    count += w
                    continue
                else:
                    # Normal case: small weight, go through batch
                    pass
            else:
                # f is a token string, w stays = 1
                feature_str = f

            count += w

            if self.hashfunc_returns_int:
                h_int = self.hashfunc(feature_str.encode("utf-8")) & truncate_mask
                h_bytes = int_to_bytes(h_int, self.f_bytes)
            else:
                h_bytes = self.hashfunc(feature_str.encode("utf-8"))[-self.f_bytes :]

            # Accumulate into "batch" if weight ≤ cutoff
            if w <= self.large_weight_cutoff and isinstance(w, int):
                batch.append(h_bytes * w)
                if len(batch) >= self.batch_size:
                    sums.append(self._sum_hashes(batch))
                    batch = []
            else:
                # Already handled above for large weights
                pass

            if len(sums) >= self.batch_size:
                sums = [np.sum(sums, 0)]

        if batch:
            sums.append(self._sum_hashes(batch))

        combined_sums = np.sum(sums, 0)
        self.value = bytes_to_int(np.packbits(combined_sums > count / 2).tobytes())

    def _sum_hashes(self, digests):
        bitarray = self._bitarray_from_bytes(b''.join(digests))
        rows = np.reshape(bitarray, (-1, self.f))
        return np.sum(rows, 0)

    @staticmethod
    def _bitarray_from_bytes(b):
        return np.unpackbits(np.frombuffer(b, dtype=">B"))

    def distance(self, another):
        assert self.f == another.f
        x = (self.value ^ another.value) & ((1 << self.f) - 1)
        # builtin bit‐count is faster than while‐loop
        return bin(x).count("1")


class SimhashIndex(object):
    """
    Optimized SimhashIndex for large‐scale data:

    - Buckets store (int_hash, obj_id) tuples, not strings.
    - Maintains self.id_to_hash to avoid reparsing buckets when you need all items.
    - Allows optional 'benchmarks' at init or via insert_benchmarks().
    """

    def __init__(self, objs, f=64, k=2, benchmarks=None, log=None):
        """
        `objs` is a list of (obj_id, Simhash_instance).
          - obj_id must be a string (e.g. URL or an identifier).
          - Simhash_instance must be an instance of Simhash with f bits.

        `benchmarks` is an optional list of (obj_id, Simhash_instance)
          that you want to insert “as controls” in addition to `objs`.
          They can be queried/clustered just like any other item.

        `f` is fingerprint bit‐width (must match your Simhash instances).
        `k` is Hamming‐distance tolerance (e.g. 2 or 3).

        Inside, we build:
          - self.bucket: { bucket_key_string → set( (int_hash, obj_id), ... ) }
          - self.id_to_hash: { obj_id → Simhash_instance }
          - self._offsets: a precomputed list of bit‐offsets, to speed up get_keys()
        """
        self.k = k
        self.f = f
        self.f_bytes = f // 8

        if log is None:
            self.log = logging.getLogger("simhash")
        else:
            self.log = log

        count = len(objs) + (len(benchmarks) if benchmarks else 0)
        self.log.info("Initializing SimhashIndex with %d total items.", count)

        # Precompute offsets once
        # offsets = [0, f/(k+1), 2f/(k+1), …, k f/(k+1)]
        step = self.f // (self.k + 1)
        self._offsets = [step * i for i in range(self.k + 1)]

        # Buckets: key → set of (int_hash, obj_id)
        self.bucket = defaultdict(set)

        # id_to_hash: obj_id → Simhash_instance
        self.id_to_hash = {}

        # Insert main objects
        for idx, (obj_id, simobj) in enumerate(objs):
            if idx % 100_000 == 0 or idx == len(objs) - 1:
                self.log.info("  └─ Inserting object %d/%d", idx + 1, len(objs))
            self.add(obj_id, simobj)

        # If any benchmarks provided, insert them as well
        if benchmarks:
            for b_idx, (b_id, b_sim) in enumerate(benchmarks):
                if (len(objs) + b_idx) % 100_000 == 0:
                    self.log.info("  └─ Inserting benchmark %d/%d", b_idx + 1, len(benchmarks))
                self.add(b_id, b_sim)

    def get_near_dups(self, simhash):
        """
        Given a Simhash instance `simhash`, return a list of all obj_ids
        (strings) within Hamming distance ≤ k.
        """
        assert simhash.f == self.f

        candidates = set()
        base_val = simhash.value

        for key in self._get_keys(base_val):
            bucket_entries = self.bucket.get(key, ())
            if len(bucket_entries) > 200:
                self.log.warning("Big bucket (key=%s) size=%d", key, len(bucket_entries))

            for (other_hash_int, other_id) in bucket_entries:
                # Avoid comparing to ourselves if same id
                if other_id not in candidates:
                    # Compute Hamming distance between two integers directly
                    xored = base_val ^ other_hash_int
                    dist = bin(xored).count("1")
                    if dist <= self.k:
                        candidates.add(other_id)

        return list(candidates)

    def add(self, obj_id, simhash):
        """
        Insert a new (obj_id, Simhash_instance) into the index.
        If obj_id was already present, this will overwrite it.
        """
        assert simhash.f == self.f

        # 1) If this obj_id already exists, delete its old buckets first.
        if obj_id in self.id_to_hash:
            self._delete_from_buckets(obj_id)

        # 2) Register in id_to_hash
        self.id_to_hash[obj_id] = simhash

        # 3) For each partitioned key, insert into bucket
        base_val = simhash.value
        for key in self._get_keys(base_val):
            # Store the integer directly (instead of hexstring).
            self.bucket[key].add((base_val, obj_id))

    def delete(self, obj_id):
        """
        Remove a given obj_id from the index (and from all buckets).
        Does nothing if obj_id not present.
        """
        if obj_id not in self.id_to_hash:
            return

        self._delete_from_buckets(obj_id)
        del self.id_to_hash[obj_id]

    def _delete_from_buckets(self, obj_id):
        """
        Internal helper: know the old simhash, compute its bucket keys,
        remove (old_int_hash, obj_id) from each bucket set.
        """
        old_sim = self.id_to_hash[obj_id]
        old_val = old_sim.value
        for key in self._get_keys(old_val):
            entry = (old_val, obj_id)
            if entry in self.bucket[key]:
                self.bucket[key].remove(entry)
                if not self.bucket[key]:
                    # free memory if bucket empty
                    del self.bucket[key]

    def _get_keys(self, int_hash):
        """
        Yield the k+1 bucket‐keys for this 64‐bit integer. Exactly as before,
        but using precomputed offsets; each key is a string in the form
        "<partitioned_bits_in_hex>:<partition_index>".
        """
        for i, offset in enumerate(self._offsets):
            # Determine mask length
            if i == len(self._offsets) - 1:
                # Last partition: mask = bits from offset..(f-1)
                mask = (1 << (self.f - offset)) - 1
            else:
                # Next partition starts at self._offsets[i+1]; mask length = difference
                next_offset = self._offsets[i + 1]
                mask = (1 << (next_offset - offset)) - 1

            part = (int_hash >> offset) & mask
            yield f"{part:x}:{i}"

    def bucket_size(self):
        """
        Return how many distinct bucket‐keys we currently have.
        """
        return len(self.bucket)

    def insert_benchmarks(self, benchmarks):
        """
        Insert additional benchmark hashes after initialization.
        `benchmarks` should be a list of (obj_id, Simhash_instance).
        """
        for b_id, b_sim in benchmarks:
            self.add(b_id, b_sim)

    def __len__(self):
        return len(self.id_to_hash)

    def all_ids(self):
        """
        Return a list of all obj_ids in the index.
        """
        return list(self.id_to_hash.keys())

    def all_simhashes(self):
        """
        Return a list of all Simhash instances in the index (in arbitrary order).
        """
        return list(self.id_to_hash.values())

def build_simhash_clusters(sim_index):
    """
    Given an optimized SimhashIndex, return a list of clusters.
    Each cluster is a set of obj_ids that are all transitively within Hamming distance ≤ k.

    This version:
      - Does NOT re‐parse buckets at all.
      - Does a single pass over sim_index.id_to_hash to get (obj_id, Simhash).
      - Then does a standard BFS for each unvisited ID, calling sim_index.get_near_dups().
    """
    visited = set()
    clusters = []

    # 1) Directly grab the item‐map
    #    (obj_id → Simhash_instance). No need to re‐scan buckets.
    url_to_simhash = sim_index.id_to_hash

    # 2) For each obj_id that isn’t yet visited, BFS until no more near‐duplicates
    for url, sim in tqdm(
        url_to_simhash.items(),
        total=len(url_to_simhash),
        desc="Clustering all items",
    ):
        if url in visited:
            continue

        cluster = set()
        queue = deque([url])

        while queue:
            current_url = queue.popleft()
            if current_url in visited:
                continue

            visited.add(current_url)
            cluster.add(current_url)

            current_sim = url_to_simhash[current_url]
            near_duplicates = sim_index.get_near_dups(current_sim)

            for dup_url in near_duplicates:
                if dup_url not in visited:
                    queue.append(dup_url)

        if cluster:
            clusters.append(cluster)

    return clusters