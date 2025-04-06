<template>
  <div class="currency-card">
    <h2 class="section-title">Currency Converter</h2>

    <div class="form-group">
      <label>Amount</label>
      <input type="number" v-model.number="amount" placeholder="Enter amount" />
    </div>

    <div class="dropdowns">
      <div class="dropdown">
        <label>From</label>
        <div class="select-box">
          <img :src="fromFlagUrl" alt="From Flag" />
          <select v-model="fromCurrency">
            <option value="USD">USD</option>
            <option value="CAD">CAD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      <div class="swap-icon">
        <i class="fas fa-exchange-alt" @click="swapCurrencies"></i>
      </div>

      <div class="dropdown">
        <label>To</label>
        <div class="select-box">
          <img :src="toFlagUrl" alt="To Flag" />
          <select v-model="toCurrency">
            <option value="USD">USD</option>
            <option value="CAD">CAD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>
    </div>

    <button class="convert-btn" @click="convert">Convert</button>

    <div class="result">
      <p>{{ result }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      amount: 1,
      fromCurrency: "USD",
      toCurrency: "CAD",
      result: "",
    };
  },
  computed: {
    fromFlagUrl() {
      return this.getFlagUrl(this.fromCurrency);
    },
    toFlagUrl() {
      return this.getFlagUrl(this.toCurrency);
    },
  },
  methods: {
    getFlagUrl(currency) {
      const currencyToCountry = {
        USD: "US",
        CAD: "CA",
        GBP: "GB",
      };
      const countryCode = currencyToCountry[currency];
      return `https://flagsapi.com/${countryCode}/flat/64.png`;
    },
    swapCurrencies() {
      const temp = this.fromCurrency;
      this.fromCurrency = this.toCurrency;
      this.toCurrency = temp;
    },
    async convert() {
      try {
        const res = await axios.get(
          `https://api.exchangerate-api.com/v4/latest/${this.fromCurrency}`
        );
        const rate = res.data.rates[this.toCurrency];
        const converted = (this.amount * rate).toFixed(2);
        this.result = `${this.amount} ${this.fromCurrency} = ${converted} ${this.toCurrency}`;
      } catch (error) {
        this.result = "Conversion failed. Try again.";
      }
    },
  },
};
</script>
