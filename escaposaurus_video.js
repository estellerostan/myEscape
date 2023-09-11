<!--
/////////////////////////////////////////////////////////////
/// Escaposaurus v1 (2020)
///	A quick and dirty framework to create small adventure game (certified vanilla JS)
/// Author: Stéphanie Mader (http://smader.interaction-project.net)
/// GitHub: https://github.com/RedNaK/escaposaurus
///	Licence: MIT
////////////////////////////////////////////////////////////
-->


/*some needed initialization*/
var passwordCenter = {} ; /*list of password for each folder*/
var lockedFolder = [] ; /*list of folder locked at the beginning*/
var folderState = {} ; /*state of the folder*/
var sequenceFolder = [] ; /*which folder can be opened regarding the sequence*/
var sequenceNumber = 0 ;
var winState = false ;
var mainHintFound = false ;
var gameStart = false ;


/*
	FIRST FUNCTION CALLED UPON WINDOWS LOADED TO PREPARE THE GAME
*/

function loadDataIntoHTML(){

	/*load html content from data*/
	document.title = gameTitle ;
	document.getElementById("home-gameTitle").innerHTML = gameTitle ;
	document.getElementById("home-gameDescription").innerHTML = gameDescriptionHome ;
	document.getElementById("home-mission").innerHTML = gameMissionCall ;
	document.getElementById("overlay-btn").innerHTML = gameMissionAccept ;
	document.getElementById("vid-overlay").src = missionVideoPath ;

	document.getElementById("added").innerHTML = finalStepAdded ;

	document.getElementById("os-name").innerHTML = OSName ;
	document.getElementById("callerApp-name").innerHTML = callerAppName ;
	document.getElementById("explorer-name").innerHTML = explorerName ;

	document.getElementById("game-credit").innerHTML = gameCredit ;
	document.getElementById("game-thanks").innerHTML = gameThanks ;

	/*document.getElementById("callerIMG").src = callingIDHelper ;
	document.getElementById("caller2IMG").src = callingIDHelper2 ;*/

}


function closeOverlay(overlay){
	document.getElementById("vid-overlay").pause() ;
	if(gameStart===false){
		if(isLocal === true){
			startGameLocally(overlay)  ;
		}else{
			startGame(overlay) ;
		}
		document.getElementById('overlay-btn').innerHTML = "&raquo;&raquo; Continuer l'aventure (JOUER) &laquo;&laquo;" ;
		gameStart = true;
	}else{
		/*close the overlay*/
	    closeIt(overlay) ;
	}
}

function startGameLocally(overlay){

	var folders = udiskData.root.folders ;
	var files = udiskData.root.files ;

	loadGame(folders,files, overlay) ;
}

function startGame(overlay){
	TinyStato.logThis(1, "startGame", "", sequenceNumber) ;

	/*NK: to be changed when online + add comment about the generate the json*/
	getJSON(udiskJSONPath,
	function(err, data) {
	  if (err !== null) {
	    TinyStato.logThis(90, "jsonError", err, sequenceNumber) ;
	  } else {
	  	TinyStato.logThis(91, "jsonOK", "", sequenceNumber) ;

	    var folders = data2.root.folders ;
	    var files = data2.root.files ;

	   
	   loadGame(folders,files, overlay) ;
	  }
	});
}

function loadGame(folders, files, overlay){

	/* create the html elem for the udisk and saving the password from the JSON*/
    arborescence(folders, files, 'root', '') ;

    /*lock and hide the protected folders*/
    lockFolders();

    createContactList() ;
    lockContacts() ;

    /*launch lightbox after creation of the udisk to make it work*/
    startLighBox() ;

    /*to know when hint are opened*/
    addListenerToLink() ;

    /*close the overlay*/
    closeIt(overlay) ;

    /*now we open the intro video, or we have a page before, we need to decide, same for credits :/*/
    /*ok y'a un truc de sécurité qui fait que ça n'auto-play pas si y'a pas eu un click avant*/
    /*faudra juste faire un message, call entrant, puis ok qui ouvre cette vidéo*/
    setTimeout(function () {
		openIt('calling-window') ;
	},500);
}


