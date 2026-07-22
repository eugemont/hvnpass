import React, { useEffect, useState, useCallback } from 'react';
import { Modal, View, Text, Pressable, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fonts } from '../theme';
import { getAllEntries, deleteEntry } from '../storage';

function formatDate(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('es-UY');
  } catch (e) {
    return '—';
  }
}

export default function AdminModal({ visible, onClose, onChange }) {
  const [entries, setEntries] = useState(null); // null = loading
  const [deletingKey, setDeletingKey] = useState(null);

  const load = useCallback(async () => {
    setEntries(null);
    try {
      const data = await getAllEntries();
      setEntries(data);
    } catch (e) {
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    if (visible) load();
  }, [visible, load]);

  const handleDelete = async (key) => {
    setDeletingKey(key);
    try {
      await deleteEntry(key);
      const data = await getAllEntries();
      setEntries(data);
      onChange?.();
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Lista de espera — panel interno</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>

          {entries === null ? (
            <ActivityIndicator color={colors.gold} style={{ marginVertical: 30 }} />
          ) : entries.length === 0 ? (
            <Text style={styles.empty}>Todavía no hay anotados.</Text>
          ) : (
            <>
              <Text style={styles.total}>Total: {entries.length} anotados</Text>
              <FlatList
                data={entries}
                keyExtractor={(item) => item._key}
                style={{ maxHeight: 380 }}
                renderItem={({ item }) => (
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{item.name || '—'}</Text>
                      <Text style={styles.meta}>{item.email || '—'}</Text>
                      <Text style={styles.meta}>{item.whatsapp || '—'} · {item.plan || '—'}</Text>
                      <Text style={styles.date}>{formatDate(item.ts)}</Text>
                    </View>
                    <Pressable
                      onPress={() => handleDelete(item._key)}
                      style={styles.deleteBtn}
                      disabled={deletingKey === item._key}
                    >
                      <Text style={styles.deleteText}>
                        {deletingKey === item._key ? '…' : 'Borrar'}
                      </Text>
                    </Pressable>
                  </View>
                )}
              />
            </>
          )}

          <Text style={styles.footnote}>Datos guardados localmente en este dispositivo.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,13,22,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 22,
    maxHeight: '82%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 17,
    color: colors.sand,
    flex: 1,
    paddingRight: 12,
  },
  close: {
    fontSize: 24,
    color: colors.sandDim,
    lineHeight: 24,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.sandDim,
    textAlign: 'center',
    paddingVertical: 24,
  },
  total: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.sandDim,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
    paddingVertical: 12,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.sand,
    marginBottom: 3,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.sandDim,
    marginBottom: 2,
  },
  date: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.sandDim,
    opacity: 0.7,
    marginTop: 3,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  deleteText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.sandDim,
  },
  footnote: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.sandDim,
    opacity: 0.6,
    marginTop: 16,
    textAlign: 'center',
  },
});
