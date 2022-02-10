<?php

require_once("../cloud/util.php");

function hwplanner_add_request_log($conn, int $uid, string $command, array $args)
{
    $args = $conn->real_escape_string(json_encode($args));
    if(!$conn->query("INSERT INTO requestLog (userId, command, args) VALUES ('$uid', '$command', '$args')"))
        error_log("Failed to add requestLog - " . mysqli_error($conn));
}

function hwplanner_get_request_log($conn, int $uid)
{
    $array = array();
    $result = $conn->query("SELECT * FROM requestLog WHERE userId='$uid'");
    if(!$result)
        error_log("Failed to get request log - " . mysqli_error($conn));
    while($row = $result->fetch_assoc())
    {
        $row["args"] = json_decode($row["args"]);
        array_push($array, $row);
    }
    return $array;
}

// add-hw
// Args:
//  sub - The subject
//  turnInTime - untilTime + " " + untilTimeT
//  isExerciseList - topicFormat=="N"
//  topic - The topic string
//  topicLabel - Comma-separated labels
//  optional - Is optional?
//  tid - Resulting TID.
function cmd_add_hw($json, $uid, $data)
{
    if(!isset($data))
    {
        pcu_cmd_error($json, "{error.noData}");
        return;
    }
    
    $conn = pcu_cmd_connect_db($json, "hwplanner");
    if(!$conn)
        return;
    
    $_sub =          $conn->real_escape_string($data["sub"]);
    $_type =         $conn->real_escape_string($data["type"]);
    $_untilTime =    $conn->real_escape_string($data["untilTime"]);
    $_untilTimeT =   $conn->real_escape_string($data["untilTimeT"]);
    $_topicFormat =  $conn->real_escape_string($data["topicFormat"]);
    $_topic =        $conn->real_escape_string($data["topic"]);
    $_topicLabel =   $conn->real_escape_string($data["topicLabel"]);
    $_description =  $conn->real_escape_string($data["description"]);
    $_optional =      ($data["optional"] == "true" ? "1" : "0");
    $_shareToDomain = ($data["shareToDomain"] == "true" ? "1" : "0");
    
    if(!$conn->query("insert into hws (sub,type,addTime,untilTime,untilTimeT,topicFormat,topic,topicLabel,description,optional,shareToDomain,userId) values
            ('$_sub', '$_type', NOW(), '$_untilTime', '$_untilTimeT', '$_topicFormat', '$_topic', '$_topicLabel', '$_description', '$_optional', '$_shareToDomain', '$uid')"))
    {
        pcu_cmd_error($json, "Query failed: " . mysqli_errno($conn) . ": " . mysqli_error($conn));
        return;
    }
    
    hwplanner_add_request_log($conn, $uid, "add-hw", array(
        "sub" => $_sub,
        "turnInTime" => $_untilTime . " " . $_untilTimeT,
        "isExerciseList" => ($_topicFormat == "N"),
        "topic" => $_topic,
        "topicLabel" => $_topicLabel,
        "optional" => $_optional,
        "tid" => $conn->query("select last_insert_id()")->fetch_assoc()["last_insert_id()"]
    ));
    
    $conn->close();
}

function hwplanner_get_hw($conn, int $uid, int $tid)
{
    $result = $conn->query("SELECT * FROM hws WHERE tid='$tid' and userId='$uid'");
    if(!$result || !($row = $result->fetch_assoc()))
        return null;
    return $row;
}

function hwplanner_tid_has_files_or_links($conn, $tid)
{
    // files?
    $files = cloud_list_files(pcu_current_uid(), ".hwplanner/t${tid}");
    if(sizeof($files) > 0)
        return true;
    
    // links?
    $_tid = $conn->real_escape_string($tid);
    if(!($query = $conn->query("SELECT link FROM links WHERE tid='$_tid'")))
        return null;
    return $query->num_rows > 0;
}

function cmd_get_data($json, $uid, $query)
{
    if(!isset($query))
    {
        pcu_cmd_error($json, "{error.noQuery}");
        return;
    }
    
    $conn = pcu_cmd_connect_db($json, "hwplanner");
    if(!$conn)
        return;
    
    // Select users which own the HW or users which are in HW owner's domain (for shareToDomain HWs) 
    $sql = "SELECT hwplanner.hws.*,hwplanner.hws.userId AS ownerId,pcutil.users.userName AS ownerName FROM hwplanner.hws
	    INNER JOIN pcutil.users ON hwplanner.hws.userId = pcutil.users.id
        WHERE userId='$uid' OR (hwplanner.hws.shareToDomain = '1' AND pcutil.users.domain = (SELECT domain FROM pcutil.users WHERE id='$uid'));";
    $result = $conn->query($sql);
    if(!$result)
    {
        cmd_error($json, "{error.sql}(" . mysqli_errno($conn) . "," . mysqli_error($conn) . ")");
        return;
    }
    
    $data = array();
    
    if($result && $result->num_rows > 0)
    {
        while($row = $result->fetch_assoc())
        {
            $row["hasFilesOrLinks"] = hwplanner_tid_has_files_or_links($conn, $row["tid"]);
            $data[$row["tid"]] = $row;
        }
    }

    $json->data = $data;
    
    $conn->close();
}

// modify-hw
// Args:
//  tid - The TID of modified HW.
//  sub - The subject
//  turnInTime - untilTime + " " + untilTimeT
//  isExerciseList - topicFormat=="N"
//  topic - The topic string
//  topicLabel - Comma-separated labels
//  status - The status.
//  description - The description.
//  optional - Is optional?
function cmd_modify_hw($json, $uid, $data)
{
    if(!isset($data))
    {
        pcu_cmd_error($json, "{error.noData}");
        return;
    }
    
    $conn = pcu_cmd_connect_db($json, "hwplanner");
    if(!$conn)
        return;
    
    $tid =            $conn->real_escape_string($data["tid"]);
    $_sub =           $conn->real_escape_string($data["sub"]);
    $_type =          $conn->real_escape_string($data["type"]);
    $_untilTime =     $conn->real_escape_string($data["untilTime"]);
    $_untilTimeT =    $conn->real_escape_string($data["untilTimeT"]);
    $_topicFormat =   $conn->real_escape_string($data["topicFormat"]);
    $_topic =         $conn->real_escape_string($data["topic"]);
    $_topicLabel =    $conn->real_escape_string($data["topicLabel"]);
    $_status =        $conn->real_escape_string($data["status"]);
    $_description =   $conn->real_escape_string($data["description"]);
    $_shareToDomain = ($data["shareToDomain"] == "true" ? "1" : "0");
    $_optional =      ($data["optional"] == "true" ? "1" : "0");
    
    if(!$conn->query("update hws set
            sub='$_sub', type='$_type', untilTime='$_untilTime', untilTimeT='$_untilTimeT', topicFormat='$_topicFormat', 
            topic='$_topic', topicLabel='$_topicLabel', status='$_status', description='$_description',
            shareToDomain='$_shareToDomain', optional='$_optional' where tid='$tid' and userId='$uid'"))
    {
        pcu_cmd_fatal("{error.sql}(" . mysqli_errno($conn) . "," . mysqli_error($conn) . ")", 500);
        return;
    }
    $json->message2 = "This is an old way...";
    
    hwplanner_add_request_log($conn, $uid, "modify-hw", array(
        "tid" => $tid,
        "sub" => $_sub,
        "turnInTime" => $_untilTime . " " . $_untilTimeT,
        "isExerciseList" => ($_topicFormat == "N"),
        "topic" => $_topic,
        "topicLabel" => $_topicLabel,
        "status" => $_status,
        "description" => $_description,
        "optional" => $_optional,
        "shareToDomain" => $_shareToDomain,
    ));
    
    $conn->close();
}

// modify-details
// Args:
//  tid - The TID of modified HW.
//  sub - The subject
//  isExerciseList - topicFormat=="N"
//  topic - The topic string
//  topicLabel - Comma-separated labels
//  description - The description.
//  optional - Is optional?
function cmd_modify_details($json, $uid, $data)
{
    if(!isset($data))
    {
        pcu_cmd_error($json, "{error.noData}");
        return;
    }
    
    $conn = pcu_cmd_connect_db($json, "hwplanner");
    if(!$conn)
        return;
    
    pcu_cmd_error("{error.todo}");
    $conn->close();
}

// modify-turn-in-time
// Args:
//  tid - The TID of modified HW.
//  old - The old turn-in time.
//  new - The new turn-in time.
function cmd_modify_turn_in_time($json, $uid, $data)
{
    if(!isset($data))
    {
        pcu_cmd_error($json, "{error.noData}");
        return;
    }
    
    $conn = pcu_cmd_connect_db($json, "hwplanner");
    if(!$conn)
        return;
    
    pcu_cmd_error("{error.todo}");
    $conn->close();
}

// modify-status
// Args:
//  tid - The TID of modified HW.
//  name - The display name of HW.
//  old - The old status
//  new - The new status
function cmd_modify_status($json, $uid, $data)
{
    if(!isset($data["status"]))
    {
        pcu_cmd_error($json, "{error.noDataCustom}(status)");
        return;
    }
    
    $conn = pcu_cmd_connect_db($json, "hwplanner");
    if(!$conn)
        return;
    
    $_tid = $conn->real_escape_string($data["tid"]);
    $_status = $conn->real_escape_string($data["status"]);
    
    $hw = hwplanner_get_hw($conn, $uid, $_tid);
    if(!$hw)
    {
        pcu_cmd_error($json, "{error.invalidArgument}(tid, $_tid)");
        return;
    }
    
    if(!$conn->query("update hws set
            status='$_status' where tid='$_tid' and userId='$uid'"))
    {
        cmd_error($json, "{error.sql}(" . mysqli_errno($conn) . "," . mysqli_error($conn) . ")");
        return;
    }
    
    $json->hw = $hw;
    
    hwplanner_add_request_log($conn, $uid, "modify-status", array(
        "tid" => $_tid,
        "name" => $hw["topic"],
        "old" => $hw["status"],
        "new" => $_status
    ));
    
    $conn->close();
}

// remove-hw
// Args:
//  tid - The TID of modified HW.
//  name - The HW display name.
//  reason - The reason of removal.
function cmd_remove_hw($json, $uid, $tid)
{
    if(!isset($tid))
    {
        pcu_cmd_error($json, "{error.noDataCustom}(TID)");
        return;
    }
    
    $conn = pcu_cmd_connect_db($json, "hwplanner");
    if(!$conn)
        return;
    
    $tid = $conn->real_escape_string($tid);
    
    $topic = $conn->query("select topic from hws where tid='$tid' and userId='$uid'")->fetch_assoc()["topic"];
    
    if(!$conn->query("delete from hws where tid='$tid' and userId='$uid'"))
    {
        cmd_error($json, "{error.sql}(" . mysqli_errno($conn) . "," . mysqli_error($conn) . ")");
        return;
    }  
    
    hwplanner_add_request_log($conn, $uid, "remove-hw", array(
        "tid" => $tid,
        "name" => $topic,
        "reason" => "{remove.reason.generic}"
    ));
    
    $conn->close();
}

function cmd_get_labels($json, $uid)
{
    $conn = pcu_cmd_connect_db($json, "hwplanner");
    if(!$conn)
        return;
        
    $json->data = array();
    $result = $conn->query("select * from labels where userId='$uid' or userId is NULL order by imp asc, name asc");
    if($result)
    {
        while($row = $result->fetch_assoc())
        {
            array_push($json->data, $row);
        }
    }
    $conn->close();
}

function cmd_get_request_log($json, $uid)
{
    $conn = pcu_cmd_connect_db($json, "hwplanner");
    if(!$conn)
        return;
        
    $json->data = hwplanner_get_request_log($conn, $uid);
    
    $conn->close();
}

// add-label
// Args:
//  uid - The user ID (from cache).
// Returns: The label ID.
function cmd_add_label($uid)
{
    $conn = pcu_cmd_connect_db($json, "hwplanner");
    if(!$conn)
        return;

    $result = $conn->query("INSERT INTO labels (userId) VALUES ($uid) RETURNING id");
    if(!$result)
        pcu_cmd_fatal("Query failed: " . $conn->error, 500);
    return $result->fetch_assoc()["id"];
}

// modify-label
// Args:
//  id - The label ID.
//  uid - The user ID.
//  data - User-specified data (fields as in DB)
function cmd_modify_label($id, $uid, $data)
{
    $conn = pcu_cmd_connect_db($json, "hwplanner");
    if(!$conn)
        return;

    $name = $conn->real_escape_string($data["name"]);
    $imp = $conn->real_escape_string($data["imp"]);
    $fullFlow = ($data["fullFlow"] == "true" ? "1" : "0");
    $preparationTime = $conn->real_escape_string($data["preparationTime"]);
    $evaluationTime = $conn->real_escape_string($data["evaluationTime"]);

    if(!$conn->query("UPDATE labels
        SET imp='$imp',fullFlow='$fullFlow',name='$name',preparationTime='$preparationTime',evaluationTime='$evaluationTime'
        WHERE id='$id' AND userId='$uid'")
    )
        pcu_cmd_fatal("Query failed: " . $conn->error, 500);
}

// remove-label
// Args:
//  id - The label ID.
//  uid - The user ID.
function cmd_remove_label($id, $uid)
{
    $conn = pcu_cmd_connect_db($json, "hwplanner");
    if(!$conn)
        return;

    $id = $conn->real_escape_string($id);
    if(!$conn->query("DELETE FROM labels WHERE id='$id' AND userId='$uid'"))
        pcu_cmd_fatal("Query failed: " . $conn->error, 500);
}

// TODO:
// remove-log
// Args:
//  id - The log entry ID

// TODO:
// clear-log
// Args:
//  <none>

// link-links: List links (URLs) attached to an assignment
// Args:
//  tid - Topic ID
function cmd_list_links($json, $tid, $uid)
{
    $conn = pcu_cmd_connect_db($json, "hwplanner");
    if(!$conn)
        return;
    $_tid = $conn->real_escape_string($tid);
    if(!($query = $conn->query("SELECT link FROM links INNER JOIN hws ON hws.tid=links.tid WHERE hws.userId='$uid' AND hws.tid='$_tid'")))
        pcu_cmd_fatal("Query failed: " . $conn->error, 500);
    $result = [];
    while($row = $query->fetch_assoc())
        array_push($result, $row);
    $json->data = $result;
}

// add-link: Attach a link (URL) to an assignment
// Args:
//  tid - Topic ID
//  link - The link URL
function cmd_add_link($json, $tid, $link, $uid)
{
    $conn = pcu_cmd_connect_db($json, "hwplanner");
    if(!$conn)
        return;

    $_tid = $conn->real_escape_string($tid);
    $_link = $conn->real_escape_string($link);
    
    $hw = hwplanner_get_hw($conn, $uid, $_tid);
    if(is_null($hw))
        pcu_cmd_fatal("Invalid assignment", 400);

    if(!$conn->query("INSERT INTO links (tid, link) VALUES ('$_tid', '$_link')"))
        pcu_cmd_fatal("Query failed: " . $conn->error, 500);
}

?>
