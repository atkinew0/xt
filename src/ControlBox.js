import React from 'react';
import { EventEmitter } from 'events';

const PORT = '3001';
const HOST = `127.0.0.1:${ PORT }`;

const style = {
    float:'left',
    width:"200px",
    height:"800px",
    border:"black solid 2px"
}

export default class ControlBox extends React.Component {
    constructor(props){
        super(props);

        this.index = 0;
    }

    handleClick = (event) => {
       
        //when you click on Level x load in questions for that level
        
        
        const theReq = `http://${ HOST }/api/level/${event.target.value}`;

        fetch(theReq, { method:'GET'}).then( res => {
            if(!res.ok) console.log(res.status);

            res.text().then(resText => {
                console.log(resText);
                let resjson = JSON.parse(resText);
                this.props.questionsCall(resjson);
            });

            this.props.focus();
        })
    }
    renderStyle = (elem) => {
        if(elem.finished){
            return { border:'solid green 3px'};
        }else if(elem.selected){
            return {border:'solid red 3px'};
        }else{
            return {};
        }
    }


    renderWords(){

        if(!this.props.words) return <p>loading</p>;

        return this.props.words.map((elem, index) => {
           
            return <li value={index+1} style={this.renderStyle(elem)} onClick={this.handleClick} key={this.index++}>{elem.name}</li>;
        })
    }

    render(){
        return (
            <div style={style}><span style={ {border:'2px solid black'} }>Levels</span>
            <ul>
            {this.renderWords()}
            </ul>
            </div>
        );
    }


}