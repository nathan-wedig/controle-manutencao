export interface Usuario {
  id: string;
  username: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  especialidade: string;
  ativo: boolean;
}

export interface Maquina {
  id: string;
  codigoMaquina: string;
  apr?: string;
  nr12?: string;
  nome: string;
  setor: string;
  fonteEnergia?: string;
  nomeOperador: string;
  numeroSerie: string;
  anoFabricacao?: string;
  fabricante: string;
  cnpjFabricante?: string;
  modelo: string;
  peso?: string;
  dataCompra: string;
  dataGarantia: string;
  status: 'ATIVA' | 'EM_MANUTENCAO' | 'PARADA' | 'DESATIVADA';
  observacoes: string;
  qrcodeHash: string;
  anexos: Anexo[];
  ativo: boolean;
  fornecedores: MaquinaFornecedor[];
}

export interface MaquinaFornecedor {
  id?: string;
  fornecedorId: string;
  fornecedorNome: string;
  observacao: string;
}

export interface Anexo {
  id: string;
  nomeOriginal: string;
  tipo: string;
  extensao: string;
  tamanho: number;
  categoria: string;
  url: string;
  pastaId?: string;
  pastaNome?: string;
}

export interface Pasta {
  id: string;
  nome: string;
  maquinaId?: string;
  pastaPaiId?: string;
  pastaPaiNome?: string;
}

export interface ItemCusto {
  id?: string;
  descricao: string;
  unidade: number;
  valorUnitario: number;
}

export interface OrdemServico {
  id: string;
  numeroOS: string;
  tipo: 'PREVENTIVA' | 'CORRETIVA' | 'EMERGENCIAL' | 'INSTALACAO';
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  status: 'ABERTA' | 'EM_ANDAMENTO' | 'AGUARDANDO_PECA' | 'AGUARDANDO_APROVACAO' | 'CONCLUIDA' | 'CANCELADA';
  setor: string;
  problemaRelatado: string;
  acaoFeita: string;
  observacoes: string;
  maquinaId: string;
  maquinaNome: string;
  maquinaCodigo: string;
  tecnicoResponsavelId: string;
  tecnicoNome: string;
  dataAbertura: string;
  dataConclusao: string;
  dataMaxima: string;
  dataAgendamento: string;
  tempoParadoHoras: number;
  custoPecas: number;
  custoServico: number;
  custoTotal: number;
  planoPreventivaId: string;
  planoPreventivaNome: string;
  fornecedorId: string;
  fornecedorNome: string;
  observacoesTerceiro: string;
  itensCusto: ItemCusto[];
  anexos: Anexo[];
}

export interface PlanoPreventiva {
  id: string;
  nome: string;
  descricao: string;
  periodicidadeDias: number;
  maquinaId?: string;
  maquinaNome?: string;
  maquina?: Maquina;
  responsavelId?: string;
  responsavelNome?: string;
  proximaExecucao: string;
  ultimaExecucao: string;
  ativo: boolean;
  checklists: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  item: string;
  tipo: string;
  obrigatorio: boolean;
}

export interface Alerta {
  id: string;
  tipo: string;
  mensagem: string;
  detalhes: string;
  lido: boolean;
  resolvido: boolean;
  maquinaId: string;
  ordemServicoId: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  id: string;
  username: string;
  nome: string;
  email: string;
  cargo: string;
  role: string;
}

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  nomeRepresentante: string;
  whatsappRepresentante: string;
  telefone: string;
  email: string;
  tipoServico: string;
  detalhesServico: string;
  formasPagamento: string;
}

export interface DashboardData {
  totalMaquinas: number;
  maquinasAtivas: number;
  maquinasEmManutencao: number;
  maquinasParadas: number;
  ordensAbertas: number;
  ordensConcluidas: number;
  ordensEmergenciais: number;
  alertasAtivos: number;
  custoTotalMes: number;
  tempoMedioParada: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
