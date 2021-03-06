/*****************************************************
This is the root Dashboard component
*****************************************************/
import React from 'react';
import Dropdown from 'react-dropdown';

import {FilterCondition,ParseLineData,ParseBarData} from './_dataPrep';
import {LineChart,TornadoChart} from './_chartTypes';
import 'react-dropdown/style.css';


// Define the root Dashboard component
export class Dashboard extends React.Component {
    // Establish the internal state of the Dashboard
    constructor(props) {
        super(props);
        // The options for choosing LabTest name, unit, and order date
        this.rawJSON = props.labData.value;
        this.testOptions = [...new Set( props.labData.value.map(row=>row.wc_test) )];
        this.unitOptions = [...new Set( props.labData.value.map(row=>row.wc_units) )];
        this.dateOptions = [...new Set( props.labData.value.map(row=>row.wc_orderdate) )];
        // The Dashboard internal state includes:
        //   1) the Dashboard's currently selected:  LabTest name
        //   2) the Dashboard's currently selected:  LabTest unit of measure
        //   3) the Dashboard's currently selected:  LabTest order date
        this.state = {
            selectedTest: this.testOptions[0],
            selectedDate: this.dateOptions[0],
            selectedUnit: this.unitOptions[0]
        };
        // Bind the event handler functions
        this.onSelectTest = this.onSelectTest.bind(this);
        this.onSelectDate = this.onSelectDate.bind(this);
    }

    // Method to handle the dropdown selection event:  Choosing a test name
    onSelectTest(choice) {
        this.setState( {selectedTest: choice.label} );
        const chosenUnit = this.rawJSON.find(row => row.wc_test===choice.label).wc_units;
        this.setState( {selectedUnit: chosenUnit} );
    }

    // Method to handle the dropdown selection event:  Choosing a test date
    onSelectDate(choice) {
        this.setState( {selectedDate: choice.label} );
    }

    // Method to prepare the Props for a LineChart
    CreateLineProps() {
        const TEST = this.state.selectedTest;
        
        // Extract the relevant info from the raw JSON
        const units = this.state.selectedUnit;
        const {dates,min,max,value} = ParseLineData(
            FilterCondition(this.rawJSON, {test:TEST})
        );
        const chartData = {
            labels: dates,
            datasets: [
                {
                    label: 'Result',
                    fill: false,
                    lineTension: 0.5,
                    backgroundColor: 'rgba(255,170,170,1)',
                    borderColor: 'rgba(255,79,122,1)',
                    borderWidth: 3,
                    pointRadius: 5,
                    data: value
                },
                {
                    label: 'Healthy',
                    fill: '+1',
                    pointRadius: 0,
                    pointHitRadius: 0,
                    backgroundColor: 'rgba(230,230,230,0.5)',
                    borderColor: 'rgba(0,0,0,1)',
                    borderWidth: 1,
                    data: min
                },
                {
                    label: 'Max',
                    fill: false,
                    pointRadius: 0,
                    pointHitRadius: 0,
                    backgroundColor: 'rgba(230,230,230,0.5)',
                    borderColor: 'rgba(0,0,0,1)',
                    borderWidth: 1,
                    data: max
                }
            ]
        }
        return {TEST,units,chartData};
    }
    
    // Method to prepare the Props for a TornadoChart
    CreateTornadoProps() {
        const DATE = this.state.selectedDate;
        
        // Extract the relevant info from the raw JSON
        const {tests,scaledValue} = ParseBarData(
            FilterCondition(this.rawJSON, {date:DATE})
        );
        const chartData = {
            labels: tests,
            datasets: [
                {
                    minBarLength: 1,
                    label: 'Standardized Result',
                    backgroundColor: 'rgba(255,99,132,0.2)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 2,
                    hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                    hoverBorderColor: 'rgba(255,99,132,1)',
                    data: scaledValue
                },
                {
                    type: 'line',
                    label: 'Healthy',
                    fill: '+1',
                    pointRadius: 0,
                    pointHitRadius: 0,
                    pointHoverRadius: 0,
                    backgroundColor: 'rgba(230,230,230,0.5)',
                    borderColor: 'rgba(0,0,0,1)',
                    borderWidth: 0.5,
                    data: [{x:-1,y:-0.5},{x:-1,y:6.5}]
                },
                {
                    type: 'line',
                    label: 'Max',
                    fill: true,
                    pointRadius: 0,
                    pointHitRadius: 0,
                    pointHoverRadius: 0,
                    backgroundColor: 'rgba(230,230,230,0.5)',
                    borderColor: 'rgba(0,0,0,1)',
                    borderWidth: 0.5,
                    data: [{x:1,y:-0.5},{x:1,y:6.5}]
                }
            ]
        }
        return {DATE,chartData};
    }
    
    // Render the Dashboard component
    render() {
        // Create the Line Chart data
        const lineProps = this.CreateLineProps();
        const testName = lineProps.TEST;
        const testUnits = lineProps.units;
        const lineData = lineProps.chartData;
        // Create the Tornado Chart data
        const tornadoProps = this.CreateTornadoProps();
        const testDate = tornadoProps.DATE;
        const barData = tornadoProps.chartData;
        
        return (
        <div className='background Dashboard-flexbox'>
            <div className="shadow">
                <div className='Dropdown-banner'>
                    <Dropdown options={this.testOptions} onChange={this.onSelectTest} value={testName} />
                </div>
                <LineChart test={testName} units={testUnits} data={lineData}
                    click={ elem => {
                        if (elem[0]) {                            
                            this.setState({selectedDate: this.dateOptions[elem[0]._index]});
                        }
                    }}
                />
            </div>
            <div className="shadow">
                <div className='Dropdown-banner'>
                    <Dropdown options={this.dateOptions} onChange={this.onSelectDate} value={testDate} />
                </div>
                <TornadoChart date={testDate} data={barData}
                    click={ elemArr => {
                        if (elemArr[0]) {
                            const chosenTest = this.testOptions[elemArr[0]._index];
                            this.setState({selectedTest: chosenTest});
                            this.setState({selectedUnit: this.rawJSON.find(row => row.wc_test===chosenTest).wc_units});
                        }
                    }}
                />
            </div>
        </div>
        );
    }
}
