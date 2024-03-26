import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap/gsap-core';
import { useLocation } from 'react-router-dom';



const loader = new GLTFLoader();
let loaderGltf
let racket1 = null
let racket2 = null
let ball = null
let startVal = 0
let running = false
let preparationNewRound = false
let keyListenerActive = false
let newRound = true
let keysPressed = {}
let stop = false
let playerId
let nameServer
let leftKey = false
let rightKey = false
let isPlayerReady = false
let side

let deltaTime = 0.0166

let speedPaddle = 7.5;
let speedBall = 10;
let playeurSize = 2;
let rayonBall = 0.207;

let largSize = 15.4;
let longSize = 22;

let clockActiv = false
let infoIsReady = false

let countMoov = 0
let lastDir = 0;

let tmpBall = null

const Pong = ({ stateGame, updateSetState, formData8, formData4, formData2, winnerTournament, score, updateSetScore, racketColor, selectedKeys, client, findOnlineGame, newUrl, username, userId, gameId, position, rotation }) => {
	console.log(ball);
	const location = useLocation()
  if (racket1 && racket2){
    racket1.material = new THREE.MeshBasicMaterial({ color: racketColor })
    racket2.material = new THREE.MeshBasicMaterial({ color: racketColor })
  }

    // Chargement du model 3d
    const [gltf, setGltf] = React.useState(null);
    React.useEffect(() => {
		if (clockActiv === false)
		{
			if (tmpBall === null) {
				tmpBall = {}; // Créez un nouvel objet tmpBall s'il est null
			}
			if (typeof tmpBall.vector === 'undefined'){
				tmpBall.vector = {
					x: 0,
					z: 0
				}
			}
			if (typeof tmpBall.position === 'undefined'){
				tmpBall.position = {
					z: 0,
					x: 11,
					y: 0.5
				}
			}
			if (typeof tmpBall.speed === 'undefined'){
				tmpBall.speed = speedBall
			}
			clockActiv = true
    		setInterval(getPositionOfBall, 1000);
  		}
    	loader.load('./pong.glb', (loadedGltf) => {
        setGltf(loadedGltf);
        loaderGltf = loadedGltf
        loadedGltf.scene.traverse((child) => {
          child.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        if (child.name === 'Player1'){
          racket1 = child			// vitesse des paddle = 2 
          racket1.position.z = 0    // 7,7max et -7,7 min donc la largeur fait 15,4     2 tant la taille du paddle
          racket1.position.x = 11   // rayon de la balle 0,207
          racket1.position.y = 0.5  // d'un bute a l'autre c'est 22 (donc 11 a partir du milieu)
        }else if (child.name === 'Player2'){
          racket2 = child
          racket2.position.z = 0
          racket2.position.x = -11
          racket2.position.y = 0.5
        }else if (child.name === 'Ball'){
          ball = child
          ball.position.x = 0
          ball.position.y = 0.5
          ball.position.z = 0
          if (typeof ball.vector === 'undefined')
          {
            ball.vector = {
              x: 0,
              z: 0
            };
          }
          if (typeof ball.speed === 'undefined')
          {
            ball.speed = speedBall;
          }



          if (typeof ball.velocity === 'undefined') {   //vas etre bientot supprimer
            ball.velocity = {
              x: 0,
              z: 0
             };
          }
          if (typeof ball.stopped === 'undefined') {
            ball.stopped = true
          }
        }
        })
      }, undefined, (error) => {
        console.error('Erreur lors du chargement du fichier GLTF', error);
      });
	  
    }, []);
    
	function startBallMovement() {
	let ball_z;
	let ball_x =  Math.random() < 0.5 ? -1 : 1;
	while (1) {
		ball_z = Math.random() * (0.5 - (-0.5)) + (-0.5);
		if (ball_z !== 0){
			break;
		}
	}
	ball.vector = {
		x: ball_x,
		z: ball_z
	}
  }
  
  function processBallMovement() {
    
    if(startVal === 0) {
      startBallMovement();
      startVal++
    }
    if(ball.$stopped) {
      return;
    }
    updateBallPosition();
    
    if(isSideCollision()) {
		ball.vector.z *= -1;
    }
    
    if(isPaddle1Collision()) {
      hitBallBack(racket1)
    }
    
    if(isPaddle2Collision()) {
      hitBallBack(racket2)
    }
    
    if(isPastPaddle1()) {
      scoreBy('player2')
      return
    }
    
    if(isPastPaddle2()) {
      scoreBy('player1')
      return
    }
  }
  
  function isPastPaddle1() {
    return ball.position.x > racket1.position.x;
  }
  
  function isPastPaddle2() {
    return ball.position.x < racket2.position.x;
  }
  
  function updateBallPosition() {
    var ballPos = ball.position;
    
    ballPos.x += ball.vector.x * deltaTime * ball.speed;
    ballPos.z += ball.vector.z * deltaTime * ball.speed;
  }
  
  function isSideCollision() {
    var ballX = ball.position.z,
        halfFieldWidth = 15.4 / 2;
    return ballX - rayonBall < -halfFieldWidth || ballX + rayonBall > halfFieldWidth;
  }
  
  function hitBallBack(paddle) {
	ball.speed += 0.2
	ball.vector.x *= -1;
    ball.vector.z = (ball.position.z - paddle.position.z) / (playeurSize / 2); 
  }
  
  function isPaddle2Collision() {
    return ball.position.x - rayonBall <= racket2.position.x && 
        isBallAlignedWithPaddle(racket2);
  }
  
  function isPaddle1Collision() {
    return ball.position.x + rayonBall >= racket1.position.x && 
        isBallAlignedWithPaddle(racket1);
  }
  
  function isBallAlignedWithPaddle(paddle) {
    var halfPaddleWidth = 2 / 2,
        paddleX = paddle.position.z,
        ballX = ball.position.z;
    return ballX > paddleX - halfPaddleWidth && 
        ballX < paddleX + halfPaddleWidth;
  }



function endGame(winner)
{
    if (stateGame === 31){
      winner === 1 ? winnerTournament.player = 'player 1' : winnerTournament.player = 'player 2'
      updateSetState(32)
    }
    else if (stateGame === 41){
      winner === 1 ? formData4.player1 = formData8.player1 : formData4.player1 = formData8.player2
      updateSetState(42)
    } else if (stateGame === 43){
      winner === 1 ? formData4.player2 = formData8.player3 : formData4.player2 = formData8.player4
      updateSetState(44)
    }else if (stateGame === 45){
      winner === 1 ? formData4.player3 = formData8.player5 : formData4.player3 = formData8.player6
      updateSetState(46)
    }else if (stateGame === 47){
      winner === 1 ? formData4.player4 = formData8.player7 : formData4.player4 = formData8.player8
      updateSetState(48)
    }else if (stateGame === 49){
      winner === 1 ? formData2.player1 = formData4.player1 : formData2.player1 = formData4.player2
      updateSetState(140)
    }else if (stateGame === 141){
      winner === 1 ? formData2.player2 = formData4.player3 : formData2.player2 = formData4.player4
      updateSetState(142)
    }else if (stateGame === 143){
      winner === 1 ? winnerTournament.player = formData2.player1 : winnerTournament.player = formData2.player2
      updateSetState(144)
  }else if (stateGame === 51){
    winner === 1 ? winnerTournament.player = 'player 1' : winnerTournament.player = 'AI-bot'
    updateSetState(52)
  }
}

	function stopBall(){ 
    ball.stopped = true;
  }
  

  
  function startRender(){
    running = true;
    startVal = 0
    render();  
  }

  function stopRender() {
    running = false;
  }
  
  function render() {
    if(running) {
		setTimeout(render, 1000 / 60); // Appel à render() toutes les (1 / desiredFPS) secondes
		handleKeys()
    processBallMovement()
    if (stateGame > 50 && stateGame < 52)
      processBotPaddle()
    }
  }

  function scoreBy(playerName) {
      stopBall()
      stopRender()
      ball.material = new THREE.MeshBasicMaterial({ color: 0xff1500 });
      preparationNewRound = true
      if (playerName === "player1"){
        updateSetScore('player1', ++score.player1)
      }
        
      else if (playerName === "player2")
        updateSetScore('player2', ++score.player2)
      if (score.player1 === 5){
        setTimeout(reset(false), 2000)
        endGame(1)
        newRound = true
      } else if (score.player2 === 5){
        setTimeout(reset(false), 2000)
        endGame(2)
        newRound = true
      } else {
        gsap.to(ball.position, {
          duration: 1.5,
          onComplete: () => {
            setTimeout(reset(true), 2000)
          }
        })

        
      }
  }

  






  function getPositionOfBall()
  {
	infoIsReady = true;
  }



  function moov_right(){
	if (racket2.position.z <= (largSize / 2) - (playeurSize / 2)) //droite
        racket2.position.z += deltaTime * speedPaddle;
	console.log("moov_right");
  }

  function moov_left(){
	if (racket2.position.z >= (-largSize / 2) + (playeurSize / 2)) //gauche
        racket2.position.z -= deltaTime * speedPaddle;
	console.log("moov_left");
  }

  function processBotPaddle() {

    if (infoIsReady === true)
	{
		console.log("1 seconde timer");
    	infoIsReady = false;
		tmpBall.vector.x = ball.vector.x;
		tmpBall.vector.z = ball.vector.z;
		tmpBall.position.x = ball.position.x;
		tmpBall.position.z = ball.position.z;
		tmpBall.position.y = ball.position.y;
		tmpBall.speed = ball.speed;
	}
	


	if (tmpBall.position.x >= 11 || tmpBall.position.x <= -11)// ici la balle touche un des coter ou il y a les paddle, je n'interprete pas ou est le paddle pour reproduire un comportement humain
	{
		tmpBall.vector.z *= -1;
	}
	if (tmpBall.position.z >= 7,7 || tmpBall.position.z <= -7,7)// ici la balle touche un rebord, un humain comprend tres bien ce genre de rebond, donc calcule precis.
	{
		tmpBall.vector.x *= -1;
	}

	tmpBall.position.x += tmpBall.vector.x * deltaTime * tmpBall.speed;
	tmpBall.position.z += tmpBall.vector.z * deltaTime * tmpBall.speed;

	if (countMoov >= 10)
		countMoov = 0;
	else{
		countMoov++;
		if (lastDir === 1)
			moov_left();
		else if (lastDir === 2)
			moov_right();
		return;
	}

	let tmp = {
		x: tmpBall.position.x,
		z: tmpBall.position.z,
		Vx: tmpBall.vector.x,
		Vy: tmpBall.vector.x
	}
	let countTmp = 0;
	while (1)
	{
		countTmp++;
		tmp.x += tmp.Vx * deltaTime * ball.speed;
		if (tmp.x <= -longSize / 2 || tmp.x >= longSize / 2)
			break ;
		if (tmp.y - rayonBall <= -largSize / 2 || tmp.y + rayonBall <= largSize / 2)
			tmp.Vz *= -1;
		tmp.y += tmp.Vy * deltaTime * ball.speed;
	}

	console.log("TMP BALL : ", tmpBall.position.x);
	console.log("BALL      : ", ball.position.x);
	let tmpValue = racket2.position.z - tmpBall.position.z;
	if (tmpValue === 0 || (tmpValue < 0 && tmpValue >= -(playeurSize / 2) || tmpValue > 0 && tmpValue <= playeurSize / 2)){
		lastDir = 0;
		return ;
	}


	if(racket2.position.z > tmp.z) {
		lastDir = 1; //il ce dirige a gauche
		moov_left();
    	// racket2.position.z -= Math.min(racket2.position.z - tmpBall.position.z, deltaTime * speedPaddle);
    }else if(racket2.position.z < tmp.z) {
		lastDir = 2;// il ce dirig a droite
		moov_right();
    	// racket2.position.z  += Math.min(tmpBall.position.z - racket2.position.z, deltaTime * speedPaddle);
    }
	else
		lastDir = 0;

    // if(racket2.position.z > tmpBall.position.z) {
	// 	lastDir = 1; //il ce dirige a gauche
	// 	moov_left();
    // 	// racket2.position.z -= Math.min(racket2.position.z - tmpBall.position.z, deltaTime * speedPaddle);
    // }else if(racket2.position.z < tmpBall.position.z) {
	// 	lastDir = 2;// il ce dirig a droite
	// 	moov_right();
    // 	// racket2.position.z  += Math.min(tmpBall.position.z - racket2.position.z, deltaTime * speedPaddle);
    // }
	// else
	// 	lastDir = 0;

    // clock.start();

  }











  function reset(bool) {
    ball.vector.x = 0
    ball.vector.y = 0
    ball.speed = speedBall
    tmpBall.vector.x = 0
    tmpBall.vector.y = 0
    tmpBall.position.x = 0
    tmpBall.position.y = 0
    tmpBall.speed = speedBall
    racket1.position.z = 0
    racket2.position.z = 0
    if (bool){
      gsap.to(ball.position, {
        duration:2,
        z: 0,
        x: 0,
        onComplete: () => {
          ball.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        }
      })
      gsap.to(ball.position, {
        duration:3,
        onComplete: () => {
          if (stop === false){
            startRender()
          } else{
            stop = false
            stopRender()
            ball.vector.x = 0
            ball.vector.y = 0
            ball.position.x = 0
            ball.position.z = 0
            racket1.position.z = 0
            racket2.position.z = 0
            return
          }
          
        }
      })
      
    } else {
    gsap.to(racket1.position, {
      duration:1,
      z: 0,
    })
    gsap.to(racket2.position, {
      duration:1,
      z: 0,
    })
    gsap.to(ball.position, {
      duration:3,
      z: 0,
      x: 0,
      onComplete: () => {
        ball.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        preparationNewRound = false
      }
    })
    }
    
  }
  



  const onKeyPress = function (event) {
    if (!keyListenerActive) return
    keysPressed[event.code] = true
  };
  
  const onKeyRelease = function (event) {
    if (!keyListenerActive) return
    keysPressed[event.code] = false
  };
  
  const handleKeys = function () {
    if (!keyListenerActive) return
    if (loaderGltf && loaderGltf.scene) {
      if (stateGame < 50 || stateGame > 52){
        if (keysPressed[selectedKeys[3]]) {// key pour le playeur 2 (celui d'en face)
          if (racket2.position.z < (largSize / 2) - (playeurSize / 2)) //droite
            racket2.position.z += deltaTime * speedPaddle
        }
        if (keysPressed[selectedKeys[2]]) {
          if (racket2.position.z > (-largSize / 2) + (playeurSize / 2)) //gauche
            racket2.position.z -= deltaTime * speedPaddle
        }
    }
      if (keysPressed[selectedKeys[0]]) {// key pour le playeur 1 (le notre)
        if (racket1.position.z < (largSize / 2) - (playeurSize / 2)) //droite
          racket1.position.z += deltaTime * speedPaddle
      }
      if (keysPressed[selectedKeys[1]]) {
        if (racket1.position.z > (-largSize / 2) + (playeurSize / 2)) //gauche
          racket1.position.z -= deltaTime * speedPaddle
      }
    }
  };





  if (stateGame === 21 || stateGame === 31 || stateGame === 41 || stateGame === 43 || stateGame === 45 || stateGame === 47 || stateGame === 49 || stateGame === 141 || stateGame === 143 || stateGame === 51) {
    if (newRound === true && stateGame !== 21){
      newRound = false
        startRender()
      }
    if (stateGame === 21){
      isPlayerReady = true
    }
    keyListenerActive = true
    document.addEventListener("keydown", onKeyPress)
    document.addEventListener("keyup", onKeyRelease)
    handleKeys()
  } else {
    keyListenerActive = false
    keysPressed = {}
    document.removeEventListener("keydown", onKeyPress)
    document.removeEventListener("keyup", onKeyRelease)
  }



  const websocketUrl = 'ws://' + newUrl + ':8080/ws/game/' + gameId + '/'
   
  let websocket;


  function sendInfo() {
	// Send your information here
	if (websocket.readyState === WebSocket.OPEN){
	  let dir = 'none'
	  if (leftKey === true){
		dir = 'up'
	  } else if (rightKey === true){
		dir = 'down'
	  }

	  const data = {
		"name_serv": nameServer,
		"idMatch": playerId,
		"isReady": isPlayerReady,
		"playerDirection": dir,
		"playerId": userId,
		"username": username
	  };
	  console.log('envoi ready', data)
	  websocket.send(JSON.stringify(data));
	  } else{
		console.error('La connexion WebSocket est fermée. Impossible d\'envoyer des données.');
	  }
}



useEffect(() => {

if (findOnlineGame === true) {
console.log('tesssssssssssssssssssssssssssssssst')
  websocket = new WebSocket(websocketUrl);
  
  websocket.onopen = function() {
	  console.log('Connected to WebSocket');
	  // Start sending info every 1 second once connected
	  setInterval(sendInfo, 1000);
  };

  websocket.onmessage = function(event) {
	  console.log('Received message:', event.data);
	  const messageObj = JSON.parse(event.data); 
	  const type = messageObj.type;
	  if (type === 'playerId'){
		const messageObj = JSON.parse(event.data)
		playerId = messageObj.playerId
		nameServer = messageObj.name_serv
		side = messageObj.side
		console.log(messageObj.playerId, playerId, side)
	  }
	  if (type === 'state_update'){
		if (side === 'right'){
   /*      console.log(ball.position.x, messageObj.ball_x)
      console.log(ball.position.z, messageObj.ball_y)
      console.log(racket1.position.z, messageObj.player_1_y)
      console.log(racket2.position.z, messageObj.player_2_y)
      console.log(ball.vector.x, messageObj.player_2_y)
      if (ball.position.x !== messageObj.ball_x * -1)
		    ball.position.x = messageObj.ball_x * -1
      if (ball.position.z !== messageObj.ball_y * -1)
		    ball.position.z = messageObj.ball_y * -1
      if (racket1.position.z !== messageObj.player_1_y * -1)
		    racket1.position.z = messageObj.player_1_y * -1
      if (racket2.position.z = messageObj.player_2_y * -1)
		    racket2.position.z = messageObj.player_2_y * -1*/
 
		} else if (side === 'left'){
      console.log(ball.position.x, messageObj.ball_x)
      console.log(ball.position.z, messageObj.ball_y)
      console.log(racket1.position.z, messageObj.player_1_y)
      console.log(racket2.position.z, messageObj.player_2_y)
      if (ball.position.x !== messageObj.ball_x)
		    ball.position.x = messageObj.ball_x
      if (ball.position.z !== messageObj.ball_y)
		    ball.position.z = messageObj.ball_y
      if (racket1.position.z !== messageObj.player_1_y)
		    racket1.position.z = messageObj.player_1_y
      if (racket2.position.z !== messageObj.player_2_y)
		    racket2.position.z = messageObj.player_2_y

		}
		
    if (messageObj.isStarting === true){
      newRound = false
      startRender()
    }

		if (messageObj.isGoal === true){
		  console.log('GOAL GOAL GOALLLLL')
		  isPlayerReady = false
		  sendInfo()
		  /*setTimeout(function() {
			isPlayerReady = true;
			sendInfo()
		}, 3000);*/

		}
		  

	  }
	  
	  // Handle incoming messages here
  };

  websocket.onerror = function(error) {
	  console.error('WebSocket error:', error);
  };

  websocket.onclose = function() {
	  console.log('WebSocket connection closed');
	  return
	  // You may attempt to reconnect here if needed
  };




  window.addEventListener('keydown', (e) => {
	if (e.key == 'd') {
	  rightKey = true
	  if (side === 'left')
		  racket1.position.z -= 0.166 * 1
	 /* else if (side === 'right')
		  racket2.position.z -= 0.166 * -1*/
	} else if (e.key == 'a') {
	  leftKey = true
	  if (side === 'left')
		  racket1.position.z += 0.166 * 1
	/*  else if (side === 'right')
		  racket2.position.z += 0.166 * -1*/
	}else if (e.key == 't') {
	  isPlayerReady = true
	}
	sendInfo()
  })

  window.addEventListener('keyup', (e) => {
	if (e.key == 'd') {
	  rightKey = false
	} else if (e.key == 'a') {
	  leftKey = false
	}
	sendInfo()
  })	




} 



}, [findOnlineGame]);






useEffect(() => {
  if (location.pathname === '/lobby'){
	
	if (running === true){
	  stopRender()
	  ball.velocity.x = 0
	  ball.velocity.y = 0
	  ball.position.x = 0
	  ball.position.z = 0
	  racket1.position.z = 0
	  racket2.position.z = 0
	} else if (preparationNewRound === true){
		stop = true
	}
	newRound = true
	  
	
	
	}
}, [location.pathname]);




  if (gltf) {
	return (
	  <>
		<primitive object={gltf.scene} position={[0, 0, 0]}/>
	  </>
	)
  } else {
	return null;
  }
};

export default Pong;
