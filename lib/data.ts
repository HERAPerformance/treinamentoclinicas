export interface Module {
  id: number
  title: string
  icon: string
  minTime: number // segundos mínimos de leitura
  content: string
}

export interface Question {
  q: string
  opts: string[]
  ans: number
  mod: number
}

export const MODULES: Module[] = [
  {
    id: 0,
    title: 'Mentalidade de Alta Performance',
    icon: 'brain',
    minTime: 90,
    content: `
      <h2>Módulo 1 — Mentalidade do Atendimento</h2>
      <p>Antes de qualquer script, você precisa entender: você não é só uma atendente. Você é a primeira impressão do médico. Você representa o cuidado, a estética e a confiança que o paciente vai depositar na clínica.</p>
      <div class="callout-gold">
        <strong>Princípio de ouro:</strong> O paciente não compra procedimento. Ele compra transformação, confiança e segurança.
      </div>
      <h3>O que o paciente realmente busca</h3>
      <ul>
        <li><strong>Segurança</strong> — quero saber que estou em boas mãos</li>
        <li><strong>Conexão</strong> — quero sentir que sou ouvida, não só um número</li>
        <li><strong>Validação</strong> — quero acreditar que minha decisão é correta</li>
        <li><strong>Clareza</strong> — quero entender como funciona sem me sentir perdida</li>
      </ul>
      <h3>O Funil do Atendimento</h3>
      <p>Todo atendimento passa por <strong>5 etapas</strong>. Sua função é conduzir o lead por cada uma delas:</p>
      <ol>
        <li><strong>Conexão</strong> — Acolher, humanizar, criar rapport</li>
        <li><strong>Qualificação</strong> — Entender o que a pessoa busca</li>
        <li><strong>Educação</strong> — Mostrar o valor do médico e do procedimento</li>
        <li><strong>Oferta</strong> — Propor a consulta como próximo passo natural</li>
        <li><strong>Fechamento</strong> — Confirmar data, horário e dados</li>
      </ol>
      <h3>Os 3 erros que matam a conversão</h3>
      <ul>
        <li>Responder apenas "oi, tudo bem?" sem dar informação</li>
        <li>Mandar tabela de preços antes de criar confiança</li>
        <li>Deixar o lead "pensar" sem acompanhar</li>
      </ul>
    `
  },
  {
    id: 1,
    title: 'Scripts: Primeiro Contato e Procedimentos',
    icon: 'message-circle',
    minTime: 120,
    content: `
      <h2>Módulo 2 — Scripts de Atendimento</h2>
      <p>O primeiro contato define tudo. Seja rápida, acolhedora e já inicie a qualificação.</p>
      <div class="script-box">
        <div class="script-label">Script 01 — Primeiro contato (padrão)</div>
        <p><em>"Olá, [NOME]! Tudo bem? Aqui é [SEU NOME], do consultório do Dr. [MÉDICO]. Que ótimo que você entrou em contato — fico feliz em te ajudar! Para eu te passar as melhores informações, me conta: você tem interesse em qual procedimento?"</em></p>
      </div>
      <div class="script-box">
        <div class="script-label">Script 02 — Lead pergunta preço diretamente</div>
        <p><em>"[NOME], entendo que o investimento é uma informação importante! Os valores variam de acordo com a avaliação individual do Dr. — cada paciente é único. Na consulta você já sai com planejamento cirúrgico e investimento total. Sem surpresas. Que tal verificar um horário para você?"</em></p>
      </div>
      <h3>Scripts por Procedimento</h3>
      <h4>Abdominoplastia</h4>
      <p>Pergunte sempre: a paciente passou por gestação ou perdeu muito peso recentemente? Isso ajuda a identificar o procedimento mais indicado. Ofereça a consulta de avaliação como primeiro passo sem compromisso.</p>
      <h4>Implante Mamário</h4>
      <p>Mencione as simulações disponíveis na consulta. Pergunte sobre o volume desejado ou se prefere orientação do médico. Destaque os resultados naturais do cirurgião.</p>
      <h4>Explante Mamário</h4>
      <p>Mostre acolhimento — é uma decisão pessoal e delicada. Pergunte sobre queixas específicas: dor, alteração de sensibilidade ou contratura capsular. Ofereça avaliação completa.</p>
      <h4>Lipo HD (Alta Definição)</h4>
      <p>Esclareça que não é só remoção de gordura — é escultura corporal. Pergunte sobre prática de exercícios e área principal de preocupação.</p>
    `
  },
  {
    id: 2,
    title: 'Gestão de Objeções — Método ACEC',
    icon: 'shield',
    minTime: 110,
    content: `
      <h2>Módulo 3 — Gestão de Objeções</h2>
      <p>A objeção não significa "não quero". Significa "ainda não estou convencida". Sua função é entender a objeção real e responder com empatia e inteligência.</p>
      <div class="callout-blue">
        <strong>Método ACEC</strong><br/>
        <strong>A — Acolher:</strong> Valide o sentimento. Nunca discuta.<br/>
        <strong>C — Concordar:</strong> Mostre que você entende o ponto dela.<br/>
        <strong>E — Esclarecer:</strong> Traga a perspectiva correta com informação.<br/>
        <strong>C — Conduzir:</strong> Volte para o agendamento como solução.
      </div>
      <h3>As 5 Objeções Mais Comuns</h3>
      <h4>1. "Está muito caro"</h4>
      <p>"Entendo completamente — é uma decisão importante. O que eu posso te dizer é que o Dr. oferece procedimento completo: anestesia, hospital, pós-operatório — tudo acompanhado. Trabalhamos com parcelamento. Na consulta você conhece todos os detalhes. Quer agendar para entender melhor?"</p>
      <h4>2. "Preciso pensar"</h4>
      <p>"Claro — é uma decisão muito importante mesmo! A consulta não é um compromisso de cirurgia — é só uma conversa com o médico. Muitas pacientes vão só para tirar dúvidas e saem com muito mais clareza. Que tal marcar?"</p>
      <h4>3. "Tenho medo da cirurgia"</h4>
      <p>"Esse é um sentimento muito natural. O Dr. é especialista em deixar a paciente segura e bem informada. Muitas pacientes chegam com medo e saem da consulta com tranquilidade. Quer ter essa conversa com ele?"</p>
      <h4>4. "Estou pesquisando outros médicos"</h4>
      <p>"Você está fazendo muito certo em pesquisar! Cirurgia plástica é uma decisão de saúde. Te convido a conhecer o trabalho dele — a consulta é sem compromisso."</p>
      <h4>5. "Não tenho tempo agora"</h4>
      <p>"A consulta leva em média 40 minutos. Temos horários antes das 9h e no final da tarde. Qual funciona melhor?"</p>
    `
  },
  {
    id: 3,
    title: 'Técnicas de Fechamento e Confirmação',
    icon: 'calendar-check',
    minTime: 90,
    content: `
      <h2>Módulo 4 — Fechamento e Confirmação</h2>
      <p>Nunca pergunte "você quer agendar?" — isso cria atrito. Conduza como se o agendamento fosse o próximo passo natural.</p>
      <div class="callout-gold">
        <strong>Regra de ouro do fechamento:</strong><br/>
        ❌ "Você tem interesse em agendar uma consulta?"<br/>
        ✅ "Tenho horário na terça às 14h ou na quinta às 10h. Qual fica melhor pra você?"<br/><br/>
        Quando você dá uma escolha entre duas opções, o lead escolhe uma — não "se vai ou não vai".
      </div>
      <h3>Fechamento por Escassez Real</h3>
      <p>"[NOME], o Dr. tem agenda bem restrita — atende um número limitado de pacientes por semana. Tenho uma janela disponível na [DIA/HORÁRIO]. Se você tiver interesse, consigo segurar por até X horas enquanto confirma. O que prefere: manhã ou tarde?"</p>
      <h3>Fechamento Após Resolução de Objeção</h3>
      <p>"Então, [NOME] — agora que você já tem mais clareza sobre o procedimento e o investimento... Que tal a gente já definir uma data para você conhecer o Dr. pessoalmente? Assim você sai com todas as dúvidas respondidas. Tenho [DIA] às [HORA] — reservo pra você?"</p>
      <h3>Mensagem de Confirmação</h3>
      <p>Envie logo após o agendamento com: data, horário, endereço completo, informações de estacionamento, política de cancelamento (24h de antecedência) e convite para tirar dúvidas.</p>
      <h3>Lembrete 1 Dia Antes</h3>
      <p>"Oi [NOME]! Amanhã é o dia da sua consulta com o Dr. [NOME]. [DIA] às [HORA] no [ENDEREÇO]. Pode vir com roupas confortaveis e, se tiver, traga exames anteriores. Qualquer dúvida é só me chamar!"</p>
    `
  },
  {
    id: 4,
    title: 'Atendimento no Instagram',
    icon: 'instagram',
    minTime: 80,
    content: `
      <h2>Módulo 5 — Atendimento no Instagram</h2>
      <p>O Instagram tem dinâmica diferente do WhatsApp. O lead ainda não decidiu entrar em contato — você precisa transformar o curioso em lead qualificado.</p>
      <div class="callout-red">
        <strong>Regra do Instagram:</strong> Nunca responda informações sensíveis (preço, detalhes de procedimento) nos comentários. Sempre direcione para o DM. Isso protege a privacidade e inicia a conversa privada.
      </div>
      <h3>Fluxo Correto</h3>
      <ol>
        <li>Pessoa comenta com interesse no post</li>
        <li>Você responde no comentário: <em>"Oi [NOME]! Te mandei um DM com todas as informações. Nos vemos lá!"</em></li>
        <li>No DM, inicia o atendimento completo com qualificação</li>
      </ol>
      <h3>Mensagem no Direct após comentário</h3>
      <p><em>"Olá, [NOME]! Aqui é [NOME], do consultório do Dr. [NOME]. Vi que você se interessou pelo nosso post — que ótimo! Para te passar as melhores informações, me conta: qual procedimento você tem interesse?"</em></p>
      <h3>Reativação de Leads Frios</h3>
      <p>Lead que curtiu, comentou ou mandou DM há mais de 3 dias sem resposta pode ser reativado:</p>
      <p><em>"Oi [NOME]! Tudo bem com você? Vi que você demonstrou interesse em [PROCEDIMENTO] aqui no Instagram. Queria ver se ainda posso te ajudar — o Dr. abriu alguns horários essa semana. Tem alguma dúvida que eu possa esclarecer pra você?"</em></p>
    `
  },
  {
    id: 5,
    title: 'Compliance e Boas Práticas',
    icon: 'scale',
    minTime: 80,
    content: `
      <h2>Módulo 6 — Compliance e Boas Práticas</h2>
      <p>Atendimento em clínica médica exige cuidados especiais. Seguir essas regras protege você, o médico e o paciente.</p>
      <div class="callout-red">
        <strong>Nunca faça:</strong>
        <ul>
          <li>Prometer resultados específicos ("você vai ficar assim")</li>
          <li>Fazer diagnóstico ou recomendar procedimento sem consulta</li>
          <li>Enviar fotos de resultados de outros pacientes sem autorização formal</li>
          <li>Informar preços como definitivos — sempre como "a partir de" ou "a definir na consulta"</li>
          <li>Falar mal de outros médicos ou clínicas</li>
          <li>Pressionar o paciente de forma agressiva</li>
        </ul>
      </div>
      <h3>Como Falar de Preço com Inteligência</h3>
      <p><em>"[NOME], o investimento varia de acordo com a avaliação individual. Para te dar um valor real e honesto, o Dr. precisa te avaliar pessoalmente. Trabalhamos com parcelamento e a consulta já inclui o planejamento completo. Muitas pacientes ficam surpresas positivamente quando entendem tudo que está incluído. Que tal agendar?"</em></p>
      <h3>Gestão de Pacientes com Queixas</h3>
      <p><em>"[NOME], entendo completamente — é muito importante você me contar isso. Vou registrar tudo e acionar o Dr. pessoalmente para te retornar com urgência. Me passa o melhor horário para contato."</em></p>
    `
  },
  {
    id: 6,
    title: 'Métricas e Roteiro Semanal',
    icon: 'bar-chart-2',
    minTime: 70,
    content: `
      <h2>Módulo 7 — Métricas e Autoavaliação</h2>
      <p>O que não é medido não é melhorado. Acompanhe seus números semanalmente.</p>
      <h3>Métricas que Você Deve Acompanhar</h3>
      <ul>
        <li><strong>Tempo de 1ª resposta:</strong> meta até 5 minutos</li>
        <li><strong>Taxa de resposta:</strong> meta 100% dos leads</li>
        <li><strong>Taxa de agendamento:</strong> meta acima de 40%</li>
        <li><strong>Taxa de show-up:</strong> meta acima de 80%</li>
        <li><strong>Taxa de reagendamento:</strong> meta acima de 70%</li>
      </ul>
      <h3>Checklist Diário</h3>
      <ul>
        <li>Todos os leads de ontem foram respondidos?</li>
        <li>Há leads sem retorno há mais de 24h?</li>
        <li>Os agendamentos de amanhã foram confirmados?</li>
        <li>Leads frios da semana passada foram reativados?</li>
        <li>Mensagens de DM do Instagram foram respondidas?</li>
      </ul>
      <h3>Roteiro Semanal</h3>
      <ul>
        <li><strong>Segunda:</strong> Verificar todos os leads novos do fim de semana. Responder DMs do Instagram.</li>
        <li><strong>Terça:</strong> Follow-up em leads que não responderam. Confirmar consultas de quarta.</li>
        <li><strong>Quarta:</strong> Reativar leads frios da semana anterior. Confirmar consultas de quinta e sexta.</li>
        <li><strong>Quinta:</strong> Follow-up em leads em negociação. Verificar pacientes pós-consulta.</li>
        <li><strong>Sexta:</strong> Fechar agenda da semana. Reagendar faltosos. Reativar leads que pediram "tempo".</li>
      </ul>
    `
  }
]

