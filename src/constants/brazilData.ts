export interface BrazilState {
  name: string;
  capital: string;
  uf: string;
  region: string;
}

export const BRAZIL_STATES: BrazilState[] = [
  { name: 'Acre', uf: 'AC', capital: 'Rio Branco', region: 'Norte' },
  { name: 'Alagoas', uf: 'AL', capital: 'Maceió', region: 'Nordeste' },
  { name: 'Amapá', uf: 'AP', capital: 'Macapá', region: 'Norte' },
  { name: 'Amazonas', uf: 'AM', capital: 'Manaus', region: 'Norte' },
  { name: 'Bahia', uf: 'BA', capital: 'Salvador', region: 'Nordeste' },
  { name: 'Ceará', uf: 'CE', capital: 'Fortaleza', region: 'Nordeste' },
  { name: 'Distrito Federal', uf: 'DF', capital: 'Brasília', region: 'Centro-Oeste' },
  { name: 'Espírito Santo', uf: 'ES', capital: 'Vitória', region: 'Sudeste' },
  { name: 'Goiás', uf: 'GO', capital: 'Goiânia', region: 'Centro-Oeste' },
  { name: 'Maranhão', uf: 'MA', capital: 'São Luís', region: 'Nordeste' },
  { name: 'Mato Grosso', uf: 'MT', capital: 'Cuiabá', region: 'Centro-Oeste' },
  { name: 'Mato Grosso do Sul', uf: 'MS', capital: 'Campo Grande', region: 'Centro-Oeste' },
  { name: 'Minas Gerais', uf: 'MG', capital: 'Belo Horizonte', region: 'Sudeste' },
  { name: 'Pará', uf: 'PA', capital: 'Belém', region: 'Norte' },
  { name: 'Paraíba', uf: 'PB', capital: 'João Pessoa', region: 'Nordeste' },
  { name: 'Paraná', uf: 'PR', capital: 'Curitiba', region: 'Sul' },
  { name: 'Pernambuco', uf: 'PE', capital: 'Recife', region: 'Nordeste' },
  { name: 'Piauí', uf: 'PI', capital: 'Teresina', region: 'Nordeste' },
  { name: 'Rio de Janeiro', uf: 'RJ', capital: 'Rio de Janeiro', region: 'Sudeste' },
  { name: 'Rio Grande do Norte', uf: 'RN', capital: 'Natal', region: 'Nordeste' },
  { name: 'Rio Grande do Sul', uf: 'RS', capital: 'Porto Alegre', region: 'Sul' },
  { name: 'Rondônia', uf: 'RO', capital: 'Porto Velho', region: 'Norte' },
  { name: 'Roraima', uf: 'RR', capital: 'Boa Vista', region: 'Norte' },
  { name: 'Santa Catarina', uf: 'SC', capital: 'Florianópolis', region: 'Sul' },
  { name: 'São Paulo', uf: 'SP', capital: 'São Paulo', region: 'Sudeste' },
  { name: 'Sergipe', uf: 'SE', capital: 'Aracaju', region: 'Nordeste' },
  { name: 'Tocantins', uf: 'TO', capital: 'Palmas', region: 'Norte' }
];
