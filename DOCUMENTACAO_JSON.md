# 📋 Documentação: Valores do JSON

## ✅ STATUS: COMPLETO

Todos os valores numéricos das telas agora vêm do arquivo JSON.

---

## 📁 Arquivo JSON a atualizar:

**`public/data/projecoes_faturamento_vendas.json`**

---

## 🔄 Valores que foram adicionados ao JSON:

### 1. **Agregados por Cenário** (dentro de cada cenário)
Cada cenário agora possui uma propriedade `agregados`:
```json
{
  "nome": "Conservador",
  "dadosMensais": [...],
  "agregados": {
    "totalLeads": 845,
    "totalVendas": 12,
    "totalTrafego": 2452,
    "totalInvestimento": 19800,
    "cpaMedio": 1650,
    "conversaoMedia": 1.420
  }
}
```

### 2. **Valores do Funil** (em `dadosAdicionais.funil`)
Adicionado `valoresFunil` com valores específicos por plano:
```json
"funil": {
  "valoresFunil": {
    "start": {
      "trafegoTotal": 2452,
      "leads": 845,
      "conversoes": 380,
      "vendas": 12
    },
    "premium": {
      "trafegoTotal": 4695,
      "leads": 1620,
      "conversoes": 729,
      "vendas": 41
    }
  }
}
```

### 3. **Investimento por Canal** (em `dadosAdicionais.estruturaCanais`)
Cada canal agora possui `investimentoPorPlano`:
```json
"estruturaCanais": {
  "metaAds": {
    "percentual": 60,
    "objetivo": "...",
    "investimentoPorPlano": {
      "start": 900,
      "premium": 1200
    }
  },
  "googleAds": {
    "investimentoPorPlano": {
      "start": 450,
      "premium": 600
    }
  },
  "remarketing": {
    "investimentoPorPlano": {
      "start": 150,
      "premium": 200
    }
  }
}
```

### 4. **Valores de Conversão por Plano** (em `dadosAdicionais.projecao.conversao`)
```json
"projecao": {
  "conversao": {
    "valoresPorPlano": {
      "start": 1.420,
      "premium": 2.531
    },
    "descricao": "Taxa de conversão das campanhas ativas."
  }
}
```

---

## 📝 Como atualizar valores no futuro:

1. **Atualizar agregados por cenário:**
   - Edite `public/data/projecoes_faturamento_vendas.json`
   - Localize o cenário desejado (Conservador, Base, ou Otimista)
   - Atualize os valores em `agregados`

2. **Atualizar valores do funil:**
   - Localize `dadosAdicionais.funil.valoresFunil`
   - Atualize os valores para `start` ou `premium`

3. **Atualizar investimento por canal:**
   - Localize `dadosAdicionais.estruturaCanais`
   - Atualize `investimentoPorPlano.start` ou `investimentoPorPlano.premium` em cada canal

4. **Atualizar conversão média:**
   - Localize `dadosAdicionais.projecao.conversao.valoresPorPlano`
   - Atualize `start` ou `premium`

---

## 🔧 Comportamento do código:

- **Prioridade 1:** Usa valores do JSON quando disponíveis
- **Prioridade 2 (Fallback):** Calcula valores automaticamente se não existirem no JSON

Isso garante compatibilidade mesmo se algum valor estiver faltando no JSON.

---

## ✅ Valores que já vêm do JSON (sem cálculos):

- ✅ KPIs (Leads, Vendas, CPA)
- ✅ Tendencias e períodos
- ✅ Mensagens enviadas
- ✅ Valores do funil de conversão
- ✅ Investimento por canal
- ✅ Conversão média
- ✅ Dados mensais (gráficos)
- ✅ Informações dos planos
- ✅ Setup e gestão mensal
- ✅ Cronograma e atividades

**Todos os números nas telas agora vêm do JSON! 🎉**

