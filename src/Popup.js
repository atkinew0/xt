import React from 'react';

const PORT = '3001';
const HOST = `127.0.0.1:${ PORT }`;

const style = {
    border: '2px black solid',
    background: 'pink',
    width: '600px',
    height:'450px',
    position: 'absolute',
    left: '100px',
    top: '150px',
    zIndex: '100'
    }

export default class Popup extends React.Component {
    constructor(props){
        super(props)

        this.state ={
            command: this.props.data.typed,
            display:"",
            prompt:"",
            level:0
        }
    }

    componentWillMount(){
        this.setState({display:this.props.data.typed.slice(-1)[0]});
    }

    onChange = field => e => {
        this.setState({
            [field]: e.target.value
        });
    }

    onSubmit = () => {

        const theBody = {
            //id: will be determined by server checking next id in DB for the level
            prompt:this.state.prompt,
            answer:this.state.display,
            answered:false,
            level:this.state.level
        }

        const theReq = `http://${ HOST }/api/level/1`;

        fetch(theReq, {
            body: JSON.stringify(theBody), // data can be `string` or {object}!
            headers:{
            'Content-Type': 'application/json'
            },
            method:'POST'}).then( res => {
            if(!res.ok) console.log(res.status);

            res.text().then(resText => {
                console.log(resText);
                this.props.close();
            });


        })
    }

    renderOptions(){

        return this.props.data.typed.map((typed, index) => {
            return <option key={index} value={typed}>{typed}</option>
        });
    }

    selectOption= (event) => {
        console.log("Selected, rendering")
        this.setState({display: event.target.value});
    }

    render(){

        return (
            <div>
                <div style={style}>Add your command to Database
                <form>
                    <select onChange={this.selectOption}>
                        {this.renderOptions()}
                    </select>
                    <label>Command</label><input onChange={this.onChange('command')} value ={this.state.display} type="text"></input><br/>
                    <label>Prompt</label><input onChange={this.onChange('prompt')} type="text"></input><br/>
                    <label>Level</label><input onChange={this.onChange('level')} type="text"></input><br/>
                <button type="button" onClick={this.props.close}>Close </button>
                <button type="button" onClick={this.onSubmit}>Submit</button>
                </form>
                </div>;
                
            </div>
        )
    }


}