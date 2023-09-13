<!--
/////////////////////////////////////////////////////////////
/// Escapausorus v1 (2020)
///	A quick and dirty framework to create small adventure game (certified vanilla JS)
/// Author: Stéphanie Mader (http://smader.interaction-project.net)
/// GitHub: https://github.com/RedNaK/escaposaurus
///	Licence: MIT
////////////////////////////////////////////////////////////
-->

	/*
		HERE IS THE CONFIGURATION OF THE GAME
	*/
		/*either online with VOD server and JSON load of data
		either local */
		var isLocal = true ;
 		var gameRoot = "./" ;
 		var gameDataRoot = gameRoot+"escaposaurus_examplegamedata/" ;
 		var videoRoot = gameDataRoot+"videos/" ;

 		/*caller app*/
		var contactVideoRoot = videoRoot+"contactVideo/" ;

		/*full path to intro / outro video*/
		var missionVideoPath = videoRoot+"introVideo/intro.mp4" ;
		var introVideoPath = videoRoot+"introVideo/intro2.mp4" ;
		var missingVideoPath = videoRoot+"contactVideo/missing/final.mp4" ;
		var epilogueVideoPath = videoRoot+"epilogueVideo/epiloguecredit.mp4" ;

		/*udisk JSON path*/
		var udiskRoot = gameDataRoot+"udisk/" ;

		/*for online use only*/
		/*var udiskJSONPath = gameRoot+"escaposaurus_gamedata/udisk.json" ;
		var udiskJSONPath = "/helper_scripts/accessJSON_udisk.php" ;*/

		// Careful, foldernames need to be unique, calling them all "Rechercher" will lead to a bug
		// where all the unlocked files go to the first root
		var udiskData =
	  	{"root":{
	  		"folders":
		  		[
		  		{"foldername":"Rechercher une adresse","password":"ee","sequence":0,
				  	"files":["scan_memo.png"]
				}
		 		],
			"files":["Annuaire01.png","Annuaire02.png","Annuaire03.png"]},
		"root2":{
					"folders":
						[
						{"foldername":"Rechercher un article","password":"ee","sequence":2,
							"files":["grandmas-letter.png"]
					  }
					   ],
					   "files":[]},
		"root3":{
					"folders":
						[
						{"foldername":"Rechercher des lieux à visiter","password":"ee","sequence":1,
							"files":["grandmas-letter.png"]
						}
						],
						"files":[]},
		"root4":{
					"folders":
						[
						{"foldername":"Ouvrir le coffre","password":"ee","sequence":3,
							"files":["chest-opened.png"]
						}
						],
						"files":[]}
		} ;

		var gameTitle = "Guliba Gangsta Paradise" ;
		var gameDescriptionHome = "Ceci est le test de Théo Carrasco sur le framework Escaposaurus.<br/>Le code source est téléchargeable sur <a href='https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUIcmlja3JvbGw%3D' target='_blank'>GitHub</a>" ;
		var gameMissionCall = "Ouais, c'est Greg..." ;
		var gameMissionAccept = "&raquo;&raquo; Alors ça dépote ! &laquo;&laquo;" ;

		var gameCredit = "Un jeu conçu et réalisé par : <br/>EyeCrown" ;
		var gameThanks = "Remerciements : <br/> ;) ma mère" ;

		var OSName = "" ;
		var explorerName = "" ;
		var callerAppName = "Téléphone" ;

		/*titles of video windows*/
		var titleData = {} ;
		titleData.introTitle = "INTRODUCTION" ;
		titleData.epilogueTitle = "EPILOGUE" ;
		titleData.callTitle = "APPEL EN COURS..." ;

		/*change of caller app prompt for each sequence*/
		var promptDefault = "Rien à demander, ne pas les déranger." ;
		var prompt = [] ;
		prompt[0] = "Prendre contact" ;
		prompt[1] = "" ;
		prompt[2] = "" ;
		prompt[3] = "Envoyer la carte" ;
		prompt[4] = "Appeler Nathalie pour savoir où en sont les secours." ;

		/*when the sequence number reach this, the player win, the missing contact is added and the player can call them*/
		var sequenceWin = 4 ;

		/*before being able to call the contacts, the player has to open the main clue of the sequence as indicated in this array*/
		/*if you put in the string "noHint", player will be able to immediatly call the contact at the beginning of the sequence*/
		/*if you put "none" or anything that is not an existing filename, the player will NOT be able to call the contacts during this sequence*/
		var seqMainHint = [] ;
		seqMainHint[0] = "scan_memo.png" ;
		seqMainHint[1] = "aucun" ; /*if you put anything that is not an existing filename of the udisk, the player will never be able to call any contacts or get helps during this sequence*/
		seqMainHint[2] = "aucun" ;
		seqMainHint[3] = "swisstopo-screen.png" ;

		/*contact list, vid is the name of their folder in the videoContact folder, then the game autoload the video named seq%number of the current sequence%, e.g. seq0.MP4 for the first sequence (numbered 0 because computer science habits)
	their img need to be placed in their video folder, username is their displayed name
		*/
		var normalContacts = [] ;
		normalContacts[0] = {"vid" : "Denise", "vod_folder" : "", "username" : "Mamounette", "canal" : "video", "avatar" : "denise_avatar.jpg"} ;
		normalContacts[1] = {"vid" : "Nathalie", "vod_folder" : "", "username" : "L'Archiviste", "canal" : "video", "avatar" : "nata_avatar.jpg"} ;

		/*second part of the list, contact that can help the player*/
		var helperContacts = [] ;
		helperContacts[0] = {"vid" : "Albert", "vod_folder" : "", "username" : "Mami (de là où tu es)", "canal" : "txt", "avatar" : "albert.png", "bigAvatar" : "albertbig.png"} ;
		/*helperContacts[1] = {"vid" : "Lou", "username" : "Lou (pour avoir un deuxième indice) - par message", "canal" : "txt", "avatar" : "Lou_opt.jpg", "bigAvatar" : "avatarHelper2Big.gif"} ;*/


		/*ce qui apparait quand on trouve le dernier élément du disque dur*/
		finalStepAdded = "ID du GPS transmise aux secours." ;

		/*the last call, it can be the person we find in the end or anyone else we call to end the quest, allows the game to know it is the final contact that is called and to proceed with the ending*/
		var missingContact = {"vid" : "missing", "vod_folder" : "","username" : "Nathalie",  "canal" : "video", "avatar" : "nata_avatar.jpg"} ;

		/*Lou only send text message, they are stored here*/
		var tips = {} ;
		tips['Albert'] = [] ;
		tips['Albert'][0] = "Je peux pas répondre à votre appel. Mais je peux vous répondre par écrit. Donc vous cherchez le surnom d'un guide ? Je crois que les contacts sont des guides justement, essayez peut-être de les appeler." ;
		tips['Albert'][1] = "" ;
		tips['Albert'][2] = "" ;
		tips['Albert'][3] = "Ah zut, un dossier verouillé sans infos dans scan mémo ? Y'a forcément un truc mnémotechnique facile à retenir ou retrouver. Les guides en disent quoi ?" ;


		/*text for the instruction / solution windows*/
		var instructionText = {} ;
		instructionText.winState = "Vous avez retrouvé l'id GPS et vous pouvez appeler les secours du secteur." ;
		instructionText.lackMainHint = "" ;
		instructionText.password = "Vous devez trouver et entrer le mot de passe d'un des dossiers de la boite de droite. Vous pouvez trouver le mot de passe en appelant les contacts de la boite de gauche.<br/>Pour entrer un mot de passe, cliquez sur le nom d'un dossier et une fenêtre s'affichera pour que vous puissiez donner le mot de passe." ;

		/*please note the %s into the text that allow to automatically replace them with the right content according to which sequence the player is in*/
		var solutionText = {} ;
		solutionText.winState = "Si Sabine a été secourue, le jeu est fini bravo." ;
		solutionText.lackMainHint = "Vous devez ouvrir le fichier <b>%s</b><br/>" ;
		solutionText.password = "Vous devez déverouiller le dossier <b>%s1</b><br/>avec le mot de passe : <b>%s2</b><br/>" ;