import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Almacenamiento de la lista de espera.
 *
 * IMPORTANTE — esto guarda los datos SOLO en el dispositivo donde corre la
 * app (AsyncStorage es almacenamiento local, no una base de datos en la
 * nube). Si dos personas se anotan desde dos celulares distintos, cada
 * dispositivo va a tener su propia lista — no un total combinado.
 *
 * En la landing web original, el conteo era compartido entre todas las
 * visitas porque corría sobre el almacenamiento de Artifacts de Claude.
 * Ese mecanismo no existe fuera de ahí. Si necesitás un número real y
 * compartido entre todos los que abren la app — que es justamente lo que
 * pide el documento para mostrarle demanda real a Key o a un inversor —
 * este es el único archivo que hay que tocar: reemplazá las tres funciones
 * de acá abajo por llamadas a un backend (Supabase o Firebase tienen
 * niveles gratuitos que alcanzan de sobra para esto). El resto de la app
 * no necesita cambiar nada, porque todos los componentes solo conocen
 * saveEntry / getAllEntries / deleteEntry.
 */

const PREFIX = 'waitlist:';

export async function saveEntry(entry) {
  const key = PREFIX + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const value = JSON.stringify({ ...entry, ts: Date.now() });
  await AsyncStorage.setItem(key, value);
  return key;
}

export async function getAllEntries() {
  const allKeys = await AsyncStorage.getAllKeys();
  const keys = allKeys.filter((k) => k.startsWith(PREFIX));
  if (keys.length === 0) return [];

  const pairs = await AsyncStorage.multiGet(keys);
  const entries = pairs
    .map(([key, value]) => {
      if (!value) return null;
      try {
        return { _key: key, ...JSON.parse(value) };
      } catch (e) {
        console.warn('No se pudo leer una entrada de la lista de espera', key, e);
        return null;
      }
    })
    .filter(Boolean);

  entries.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  return entries;
}

export async function deleteEntry(key) {
  await AsyncStorage.removeItem(key);
}
