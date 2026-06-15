import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

export function useGraph() {
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGraph = useCallback(async (queryType = 'gang_networks', params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/graph`, {
        query_type: queryType,
        ...params
      });
      setData(response.data);
    } catch (err) {
      console.error("Failed to load network graph:", err);
      setError("Failed to connect to graph analysis database.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchGraph };
}
