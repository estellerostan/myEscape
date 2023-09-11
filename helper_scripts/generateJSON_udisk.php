<?php
/*
* Name: generateJSON-udisk.php
* Author: Stéphanie Mader (http://smader.interaction-project.net)
* Datever: 2020.06.20 v0.1
* Descr: Script to automate the writing of the udisk.json by getting the folder architecture and name of files of the given dir udisk
   configurable to add password on some folder
   and then formatting in a JSON compatible for the framework Escaposaurus (https://github.com/RedNaK/escaposaurus)
* /!\ Limitation: Don't have folders or files with the same name. This has not been tested and should not work
* GitHub: https://github.com/RedNaK/escaposaurus
* Licence: MIT
*/


/*CONFIGURATION*/

/*array of password for the folders */
/*and as it is linear, which folder can be unlocked at which sequence*/
$passProtected['nz'] = ["bob", 0] ;
$passProtected['japon'] = ["rite", 1] ;
$passProtected['tokyo'] = ["liberty", 2] ;
$passProtected['perso'] = ["inde", 3] ;



/*full path to the root folder of the content */
$dirToScan = $_SERVER['DOCUMENT_ROOT'].'/elodisk/elodisk_gamedata/udisk' ;

/*full path to the json file to write in the end*/
$jsonfilepath = $_SERVER['DOCUMENT_ROOT'].'/elodisk/elodisk_gamedata/udisk.json' ;


/* END CONFIGURATION*/

/* call to auto-scan recursivelly the directory */
$udisk = dirToArray($dirToScan) ;
usdiskToJson($udisk, $passProtected, $jsonfilepath) ;

/* (to check, the folders and files should get written if uncommented)
echo "<pre>" ; print_r($udisk) ; echo "</pre>" ;
*/



/* json preparation and writing*/
function usdiskToJson($udisk, $passProtected, $jsonfilepath){
   $jsonDisk = traceDir($udisk, $passProtected) ;

   //echo "<pre>" ; print_r($jsonDisk) ; echo "</pre>" ;

   $json_wrap['root'] = $jsonDisk ;

   /*writing of the json file*/
   $json_data = json_encode($json_wrap);
   file_put_contents($jsonfilepath, $json_data);
}

/*quick and very dirty recursive func to add password and to change the datastruct to facilitate js work after*/
function traceDir($udisk, $passProtected){
   foreach($udisk as $key => $value){
      if(is_numeric($key)){
         $jsonDisk['files'][$key] = $value ;
      }else{
         $ndisk[$key] = traceDir($udisk[$key], $passProtected) ;
         if(array_key_exists($key,$passProtected)){
            /*if you add an encryption of the password into the array, (not for security but to hide them a little to people reading the src and json)
            you won't be able to display it automatically in the solutions... (trade off)
            but as there is a solution accessible, well cheating is not an issue*/
            $ndisk[$key]['password'] = $passProtected[$key][0] ;
            $ndisk[$key]['sequence'] = $passProtected[$key][1] ;
         }
         $ndisk[$key]['foldername'] = $key ;
         $jsonDisk['folders'][] = $ndisk[$key] ;
      } 
   }
   return $jsonDisk ;
}

/*standard func to recursively scan and save to an array the content of a folder*/
function dirToArray($dir) {
   $result = array();

   $cdir = scandir($dir);
   foreach ($cdir as $key => $value){
      if (!in_array($value,array(".",".."))){
         if (is_dir($dir . DIRECTORY_SEPARATOR . $value)){
            $result[$value] = dirToArray($dir . DIRECTORY_SEPARATOR . $value);
         }
         else{
            $result[] = $value;
         }
      }
   }
   return $result;
}

?>