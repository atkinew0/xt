import React from 'react';
import Command from './Command';

const style = {
    float:'left',
    position:'relative',
    width:"200px",
    height:"800px",
    border:"black solid 2px"
}

const PORT = '3001';
const HOST = `127.0.0.1:${ PORT }`;

export default class WordBox extends React.Component {
    constructor(props){
        super(props);

        
        this.index = 0;
    }

    handleClick = () =>{

        this.props.setmode("srs");
        this.props.focus();

        const theRequest = `http://${HOST}/api/srs`;

        fetch(theRequest,{ method:'GET'}).then( response => {

            response.text().then( resText => {
                console.log(resText);
                let resJSON = JSON.parse(resText)
                this.props.questionsCall(resJSON);
            })
        })

    }

    

    renderWords(){

        if(!this.props.words) return <p>loading</p>;

        return this.props.words.map(elem => {
            return <Command key={this.index++} data={elem}/>;
        })
    }

    render(){
        
        return (
            <div style={style}><span style={ {border:'2px solid black'} }>Commands</span>
            <ul>
            {this.renderWords()}
            </ul>
            <p onClick={this.handleClick} style={{position:'absolute',bottom:'0'}}>Review Commands</p>
            </div>
        );
    }


}