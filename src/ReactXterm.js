/* eslint-disable no-use-before-define */
import React from 'react';
import WordBox from './WordBox';
import ControlBox from './ControlBox';
import Prompt from './Prompt';
import PropTypes from 'prop-types';
import { Terminal } from 'xterm';
// import * as attach from 'xterm/lib/addons/attach/attach';
import * as attach from './addons/attach';
import * as fit from 'xterm/lib/addons/fit/fit';
import * as fullscreen from 'xterm/lib/addons/fullscreen/fullscreen';
import * as search from 'xterm/lib/addons/search/search';
import * as winptyCompat from 'xterm/lib/addons/winptyCompat/winptyCompat';
import { runInThisContext } from 'vm';

var parser = require('./parseCom')
parser.init();

//import getId from '../helpers/getId';

Terminal.applyAddon(attach);
Terminal.applyAddon(fit);
Terminal.applyAddon(fullscreen);
Terminal.applyAddon(search);
Terminal.applyAddon(winptyCompat);

const PORT = '3001';
const HOST = `127.0.0.1:${ PORT }`;
const SOCKET_URL = `ws://${ HOST }/terminals/`;

export default class ReactTerminal extends React.Component {
  constructor(props) {
    super(props);

    this.buffer = [];

    this.elementId = `terminal_1`;
    this.failures = 0;
    this.interval = null;
    this.fontSize = 16;
    this.state = {
      command: [],
      prompt: "prompt",
      questions: [],
      nextQuestion:0
    };
  }
  componentDidMount() {
    this.term = new Terminal({
      cursorBlink: true,
      rows: 24,
      fontSize: this.fontSize
    });

    this.term.open(document.getElementById('terminal-container'));
    this.term.winptyCompatInit();
    this.term.fit();
    this.term.focus();
    
    // this.term.on('resize', ({ cols, rows }) => {
    //   if (!this.pid) return;
    //   fetch(`http://${ HOST }/terminals/${ this.pid }/size?cols=${ cols }&rows=${ rows }`, { method: 'POST' });
    // });
    this.term.on('key', (key) => {

     
      console.log("State starting is",this.state.command);
      console.log(key.charCodeAt(0));
      parser.addChar(key);
      let command;
      let comm;

      if( key.charCodeAt())

      if(key.charCodeAt(0) === 13){
        console.log("Keycode 13, checking answer and command");
        this.checkAnswer(parser.repeat().join(""));
        
        //this.term.writeln("echo !!");
        setTimeout(() => this.term._sendData("echo !!\r", 100));
        setTimeout(() => {
          comm = this.term._getCommand();
          console.log("Command in ReactXterm of ", comm);
          command  = parser.checkCommand(comm);
          parser.clear();
          console.log('Checkcommand returned', command);

          if(command){
            console.log("Parser sent back command", command);
            
            if(!this.state.command.includes(command)){
              this.setState( { command: [...this.state.command, command] } );
            }
          }
        }, 500);
        
        
      }
      
      //console.log("Command after checkBuffer",command);
     
    });

    this.term.decreaseFontSize = () => {
      this.term.setOption('fontSize', --this.fontSize);
      this.term.fit();
    };
    this.term.increaseFontSize = () => {
      this.term.setOption('fontSize', ++this.fontSize);
      this.term.fit();
    };
    this._connectToServer();

    // listenToWindowResize(() => {
    //   this.term.fit();
    // });
    this.term.fit();

    // this.term._core.register(this.term.addDisposableListener('key', (key, ev) => {
    //   const printable = !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey;
  
    //   if (ev.keyCode === 13) {
    //     this.term.prompt();
    //   } else if (ev.keyCode === 8) {
    //    // Do not delete the prompt
    //     if (this.term.x > 2) {
    //       this.term.write('\b \b');
    //     }
    //   } else if (printable) {
    //     this.term.write(key);
    //   }
    // }));
  
    // this.term._core.register(this.term.addDisposableListener('paste', (data, ev) => {
    //   this.term.write(data);
    // }));
    // this.term.on('key',function(key){
    //   console.log("Term got a key event");
    //   this.term.write(key);
    // })

    // this.term.textarea.onkeydown = e => {
    //   console.log(e.keyCode, e.shiftKey, e.ctrlKey, e.altKey);
    //   // ctrl + shift + metakey + +
    //   if ((e.keyCode === 187 || e.keyCode === 61) && e.shiftKey && e.ctrlKey && e.altKey) {
    //     this.term.setOption('fontSize', ++this.fontSize);
    //     this.term.fit();
    //   }
    //   // ctrl + shift + metakey + -
    //   if ((e.keyCode === 189 || e.keyCode === 173) && e.shiftKey && e.ctrlKey && e.altKey) {
    //     this.term.setOption('fontSize', --this.fontSize);
    //     this.term.fit();
    //   }
    //   // ctrl + shift + metakey + v
    //   if (e.keyCode === 86 && e.shiftKey && e.ctrlKey && e.altKey) {
    //     this.props.options.splitVertical && this.props.options.splitVertical();
    //   }
    //   // ctrl + shift + metakey + h
    //   if (e.keyCode === 72 && e.shiftKey && e.ctrlKey && e.altKey) {
    //     this.props.options.splitHorizontal && this.props.options.splitHorizontal();
    //   }
    //   // ctrl + shift + metakey + w
    //   if (e.keyCode === 87 && e.shiftKey && e.ctrlKey && e.altKey) {
    //     this.props.options.close && this.props.options.close();
    //   }
    // };
  }
  componentWillUnmount() {
    clearTimeout(this.interval);
  }


