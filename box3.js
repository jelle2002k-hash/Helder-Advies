import { compareScenarios } from './box3-engine.mjs';

const form = document.getElementById('box3-form');
const money = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const preciseMoney = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const field = name => form.elements.namedItem(name);
const setText = (id, value) => { document.getElementById(id).textContent = value; };
const errorBox = document.getElementById('calculation-error');

function readInputs() {
  return {
    capital: field('capital').valueAsNumber,
    reservedSavings: field('reservedSavings').valueAsNumber,
    otherSavings: field('otherSavings').valueAsNumber,
    partner: field('partner').value === 'yes',
    savingsRate: field('savingsRate').valueAsNumber,
    investmentReturn: field('investmentReturn').valueAsNumber,
    investmentCosts: field('investmentCosts').valueAsNumber,
    fundCosts: field('fundCosts').valueAsNumber,
    mode: field('mode').value,
  };
}

function addRow(body, label, first, second, options = {}) {
  const row = document.createElement('tr');
  if (options.total) row.className = 'total-row';
  const heading = document.createElement('th');
  heading.scope = 'row';
  heading.textContent = label;
  row.append(heading);
  for (const value of [first, second]) {
    const cell = document.createElement('td');
    cell.textContent = options.percentage ? percent.format(value) + '%' : preciseMoney.format(value);
    row.append(cell);
  }
  body.append(row);
}

function render(comparison, announce = false) {
  const { inputs, saving, investing, differenceAfterCosts, breakEvenInvestmentReturn } = comparison;
  const counterproof = inputs.mode === 'counterproof';
  setText('total-capital', money.format(saving.totalWealth));
  setText('saving-net', money.format(saving.netAfterCosts));
  setText('investing-net', money.format(investing.netAfterCosts));
  setText('saving-rate', percent.format(saving.netReturnRateAfterCosts) + '% van het totale vermogen / jaar');
  setText('investing-rate', percent.format(investing.netReturnRateAfterCosts) + '% van het totale vermogen / jaar');
  setText('saving-mix', money.format(saving.savings) + ' op de spaarrekening');
  setText('investing-mix', money.format(investing.savings) + ' sparen + ' + money.format(investing.investments) + ' beleggen');
  const equal = Math.abs(differenceAfterCosts) < 0.005;
  setText('difference-direction', 'Verschil na belasting én kosten');
  setText('difference-value', equal ? 'Vrijwel gelijk' : money.format(Math.abs(differenceAfterCosts)) + (differenceAfterCosts > 0 ? ' meer per jaar' : ' minder per jaar'));
  setText('difference-text', equal
    ? 'Bij deze aannames leveren beide scenario’s nagenoeg dezelfde netto jaaropbrengst op. Hun risico verschilt wel.'
    : 'Het scenario met ' + money.format(inputs.capital) + ' beleggen levert bij deze aannames ' + (differenceAfterCosts > 0 ? 'meer' : 'minder') + ' op dan alles sparen. Dit is geen rendementsgarantie.');
  setText('breakeven-text', breakEvenInvestmentReturn === null
    ? 'Binnen het onderzochte rendementsbereik is geen omslagpunt gevonden.'
    : 'Bij een bruto beleggingsrendement boven circa ' + percent.format(breakEvenInvestmentReturn) + '% per jaar. Dit omslagpunt geldt voor uw huidige rente, vermogen en kosten' + (counterproof ? ', in de indicatieve vergelijking met tegenbewijs.' : ', met de forfaitaire heffing van 2026.'));
  setText('mode-help', counterproof
    ? 'Indicatie: de tool vergelijkt de forfaitaire heffing met belasting over de gesimuleerde totale jaaropbrengst na interne fondskosten. Externe kosten zijn daarvoor niet aftrekbaar. Voor de aangifte zijn uw echte jaarcijfers nodig.'
    : 'De hoofduitwerking gebruikt de forfaitaire berekening. Een eventuele vermindering op basis van werkelijk rendement vraagt achteraf om werkelijke jaarcijfers.');
  setText('method-context', (counterproof ? 'Rekenindicatie inclusief tegenbewijs' : 'Forfaitaire berekening') + ' · 2026 · ' + (inputs.partner ? 'gezamenlijk vermogen fiscale partners' : 'één belastingplichtige') + '.');
  const body = document.getElementById('calculation-rows');
  body.replaceChildren();
  addRow(body, 'Totaal vermogen op 1 januari', saving.totalWealth, investing.totalWealth);
  addRow(body, 'Waarvan spaargeld', saving.savings, investing.savings);
  addRow(body, 'Waarvan beleggingen', saving.investments, investing.investments);
  addRow(body, 'Heffingsvrij vermogen (forfait)', saving.exemption, investing.exemption);
  addRow(body, 'Grondslag na vrijstelling', saving.taxableWealth, investing.taxableWealth);
  addRow(body, 'Belast aandeel van het vermogen', saving.taxableFraction * 100, investing.taxableFraction * 100, { percentage: true });
  addRow(body, 'Bruto jaaropbrengst vóór alle kosten', saving.grossReturn, investing.grossReturn);
  addRow(body, 'Forfaitair inkomen na vrijstelling', saving.forfaitIncome * saving.taxableFraction, investing.forfaitIncome * investing.taxableFraction);
  addRow(body, 'Box 3-heffing volgens forfait', saving.forfaitTax, investing.forfaitTax);
  if (counterproof) {
    addRow(body, 'Gesimuleerd werkelijk inkomen (na interne fondskosten)', saving.estimatedActualIncome, investing.estimatedActualIncome);
    addRow(body, 'Heffing over dat gesimuleerde inkomen', saving.actualTax, investing.actualTax);
    addRow(body, 'Laagste heffing in dit rekenvoorbeeld', saving.tax, investing.tax);
  }
  addRow(body, 'Netto na belasting, vóór kosten', saving.netBeforeCosts, investing.netBeforeCosts);
  addRow(body, 'Externe beleggingskosten', saving.externalInvestmentCost, investing.externalInvestmentCost);
  addRow(body, 'Interne fondskosten', saving.fundCost, investing.fundCost);
  addRow(body, 'Totale beleggingskosten', saving.investmentCost, investing.investmentCost);
  addRow(body, 'Netto na belasting en alle kosten', saving.netAfterCosts, investing.netAfterCosts, { total: true });
  setText('result-status', announce ? 'Berekening bijgewerkt. ' + (counterproof ? 'Indicatie inclusief tegenbewijs.' : 'Forfaitaire methode 2026.') : '');
  document.getElementById('results').classList.remove('is-stale');
  errorBox.hidden = true;
}