/*find files that are hint and add listener so a callback is called when they are opened to allow the game to proceed and unlock the contact*/
function addListenerToLink(){
	var z = document.getElementsByClassName('file-name') ;
	for(var i = 0 ; i < z.length ; i++){
		var fn = z[i].href.substring(z[i].href.lastIndexOf('/')+1);
		if(seqMainHint.includes(fn)){
			z[i].addEventListener("click", callbackClicHint) ;
		}
	}
}

var callbackClicHint = function(evt){
	var fn = evt.target.href.substring(evt.target.href.lastIndexOf('/')+1);
	if(fn == seqMainHint[sequenceNumber]){
		mainHintFound = true ;
		unlockContacts() ;
	}
}

function unlockContacts(){
	var p = document.getElementById("callApp-prompt") ;
	p.innerHTML = prompt[sequenceNumber] ;

	var z = document.getElementsByClassName('contact-div') ;
	for(var i = 0 ; i < z.length ; i++){
		z[i].classList.remove("no-call") ;
	}
}

function lockContacts(){
	var p = document.getElementById("callApp-prompt") ;
	p.innerHTML = promptDefault ;

	var z = document.getElementsByClassName('contact-div') ;
	for(var i = 0 ; i < z.length ; i++){
		z[i].classList.add("no-call") ;
		z[i].classList.remove("already-called") ;
	}
}


/*
	FUNCTIONS LOADING THE DATA AND CREATING THE HTML ELEMENTS FROM IT
*/

