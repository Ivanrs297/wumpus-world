import React, { Component } from 'react';
import { FaMale, FaOptinMonster, FaCircle, FaGem, FaPoo, FaAlignCenter, FaEye } from 'react-icons/fa';
import SweetAlert from 'sweetalert-react';


import './App.css';

const timeout = ms => new Promise(res => setTimeout(res, ms))

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      sizeMap: {
        y: [4 ,3, 2, 1],
        x: [1, 2, 3, 4]
      },
      agent: {x: 0, y: 3},
      monster: {x: 1, y: 2},
      pits: [],
      gold: {x: 1, y: 4},
      worldMatrix: [[]],
      gotGold: false,
      path: [{x: 0, y: 3}], // la ruta que toma
      won: false, // gano ?
      lost: false, // sin opciones
      dificultLevel: 1,
      gameStart: false,
      onGame: false
    }
  }

  async componentDidMount(){
    // await this.initWorld();
  }

  async startGame(){
    await this.setState({gameStart: true})
    await this.initWorld();
  }

  async resetAll(){
    await this.setState({ 
      gameStart: false,
      gotGold: false,
      path: [{x: 0, y: 3}],
      won: false,
      lost: false,
      onGame: false
    })
    await this.initWorld()
  }

  async resetWorld(){
    await this.setState({ 
      gotGold: false,
      path: [{x: 0, y: 3}],
      won: false,
      lost: false,
      onGame: false
    })
    await this.initWorld()
    
  }

  async initWorld(){
    let coords= []
    let randX, randY;

    // ubicacion aleatorio de monstruo y oro
    for (let i = 0; i < 2; i++){
      
      while (true){
        randX = Math.floor((Math.random() * 4))
        randY = Math.floor((Math.random() * 4))
        break;
      }

      if(randX == 0 && randY == 3){
        this.resetWorld();
      }

      coords.push({
        x: randX,
        y: randY,
      })
    }

    //ubicacion de los agujeros
    let pits = [];

    for (let y = 0; y <= 3; y++){
      for (let x = 0; x <= 3; x++){

        if (x === 0 && y === 3){
          break;
        }
        if (Math.floor(Math.random() * 100) <= 20){
          pits.push({
            x: x,
            y: y,
          })
        }
      }
    }
    
    await this.setState({
      agent: {x: 0, y: 3},
      monster: coords[0],
      pits: pits,
      gold: coords[1],
      path: [{x: 0, y: 3}]
    })

    await this.mapWorldMatrix();
  }

  handleChangeLevel(e){
      this.setState({dificultLevel: parseInt(e.target.value) });
  }

  _renderAgent(){
    return(
      <div className="icon">
        <FaMale color="#000066"/> 
      </div>
    );
  }

  _renderMonster(){
    return(
      <div className="icon">
        <FaOptinMonster color="#008000"/> 
      </div>
    );
  }

  _renderPit(){
    return(
      <div className="big-icon">
        <FaCircle color="rgba(0,0,0,.8)"/> 
      </div>
    );
  }

  _renderGold(){
    return(
      <div className="icon">
        <FaGem color="#FFD700"/> 
      </div>
    );
  }

  _renderStench(){
    return(
      <div className="small-icon-left">
        <FaPoo color="#8B4513"/> 
      </div>
    );
  }

  _renderBreeze(){
    return(
      <div className="small-icon-right">
        <FaAlignCenter color="#ADD8E6"/> 
      </div>
    );
  }

  _renderVisited(){
    return(
      <div className="small-icon-left-bottom">
        <FaEye color="#FFA500"/> 
      </div>
    );
  }

  renderBoard(){
    return(
      <table id="board">
      <tbody>
        {this.state.worldMatrix.map((itemY, indexY) => {
          return(
          <tr key={indexY}>
            {itemY.map((itemX, indexX) =>{
              return(
                <td key={indexX} >
                  <p className="coordTxt">{(indexX + 1) + "," + (4 - indexY)}</p>
                    {itemX.V ? this._renderVisited() : null}
                    {itemX.P ? this._renderPit() : null }
                    {itemX.W ? this._renderMonster() : null }
                    {itemX.G ? this._renderGold() : null }
                    {itemX.S ? this._renderStench() : null }
                    {itemX.B ? this._renderBreeze() : null }
                    {itemX.A ? this._renderAgent() : null }
                </td>
              );
            })}
          </tr>
          );
        })}
        </tbody>
      </table>
    );
  }

  async nextAgentMove(){

    let auxMatrix = this.state.worldMatrix;
    let auxAgent = this.state.agent;
    let auxPath = this.state.path.slice()

    if (this.state.gotGold){
      // console.log("auxPath: ", auxPath)
      let backMove = auxPath.pop()
      auxMatrix[this.state.agent.y][this.state.agent.x].A = false
      auxMatrix[this.state.agent.y][this.state.agent.x].V = true
      auxMatrix[backMove.y][backMove.x].A = true
      auxMatrix[this.state.agent.y][this.state.agent.x].G = false
      auxMatrix[backMove.y][backMove.x].G = true
      auxAgent.x = backMove.x;
      auxAgent.y = backMove.y;
    }
    else if (auxAgent.y - 1 >= 0 &&
        !auxMatrix[auxAgent.y - 1][auxAgent.x].P &&
        !auxMatrix[auxAgent.y - 1][auxAgent.x].V &&
        !auxMatrix[auxAgent.y - 1][auxAgent.x].W
      ){
        auxMatrix[auxAgent.y][auxAgent.x].A = false
        auxMatrix[auxAgent.y][auxAgent.x].V = true
        auxMatrix[auxAgent.y - 1][auxAgent.x].A = true
        auxPath.push({
          x: auxAgent.x,
          y: auxAgent.y - 1
        })
        auxAgent.y -= 1
    }
    else if (auxAgent.y + 1 <= 3 &&
      !auxMatrix[auxAgent.y + 1][auxAgent.x].P &&
      !auxMatrix[auxAgent.y + 1][auxAgent.x].V &&
      !auxMatrix[auxAgent.y + 1][auxAgent.x].W
    ){
      auxMatrix[auxAgent.y][auxAgent.x].A = false
      auxMatrix[auxAgent.y][auxAgent.x].V = true
      auxMatrix[auxAgent.y + 1][auxAgent.x].A = true
      auxPath.push({
        y: auxAgent.y + 1,
        x: auxAgent.x
      })
      auxAgent.y += 1
    }
    else if (auxAgent.x + 1 <= 3 &&
      !auxMatrix[auxAgent.y][auxAgent.x + 1].P &&
      !auxMatrix[auxAgent.y][auxAgent.x + 1].V &&
      !auxMatrix[auxAgent.y][auxAgent.x + 1].W
    ){
      auxMatrix[auxAgent.y][auxAgent.x].A = false
      auxMatrix[auxAgent.y][auxAgent.x].V = true
      auxMatrix[auxAgent.y][auxAgent.x + 1].A = true
      auxPath.push({
        y: auxAgent.y,
        x: auxAgent.x + 1
      })
      auxAgent.x += 1
    }
    else if (auxAgent.x - 1 >= 0 &&
      !auxMatrix[auxAgent.x][auxAgent.x - 1].P &&
      !auxMatrix[auxAgent.x][auxAgent.x - 1].V &&
      !auxMatrix[auxAgent.x][auxAgent.x - 1].W
    ){
      auxMatrix[auxAgent.y][auxAgent.x].A = false
      auxMatrix[auxAgent.y][auxAgent.x].V = true
      auxMatrix[auxAgent.y][auxAgent.x  - 1].A = true
      auxPath.push({
        y: auxAgent.y,
        x: auxAgent.x - 1
      })
      auxAgent.x -= 1
    }
    else {
      this.setState({ lost: true });
      return;
    }

    await this.setState({ 
      agent: auxAgent, 
      worldMatrix: auxMatrix,
      path: auxPath,
    })

    if (this.state.worldMatrix[this.state.agent.y][this.state.agent.x].G){
      await this.setState({ gotGold: true})
    }

    if (this.state.agent.y === 3 && this.state.agent.x === 0 && this.state.gotGold ){
      await this.setState({ won: true})
    }

  }

  mapWorldMatrix(){
    let matrix = []

    // init matrix
    for (let y = 0; y <= 3; y++){
      matrix[y] = [];
      for (let x = 0; x <= 3; x++){
        matrix[y][x] = {
          A: false,  //Agent
          B: false,  //Breeze
          G: false,  //Glitter, Gold
          OK: false, //Safe square
          P: false, //Pit
          S: false,  //Stench
          V: false,  //Visited
          W: false,  //Wumpus
        }
      }
    }

    matrix[this.state.agent.y][this.state.agent.x].A = true;
    matrix[this.state.gold.y][this.state.gold.x].G = true;

    if (this.state.dificultLevel >= 2){
      matrix[this.state.monster.y][this.state.monster.x].W = true;
      if (this.state.monster.y - 1 >= 0)
        matrix[this.state.monster.y - 1][this.state.monster.x].S = true
      if (this.state.monster.y + 1 <= 3)
        matrix[this.state.monster.y + 1][this.state.monster.x].S = true
      if (this.state.monster.x + 1 <= 3)
        matrix[this.state.monster.y][this.state.monster.x + 1].S = true
      if (this.state.monster.x - 1 >= 0)
        matrix[this.state.monster.y][this.state.monster.x - 1].S = true
    }

    if (this.state.dificultLevel >= 3){
      this.state.pits.forEach((item, index) => {
        matrix[item.y][item.x].P = true;
        if (item.y - 1 >= 0)
          matrix[item.y - 1][item.x].B = true
        if (item.y + 1 <= 3)
          matrix[item.y + 1][item.x].B = true
        if (item.x - 1 >= 0)
          matrix[item.y][item.x - 1].B = true
        if (item.x + 1 <= 3)
          matrix[item.y][item.x + 1].B = true
      })
    }

    this.setState({worldMatrix: matrix});
  }

  async autoMoveAgent(){
    this.setState({ onGame: true })
    while (true){
      if (this.state.won || this.state.lost){ return }
      this.nextAgentMove()
      await timeout(500);
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Wumpus World 2018 - IRA</h1>
        </header>

        <div className="content">

          <ul className="list-inline icons">
            <li><FaEye color="#FFA500"/> Casilla visitada  </li>
            <li><FaCircle color="rgba(0,0,0,.8)"/> Agujero  </li>
            <li><FaOptinMonster color="#008000"/> Monstruo Wumpus  </li>
            <li><FaGem color="#FFD700"/> Oro  </li>
            <li><FaPoo color="#8B4513"/> Caca de Wumpus  </li>
            <li><FaAlignCenter color="#ADD8E6"/> Brisa de viento   </li>
            <li><FaMale color="#000066"/>  Agente  </li>
          </ul>

          <div className="world">

            

            {this.state.gameStart ? this.renderBoard() : null}
          </div>

          <div className="menu">
          
         
            {this.state.gameStart ?
              <ul className="list-inline">
                <li>
                  <button
                    onClick={() => {
                      this.autoMoveAgent()
                    }}
                    disabled={this.state.won || this.state.lost || this.state.onGame}
                    className="btn btn-success">Comenzar</button>
                </li>
                <li>
                  <button 
                    onClick={() => this.resetWorld()}
                    className="btn btn-warning">Resetear</button>
                </li>
                <li>
                  <button 
                    onClick={() => this.resetAll()}
                    className="btn btn-danger">Cambiar Dificultad</button>
                </li>
              </ul>
            :
              <ul className="list-inline">
                <li>
                  <div className="form-group">
                    <label>Nivel</label>
                    <select 
                      className="form-control"
                      id="level"
                      value={this.state.dificultLevel} 
                      onChange={(e) => this.handleChangeLevel(e)} 
                    >
                      <option value="1">Fácil</option>
                      <option value="2">Medio</option>
                      <option value="3">Dificil</option>
                    </select>
                  </div>
                </li>
                <li>
                  <button
                    onClick={() => {
                      this.startGame()
                    }}
                    className="btn btn-success">Empezar</button>
                </li>
              </ul>
            }
            {this.state.won ?
              <h2>El agente se ha llevado el oro con éxito!</h2>
              
            : null}
            {this.state.lost ?
              <h2>El agente se ha perdido :(</h2>
            : null}
          </div>

        </div>

      </div>
    );
  }
}

export default App;
