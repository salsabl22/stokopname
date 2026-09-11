import { useState, useEffect } from 'react';
import { fetchStatusesByModul } from '../services/statusMasterService';
import type { MasterStatus } from '../services/statusMasterService';

export function useMasterStatus(modul: string) {
  const [statuses, setStatuses] = useState<MasterStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchStatusesByModul(modul);
      setStatuses(data);
      setLoading(false);
    }
    load();
  }, [modul]);

  const getLabel = (kode: string) => {
    const s = statuses.find(x => x.kode === kode);
    return s ? s.label : kode;
  };

  const getTone = (kode: string): 'success' | 'danger' | 'warning' | 'neutral' | 'info' => {
    const s = statuses.find(x => x.kode === kode);
    return s ? s.tone : 'neutral';
  };

  return { statuses, loading, getLabel, getTone };
}
