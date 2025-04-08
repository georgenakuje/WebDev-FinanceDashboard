<template>
  <div class="reports-container">
    <div class="reports-header">
      <h1>Reports</h1>
      <p class="subtitle">Generate financial reports based on date ranges</p>
    </div>

    <div class="report-options">
      <div class="date-range">
        <div class="input-group">
          <label>Start Date</label>
          <input 
            type="date" 
            v-model="startDate"
            class="date-input"
          />
        </div>
        <div class="input-group">
          <label>End Date</label>
          <input 
            type="date" 
            v-model="endDate"
            class="date-input"
          />
        </div>
      </div>

      <button 
        @click="generateAndDownloadReport" 
        class="download-btn"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Generating Report...' : 'Download Report' }}
      </button>
    </div>
  </div>
</template>

<script>
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as d3 from 'd3'

export default {
  data() {
    return {
      startDate: '',
      endDate: '',
      isLoading: false,
      tempChartRefs: null
    }
  },
  methods: {
    async generateAndDownloadReport() {
      this.isLoading = true
      try {
        // Create temporary div for charts
        this.tempChartRefs = {
          monthlyTrendsChart: this.createTempDiv(),
          incomeSourcesChart: this.createTempDiv(),
          expenseBreakdownChart: this.createTempDiv()
        }

        // Fetch and process data
        const transactions = await this.fetchTransactions()
        const filteredTransactions = this.filterTransactions(transactions)
        const reportData = this.calculateSummary(filteredTransactions)
        
        // Create charts
        this.createCharts(filteredTransactions)
        
        // Generate and download PDF
        await this.generatePDF(reportData, filteredTransactions)
        
        // Cleanup
        this.cleanupTempDivs()
      } catch (error) {
        console.error('Error generating report:', error)
      } finally {
        this.isLoading = false
      }
    },
    createTempDiv() {
      const div = document.createElement('div')
      div.style.width = '800px'
      div.style.height = '400px'
      div.style.position = 'absolute'
      div.style.left = '-9999px'
      document.body.appendChild(div)
      return div
    },
    cleanupTempDivs() {
      if (this.tempChartRefs) {
        Object.values(this.tempChartRefs).forEach(div => {
          if (div && div.parentNode) {
            div.parentNode.removeChild(div)
          }
        })
        this.tempChartRefs = null
      }
    },
    async fetchTransactions() {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('http://localhost:3000/api/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      return response.json()
    },
    filterTransactions(transactions) {
      return transactions.filter(tx => {
        const txDate = new Date(tx.date)
        const start = this.startDate ? new Date(this.startDate) : null
        const end = this.endDate ? new Date(this.endDate) : null
        return (!start || txDate >= start) && (!end || txDate <= end)
      })
    },
    calculateSummary(transactions) {
      const totalIncome = transactions
        .filter(tx => tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0)

      const totalExpenses = Math.abs(transactions
        .filter(tx => tx.amount < 0)
        .reduce((sum, tx) => sum + tx.amount, 0))

      return {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        transactions
      }
    },
    createCharts(transactions) {
      // Clear any existing charts
      Object.values(this.tempChartRefs).forEach(div => {
        d3.select(div).selectAll('*').remove()
      })

      this.createMonthlyTrendsChart(transactions)
      this.createIncomeSourcesChart(transactions)
      this.createExpenseBreakdownChart(transactions)
    },
    createMonthlyTrendsChart(transactions) {
      if (!transactions || transactions.length === 0) {
        const noDataText = d3.select(this.tempChartRefs.monthlyTrendsChart)
          .append('div')
          .style('text-align', 'center')
          .style('padding-top', '120px')
          .style('color', '#64748b')
          .text('No data available for selected date range')
        return
      }

      const margin = { top: 40, right: 80, bottom: 40, left: 80 }
      const width = 800 - margin.left - margin.right
      const height = 400 - margin.top - margin.bottom

      // Clear any existing content
      d3.select(this.tempChartRefs.monthlyTrendsChart).selectAll('*').remove()

      const svg = d3.select(this.tempChartRefs.monthlyTrendsChart)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      // Process and sort the data
      const monthlyData = d3.group(
        transactions.sort((a, b) => new Date(a.date) - new Date(b.date)),
        d => d3.timeMonth.floor(new Date(d.date))
      )
      
      const data = Array.from(monthlyData, ([date, transactions]) => ({
        date,
        income: d3.sum(transactions.filter(t => t.amount > 0), d => d.amount),
        expenses: Math.abs(d3.sum(transactions.filter(t => t.amount < 0), d => d.amount))
      })).sort((a, b) => a.date - b.date)

      // Create scales with padding
      const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width])
        .nice()

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.income, d.expenses)) * 1.1])
        .range([height, 0])
        .nice()

      // Add axes with more visible styling
      const xAxis = svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x)
          .ticks(d3.timeMonth.every(1))
          .tickFormat(d3.timeFormat('%b %Y')))
        .call(g => g.selectAll('.tick text')
          .style('font-size', '12px')
          .attr('transform', 'rotate(-45)')
          .style('text-anchor', 'end'))

      const yAxis = svg.append('g')
        .call(d3.axisLeft(y)
          .tickFormat(d => this.formatCurrency(d)))
        .call(g => g.selectAll('.tick text')
          .style('font-size', '12px'))

      // Add grid lines
      svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat('')
        )
        .style('stroke-dasharray', '3,3')
        .style('stroke-opacity', 0.2)

      // Create and add the lines
      const lineIncome = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.income))
        .curve(d3.curveMonotoneX)

      const lineExpenses = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.expenses))
        .curve(d3.curveMonotoneX)

      // Add the lines with increased visibility
      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#22c55e')
        .attr('stroke-width', 3)
        .attr('d', lineIncome)

      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 3)
        .attr('d', lineExpenses)

      // Add dots for each data point
      svg.selectAll('.dot-income')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot-income')
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.income))
        .attr('r', 4)
        .attr('fill', '#22c55e')

      svg.selectAll('.dot-expenses')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot-expenses')
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.expenses))
        .attr('r', 4)
        .attr('fill', '#ef4444')

      // Add legend with better positioning and visibility
      const legend = svg.append('g')
        .attr('transform', `translate(${width - 120}, -20)`)

      // Income legend item
      legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 0)
        .attr('y2', 0)
        .style('stroke', '#22c55e')
        .style('stroke-width', 3)

      legend.append('text')
        .attr('x', 25)
        .attr('y', 0)
        .text('Income')
        .style('font-size', '12px')
        .attr('alignment-baseline', 'middle')

      // Expenses legend item
      legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 20)
        .attr('y2', 20)
        .style('stroke', '#ef4444')
        .style('stroke-width', 3)

      legend.append('text')
        .attr('x', 25)
        .attr('y', 20)
        .text('Expenses')
        .style('font-size', '12px')
        .attr('alignment-baseline', 'middle')
    },
    createIncomeSourcesChart(transactions) {
      const incomeTransactions = transactions.filter(t => t.amount > 0)
      
      if (!incomeTransactions || incomeTransactions.length === 0) {
        d3.select(this.tempChartRefs.incomeSourcesChart)
          .append('div')
          .style('text-align', 'center')
          .style('padding-top', '120px')
          .style('color', '#64748b')
          .text('No income data available')
        return
      }

      const width = this.tempChartRefs.incomeSourcesChart.clientWidth
      const height = 250
      const radius = Math.min(width, height) / 2

      const svg = d3.select(this.tempChartRefs.incomeSourcesChart)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`)

      // Group income transactions by description
      const incomeData = d3.group(incomeTransactions, d => d.description)

      const data = Array.from(incomeData, ([name, transactions]) => ({
        name,
        value: d3.sum(transactions, d => d.amount)
      }))

      const colors = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d']
      const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(colors)

      const pie = d3.pie()
        .value(d => d.value)

      const arc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius)

      const arcs = svg.selectAll('arc')
        .data(pie(data))
        .enter()
        .append('g')

      arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.name))
        .attr('stroke', 'white')
        .style('stroke-width', '2px')

      // Add labels
      const label = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9)

      arcs.append('text')
        .attr('transform', d => `translate(${label.centroid(d)})`)
        .attr('dy', '0.35em')
        .text(d => d.data.name)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#1e293b')
    },
    createExpenseBreakdownChart(transactions) {
      const expenseTransactions = transactions.filter(t => t.amount < 0)
      
      if (!expenseTransactions || expenseTransactions.length === 0) {
        d3.select(this.tempChartRefs.expenseBreakdownChart)
          .append('div')
          .style('text-align', 'center')
          .style('padding-top', '120px')
          .style('color', '#64748b')
          .text('No expense data available')
        return
      }

      const width = this.tempChartRefs.expenseBreakdownChart.clientWidth
      const height = 250
      const radius = Math.min(width, height) / 2

      const svg = d3.select(this.tempChartRefs.expenseBreakdownChart)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`)

      // Group expense transactions by description
      const expenseData = d3.group(expenseTransactions, d => d.description)

      const data = Array.from(expenseData, ([name, transactions]) => ({
        name,
        value: Math.abs(d3.sum(transactions, d => d.amount))
      }))

      const colors = ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d']
      const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(colors)

      const pie = d3.pie()
        .value(d => d.value)

      const arc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius)

      const arcs = svg.selectAll('arc')
        .data(pie(data))
        .enter()
        .append('g')

      arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.name))
        .attr('stroke', 'white')
        .style('stroke-width', '2px')

      // Add labels
      const label = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9)

      arcs.append('text')
        .attr('transform', d => `translate(${label.centroid(d)})`)
        .attr('dy', '0.35em')
        .text(d => d.data.name)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#1e293b')
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    async generatePDF(reportData, transactions) {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const margin = 20

      // Add title and date range
      doc.setFontSize(20)
      doc.text('Financial Report', pageWidth / 2, margin, { align: 'center' })
      
      doc.setFontSize(12)
      const dateRange = `${this.formatDate(this.startDate)} to ${this.formatDate(this.endDate)}`
      doc.text(dateRange, pageWidth / 2, margin + 10, { align: 'center' })

      // Add summary section
      doc.setFontSize(16)
      doc.text('Financial Summary', margin, margin + 25)
      
      // Create summary table
      autoTable(doc, {
        startY: margin + 30,
        head: [['Category', 'Amount']],
        body: [
          ['Total Income', this.formatCurrency(reportData.totalIncome)],
          ['Total Expenses', this.formatCurrency(reportData.totalExpenses)],
          ['Net Balance', this.formatCurrency(reportData.netBalance)]
        ],
        theme: 'grid',
        headStyles: { 
          fillColor: [41, 128, 185],
          fontSize: 12,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 11,
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 50 }
        },
        margin: { left: margin }
      })

      // Add charts
      const charts = [
        { ref: 'monthlyTrendsChart', title: 'Monthly Trends' },
        { ref: 'incomeSourcesChart', title: 'Income Sources' },
        { ref: 'expenseBreakdownChart', title: 'Expense Breakdown' }
      ]

      let currentY = margin + 100

      for (const chart of charts) {
        const svg = this.tempChartRefs[chart.ref].querySelector('svg')
        if (svg) {
          try {
            const svgData = new XMLSerializer().serializeToString(svg)
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()
            
            await new Promise((resolve, reject) => {
              img.onload = () => {
                try {
                  canvas.width = img.width
                  canvas.height = img.height
                  ctx.drawImage(img, 0, 0)
                  const imgData = canvas.toDataURL('image/png')
                  
                  if (currentY > doc.internal.pageSize.height - 100) {
                    doc.addPage()
                    currentY = margin
                  }
                  
                  doc.text(chart.title, margin, currentY)
                  doc.addImage(
                    imgData, 
                    'PNG', 
                    margin, 
                    currentY + 5, 
                    pageWidth - (margin * 2), 
                    100
                  )
                  currentY += 120

                  resolve()
                } catch (err) {
                  reject(err)
                }
              }
              img.onerror = reject
              img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
            })
          } catch (err) {
            console.error(`Error processing chart ${chart.title}:`, err)
            continue
          }
        }
      }

      // Add transaction details
      doc.addPage()
      doc.setFontSize(14)
      doc.text('Transaction Details', margin, margin)
      
      autoTable(doc, {
        startY: margin + 5,
        head: [['Date', 'Description', 'Amount']],
        body: transactions.map(tx => [
          this.formatDate(tx.date),
          tx.description,
          this.formatCurrency(tx.amount)
        ]),
        theme: 'grid',
        headStyles: { 
          fillColor: [41, 128, 185],
          fontSize: 12,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 11,
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 30, halign: 'right' }
        },
        margin: { left: margin }
      })

      // Save the PDF
      doc.save(`financial-report-${this.formatDate(new Date())}.pdf`)
    }
  }
}
</script>

<style scoped>
.reports-container {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.reports-header {
  margin-bottom: 24px;
}

.reports-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.report-options {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  display: flex;
  gap: 24px;
  align-items: flex-end;
}

.date-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.date-input {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  width: 100%;
}

.date-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.download-btn {
  padding: 8px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  background: #3b82f6;
  color: white;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.download-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .reports-container {
    padding: 16px;
  }

  .report-options {
    flex-direction: column;
    padding: 16px;
    align-items: stretch;
  }

  .date-range {
    grid-template-columns: 1fr;
  }

  .download-btn {
    width: 100%;
  }
}
</style>