function calculate(announce = true) {
  field('fundCosts').setCustomValidity('');
  if (field('fundCosts').valueAsNumber > field('investmentCosts').valueAsNumber) {
    field('fundCosts').setCustomValidity('De interne fondskosten mogen niet hoger zijn dan de totale beleggingskosten.');
  }
  if (!form.reportValidity()) return false;
  try {
    render(compareScenarios(readInputs()), announce);
    return true;
  } catch (error) {
    errorBox.textContent = 'Controleer uw invoer. ' + error.message;
    errorBox.hidden = false;
    return false;
  }
}

form.addEventListener('submit', event => { event.preventDefault(); calculate(); });
form.addEventListener('input', () => {
  field('fundCosts').setCustomValidity('');
  document.getElementById('results').classList.add('is-stale');
  setText('result-status', 'Invoer gewijzigd: klik op ‘Bereken het verschil’ om de uitkomst bij te werken.');
});
field('profile').addEventListener('change', () => {
  const rates = { defensive: 4.6, neutral: 5.1, offensive: 5.6 };
  if (field('profile').value in rates) field('investmentReturn').value = String(rates[field('profile').value]);
});
field('investmentReturn').addEventListener('input', () => { field('profile').value = 'custom'; });
document.getElementById('load-case').addEventListener('click', () => { form.reset(); field('fundCosts').setCustomValidity(''); calculate(); });
document.getElementById('print-results').addEventListener('click', () => { if (calculate()) window.print(); });
document.getElementById('calculator-inputs').disabled = false;
calculate(false);