/*
	function that create the folder and files display
*/
var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      if (xhr.status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

/*recursive function to create the folders and files, even the one protected by password (yep, easycheat by watching the source code to get infos and access to files)*/
function arborescence(folders, files, parent, fullpath){
	if(folders !== null){
		for (var i = 0; i < folders.length; i++){
		    var obj = folders[i];
		    //console.log("a folder" + obj.foldername) ;
		    var password = (obj.password == undefined)?"":obj.password;
		    var seqNumber = (obj.password == undefined)?"":obj.sequence;
		    cFolder(obj.foldername, parent, password, seqNumber) ;

		    var fo = (obj.folders == undefined)?null:obj.folders ;
		 	var fi = (obj.files == undefined)?null:obj.files ;
		 	

		 	if(fi != null || fo != null){
		    	arborescence(fo, fi, obj.foldername, fullpath+obj.foldername+"/") ;
			}
		}
	}

	if(files !== null){
		for (var j = 0; j < files.length; j++){
			cFile(files[j], parent, fullpath) ;
		}
	}
}

/*folder routine HTML*/
function cFolder(name, parent, password, seqNumber){
	passwordCenter[name] = password ;
	if(password != null){
		sequenceFolder[seqNumber] = name ;
	}
	folderState[name] = 0 ;
	if(password != ""){
		lockedFolder.push(name) ;
		folderState[name] = 1 ;
	}

	//console.log("folder name: "+name+" parent is: "+parent + " and password: "+password) ;
	var elem = document.createElement('li') ;
	elem.id = name ;
	elem.name = name ;
	elem.classList.add("folder") ;
	elem.classList.add("arbo") ;

	var elemA = document.createElement('a') ;
	if(password != ""){
		elemA.classList.add("protected-name") ;
		elemA.setAttribute("onclick", "openPasswordPrompt('"+name+"')") ;
	}else{
		elemA.classList.add("folder-name") ;
	}

	elemA.id = name+"sp" ;
	elemA.name = name+"sp" ;
	elemA.innerHTML = name ;
	elem.appendChild(elemA) ;

	var elem2 = document.createElement('ul') ;
	elem2.id = name+"ul" ;
	elem2.name = name+"ul" ;
	elem.appendChild(elem2) ;

	var p = document.getElementById(parent+"ul") ;
	p.appendChild(elem) ;
}

/*file routine HTML*/
function cFile(name, parent, fullPath){
	var elem = document.createElement('li') ;
	elem.id = name ;
	elem.name = name ;
	elem.classList.add("file") ;
	elem.classList.add("arbo") ;

	var elemA = document.createElement('a') ;
	elemA.classList.add("file-name") ;
	elemA.href = udiskRoot+fullPath+name ;
	elemA.setAttribute("data-lightbox", "") ;
	elemA.setAttribute("data-image-alt", "name") ;
	elemA.innerHTML = name ;
	elem.appendChild(elemA) ;

	var p = document.getElementById(parent+"ul") ;
	p.appendChild(elem) ;
}

/*to lock folder after creating the udisk*/
function lockFolders(){
	for(i=0; i<lockedFolder.length;i++){
		var x = document.getElementById(lockedFolder[i]+"ul") ;
		x.classList.add("hidden") ;
	}
}

/*contact list creation*/
function createContactList(){
	/*first prompt*/
	var p = document.getElementById("callApp-prompt") ;
	p.innerHTML = promptDefault;

	/*removing existing stuff*/
	var nc = document.getElementById("normal-contact") ;
	while (nc.firstChild) {
		nc.removeChild(nc.lastChild);
	}
	var hc = document.getElementById("help-contact") ;
	while (hc.firstChild) {
		hc.removeChild(hc.lastChild);
	}

	/*create normal contact*/
	for(var i = 0 ; i < normalContacts.length ; i++){
		createContact(normalContacts[i], nc) ;
	}

	/*create helper contact*/
	for(var i = 0 ; i < helperContacts.length ; i++){
		createContact(helperContacts[i], hc) ;
	}
}

function createContact(contact, parent){
	var x = document.createElement("div") ;
	x.id = "divcontact-"+contact.vid ;
	x.classList.add("contact-div") ;
	x.classList.add("no-call") ;

	/*NK ICI SI TXT OU PAS*/
	if(contact.canal == "video"){
		if(isLocal === true){
			x.setAttribute("onclick","openVideoWindow('"+contact.vid+"', '"+contactVideoRoot+contact.vid+"/')") ;
		}else{
			x.setAttribute("onclick","openVideoWindow('"+contact.vid+"', '"+videoRootVOD+"/"+contact.vod_folder+"')") ;
		}
	}else if(contact.canal == "txt"){
		x.setAttribute("onclick","openContactTxTWindow('"+contact.vid+"', '"+contactVideoRoot+contact.vid+"/"+contact.bigAvatar+"')") ;
	}

	var im = document.createElement("img") ;
	im.src = contactVideoRoot+contact.vid+"/"+contact.avatar ;
	im.classList.add("contact-avatar") ;

	var sp = document.createElement("span") ;
	sp.innerHTML = contact.username ;

	x.appendChild(im) ;
	x.appendChild(sp)
	parent.appendChild(x) ;
}

/*
	FUNCTION DEALING WITH INTERACTIVE UI, DATA, AND GAME LOGIC
*/

/*
functions that deals with the password protection of folders
*/
function unlockFolder(unlockedFolder){
	TinyStato.logThis(15, "unlockedfolder", unlockedFolder, sequenceNumber) ;

	var x = document.getElementById(unlockedFolder+"sp") ;
	x.classList.remove("protected-name") ;
	x.classList.add("folder-name") ;

	var y = document.getElementById(unlockedFolder+"ul") ;
	y.classList.remove("hidden") ;

	/*changing the state to open*/
	folderState[unlockedFolder] = 0 ;

	/*opening a folder change the sequence, the content here is linear*/
	changingSequence() ;
}

function isItPasswordProtected(foldername){
	if(passwordCenter[foldername] != null
		&& passwordCenter[foldername] != ""){
		return true;
	}else{
		return false;
	}
}

function doThePasswordMatch(userTry, foldername){
	var userTryCleared = userTry.replace(/[^a-z0-9]/gi, '') ;
	var passwordCleared = passwordCenter[foldername].replace(/[^a-z0-9]/gi, '') ;

	if(isItPasswordProtected(foldername)
		&& passwordCleared.toLowerCase() == userTryCleared.toLowerCase()){
		return true;
	}else{
		return false;
	}
}

function checkIfEnter(e, userTry, foldername){
	if(e.keyCode === 13){
	    e.preventDefault(); // Ensure it is only this code that runs

	    checkPassword(userTry, foldername) ;
	}
}

function checkPassword(userTry, foldername){
	TinyStato.logThis(14, "triedpassword", userTry, sequenceNumber) ;

	if(doThePasswordMatch(userTry, foldername)){
		closeIt("passPrompt-window") ;
		unlockFolder(foldername) ;
	}else{
		openIt("wrongPassword") ;
	}
}

function openPasswordPrompt(foldername){
	/*if the not now prompt is open, we close it*/
	var p = document.getElementById("notnowPrompt-window") ;
	if(!p.classList.contains('hidden')){
		p.classList.add("hidden") ;
	}

	if(sequenceFolder[sequenceNumber] == foldername){
		document.getElementById("passwordInput").value = "" ;


		var x = document.getElementById("folderInput") ;
		x.value = foldername ;

		var d = document.getElementById("folderD") ;
		d.innerHTML = foldername ;

		var p = document.getElementById("passPrompt-window") ;
		p.classList.remove("hidden") ;
		document.getElementById("passwordInput").focus() ;

	}else{
		if(folderState[foldername] == 1){
			var d = document.getElementById("folderN") ;
			d.innerHTML = foldername ;

			var p = document.getElementById("notnowPrompt-window") ;
			p.classList.remove("hidden") ;
		}/*else nothing as the folder has already been unlocked*/
	}
}

/*specifical bad UI to avoid user entering many password*/
function closeWrongPassword(){
	closeIt("passPrompt-window") ;
	closeIt("wrongPassword") ;
}

const animation = {
	fadeIn: 'fadeIn .3s',
	fadeOut: 'fadeOut .3s',
	scaleIn: 'scaleIn .3s',
	scaleOut: 'scaleOut .3s'
};


function openContactTxTWindow(vid, bigAvatarHelper){
	if(mainHintFound){
		TinyStato.logThis(13, "textexchange", vid, sequenceNumber) ;
		document.getElementById("caller2IMG").src = bigAvatarHelper ;
		var z = document.getElementById("tips-content") ;
		z.innerHTML = tips[vid][sequenceNumber] ;
		document.getElementById('divcontact-'+vid).classList.add("already-called") ;
		openIt("message-window") ;
		return;
	}else{
		openIt('nocall-window') ;
		return;
	}
}

/*open/close video windows*/
function openVideoWindow(vid, vid_folder){
	var x = document.getElementById("callVideo-content") ;
	var t = document.getElementById("callVideo-title") ;
	
	var title ;
	var src ;
	/*according to case, deal with title and video path*/
	if(vid == "intro" || vid == "introBis"){
		title = titleData.introTitle ;
		src = introVideoPath ;
	}else if(vid == "epilogue"){
		title = titleData.epilogueTitle ;
		src = epilogueVideoPath ;
	}else if(vid == "missing"){
		title = titleData.callTitle ;
		src = missingVideoPath ;

		/*add listerner to launch the end of the game when player close this video*/
		var cl = document.getElementById("btn-closecall") ;
		cl.addEventListener("click", callbackCloseMissingCall) ;
	}else{
		if(mainHintFound){
			title = titleData.callTitle ;
			src = vid_folder+"seq"+sequenceNumber+".mp4" ;
			document.getElementById('divcontact-'+vid).classList.add("already-called") ;
		}else{
			/*no call, because main clue not opened, display of message*/
			openIt('nocall-window') ;
			return;
		}
	}

	TinyStato.logThis(12, "playvideo", vid, sequenceNumber) ;
	/*create the video element everything*/
	var v = document.createElement("video") ;
	v.setAttribute("controls", true) ;
	v.setAttribute("autoplay", true) ;

	t.innerHTML = title ;
	v.src = src ;

	v.type = "video/mp4" ;
	x.appendChild(v) ;

	openIt("callVideo-window") ;
}

function closeVideoWindow(parentElem){
	closeIt(parentElem.id) ;
	/*destroy video, that stop it also*/
	var x = document.getElementById("callVideo-content") ;
	while (x.firstChild) {
		x.removeChild(x.lastChild);
	}
}

/*
short func to display/hide stuff
*/
function openIt(nameId){
	var mainElt = document.getElementById(nameId);
	mainElt.style.animation = [animation.scaleIn, animation.fadeIn];
	mainElt.classList.remove('hidden');
	TinyStato.logThis(10, "openit", nameId, sequenceNumber) ;
}

function closeIt(nameId){
	var mainOElt = document.getElementById(nameId);
	mainOElt.classList.add('hidden') ;

	/* need a callback on animation to work
	mainOElt.style.animation = [animation.scaleOut, animation.fadeOut];
	setTimeout(function () {
		mainOElt.classList.add('hidden');
		},280);
	*/
	TinyStato.logThis(11, "closeit", nameId, sequenceNumber) ;
}


/*progression, beggining, and end specific event*/
function changingSequence(){
	sequenceNumber++ ;

	if(sequenceNumber >= sequenceWin){
		TinyStato.logThis(2, "win", "", sequenceNumber) ;
		unlockContacts() ;
		win() ;
	}else{
		TinyStato.logThis(3, "newsequence", "", sequenceNumber) ;
		mainHintFound = false ;
		lockContacts() ;
		if(seqMainHint[sequenceNumber] == "noHint"){
			mainHintFound = true ;
			unlockContacts() ;
		}
	}

}

function win(){
	winState = true ;
	openIt("newContact-window") ;
	/*removing existing stuff*/
	var nc = document.getElementById("normal-contact") ;
	while (nc.firstChild) {
		nc.removeChild(nc.lastChild);
	}
	
	var hc = document.getElementById("help-contact") ;
	while (hc.firstChild) {
		hc.removeChild(hc.lastChild);
	}
}

function closeNewContact(d){
	closeIt(d) ;
	var nc = document.getElementById("normal-contact") ;
	createContact(missingContact, nc) ;
}

function closeAppelEntrant(d){
	closeIt(d) ;

	if(winState === false){
		openVideoWindow('intro') ;
	}else{
		openEpilogue() ;
	}
}

/*via eventlistener, callback that open the end of the game (epilogue and credit video)*/
var callbackCloseMissingCall = function(){
	var cl = document.getElementById("btn-closecall") ;
	cl.removeEventListener("click", callbackCloseMissingCall) ;
	setTimeout(function () {
		openIt('calling-window') ;
	},1000);
}

function openEpilogue(){
	setTimeout(function () {
		openVideoWindow('epilogue') ;
		var x = document.getElementById('button-outro');
		x.style.animation = [animation.scaleIn, animation.fadeIn];
		x.classList.remove('hidden');
	},1000);
}

/* HELP AND SOLUTION BOX */
function instructionReveal(spid){
	TinyStato.logThis(101, "instructionreveal", mainHintFound, sequenceNumber) ;
	var text = "" ;
	var sp = document.getElementById(spid) ;
	if(winState){
		text = instructionText.winState ;
	}else if(mainHintFound === false){
		text = instructionText.lackMainHint ;
	}else{
		var foldername = sequenceFolder[sequenceNumber] ;
		text = instructionText.password ;
	}
	sp.innerHTML = text ;
	openIt(spid) ;
}

function solutionReveal(spid){
	TinyStato.logThis(102, "solutionreveal", mainHintFound, sequenceNumber) ;
	var text = "" ;
	var sp = document.getElementById(spid) ;
	if(winState){
		text = solutionText.winState ;
	}else if(mainHintFound === false){
		text = solutionText.lackMainHint.replace("%s", seqMainHint[sequenceNumber]) ;
	}else{
		var foldername = sequenceFolder[sequenceNumber] ;
		text = solutionText.password.replace("%s1", foldername).replace("%s2", passwordCenter[foldername]) ;
	}
	sp.innerHTML = text ;
	openIt(spid) ;
}

function solutionClose(iid, spid, spwin){
	var spi = document.getElementById(iid) ;
	spi.innerHTML = "" ;
	var sp = document.getElementById(spid) ;
	sp.innerHTML = "" ;
	closeIt(spwin) ;
}