<template>
  <div class="analytics-container">
    <!-- Date Filter -->
    <div class="filter-section">
      <div class="date-presets">
        <button 
          v-for="period in datePeriods" 
          :key="period.value"
          :class="['filter-btn', { active: selectedPeriod === period.value }]"
          @click="selectPeriod(period.value)"
        >
          {{ period.label }}
        </button>
      </div>
      <div class="custom-date-range">
        <input 
          type="date" 
          v-model="startDate"
          :max="endDate"
          class="date-input"
        >
        <span>to</span>
        <input 
          type="date" 
          v-model="endDate"
          :min="startDate"
          :max="today"
          class="date-input"
        >
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card">
        <h3>Net Worth</h3>
        <p class="amount">{{ formatCurrency(netWorth) }}</p>
      </div>

      <div class="summary-card">
        <h3>Savings Rate</h3>
        <p class="amount">{{ savingsRate.toFixed(1) }}%</p>
        <p class="subtitle">of total income</p>
      </div>

      <div class="summary-card">
        <h3>Largest Expense</h3>
        <p class="amount">{{ formatCurrency(largestExpense.amount) }}</p>
        <p class="subtitle">{{ largestExpense.category }}</p>
      </div>

      <div class="summary-card">
        <h3>Monthly Average</h3>
        <p class="amount">Income: {{ formatCurrency(monthlyAverageIncome) }}</p>
        <p class="amount expense-text">Expense: {{ formatCurrency(monthlyAverageExpense) }}</p>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <div class="chart-card">
        <h3>Income vs Expenses</h3>
        <div id="overviewPie" class="chart"></div>
      </div>

      <div class="chart-card">
        <h3>Monthly Trends</h3>
        <div id="monthlyTrends" class="chart"></div>
      </div>

      <div class="chart-card">
        <h3>Income Sources</h3>
        <div id="incomePie" class="chart"></div>
      </div>

      <div class="chart-card">
        <h3>Expense Breakdown</h3>
        <div id="expensePie" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import * as d3 from 'd3';

