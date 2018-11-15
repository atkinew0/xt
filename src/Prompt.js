import React from 'react';


export default class Prompt extends React.Component {



    render(){
        

    return <div style={{background:this.props.color}}>{this.props.prompt} </div>;
    }


}