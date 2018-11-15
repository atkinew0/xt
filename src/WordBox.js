import React from 'react';
import Command from './Command';

const style = {
    float:'left',
    position:'relative',
    width:"200px",
    height:"800px",
    border:"black solid 2px"
}

export default class WordBox extends React.Component {
    constructor(props){
        super(props);

        
        this.index = 0;
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
            <p style={{position:'absolute',bottom:'0'}}>All Commands</p>
            </div>
        );
    }


}