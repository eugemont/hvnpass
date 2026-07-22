// All the copy and data for the app, kept in one place so it's easy to edit
// without touching component code.

export const hero = {
  eyebrow: 'TEMPORADA 26/27 · PUNTA DEL ESTE',
  titleLines: ['Pagás una vez.', 'Elegís tus fiestas.', 'Entrás sin '],
  titleEmphasis: 'preguntar',
  subtitle:
    'Heaven Pass es una membresía privada con acceso garantizado a las mejores fiestas del verano en Punta del Este. Sin pelear entradas, sin reventa, sin quedarte afuera.',
  ctaLabel: 'Quiero ser parte',
};

export const quote = 'No es una ticketera.\nEs un club privado.';

export const compare = {
  eyebrow: 'EL PROBLEMA',
  title: 'Ir de fiesta en Punta del Este se volvió un trabajo de tiempo completo.',
  before: {
    label: 'Sin Heaven Pass',
    items: [
      'Precios que suben por lote — de $50 a $300 o más',
      'FOMO constante por no saber a dónde ir',
      'Comprar entrada por entrada, fiesta por fiesta',
      'Reventa a precios inflados y sin garantías',
      'La duda de si vas a poder entrar o no',
    ],
  },
  after: {
    label: 'Con Heaven Pass',
    items: [
      'Un precio fijo, pagás una sola vez por toda la temporada',
      'Catálogo completo de fiestas, elegís sobre la marcha',
      'Un solo pago cubre todas las fiestas que quieras',
      'Acuerdo directo con la productora, cero reventa',
      'Tu cupo está garantizado desde el día uno',
    ],
  },
};

export const steps = {
  eyebrow: 'CÓMO FUNCIONA',
  title: 'Tres pasos, ninguna fila de reventa.',
  items: [
    {
      number: '01',
      title: 'Te asociás',
      body: 'Elegís tu plan — Basic, VIP o Black — y confirmás tu lugar para la temporada.',
    },
    {
      number: '02',
      title: 'Elegís tus fiestas',
      body: 'Accedés al catálogo de fiestas asociadas y armás tu propio recorrido, noche a noche.',
    },
    {
      number: '03',
      title: 'Entrás sin preguntar',
      body: 'Mostrás tu pass en la puerta. Nada de reventa, nada de "vamos a ver si entrás".',
    },
  ],
};

export const plans = {
  eyebrow: 'PLANES',
  title: 'Elegí tu nivel de acceso.',
  note: '* Precios de lanzamiento para la temporada 26/27, sujetos a confirmación final con cada productora.',
  items: [
    {
      id: 'Basic',
      name: 'Basic',
      price: '$490',
      tag: '5 accesos generales',
      features: [
        'Catálogo de fiestas categoría B y C',
        'Upgrade a VIP disponible desde la plataforma',
        'Late entry hasta las 2 AM (fee luego de esa hora)',
        'Primera cancelación sin costo',
        'Cupo no usado, liberado para otra fiesta',
      ],
    },
    {
      id: 'VIP',
      name: 'VIP',
      price: '$790',
      tag: '6 accesos VIP',
      features: [
        'Catálogo completo, incluidas Templo y Sensation',
        'Upgrade y liberación de cupo disponibles',
        'Late entry hasta las 2 AM (fee luego de esa hora)',
        'Primera cancelación sin costo',
        'Prioridad sobre el plan Basic en disponibilidad',
      ],
    },
    {
      id: 'Black',
      name: 'Black',
      price: '$1.190+',
      tag: 'Fiestas grandes + concierge',
      isFeatured: true,
      features: [
        'Acceso a los eventos grandes de la temporada (ej. Key Producciones en Open Park)',
        'Precio variable según el evento',
        'Concierge personal + beneficio adicional',
        'Late entry incluido, sin fee',
        'Prioridad total en upgrades y liberación de cupo',
      ],
      footnote:
        '* En fiestas de Key Producciones (Open Park) el Black incluye mesa — ahí no existe backstage sin mesa. En otras productoras con backstage independiente, el Black funciona sin mesa.',
    },
  ],
};

export const stats = [
  { number: '+44', label: 'fiestas en 20 días\n27 dic → 8 ene' },
  { number: '15.000', label: 'capacidad de Open Park,\nel venue principal' },
  { number: '10.000', label: 'personas en las\nnoches grandes' },
  { number: '3.3%', label: 'de una noche de 6.000 —\n200 miembros, invisibles' },
];

export const waitlist = {
  eyebrow: 'ÚLTIMA LLAMADA',
  title: 'La lista de espera abre antes que la fiesta.',
  body: 'Dejanos tus datos. Te avisamos apenas confirmemos las primeras productoras y abramos los planes para la temporada 26/27.',
  planOptions: ['Basic', 'VIP', 'Black', 'Todavía no sé'],
  submitLabel: 'Reservar mi lugar',
  submittingLabel: 'Guardando…',
  thanksTitle: 'Listo, ya estás anotado.',
  thanksBody:
    'Te vamos a escribir por WhatsApp o email apenas abramos los planes de la temporada 26/27.',
};

export const footer = {
  text: 'HEAVEN PASS · Punta del Este · Temporada 26/27',
  adminLabel: 'Panel interno',
};