  handleQuestions = (questionsArray) => {
    //this will be called from controlbox which does a db query to get questions
  
    this.setState({questions:questionsArray}, this.updatePrompt);
    
  }

  updatePrompt(){
    //sets the top prompt to be whatever the first unanswered question is
    let questions = this.state.questions;
    console.log("Here in updatePrompt the questions are",questions, questions.length, typeof questions);

    for(let i = 0; i < questions.length;i++){
      if(questions[i].answered == false){
        console.log("QUestions i answered was false, setting prompt to that",questions[i]);
        this.setState({prompt:questions[i].prompt, nextQuestion:questions[i].id });
  
      }
    }
  }

  checkAnswer(answer){
    //this method finds the first unanswered question in state and matches answer against it

    answer = answer.replace(/[^\x20-\x7E]/g, '');
    console.log("checking answer", answer, " id question",this.state.nextQuestion)
    let questions = this.state.questions;

    
    questions.forEach(question => {
      if(question.id === this.state.nextQuestion){
        if(question.answer.trim() == answer.trim()){
          console.log("Answer matched question.answer");
          question.answered = true;
          this.setState({questions:questions}, this.updatePrompt);
        }
      } 
    });

    
    console.log("Now state of questions is", this.state.questions);
  }

 
  render() {
    return (
      <div>
        <Prompt prompt={this.state.prompt}/>
        <WordBox words={this.state.command}/>
    <div id={"terminal-container"}  style={{
      float:'left', top: 0, left: 0, width: '80', height: '100%'
    }}></div>;
    <ControlBox questionsCall={this.handleQuestions} words={["Level 1"]}/>
    </div>
    )
  }



  _connectToServer() {

    const theReq = `http://${ HOST }/terminals/?cols=${ this.term.cols }&rows=${ this.term.rows }`;

    fetch(
      theReq,
      { method: 'POST' }
    ).then(
      res => {
        if (!res.ok) {
          this.failures += 1;
          if (this.failures === 2) {
            this.term.writeln(
              'There is back-end server found but it returns "' +
              res.status + ' ' + res.statusText + '".'
            );
          }
          this._tryAgain();
          return;
        }
        res.text().then(processId => {
          this.pid = processId;
          this.socket = new WebSocket(SOCKET_URL + processId);
          console.log("The socket at",SOCKET_URL+processId);
          console.log("Socket",this.socket);
          this.socket.onopen = () => {
            this.term.attach(this.socket, true , false, (comp) => { console.log("Callback" ,comp)} );
            this.term.writeln("Welcome to the beginning of mastershell");
          };
          this.socket.onclose = () => {
            this.term.writeln('Server disconnected!');
            this._connectToServer();
          };
          this.socket.onerror = () => {
            this.term.writeln('Server disconnected!');
            this._connectToServer();
          };
        });
      },
      error => {
        this.failures += 1;
        if (this.failures === 2) {
          this.term.writeln('It looks like there is no backend. You have to:');
          this.term.writeln('> npm install evala -g');
          this.term.writeln('> evala --shell=$SHELL');
        }
        console.error(error);
        this._tryAgain();
      }
    );
  }
  _tryAgain() {
    clearTimeout(this.interval);
    this.interval = setTimeout(() => {
      this._connectToServer();
    }, 2000);
  }
};

ReactTerminal.propTypes = {
  options: PropTypes.object
};

function listenToWindowResize(callback) {
  var resizeTimeout;

  function resizeThrottler() {
    // ignore resize events as long as an actualResizeHandler execution is in the queue
    if (!resizeTimeout) {
      resizeTimeout = setTimeout(function () {
        resizeTimeout = null;
        callback();
      }, 66);
    }
  }

  window.addEventListener('resize', resizeThrottler, false);
}