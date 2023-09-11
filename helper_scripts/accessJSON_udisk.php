<?php header("Access-Control-Allow-Origin: *");
header("content-type: application/json");
echo file_get_contents($_SERVER['DOCUMENT_ROOT'].'/udisk.json');

/*if you work locally and have the json on a server, you can't access it by default (for security reason server won't allow origin outside of the server), also you also can't easily access the json locally (for other security reason)
so you can use this intermediary on the server to quickly and temporarilly change the parameters before loading the json (when in production don't forget to stop the use of this script and to directly point to the JSON) */
?>