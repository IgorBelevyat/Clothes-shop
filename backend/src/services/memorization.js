function memoizeAsync(fn, {
  maxSize = Infinity,
  strategy = 'LRU', // или 'LFU', 'TTL', 'custom'
  ttl = 0,
  customEvict = null
} = {}) { //?
  const cache = new Map();
  const usageOrder = new Map();
  const usageCount = new Map();
  const timestamps = new Map();

  function prune() {
    if (cache.size <= maxSize) return;

    let keysToRemove = [];

    if (strategy === 'LRU') {
      keysToRemove = [...usageOrder.entries()]
        .sort((a, b) => a[1] - b[1])
        .slice(0, cache.size - maxSize)
        .map(([key]) => key);
    } else if (strategy === 'LFU') {
      keysToRemove = [...usageCount.entries()]
        .sort((a, b) => a[1] - b[1])
        .slice(0, cache.size - maxSize)
        .map(([key]) => key);
    } else if (strategy === 'custom' && typeof customEvict === 'function') {
      keysToRemove = customEvict(cache);
    }

    keysToRemove.forEach(key => {
      cache.delete(key);
      usageOrder.delete(key);
      usageCount.delete(key);
      timestamps.delete(key);
    });
  }

  const memoizedFn = async function (...args) {
    const key = JSON.stringify(args);

    if (strategy === 'TTL' && timestamps.has(key)) {
      const age = Date.now() - timestamps.get(key);
      if (age > ttl) {
        cache.delete(key);
        timestamps.delete(key);
      }
    }

    if (cache.has(key)) {
      if (strategy === 'LRU') usageOrder.set(key, Date.now());
      if (strategy === 'LFU') usageCount.set(key, (usageCount.get(key) || 0) + 1);
      return cache.get(key);
    }

    const result = await fn(...args);
    cache.set(key, result);

    if (strategy === 'LRU') usageOrder.set(key, Date.now());
    if (strategy === 'LFU') usageCount.set(key, 1);
    if (strategy === 'TTL') timestamps.set(key, Date.now());

    prune();

    return result;
  };

  memoizedFn.clear = () => {
    cache.clear();
    usageOrder.clear();
    usageCount.clear();
    timestamps.clear();
  };

  return memoizedFn;
}

module.exports = memoizeAsync;
