import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import './InvestmentForm.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const InvestmentForm = () => {
  const [investments, setInvestments] = useState([{ name: '', percentage: '', returns: '' }]);
  const [totalAmount, setTotalAmount] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [annualIncrease, setAnnualIncrease] = useState('');
  const [projectedReturns, setProjectedReturns] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleInputChange = (index, event) => {
    const values = [...investments];
    values[index][event.target.name] = event.target.value;
    setInvestments(values);
  };

  const handleAddFields = () => {
    setInvestments([...investments, { name: '', percentage: '', returns: '' }]);
  };

  const handleRemoveFields = (index) => {
    const values = [...investments];
    values.splice(index, 1);
    setInvestments(values);
  };

  const calculateReturns = (e) => {
    e.preventDefault();
    let totalProjectedReturns = 0;
    const returnsData = [];
    const labels = [];
    const barChartLabels = [];
    const barChartDatasets = [];

    for (let i = 1; i <= timePeriod; i++) {
      barChartLabels.push(`Year ${i}`);
    }

    investments.forEach((investment, index) => {
      const investmentReturns = [];
      let amountInvested = (totalAmount * investment.percentage) / 100;
      let cumulativeReturn = 0;
      for (let year = 1; year <= timePeriod; year++) {
        const investmentReturn = amountInvested * Math.pow(1 + investment.returns / 100, year);
        investmentReturns.push(investmentReturn);
        cumulativeReturn += investmentReturn;
        amountInvested += (amountInvested * annualIncrease) / 100;
      }
      returnsData.push(cumulativeReturn);
      labels.push(investment.name);
      barChartDatasets.push({
        label: investment.name,
        data: investmentReturns,
        backgroundColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`,
      });
      totalProjectedReturns += cumulativeReturn; // Update total projected returns here
    });

    console.log("Total Projected Returns:", totalProjectedReturns); // Debugging log
    console.log("Returns Data:", returnsData); // Debugging log

    setProjectedReturns(totalProjectedReturns);
    setChartData({
      labels,
      datasets: [
        {
          data: returnsData,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
          hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
        },
      ],
    });

    setBarChartData({
      labels: barChartLabels,
      datasets: barChartDatasets,
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const formElement = document.getElementById('investment-form');
    const chartElement = document.getElementById('chart-canvas');

    html2canvas(formElement).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      doc.text('Investment Details', 10, 10);
      doc.addImage(imgData, 'PNG', 10, 20, 190, 0);

      html2canvas(chartElement).then((canvas) => {
        const chartImgData = canvas.toDataURL('image/png');
        doc.addPage();
        doc.text('Investment Charts', 10, 10);
        doc.addImage(chartImgData, 'PNG', 10, 20, 190, 0);

        doc.save('investment_report.pdf');
      });
    });
  };

  const currencySymbol = (currency) => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'INR':
        return '₹';
      default:
        return '$';
    }
  };

  return (
    <div className={`investment-form ${darkMode ? 'dark-mode' : ''}`}>
      <form id="investment-form" onSubmit={calculateReturns}>
        <h2>Investment Calculator</h2>
        <div className="form-group">
          <label>Total Amount to Invest:</label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Annual Increase in Investment (%):</label>
          <input
            type="number"
            value={annualIncrease}
            onChange={(e) => setAnnualIncrease(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Select Currency:</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="INR">INR</option>
          </select>
        </div>
        {investments.map((investment, index) => (
          <div className="investment-row" key={index}>
            <input
              type="text"
              name="name"
              placeholder="Investment Name"
              value={investment.name}
              onChange={(event) => handleInputChange(index, event)}
              required
            />
            <input
              type="number"
              name="percentage"
              placeholder="% of Total Amount"
              value={investment.percentage}
              onChange={(event) => handleInputChange(index, event)}
              required
            />
            <input
              type="number"
              name="returns"
              placeholder="Expected Returns (%)"
              value={investment.returns}
              onChange={(event) => handleInputChange(index, event)}
              required
            />
            <button
              type="button"
              className="remove-btn"
              onClick={() => handleRemoveFields(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <div className="add-btn-container">
          <button type="button" className="add-btn" onClick={handleAddFields}>
            + Add Investment
          </button>
        </div>
        <div className="form-group">
          <label>Investment Period (Years):</label>
          <input
            type="number"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            required
          />
        </div>
        <div className="add-btn-container">
        <button type="submit" className="submit-btn">Calculate Returns</button>
        </div>
      </form>
      {projectedReturns !== null && (
        <div className="result" id="chart-canvas">
          <h3>Projected Returns: {currencySymbol(currency)}{projectedReturns.toFixed(2)}</h3>
          {chartData && <Pie data={chartData} />}
          {barChartData && (
            <>
              <h3>Yearly Returns Breakdown</h3>
              <Bar data={barChartData} />
            </>
          )}
        </div>
      )}
      {projectedReturns !== null && (
        <button className="download-btn" onClick={downloadPDF}>
          Download PDF
        </button>
      )}
      <button className="toggle-dark-mode-btn">
  <input 
    type="checkbox" 
    id="darkModeToggle" 
    checked={darkMode} 
    onChange={() => setDarkMode(!darkMode)} 
  />
  <label htmlFor="darkModeToggle"></label>
  <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
</button>

    </div>
  );
};

export default InvestmentForm;
