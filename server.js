/**
 * Simple API to receive OBD-II Messages and log them in mongojs
 * 
 * Also contains a simple log viewing api at  http://[SOMEDOMAINHERE.COM]/view/[VIN #]
 *
 * This is intended for demo/POC purposes only. There's literally no security here, so you'll want to add some security measures if you're going to
 * use this in a production environment
 *
 * Example log GET request: http://[SOMEDOMAINHERE.COM]/log/{ obddata: { mode: '41', pid: '04', name: 'load_pct', value: 10.9375 },vin: 'JF1BJ673XPH968228',localdatetime: Sun Nov 10 2013 17:23:10 GMT+0000 (UTC),_id: 160 }
 *
 * Example RPM Value: { mode: '41', pid: '0C', name: 'rpm', value: 706 }
 * Example Error Code (response mode 43): { mode: '43', name: 'requestdtc', value: { errors: [ 'P0444', '-', '-' ] } }
 **/

var express = require('express');
var app = express();
var sf = require('node-salesforce');
var sfconn = new sf.Connection({});
var _ = require('underscore')._;

//var db = require("mongojs").connect("carlog", ["logger"]);
var db = require("mongojs").connect(process.env.MONGOLAB_URI, ["logger"]);

app.set('view engine', 'ejs');
app.use("/css",express.static(__dirname + "/css"));

app.get('/log/:json', function(req,res) {
	console.log(req.params.json);

  var jsonObj = JSON.parse(req.params.json);
  jsonObj["datetime"] = new Date();

  console.log("OBD RESPONSE MODE");
  console.log(jsonObj.obddata.mode);
  console.log("OBD RESPONSE VALUE");
  console.log(jsonObj.obddata.value);

	db.logger.save(jsonObj, function(err, saved) {
      if( err || !saved ) {
      	console.log(err);
      	res.send('error');
      }
      res.send('success');
	});

  //mode 43 is a trouble code, so create a SFDC Case
  if(jsonObj.obddata.mode==43 && jsonObj.obddata.value != null) {
    //assume this will happen infrequently enought that we just need to log in every time
    sfconn.login(process.env.SFUSER, process.env.SFPASS+process.env.SFTOKEN, function(err, userInfo) {
      if (err) { return console.error(err); }
      if(jsonObj == null || !_.isObject(jsonObj) || jsonObj.obddata == null || !_.isObject(jsonObj.obddata) || jsonObj.obddata.value == null) {
        return;
      }

      sfconn.sobject("Case").create({ 
        Subject : 'Diagnostic Trouble Code for VIN ' + jsonObj.vin,
        Status: 'New',
        Origin: 'OBD-II',
        Type: 'Mechanical',
        Reason: 'Breakdown',
        Description: JSON.stringify(jsonObj),
        VIN__c: jsonObj.vin,
        Trouble_Code__C: JSON.stringify(jsonObj.obddata.value)
      }, function(err, ret) {
        if (err || !ret.success) { return console.error(err, ret); }
        console.log("Created Case Record Id : " + ret.id);
      });
    });	
  }
});

app.get('/view/:vin', function(req,res){
  //res.send(req.params.vin);
  var tableData = "";

  db.logger.find({vin:req.params.vin}).forEach(function(err,doc){
    //console.log(doc);
    if (!doc) {
        // we visited all docs in the collection
        res.render('index',{body:tableData});
        return;
    }

    if(doc.localdatetime != null && doc.obddata != null && doc.obddata.name != null && doc.obddata.value != null) {
      tableData+="<tr><td>"+doc.localdatetime+"</td><td>"+doc.obddata.name+"</td><td>"+JSON.stringify(doc.obddata.value)+"</td></tr>";
    }
    else{
      console.log("***record had null values")
      console.log(doc);
    }
  });  
});

app.listen(process.env.PORT);

/**
 * Simple log...
 **/
function log(logText) {
  console.log(new Date() + ": "+logText);
}