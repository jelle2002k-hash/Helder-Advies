import test from 'node:test';
import assert from 'node:assert/strict';
import { TAX_2026, calculateScenario, compareScenarios } from '../box3-engine.mjs';

function near(actual, expected, tolerance = 1e-8) {
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`);
}

const caseInputs = {
  capital: 350000,
  reservedSavings: 100000,
  otherSavings: 0,
  partner: true,
  savingsRate: 2.29,
  investmentReturn: 5.1,
  investmentCosts: 1.1,
  fundCosts: 0.25,
};

test('2026 statutory values expose the provisional savings forfait', () => {
  assert.equal(TAX_2026.year, 2026);
  assert.equal(TAX_2026.taxRate, 0.36);
  assert.equal(TAX_2026.savingsForfaitRate, 0.0128);
  assert.equal(TAX_2026.investmentForfaitRate, 0.06);
  assert.equal(TAX_2026.exemption, 59357);
  assert.equal(TAX_2026.partnerExemption, 118714);
  assert.equal(TAX_2026.savingsForfaitProvisional, true);
  assert.equal(TAX_2026.investmentForfaitProvisional, false);
  assert.ok(Object.isFrozen(TAX_2026));
});

test('single person with €200,000 pays the correct full-precision forfait tax', () => {
  const saving = calculateScenario({ savings: 200000, savingsRate: 2 });
  const investing = calculateScenario({ investments: 200000, investmentReturn: 5 });
  near(saving.tax, 648.082944);
  near(investing.tax, 3037.8888);
  near(saving.netBeforeCosts, 3351.917056);
  near(investing.netBeforeCosts, 6962.1112);
});

test('case keeps the €100,000 child reserve in both partners’ taxable portfolios', () => {
  const result = compareScenarios(caseInputs);
  assert.equal(result.saving.totalWealth, 450000);
  assert.equal(result.investing.totalWealth, 450000);
  assert.equal(result.saving.savings, 450000);
  assert.equal(result.investing.savings, 100000);
  assert.equal(result.investing.investments, 350000);
  assert.equal(result.saving.exemption, 118714);
  assert.equal(result.investing.taxableWealth, 331286);
  near(result.saving.tax, 1526.565888);
  near(result.investing.tax, 5904.841664);
  near(result.saving.grossReturn, 10305);
  near(result.investing.grossReturn, 20140);
  near(result.investing.investmentCost, 3850);
  near(result.investing.fundCost, 875);
  near(result.investing.externalInvestmentCost, 2975);
  near(result.investing.fiscalReturnBeforeFloor, 19265);
  near(result.saving.netBeforeCosts, 8778.434112);
  near(result.investing.netBeforeCosts, 14235.158336);
  near(result.investing.netAfterCosts, 10385.158336);
  near(result.extraTax, 4378.275776);
  near(result.differenceBeforeCosts, 5456.724224);
  near(result.differenceAfterCosts, 1606.724224);
  near(result.breakEvenInvestmentReturn, 4.640935936);
});

test('additional savings are included once in each portfolio and share the exemption', () => {
  const result = compareScenarios({ ...caseInputs, otherSavings: 25000 });
  assert.equal(result.saving.totalWealth, 475000);
  assert.equal(result.investing.totalWealth, 475000);
  assert.equal(result.saving.savings, 475000);
  assert.equal(result.investing.savings, 125000);
  assert.equal(result.investing.taxableWealth, 356286);
  near(result.saving.tax, 1641.765888);
});

test('wealth below and exactly at the exemption has no forfait tax', () => {
  for (const wealth of [0, 1, 50000, 59357]) {
    const result = calculateScenario({ investments: wealth, investmentReturn: 5 });
    assert.equal(result.forfaitTax, 0);
    assert.equal(result.taxableWealth, 0);
    assert.equal(result.taxableFraction, 0);
  }
  near(calculateScenario({ savings: 59358 }).forfaitTax, 0.004608);
});

test('zero wealth returns finite zero amounts and percentages in both modes', () => {
  for (const mode of ['forfait', 'counterproof']) {
    const result = calculateScenario({ mode });
    for (const key of [
      'totalWealth', 'taxableWealth', 'taxableFraction', 'forfaitIncome',
      'forfaitTax', 'actualTax', 'indicativeTax', 'tax', 'grossReturn',
      'investmentCost', 'netBeforeCosts', 'netAfterCosts',
      'fundCost', 'externalInvestmentCost', 'fiscalReturnBeforeFloor',
      'netReturnRateBeforeCosts', 'netReturnRateAfterCosts',
    ]) assert.equal(result[key], 0, key);
  }
});

test('fiscal partners receive twice the single-person exemption, not two separate portfolio taxes', () => {
  const single = calculateScenario({ investments: 118714 });
  const partners = calculateScenario({ investments: 118714, partner: true });
  assert.equal(partners.exemption, 2 * single.exemption);
  assert.equal(partners.tax, 0);
  near(single.tax, 1282.1112);
});

test('negative total actual returns are floored at zero for indicative counterproof', () => {
  const result = calculateScenario({
    savings: 100000, investments: 350000, savingsRate: 2.29,
    investmentReturn: -10, investmentCosts: 1.1, partner: true,
    mode: 'counterproof',
  });
  near(result.grossReturn, -32710);
  assert.equal(result.estimatedActualIncome, 0);
  assert.equal(result.actualTax, 0);
  assert.equal(result.tax, 0);
  near(result.netAfterCosts, -36560);
  assert.ok(result.forfaitTax > 0);
});

test('counterproof offsets investment losses against savings income for the whole portfolio', () => {
  const result = calculateScenario({
    savings: 100000, investments: 100000, savingsRate: 2,
    investmentReturn: -1, mode: 'counterproof',
  });
  assert.equal(result.grossReturn, 1000);
  assert.equal(result.estimatedActualIncome, 1000);
  assert.equal(result.actualTax, 360);
  assert.equal(result.tax, 360);
});

test('investment costs affect net return but are not deducted for actual-return tax', () => {
  const noCost = calculateScenario({
    investments: 200000, investmentReturn: 2, mode: 'counterproof',
  });
  const withCost = calculateScenario({
    investments: 200000, investmentReturn: 2, investmentCosts: 1,
    mode: 'counterproof',
  });
  assert.equal(noCost.estimatedActualIncome, 4000);
  assert.equal(withCost.estimatedActualIncome, 4000);
  assert.equal(noCost.actualTax, 1440);
  assert.equal(withCost.actualTax, 1440);
  assert.equal(noCost.tax, withCost.tax);
  near(noCost.netAfterCosts - withCost.netAfterCosts, 2000);
});

test('fund costs embedded in unit prices reduce fiscal actual return without double-counting net costs', () => {
  const externalOnly = calculateScenario({
    investments: 200000, investmentReturn: 2, investmentCosts: 1.1,
    mode: 'counterproof',
  });
  const withFundCosts = calculateScenario({
    investments: 200000, investmentReturn: 2, investmentCosts: 1.1,
    fundCosts: 0.25, mode: 'counterproof',
  });
  near(withFundCosts.investmentCost, 2200);
  assert.equal(withFundCosts.fundCost, 500);
  near(withFundCosts.externalInvestmentCost, 1700);
  assert.equal(withFundCosts.fiscalReturnBeforeFloor, 3500);
  assert.equal(withFundCosts.estimatedActualIncome, 3500);
  assert.equal(withFundCosts.actualTax, 1260);
  assert.equal(externalOnly.actualTax, 1440);
  assert.equal(withFundCosts.netBeforeCosts, 2740);
  near(withFundCosts.netAfterCosts, 540);
  near(externalOnly.netAfterCosts, 360);
});

test('the default forfait mode does not silently apply expected actual-return relief', () => {
  const forfait = calculateScenario({ investments: 200000, investmentReturn: 2 });
  const indicative = calculateScenario({
    investments: 200000, investmentReturn: 2, mode: 'counterproof',
  });
  near(forfait.tax, 3037.8888);
  assert.equal(indicative.tax, 1440);
  assert.equal(forfait.indicativeTax, indicative.tax);
});

test('counterproof has no separate wealth exemption and never exceeds the forfait', () => {
  const lowWealth = calculateScenario({
    investments: 50000, investmentReturn: 5, mode: 'counterproof',
  });
  assert.equal(lowWealth.actualTax, 900);
  assert.equal(lowWealth.forfaitTax, 0);
  assert.equal(lowWealth.tax, 0);
  const highReturn = calculateScenario({
    investments: 200000, investmentReturn: 50, mode: 'counterproof',
  });
  assert.equal(highReturn.tax, highReturn.forfaitTax);
});

test('forfait break-even equalises complete-portfolio net returns after costs', () => {
  const initial = compareScenarios(caseInputs);
  const atBreakEven = compareScenarios({
    ...caseInputs, investmentReturn: initial.breakEvenInvestmentReturn,
  });
  near(atBreakEven.differenceAfterCosts, 0);
  near(atBreakEven.investing.netAfterCosts, atBreakEven.saving.netAfterCosts);
  const slightlyBelow = compareScenarios({
    ...caseInputs, investmentReturn: initial.breakEvenInvestmentReturn - 0.01,
  });
  assert.ok(slightlyBelow.differenceAfterCosts < 0);
});

test('indicative counterproof break-even is solved on the piecewise tax model', () => {
  const inputs = {
    capital: 200000, savingsRate: 2, investmentReturn: 5,
    mode: 'counterproof',
  };
  const initial = compareScenarios(inputs);
  near(initial.breakEvenInvestmentReturnForfait, 3.194902928);
  near(initial.breakEvenInvestmentReturn, 2.6186852);
  const atBreakEven = compareScenarios({
    ...inputs, investmentReturn: initial.breakEvenInvestmentReturn,
  });
  near(atBreakEven.differenceAfterCosts, 0);
  near(atBreakEven.investing.netAfterCosts, atBreakEven.saving.netAfterCosts);
});

test('indicative break-even accounts for embedded fund expenses and external fees separately', () => {
  const inputs = {
    capital: 200000, savingsRate: 2, investmentReturn: 5,
    investmentCosts: 1.1, fundCosts: 0.25, mode: 'counterproof',
  };
  const result = compareScenarios(inputs);
  near(result.breakEvenInvestmentReturn, 4.1968102);
  const atBreakEven = compareScenarios({
    ...inputs, investmentReturn: result.breakEvenInvestmentReturn,
  });
  near(atBreakEven.differenceAfterCosts, 0);
  assert.ok(atBreakEven.investing.actualTax < atBreakEven.investing.forfaitTax);
});

test('comparison validates all amounts, percentages, mode and partner flag', () => {
  for (const capital of [undefined, null, NaN, Infinity, -1, 0, '350000']) {
    assert.throws(() => compareScenarios({ ...caseInputs, capital }));
  }
  for (const key of ['reservedSavings', 'otherSavings']) {
    for (const value of [-1, NaN, Infinity, '100']) {
      assert.throws(() => compareScenarios({ ...caseInputs, [key]: value }));
    }
  }
  for (const [key, values] of [
    ['savingsRate', [-0.1, 20.1, NaN, Infinity, '2.29']],
    ['investmentReturn', [-100.1, 100.1, NaN, Infinity, '5.1']],
    ['investmentCosts', [-0.1, 10.1, NaN, Infinity, '1.1']],
    ['fundCosts', [-0.1, 1.11, NaN, Infinity, '0.25']],
    ['partner', [1, 'true', null]],
    ['mode', ['', 'actual', null]],
  ]) {
    for (const value of values) {
      assert.throws(() => compareScenarios({ ...caseInputs, [key]: value }));
    }
  }
  assert.throws(() => calculateScenario(null));
  assert.throws(() => compareScenarios([]));
  assert.throws(() => calculateScenario({ savings: 1e308, investments: 1e308 }));
});

test('valid percentage endpoints and decimal amounts remain supported', () => {
  const result = calculateScenario({
    savings: 1.25, investments: 1.75, savingsRate: 20,
    investmentReturn: -100, investmentCosts: 10,
  });
  near(result.grossReturn, -1.5);
  near(result.investmentCost, 0.175);
  near(result.netAfterCosts, -1.675);
  assert.doesNotThrow(() => calculateScenario({ investmentReturn: 100 }));
});

test('calculation leaves caller inputs unchanged', () => {
  const inputs = Object.freeze({ ...caseInputs });
  assert.doesNotThrow(() => compareScenarios(inputs));
  assert.deepEqual(inputs, caseInputs);
});
