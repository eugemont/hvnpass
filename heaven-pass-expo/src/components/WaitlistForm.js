import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fonts } from '../theme';
import SectionHeader from './SectionHeader';
import { waitlist } from '../content';
import { saveEntry } from '../storage';

function countLabel(count) {
  if (count === null) return 'Cargando…';
  if (count === 0) return 'Sé el primero en anotarte.';
  if (count === 1) return '1 persona ya está en la lista.';
  return `${count} personas ya están en la lista.`;
}

export default function WaitlistForm({ count, onSubmitted }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [plan, setPlan] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | submitting | error | done
  const [errorMsg, setErrorMsg] = useState('');
  const [finalCount, setFinalCount] = useState(null);

  const handleSubmit = async () => {
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !whatsapp.trim()) {
      setErrorMsg('Completá nombre, email y WhatsApp para continuar.');
      return;
    }
    if (!plan) {
      setErrorMsg('Elegí un plan de interés, aunque todavía no estés seguro.');
      return;
    }

    setStatus('submitting');
    try {
      await saveEntry({ name: name.trim(), email: email.trim(), whatsapp: whatsapp.trim(), plan });
      const newCount = await onSubmitted();
      setFinalCount(typeof newCount === 'number' ? newCount : null);
      setStatus('done');
    } catch (e) {
      console.warn('No se pudo guardar la entrada', e);
      setErrorMsg('No pudimos guardar tu lugar. Probá de nuevo en un momento.');
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <View>
        <SectionHeader eyebrow={waitlist.eyebrow} title={waitlist.title} />
        <Text style={styles.body}>{waitlist.body}</Text>
        <View style={styles.thanksBox}>
          <Text style={styles.thanksTitle}>{waitlist.thanksTitle}</Text>
          <Text style={styles.thanksBody}>{waitlist.thanksBody}</Text>
          {finalCount !== null && (
            <Text style={styles.thanksCount}>
              {finalCount === 1 ? 'Sos la primera persona en la lista.' : `Sos el número ${finalCount} en la lista.`}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View>
      <SectionHeader eyebrow={waitlist.eyebrow} title={waitlist.title} />
      <Text style={styles.body}>{waitlist.body}</Text>
      <View style={styles.counterWrap}>
        <Text style={styles.counterText}>{countLabel(count)}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
            placeholderTextColor="rgba(164,157,143,0.5)"
            autoComplete="name"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="vos@email.com"
            placeholderTextColor="rgba(164,157,143,0.5)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>WhatsApp</Text>
          <TextInput
            style={styles.input}
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="+598 99 999 999"
            placeholderTextColor="rgba(164,157,143,0.5)"
            keyboardType="phone-pad"
            autoComplete="tel"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Plan de interés</Text>
          <View style={styles.chips}>
            {waitlist.planOptions.map((option) => {
              const active = plan === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setPlan(option)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={status === 'submitting'}
          style={[styles.submit, status === 'submitting' && styles.submitDisabled]}
        >
          {status === 'submitting' ? (
            <ActivityIndicator color={colors.void} />
          ) : (
            <Text style={styles.submitText}>{waitlist.submitLabel}</Text>
          )}
        </Pressable>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.sandDim,
    marginBottom: 20,
  },
  counterWrap: {
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
    paddingLeft: 12,
    marginBottom: 24,
  },
  counterText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.goldLight,
  },
  form: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: 4,
    padding: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.sandDim,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.void,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.sand,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  chipText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.sandDim,
  },
  chipTextActive: {
    color: colors.void,
    fontFamily: fonts.monoSemiBold,
  },
  submit: {
    marginTop: 4,
    backgroundColor: colors.gold,
    borderRadius: 4,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 14,
    color: colors.void,
  },
  errorText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.error,
    marginTop: 12,
  },
  thanksBox: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: 4,
    padding: 24,
    alignItems: 'center',
  },
  thanksTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 19,
    color: colors.sand,
    marginBottom: 8,
    textAlign: 'center',
  },
  thanksBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.sandDim,
    textAlign: 'center',
  },
  thanksCount: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.goldLight,
    marginTop: 16,
  },
});
