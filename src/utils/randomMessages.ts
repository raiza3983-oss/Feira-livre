export const RANDOM_MARKET_MESSAGES = [
  "Aproveite as frutas da estação! Esta semana, o morango e a uva estão com preços incríveis.",
  "Dica do dia: Para manter suas verduras frescas por mais tempo, lave-as e guarde em potes herméticos com papel toalha.",
  "Você sabia? Comprar de produtores locais ajuda a fortalecer a economia da nossa região.",
  "Receita rápida: Que tal um refogado de legumes frescos hoje? Saudável e delicioso!",
  "Atenção feirantes: Mantenha sua banca sempre organizada para atrair mais clientes.",
  "Novidade: Agora você pode salvar suas bancas favoritas para não perder nenhuma oferta!",
  "Lembrete: A feira de domingo começa às 06:00. Chegue cedo para garantir os melhores produtos.",
  "Sustentabilidade: Traga sua própria sacola retornável e ajude a reduzir o uso de plástico.",
  "Curiosidade: O Brasil é um dos maiores produtores de frutas do mundo. Valorize o que é nosso!",
  "Oferta relâmpago: Algumas bancas estão com 20% de desconto em produtos selecionados hoje!"
];

export const getRandomMessage = () => {
  const randomIndex = Math.floor(Math.random() * RANDOM_MARKET_MESSAGES.length);
  return RANDOM_MARKET_MESSAGES[randomIndex];
};