export default {
  name: 'Analytics',
  
  setup() {
    const transactions = ref([]);
    const selectedPeriod = ref('thisMonth');
    const today = new Date().toISOString().split('T')[0];
    
    const datePeriods = [
      { label: 'This Month', value: 'thisMonth' },
      { label: 'Last Month', value: 'lastMonth' },
      { label: 'This Year', value: 'thisYear' },
      { label: 'All Time', value: 'allTime' }
    ];

    const startDate = ref(today);
    const endDate = ref(today);

    // Calculate date ranges based on selected period
    const selectPeriod = (period) => {
      selectedPeriod.value = period;
      const now = new Date();
      
      switch (period) {
        case 'thisMonth':
          startDate.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          endDate.value = today;
          break;
        case 'lastMonth':
          startDate.value = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
          endDate.value = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
          break;
        case 'thisYear':
          startDate.value = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
          endDate.value = today;
          break;
        case 'allTime':
          startDate.value = new Date(2020, 0, 1).toISOString().split('T')[0]; // Or your earliest date
          endDate.value = today;
          break;
      }
    };

    // Filter transactions based on date range
    const filteredTransactions = computed(() => {
      return transactions.value.filter(t => {
        const date = new Date(t.date);
        return date >= new Date(startDate.value) && date <= new Date(endDate.value);
      });
    });

    // Computed properties for financial metrics
    const totalIncome = computed(() => {
      return filteredTransactions.value
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    });

    const totalExpenses = computed(() => {
      return Math.abs(filteredTransactions.value
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0));
    });

    const netWorth = computed(() => {
      return totalIncome.value - totalExpenses.value;
    });

    const savingsRate = computed(() => {
      return totalIncome.value ? (netWorth.value / totalIncome.value) * 100 : 0;
    });

    const monthlyAverageIncome = computed(() => {
      const months = getMonthsDifference(startDate.value, endDate.value) || 1;
      return totalIncome.value / months;
    });

    const monthlyAverageExpense = computed(() => {
      const months = getMonthsDifference(startDate.value, endDate.value) || 1;
      return totalExpenses.value / months;
    });

    const largestExpense = computed(() => {
      const expenses = filteredTransactions.value.filter(t => t.amount < 0);
      if (!expenses.length) return { amount: 0, category: 'No expenses' };
      
      const largest = expenses.reduce((prev, current) => 
        Math.abs(current.amount) > Math.abs(prev.amount) ? current : prev
      );
      
      return {
        amount: Math.abs(largest.amount),
        category: largest.category
      };
    });

    // Helper function to calculate months difference
    const getMonthsDifference = (start, end) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      return (
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        endDate.getMonth() - startDate.getMonth()
      );
    };

    // Format currency
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    };

    // Load transactions
    const loadTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        transactions.value = response.data;
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    };

    // Chart configurations
    const chartDimensions = {
      width: 400,
      height: 300,
      radius: 120,
      margin: { top: 30, right: 30, bottom: 50, left: 60 }
    };

    const chartColors = {
      income: '#22c55e',
      expense: '#ef4444',
      incomeCategories: [
        '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
        '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'
      ],
      expenseCategories: [
        '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
        '#ea580c', '#c2410c', '#9a3412', '#a16207', '#854d0e'
      ]
    };

    // Create all charts
    const createCharts = () => {
      // Clear all charts first
      d3.select('#overviewPie').selectAll('*').remove();
      d3.select('#monthlyTrends').selectAll('*').remove();
      d3.select('#incomePie').selectAll('*').remove();
      d3.select('#expensePie').selectAll('*').remove();

      if (!filteredTransactions.value.length) return;
      
      const hasIncome = totalIncome.value > 0;
      const hasExpenses = totalExpenses.value > 0;

      // Only show overview if there's both income and expenses
      if (hasIncome || hasExpenses) {
        createPieChart('overviewPie', [
          { name: 'Income', value: totalIncome.value },
          { name: 'Expenses', value: totalExpenses.value }
        ], [chartColors.income, chartColors.expense]);
      }
      
      createMonthlyTrends();
      
      // Create income sources chart - group by transaction name
      if (hasIncome) {
        const incomeSources = {};
        filteredTransactions.value
          .filter(t => t.amount > 0)
          .forEach(t => {
            incomeSources[t.description] = (incomeSources[t.description] || 0) + t.amount;
          });
        
        const incomeData = Object.entries(incomeSources)
          .map(([description, value]) => ({ name: description, value }))
          .sort((a, b) => b.value - a.value);
        
        createPieChart('incomePie', incomeData, chartColors.incomeCategories);
      }
      
      // Create expense breakdown chart - group by transaction name
      if (hasExpenses) {
        const expenseCategories = {};
        filteredTransactions.value
          .filter(t => t.amount < 0)
          .forEach(t => {
            expenseCategories[t.description] = (expenseCategories[t.description] || 0) + Math.abs(t.amount);
          });
        
        const expenseData = Object.entries(expenseCategories)
          .map(([description, value]) => ({ name: description, value }))
          .sort((a, b) => b.value - a.value);
        
        createPieChart('expensePie', expenseData, chartColors.expenseCategories);
      }
    };

    // Create pie chart
    const createPieChart = (elementId, data, colors) => {
      d3.select(`#${elementId}`).selectAll('*').remove();
      
      const width = chartDimensions.width;
      const height = chartDimensions.height;
      const radius = Math.min(width, height) / 2 * 0.8;
      
      const svg = d3.select(`#${elementId}`)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`);
      
      const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
      
      const arc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius);
      
      const arcs = svg.selectAll('arc')
        .data(pie(data))
        .enter()
        .append('g');
      
      arcs.append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => colors[i % colors.length])
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('opacity', 0.9)
        .on('mouseover', function(event, d) {
          const total = d3.sum(data, d => d.value);
          const percentage = ((d.data.value / total) * 100).toFixed(1);
          
          d3.select(this)
            .style('opacity', 1)
            .attr('transform', 'scale(1.02)');
          
          const tooltip = d3.select('body').append('div')
            .attr('class', 'chart-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none');
          
          tooltip.html(`
            ${d.data.name}<br>
            ${formatCurrency(d.data.value)}<br>
            ${percentage}%
          `);
          
          tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this)
            .style('opacity', 0.9)
            .attr('transform', 'scale(1)');
          
          d3.selectAll('.chart-tooltip').remove();
        });
      
      // Add percentage labels
      arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(d => {
          const percentage = (d.data.value / d3.sum(data, d => d.value) * 100).toFixed(1);
          return percentage > 5 ? `${percentage}%` : '';
        });
    };

    // Create monthly trends chart
    const createMonthlyTrends = () => {
      const margin = chartDimensions.margin;
      const width = chartDimensions.width - margin.left - margin.right;
      const height = chartDimensions.height - margin.top - margin.bottom;
      
      d3.select('#monthlyTrends').selectAll('*').remove();
      
      const svg = d3.select('#monthlyTrends')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${chartDimensions.width} ${chartDimensions.height}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      
      // Group by month
      const monthlyData = d3.group(filteredTransactions.value, 
        d => d3.timeMonth(new Date(d.date)));
      
      const data = Array.from(monthlyData, ([date, transactions]) => ({
        date,
        income: transactions.filter(t => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0),
        expenses: Math.abs(transactions.filter(t => t.amount < 0)
          .reduce((sum, t) => sum + t.amount, 0))
      })).sort((a, b) => a.date - b.date);
      
      // Create scales
      const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width])
        .nice();
      
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.income, d.expenses)) * 1.1])
        .range([height, 0])
        .nice();
      
      // Add grid
      svg.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat('')
        );
      
      // Add axes
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x)
          .ticks(d3.timeMonth.every(1))
          .tickFormat(d3.timeFormat('%b %Y')))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');
      
      svg.append('g')
        .call(d3.axisLeft(y)
          .tickFormat(d => formatCurrency(d)));
      
      // Add lines
      const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.income))
        .curve(d3.curveMonotoneX);
      
      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', chartColors.income)
        .attr('stroke-width', 2)
        .attr('d', line);
      
      const expenseLine = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.expenses))
        .curve(d3.curveMonotoneX);
      
      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', chartColors.expense)
        .attr('stroke-width', 2)
        .attr('d', expenseLine);
      
      // Add dots
      svg.selectAll('.dot-income')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot-income')
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.income))
        .attr('r', 4)
        .attr('fill', 'white')
        .attr('stroke', chartColors.income)
        .attr('stroke-width', 2)
        .on('mouseover', (event, d) => {
          d3.select(event.currentTarget)
            .attr('r', 6)
            .attr('stroke-width', 3);
          
          const tooltip = d3.select('body').append('div')
            .attr('class', 'chart-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none');
          
          tooltip.html(`
            Date: ${d3.timeFormat('%B %Y')(d.date)}<br>
            Income: ${formatCurrency(d.income)}
          `);
          
          tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', (event) => {
          d3.select(event.currentTarget)
            .attr('r', 4)
            .attr('stroke-width', 2);
          
          d3.selectAll('.chart-tooltip').remove();
        });
      
      svg.selectAll('.dot-expense')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot-expense')
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.expenses))
        .attr('r', 4)
        .attr('fill', 'white')
        .attr('stroke', chartColors.expense)
        .attr('stroke-width', 2)
        .on('mouseover', (event, d) => {
          d3.select(event.currentTarget)
            .attr('r', 6)
            .attr('stroke-width', 3);
          
          const tooltip = d3.select('body').append('div')
            .attr('class', 'chart-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none');
          
          tooltip.html(`
            Date: ${d3.timeFormat('%B %Y')(d.date)}<br>
            Expenses: ${formatCurrency(d.expenses)}
          `);
          
          tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', (event) => {
          d3.select(event.currentTarget)
            .attr('r', 4)
            .attr('stroke-width', 2);
          
          d3.selectAll('.chart-tooltip').remove();
        });
      
      // Add legend
      const legend = svg.append('g')
        .attr('transform', `translate(${width - 100},0)`);
      
      legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', chartColors.income)
        .attr('stroke-width', 2);
      
      legend.append('text')
        .attr('x', 25)
        .attr('y', 0)
        .attr('dy', '.35em')
        .style('font-size', '12px')
        .text('Income');
      
      legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 20)
        .attr('y2', 20)
        .attr('stroke', chartColors.expense)
        .attr('stroke-width', 2);
      
      legend.append('text')
        .attr('x', 25)
        .attr('y', 20)
        .attr('dy', '.35em')
        .style('font-size', '12px')
        .text('Expenses');
    };

    // Watch for changes in filtered transactions
    watch([filteredTransactions, startDate, endDate], () => {
      createCharts();
    });

    // Initialize component
    onMounted(() => {
      selectPeriod('thisMonth');
      loadTransactions();
    });

    return {
      transactions,
      selectedPeriod,
      datePeriods,
      startDate,
      endDate,
      today,
      filteredTransactions,
      totalIncome,
      totalExpenses,
      netWorth,
      savingsRate,
      monthlyAverageIncome,
      monthlyAverageExpense,
      largestExpense,
      selectPeriod,
      formatCurrency,
      createCharts
    };
  }
};
</script>

<style scoped>
.analytics-container {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.filter-section {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
}

.date-presets {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #f1f5f9;
}

.filter-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.custom-date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #1e293b;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.summary-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-card h3 {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.summary-card .amount {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.summary-card .expense-text {
  color: #ef4444;
  font-size: 20px;
  margin-top: 8px;
}

.trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  margin-top: 8px;
}

.trend.positive { color: #22c55e; }
.trend.negative { color: #ef4444; }

.subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 4px 0 0 0;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.chart-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.chart-card h3 {
  font-size: 18px;
  color: #0f172a;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.chart {
  width: 100%;
  height: calc(100% - 60px);
  position: relative;
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-card {
    min-height: 350px;
  }
}

@media (max-width: 768px) {
  .analytics-container {
    padding: 16px;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-presets {
    flex-wrap: wrap;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>
