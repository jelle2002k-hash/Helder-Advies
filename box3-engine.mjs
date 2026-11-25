/**
 * Educational 2026 Box 3 comparison for a constant, full-year portfolio.
 *
 * Scope: Dutch resident, cash and ordinary investments only, no Box 3 debt,
 * exempt investments, other assets, transactions or ownership changes.
 * Input/output return percentages use percentage points (2.29 means 2.29%).
 * Statutory rates in TAX_2026 are fractions (0.36 means 36%). No intermediate
 * amount is rounded; a tax assessment can differ because of official rounding.
 *
 * Source: https://www.belastingdienst.nl/wps/wcm/connect/nl/box-3/content/berekening-box-3-inkomen-2026
 */

export const TAX_2026 = Object.freeze({
  year: 2026,
  taxRate: 0.36,
  savingsForfaitRate: 0.0128,
  investmentForfaitRate: 0.06,
  exemption: 59357,
  partnerExemption: 118714,
  savingsForfaitProvisional: true,
  investmentForfaitProvisional: false,
});

const MODES = new Set(['forfait', 'counterproof']);

function numeric(value, label, minimum, maximum = Infinity) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${label} moet een eindig getal zijn.`);
  }
  if (value < minimum || value > maximum) {
    throw new RangeError(`${label} valt buiten het toegestane bereik.`);
  }
  return value;
}

function partnerFlag(value) {
  if (typeof value !== 'boolean') {
    throw new TypeError('partner moet true of false zijn.');
  }
  return value;
}

function calculationMode(value) {
  if (!MODES.has(value)) {
    throw new RangeError("mode moet 'forfait' of 'counterproof' zijn.");
  }
  return value;
}

function inputObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('De invoer moet een object zijn.');
  }
  return value;
}

function checkFiniteResults(values) {
  if (values.some(value => !Number.isFinite(value))) {
    throw new RangeError('Het vermogen is te groot om betrouwbaar te berekenen.');
  }
}

/**
 * Compute total annual portfolio returns and taxes for one scenario.
 *
 * 'forfait' uses the statutory portfolio split. 'counterproof' additionally
 * compares it with a hypothetical actual-return tax, using expected gross
 * income as the assumed realised/unrealised annual return. That is an
 * illustration, never evidence of the actual return or a final assessment.
 * The investment return is gross before all costs. Internal fund expenses are
 * reflected in fund prices, so the optional fundCosts portion is subtracted
 * when estimating fiscal actual return. External investment fees are not
 * deductible there. Net return subtracts total costs once, never twice.
 */
export function calculateScenario(options = {}) {
  const {
    savings = 0,
    investments = 0,
    savingsRate = 0,
    investmentReturn = 0,
    investmentCosts = 0,
    fundCosts = 0,
    partner = false,
    mode = 'forfait',
  } = inputObject(options);

  numeric(savings, 'Spaargeld', 0);
  numeric(investments, 'Beleggingen', 0);
  numeric(savingsRate, 'Spaarrente', 0, 20);
  numeric(investmentReturn, 'Beleggingsrendement', -100, 100);
  numeric(investmentCosts, 'Beleggingskosten', 0, 10);
  numeric(fundCosts, 'Fondskosten', 0, investmentCosts);
  partnerFlag(partner);
  calculationMode(mode);

  const totalWealth = savings + investments;
  const exemption = partner ? TAX_2026.partnerExemption : TAX_2026.exemption;
  const taxableWealth = Math.max(totalWealth - exemption, 0);
  const taxableFraction = totalWealth > 0 ? taxableWealth / totalWealth : 0;
  const forfaitIncome = savings * TAX_2026.savingsForfaitRate
    + investments * TAX_2026.investmentForfaitRate;
  const forfaitTax = forfaitIncome * taxableFraction * TAX_2026.taxRate;
  const grossSavingsReturn = savings * savingsRate / 100;
  const grossInvestmentReturn = investments * investmentReturn / 100;
  const grossReturn = grossSavingsReturn + grossInvestmentReturn;
  const investmentCost = investments * investmentCosts / 100;
  const fundCost = investments * fundCosts / 100;
  const externalInvestmentCost = investmentCost - fundCost;
  const fiscalReturnBeforeFloor = grossReturn - fundCost;
  const estimatedActualIncome = Math.max(fiscalReturnBeforeFloor, 0);
  const actualTax = estimatedActualIncome * TAX_2026.taxRate;
  const indicativeTax = Math.min(forfaitTax, actualTax);
  const tax = mode === 'counterproof' ? indicativeTax : forfaitTax;
  const netBeforeCosts = grossReturn - tax;
  const netAfterCosts = netBeforeCosts - investmentCost;
  const netReturnRateBeforeCosts = totalWealth > 0
    ? netBeforeCosts / totalWealth * 100 : 0;
  const netReturnRateAfterCosts = totalWealth > 0
    ? netAfterCosts / totalWealth * 100 : 0;

  checkFiniteResults([
    totalWealth, taxableWealth, taxableFraction, forfaitIncome, forfaitTax,
    grossSavingsReturn, grossInvestmentReturn, grossReturn, investmentCost,
    fundCost, externalInvestmentCost, fiscalReturnBeforeFloor,
    estimatedActualIncome, actualTax, indicativeTax, tax, netBeforeCosts,
    netAfterCosts, netReturnRateBeforeCosts, netReturnRateAfterCosts,
  ]);

  return {
    mode, savings, investments, totalWealth, exemption, taxableWealth,
    taxableFraction, forfaitIncome, forfaitTax, estimatedActualIncome,
    actualTax, indicativeTax, tax, grossSavingsReturn, grossInvestmentReturn,
    grossReturn, investmentCost, fundCost, externalInvestmentCost,
    fiscalReturnBeforeFloor, netBeforeCosts, netAfterCosts,
    netReturnRateBeforeCosts, netReturnRateAfterCosts,
  };
}

/**
 * Compare saving the capital with investing it. Reserved/other savings remain
 * savings in both scenarios and share the same Box 3 exemption. All reported
 * returns and tax amounts relate to the complete portfolio in each scenario.
 */
export function compareScenarios(options = {}) {
  const {
    capital,
    reservedSavings = 0,
    otherSavings = 0,
    partner = false,
    savingsRate = 0,
    investmentReturn = 0,
    investmentCosts = 0,
    fundCosts = 0,
    mode = 'forfait',
  } = inputObject(options);

  numeric(capital, 'Te vergelijken bedrag', 0);
  if (capital <= 0) {
    throw new RangeError('Het te vergelijken bedrag moet groter zijn dan nul.');
  }
  numeric(reservedSavings, 'Gereserveerd spaargeld', 0);
  numeric(otherSavings, 'Overig spaargeld', 0);
  partnerFlag(partner);
  calculationMode(mode);

  const fixedSavings = reservedSavings + otherSavings;
  const inputs = {
    capital, reservedSavings, otherSavings, partner, savingsRate,
    investmentReturn, investmentCosts, fundCosts, mode,
  };
  const common = {
    savingsRate, investmentReturn, investmentCosts, fundCosts, partner, mode,
  };
  const saving = calculateScenario({
    ...common, savings: fixedSavings + capital, investments: 0,
  });
  const investing = calculateScenario({
    ...common, savings: fixedSavings, investments: capital,
  });

  const extraTax = investing.tax - saving.tax;
  // Difference is calculated directly to reduce cancellation of the identical
  // returns on the reserved savings, rather than subtracting two large totals.
  const differenceBeforeCosts = capital * (investmentReturn - savingsRate) / 100
    - extraTax;
  const differenceAfterCosts = differenceBeforeCosts - investing.investmentCost;
  const breakEvenInvestmentReturnForfait = savingsRate + investmentCosts
    + (investing.forfaitTax - saving.forfaitTax) / capital * 100;

  let breakEvenInvestmentReturn = breakEvenInvestmentReturnForfait;
  if (mode === 'counterproof') {
    // Tax is the lower of a fixed forfait and a piecewise linear actual-return
    // amount. Net return is strictly increasing with the investment return,
    // so bisection finds the unique break-even without applying the forfait-only
    // formula to this different tax mode.
    const differenceAt = rate => {
      const candidate = calculateScenario({
        ...common, savings: fixedSavings, investments: capital,
        investmentReturn: rate,
      });
      return capital * (rate - savingsRate - investmentCosts) / 100
        - (candidate.tax - saving.tax);
    };
    let low = -100;
    let high = 100;
    if (differenceAt(low) > 0 || differenceAt(high) < 0) {
      breakEvenInvestmentReturn = null;
    } else {
      for (let iteration = 0; iteration < 100; iteration += 1) {
        const midpoint = (low + high) / 2;
        if (differenceAt(midpoint) < 0) low = midpoint;
        else high = midpoint;
      }
      breakEvenInvestmentReturn = (low + high) / 2;
    }
  }

  return {
    inputs, saving, investing, differenceBeforeCosts, differenceAfterCosts,
    extraTax, investmentAmount: capital, breakEvenInvestmentReturn,
    breakEvenInvestmentReturnForfait,
  };
}