export const QUESTIONS: Question[] = [
  {
    q: 'Qual é o princípio fundamental no atendimento de clínica de cirurgia plástica?',
    opts: [
      'Informar o preço logo no primeiro contato',
      'O paciente compra transformação, confiança e segurança',
      'Responder apenas quando o lead perguntar',
      'Encaminhar diretamente para o médico'
    ],
    ans: 1, mod: 0
  },
  {
    q: 'Quais são as 5 etapas do Funil do Atendimento, na ordem correta?',
    opts: [
      'Preço → Consulta → Cirurgia → Pagamento → Pós-op',
      'Conexão → Qualificação → Educação → Oferta → Fechamento',
      'Boas-vindas → Scripts → Objeções → Fechamento → Métricas',
      'Qualificação → Conexão → Oferta → Educação → Fechamento'
    ],
    ans: 1, mod: 0
  },
  {
    q: 'Um lead chega perguntando o preço da abdominoplastia. O que você deve fazer?',
    opts: [
      'Informar o preço da tabela imediatamente',
      'Ignorar a pergunta e falar de outro procedimento',
      'Explicar que o valor varia conforme avaliação e oferecer a consulta',
      'Dizer que não pode informar preços por WhatsApp'
    ],
    ans: 2, mod: 1
  },
  {
    q: 'Qual informação você deve buscar ao atender um lead interessado em Lipo HD?',
    opts: [
      'Nome completo e CPF para cadastro',
      'Se pratica exercícios e qual a principal área de preocupação',
      'Plano de saúde e histórico médico completo',
      'Se já fez outras cirurgias plásticas'
    ],
    ans: 1, mod: 1
  },
  {
    q: 'O Método ACEC para responder objeções significa:',
    opts: [
      'Atenção, Clareza, Empatia, Compromisso',
      'Acolher, Concordar, Esclarecer, Conduzir',
      'Avaliar, Confirmar, Explicar, Cobrar',
      'Abrir, Conversar, Explicar, Concluir'
    ],
    ans: 1, mod: 2
  },
  {
    q: 'Uma paciente diz: "Tenho medo da cirurgia." Qual é a resposta CORRETA usando o ACEC?',
    opts: [
      '"Não precisa ter medo, é um procedimento simples."',
      '"Entendo completamente — muitas pacientes chegam com medo e saem da consulta com tranquilidade. Quer agendar?"',
      '"O medo é normal, mas se não fizer vai se arrepender."',
      '"Esse medo é sinal de que você não está pronta ainda."'
    ],
    ans: 1, mod: 2
  },
  {
    q: 'Qual é a regra de ouro para fechar um agendamento?',
    opts: [
      'Perguntar: "Você tem interesse em agendar?"',
      'Dar um prazo de 24h para a pessoa pensar',
      'Oferecer duas opções de horário: "Terça às 14h ou quinta às 10h?"',
      'Enviar o link do site para que ela agende sozinha'
    ],
    ans: 2, mod: 3
  },
  {
    q: 'Qual é o objetivo principal da mensagem de confirmação de agendamento?',
    opts: [
      'Cobrar o valor da consulta antecipadamente',
      'Reduzir cancelamentos e aumentar o show-up',
      'Coletar dados médicos do paciente',
      'Apresentar o currículo do médico'
    ],
    ans: 1, mod: 3
  },
  {
    q: 'Como você deve responder a um comentário no Instagram de alguém interessado em um procedimento?',
    opts: [
      'Informar o preço diretamente no comentário',
      'Ignorar e esperar que a pessoa mande DM sozinha',
      'Responder no comentário dizendo que mandou um DM com as informações',
      'Marcar o perfil do médico no comentário'
    ],
    ans: 2, mod: 4
  },
  {
    q: 'Após quantos dias sem resposta um lead do Instagram pode ser reativado?',
    opts: ['7 dias', '1 dia', '3 dias', '15 dias'],
    ans: 2, mod: 4
  },
  {
    q: 'O que você NUNCA deve fazer no atendimento de clínica médica?',
    opts: [
      'Oferecer parcelamento',
      'Prometer resultados específicos ao paciente',
      'Confirmar o agendamento por mensagem',
      'Perguntar sobre o histórico do interesse'
    ],
    ans: 1, mod: 5
  },
  {
    q: 'Como falar de preço corretamente para um paciente?',
    opts: [
      'Informar o valor exato da tabela',
      'Dizer que é muito caro',
      'Explicar que o valor varia conforme avaliação individual e mencionar parcelamento',
      'Recusar-se a falar de preço até a consulta'
    ],
    ans: 2, mod: 5
  },
  {
    q: 'Qual é a meta ideal para taxa de agendamento (leads que viram consulta)?',
    opts: ['Acima de 20%', 'Acima de 40%', 'Acima de 60%', 'Acima de 90%'],
    ans: 1, mod: 6
  },
  {
    q: 'Qual ação deve ser feita toda segunda-feira como parte do roteiro semanal?',
    opts: [
      'Ligar para todos os pacientes que já consultaram',
      'Verificar todos os leads novos do fim de semana e responder DMs do Instagram',
      'Criar novos posts no Instagram',
      'Atualizar a tabela de preços'
    ],
    ans: 1, mod: 6
  }
]
