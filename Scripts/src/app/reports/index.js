var React = require('react');
var ReactDOM = require('react-dom');

var Component = React.Component;
import CanvasJSReact from './canvasjs.react';

var CanvasJSChart = CanvasJSReact.CanvasJSChart;
var CanvasJS = CanvasJSReact.CanvasJS;

class StackedColumnChart extends Component {
	constructor() {
		super();
        this.toggleDataSeries = this.toggleDataSeries.bind(this);
        this.handleReportDataChange = this.handleReportDataChange.bind(this);

        this.state = {
            reportOptions:{}
        }
	}
	toggleDataSeries(e){
		if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
			e.dataSeries.visible = false;
		}
		else{
			e.dataSeries.visible = true;
		}
		this.chart.render();
    }
    
    handleReportDataChange(e){
        //console.log('report data changed. Need to rerender report.');
console.log(e.reportOptions);

console.log(e.reportOptions.customColorSet);
        CanvasJS.addColorSet("customColorSet",
        e.reportOptions.customColorSet); 

        this.setState({
            reportOptions: e.reportOptions
          });
        //console.log(e);
    }

    componentDidMount(){
        postal.subscribe({
            channel: 'report',
            topic: 'data.changed',
            callback: this.handleReportDataChange.bind(this)
          });
    }

	render() {


        if (CanvasJSChart == null){

            return (<div> no CanvasJSChart </div>);
        }


		const options = {};
        
		return (
		<div>
			<CanvasJSChart options = {this.state.reportOptions}
				 onRef={ref => this.chart = ref}
			/>
			{/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
		</div>
		);
	}
}                      

ReactDOM.render(<StackedColumnChart />, document.getElementById('div-report-root'));