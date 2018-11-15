import React from 'react';
import Popup from './Popup';


export default class Command extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            renderPop:false
        };

        
    }

    onClose = () => {
        this.setState({renderPop:false});
    }

    renderPop(){
        console.log("renderpop getting called");
        if(this.state.renderPop){
            return <Popup close ={this.onClose} data={this.props.data} />
        }
    }
    
    handleClick = (element) => {
        console.log("Clicked on me with data",element, element.typed,this.props.data);
        this.setState( {renderPop:true} );
        //rendering a Popup will go here when clicked
    }

    render(){
        return (
        <div>
            <li onClick={this.handleClick} >{this.props.data.command}</li>
            {this.renderPop()}
            </div>
        );
    }

}